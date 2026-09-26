import type {
  LoaderFunctionArgs,
  MetaFunction,
  ShouldRevalidateFunctionArgs,
} from 'react-router';
import { useLoaderData } from 'react-router';
import { dictionaries, htmlLang, locales, type Locale } from '../i18n/index.ts';
import {
  hasPublishedCaseStudy,
  isIndexable,
  listPosts,
  loadArticle,
  loadComments,
  loadProfile,
  loadProjects,
  loadResearch,
  loadTaxonomy,
  relatedPosts,
  tagsInLocale,
  topicsInLocale,
} from '../lib/content.server.ts';
import { commentsView } from '../lib/comments.ts';
import { localize } from '../lib/localize.ts';
import {
  parseRoute,
  routeLocale,
  routePath,
  withLocale,
  type RouteDescriptor,
} from '../lib/route-manifest.ts';
import { siteUrl } from '../lib/site.ts';
import { SiteLayout } from '../components/SiteLayout.tsx';
import { Home } from '../features/home/Home.tsx';
import { About } from '../features/about/About.tsx';
import { Projects } from '../features/projects/Projects.tsx';
import { ProjectOverview } from '../features/projects/ProjectOverview.tsx';
import { Library } from '../features/library/Library.tsx';
import { TagIndex, TaxonomyPage } from '../features/library/TaxonomyPages.tsx';
import { Article } from '../features/reader/Article.tsx';
import { Papers } from '../features/papers/Papers.tsx';
import { ResearchBridge } from '../features/research/ResearchBridge.tsx';
import { Privacy } from '../features/misc/Privacy.tsx';
import { NotFound } from '../features/misc/NotFound.tsx';

function notFound(): never {
  throw new Response('Not found', { status: 404 });
}

function taxonomyLabels(locale: Locale) {
  const { topics, types, tags } = loadTaxonomy();
  return localize(
    {
      topics: topics.map(({ id, label }) => ({ id, label })),
      types: types.map(({ id, label }) => ({ id, label })),
      tags: tags.map(({ id, label }) => ({ id, label })),
    },
    locale,
  );
}
export type TaxonomyLabels = ReturnType<typeof taxonomyLabels>;

function projectCards(locale: Locale) {
  return loadProjects().map((project) => ({
    ...localize(
      {
        id: project.id,
        title: project.title,
        category: project.category,
        owner: project.owner,
        technologies: project.technologies,
        domain: project.domain,
        headline: project.headline,
        summary: project.summary,
        role: project.role,
        points: project.points,
        repository: project.links.repository,
        demo: project.links.demo ?? null,
        relatedPostIds: project.relatedPostIds,
      },
      locale,
    ),
    hasCaseStudy: hasPublishedCaseStudy(project.id, locale),
  }));
}
export type ProjectCardData = ReturnType<typeof projectCards>[number];

// Provenance notes stay in the repository; the page receives only public copy.
function aboutProfile(locale: Locale) {
  const profile = loadProfile();
  return localize(
    {
      displayName: profile.displayName,
      publicName: profile.publicName,
      introduction: profile.introduction,
      focusNote: profile.focusNote,
      competencies: profile.competencies,
      featuredProjectIds: profile.featuredProjectIds,
      experience: profile.experience,
      currentFocus: profile.currentFocus,
      personal: profile.personal,
      education: profile.education,
      record: profile.record,
      contact: profile.contact,
    },
    locale,
  );
}
export type AboutProfile = ReturnType<typeof aboutProfile>;

function postLinks(locale: Locale) {
  return Object.fromEntries(
    listPosts(locale).map((post) => [
      post.id,
      { slug: post.slug, title: post.title },
    ]),
  );
}

function loadView(route: RouteDescriptor) {
  const locale = routeLocale(route);
  switch (route.kind) {
    case 'root':
    case 'home': {
      const posts = listPosts(locale);
      const featured = posts.find((post) => post.featured) ?? null;
      return {
        kind: 'home' as const,
        featured,
        latest: posts.filter((post) => post.id !== featured?.id).slice(0, 3),
        projects: projectCards(locale).filter((project) =>
          loadProfile().featuredProjectIds.includes(project.id),
        ),
        taxonomy: taxonomyLabels(locale),
      };
    }
    case 'about':
      return {
        kind: 'about' as const,
        profile: aboutProfile(locale),
        projects: projectCards(locale),
        posts: postLinks(locale),
      };
    case 'projects':
      return {
        kind: 'projects' as const,
        projects: projectCards(locale),
        posts: postLinks(locale),
      };
    case 'project': {
      const project = projectCards(locale).find(
        (item) => item.id === route.projectId,
      );
      if (!project) notFound();
      return {
        kind: 'project' as const,
        project,
        related: listPosts(locale).filter((post) =>
          project.relatedPostIds.includes(post.id),
        ),
        taxonomy: taxonomyLabels(locale),
      };
    }
    case 'library':
      return {
        kind: 'library' as const,
        posts: listPosts(locale),
        taxonomy: taxonomyLabels(locale),
        available: {
          topics: topicsInLocale(locale),
          types: [
            ...new Set(listPosts(locale).map((post) => post.contentType)),
          ],
          tags: tagsInLocale(locale),
        },
      };
    case 'topic': {
      if (!topicsInLocale(locale).some((id) => id === route.topicId))
        notFound();
      const topic = loadTaxonomy().topics.find(
        (item) => item.id === route.topicId,
      );
      if (!topic) notFound();
      return {
        kind: 'topic' as const,
        term: localize(
          { id: topic.id, label: topic.label, description: topic.description },
          locale,
        ),
        posts: listPosts(locale).filter((post) =>
          post.topics.includes(topic.id),
        ),
        taxonomy: taxonomyLabels(locale),
      };
    }
    case 'tags': {
      const posts = listPosts(locale);
      return {
        kind: 'tags' as const,
        tags: taxonomyLabels(locale)
          .tags.map((tag) => ({
            ...tag,
            count: posts.filter((post) => post.tagIds.includes(tag.id)).length,
          }))
          .filter((tag) => tag.count > 0),
      };
    }
    case 'tag': {
      if (!tagsInLocale(locale).includes(route.tagId)) notFound();
      const tag = taxonomyLabels(locale).tags.find(
        (item) => item.id === route.tagId,
      );
      if (!tag) notFound();
      return {
        kind: 'tag' as const,
        term: { ...tag, description: null },
        posts: listPosts(locale).filter((post) => post.tagIds.includes(tag.id)),
        taxonomy: taxonomyLabels(locale),
      };
    }
    case 'article': {
      const article = loadArticle(locale, route.slug);
      if (!article) notFound();
      const profile = loadProfile();
      return {
        kind: 'article' as const,
        article,
        related: relatedPosts(locale, article.post.id),
        taxonomy: taxonomyLabels(locale),
        // Controlled synonyms indexed with the tag so both spellings find the article.
        aliases: Object.fromEntries(
          loadTaxonomy()
            .tags.filter((tag) => article.post.tagIds.includes(tag.id))
            .map((tag) => [tag.id, tag.aliases[locale]]),
        ),
        comments: commentsView(loadComments(), article.post),
        author: localize(
          {
            name: profile.displayName,
            publicName: profile.publicName,
            role: profile.introduction.role,
          },
          locale,
        ),
      };
    }
    case 'papers':
      return { kind: 'papers' as const, research: loadResearch() };
    case 'research':
      return { kind: 'research' as const };
    case 'privacy':
      return { kind: 'privacy' as const, commentsMode: loadComments().mode };
    case 'not-found':
      return { kind: 'not-found' as const };
  }
}
export type ViewData = ReturnType<typeof loadView>;

function availableLocales(route: RouteDescriptor): Locale[] {
  switch (route.kind) {
    case 'article': {
      const article = loadArticle(route.locale, route.slug);
      return article ? article.post.editions : [];
    }
    case 'topic':
      return locales.filter((locale) =>
        topicsInLocale(locale).some((id) => id === route.topicId),
      );
    case 'tag':
      return locales.filter((locale) =>
        tagsInLocale(locale).includes(route.tagId),
      );
    default:
      return [...locales];
  }
}

function describe(view: ViewData, locale: Locale) {
  const t = dictionaries[locale];
  const withSite = (title: string) => `${title} — DennySORA`;
  switch (view.kind) {
    case 'home':
      return {
        title: `DennySORA — ${t.siteTagline}`,
        description: t.homeIntro,
      };
    case 'about':
      return {
        title: withSite(t.navAbout),
        description: view.profile.introduction.shortBio,
      };
    case 'projects':
      return { title: withSite(t.projectsTitle), description: t.projectsIntro };
    case 'project':
      return {
        title: withSite(view.project.title),
        description: view.project.summary,
      };
    case 'library':
      return { title: withSite(t.libraryTitle), description: t.libraryIntro };
    case 'topic':
      return {
        title: withSite(`${view.term.label} · ${t.libraryTitle}`),
        description: view.term.description,
      };
    case 'tags':
      return {
        title: withSite(`${t.tagsTitle} · ${t.libraryTitle}`),
        description: t.tagsIntro,
      };
    case 'tag':
      return {
        title: withSite(`${view.term.label} · ${t.libraryTitle}`),
        description: `${t.tagEyebrow}: ${view.term.label} — ${t.libraryIntro}`,
      };
    case 'article':
      return {
        title: withSite(view.article.edition.title),
        description: view.article.edition.summary,
      };
    case 'papers':
      return { title: withSite(t.papersTitle), description: t.papersLead };
    case 'research':
      return {
        title: withSite(t.researchBridgeEyebrow),
        description: t.researchBridgeText,
      };
    case 'privacy':
      return { title: withSite(t.privacyTitle), description: t.privacyIntro };
    case 'not-found':
      return { title: withSite('404'), description: t.notFoundText };
  }
}

export function loader({ params }: LoaderFunctionArgs) {
  const route = parseRoute('/' + (params['*'] ?? ''));
  if (!route) notFound();
  const locale = routeLocale(route);
  const view = loadView(route);
  const available = availableLocales(route);
  const indexable = isIndexable(route);
  const canonical = siteUrl + routePath(route);
  const { title, description } = describe(view, locale);
  const languageLinks = locales.map((target) => ({
    locale: target,
    href: available.includes(target)
      ? routePath(withLocale(route, target))
      : null,
  }));
  return {
    route,
    locale,
    title,
    description,
    canonical,
    indexable,
    languageLinks,
    hasMath: view.kind === 'article' && view.article.body.hasMath,
    view,
  };
}
export type PageData = ReturnType<typeof loader>;

export function shouldRevalidate({
  currentUrl,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname;
}

export const meta: MetaFunction<typeof loader> = ({ loaderData: data }) => {
  if (!data) return [{ title: 'DennySORA' }];
  const { view, locale } = data;
  const home = data.route.kind === 'root' || data.route.kind === 'home';
  const alternates = data.indexable
    ? data.languageLinks.flatMap(({ locale: target, href }) =>
        href
          ? [
              {
                tagName: 'link',
                rel: 'alternate',
                hrefLang: htmlLang[target],
                href: siteUrl + href,
              },
            ]
          : [],
      )
    : [];
  const article = view.kind === 'article' ? view.article : null;
  return [
    { title: data.title },
    { name: 'description', content: data.description },
    { tagName: 'link', rel: 'canonical', href: data.canonical },
    ...alternates,
    ...(data.indexable && home
      ? [
          {
            tagName: 'link',
            rel: 'alternate',
            hrefLang: 'x-default',
            href: siteUrl + '/',
          },
        ]
      : []),
    {
      tagName: 'link',
      rel: 'alternate',
      type: 'application/rss+xml',
      title: `DennySORA (${htmlLang[locale]})`,
      href: `/${locale}/rss.xml`,
    },
    ...(data.hasMath
      ? [
          {
            tagName: 'link',
            rel: 'stylesheet',
            href: '/assets/katex/katex.min.css',
          },
        ]
      : []),
    { property: 'og:title', content: data.title },
    { property: 'og:description', content: data.description },
    { property: 'og:url', content: data.canonical },
    { property: 'og:type', content: article ? 'article' : 'website' },
    {
      property: 'og:locale',
      content:
        locale === 'zh-hant' ? 'zh_TW' : locale === 'ja' ? 'ja_JP' : 'en_US',
    },
    { property: 'og:image', content: siteUrl + '/assets/avatar.png' },
    { name: 'twitter:card', content: 'summary' },
    ...(data.indexable ? [] : [{ name: 'robots', content: 'noindex, follow' }]),
    {
      'script:ld+json': article
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.edition.title,
            description: article.edition.summary,
            datePublished: article.post.publishedAt,
            dateModified: article.post.updatedAt,
            inLanguage: htmlLang[locale],
            author: {
              '@type': 'Person',
              name: article.post.author,
              url: `${siteUrl}/${locale}/about/`,
            },
            mainEntityOfPage: data.canonical,
          }
        : view.kind === 'about'
          ? {
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              url: data.canonical,
              inLanguage: htmlLang[locale],
              mainEntity: {
                '@type': 'Person',
                name: 'DennySORA',
                alternateName: view.profile.publicName,
                url: `${siteUrl}/${locale}/about/`,
                sameAs: [view.profile.contact.github],
              },
            }
          : {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DennySORA',
              url: data.canonical,
              inLanguage: htmlLang[locale],
            },
    },
  ];
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return (
    <SiteLayout data={data}>
      <View data={data} />
    </SiteLayout>
  );
}

function View({ data }: { data: PageData }) {
  const { view, locale } = data;
  switch (view.kind) {
    case 'home':
      return <Home view={view} locale={locale} />;
    case 'about':
      return <About view={view} locale={locale} />;
    case 'projects':
      return <Projects view={view} locale={locale} />;
    case 'project':
      return <ProjectOverview view={view} locale={locale} />;
    case 'library':
      return <Library view={view} locale={locale} />;
    case 'topic':
    case 'tag':
      return <TaxonomyPage view={view} locale={locale} />;
    case 'tags':
      return <TagIndex view={view} locale={locale} />;
    case 'article':
      return <Article view={view} locale={locale} />;
    case 'papers':
      return <Papers view={view} locale={locale} />;
    case 'research':
      return <ResearchBridge locale={locale} />;
    case 'privacy':
      return <Privacy view={view} locale={locale} />;
    case 'not-found':
      return <NotFound locale={locale} />;
  }
}
