import type {
  LoaderFunctionArgs,
  MetaFunction,
  ShouldRevalidateFunctionArgs,
} from 'react-router';
import { Suspense, use } from 'react';
import { useLoaderData } from 'react-router';
import { dictionaries, htmlLang, locales, type Locale } from '../i18n/index.ts';
import {
  isIndexable,
  listPosts,
  loadArticle,
  loadHardwareNote,
  loadMedicalNote,
  loadNetworkNote,
  loadComments,
  loadProfile,
  loadProjects,
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
import { Readme } from '../features/home/Readme.tsx';
import { SiteSearch } from '../features/search/SiteSearch.tsx';
import { searchCopy } from '../features/search/search-copy.ts';
import { Library } from '../features/library/Library.tsx';
import { TagIndex, TaxonomyPage } from '../features/library/TaxonomyPages.tsx';
import { Article } from '../features/reader/Article.tsx';
import { ResearchBridge } from '../features/research/ResearchBridge.tsx';
import { Notes } from '../features/notes/Notes.tsx';
import { MedicalNote } from '../features/notes/MedicalNote.tsx';
import { medicalCategoryCopy, medicalNotes } from '../lib/medical-notes.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { NetworkNotes } from '../features/notes/NetworkNotes.tsx';
import { NetworkNote } from '../features/notes/NetworkNote.tsx';
import { networkCopy, networkNotes } from '../lib/network-notes.ts';
import { HardwareNote } from '../features/notes/HardwareNote.tsx';
import {
  hardwareCategoryCopy,
  hardwareCopy,
  hardwareNotes,
} from '../lib/hardware-notes.ts';
import { NotFound } from '../features/misc/NotFound.tsx';
import { Projects } from '../features/projects/Projects.tsx';
import { loadProjectPageModule } from '../features/projects/project-page-module.ts';
import {
  hasProjectEdition,
  projectCategoryCopy,
  projectPages,
  projectsCopy,
  type ProjectPageId,
} from '../lib/project-pages.ts';

/** A project page from its own chunk; prerendering resolves it before rendering. */
function ProjectPageChunk(
  props: Parameters<
    Awaited<ReturnType<typeof loadProjectPageModule>>['ProjectPage']
  >[0],
) {
  const { ProjectPage } = use(loadProjectPageModule());
  return <ProjectPage {...props} />;
}

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
        repository: project.links.repository,
      },
      locale,
    ),
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
      competencies: profile.competencies,
      experience: profile.experience,
      contact: profile.contact,
    },
    locale,
  );
}
export type AboutProfile = ReturnType<typeof aboutProfile>;

// Header tags with their localized labels and the aliases search indexes.
function projectTags(projectId: ProjectPageId, locale: Locale) {
  const labels = taxonomyLabels(locale).tags;
  return projectPages[projectId].tagIds.map((id) => {
    const tag = loadTaxonomy().tags.find((item) => item.id === id);
    const label = labels.find((item) => item.id === id)?.label;
    if (!tag || !label) throw new Error(`Unknown project tag: ${id}`);
    return { id, label, aliases: tag.aliases[locale] };
  });
}

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
    // The locale home is the profile README: introduction, logo and résumé.
    case 'root':
    case 'home':
      return {
        kind: 'home' as const,
        profile: aboutProfile(locale),
        projects: projectCards(locale),
        posts: postLinks(locale),
        recent: listPosts(locale).slice(0, 3),
        taxonomy: taxonomyLabels(locale),
      };
    case 'search':
      return { kind: 'search' as const };
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
    case 'notes':
    case 'medical':
    case 'network':
    case 'hardware':
      return { kind: route.kind };
    case 'medical-category':
      return { kind: route.kind, category: route.category };
    case 'hardware-category':
      return { kind: route.kind, category: route.category };
    case 'network-note':
      return {
        kind: 'network-note' as const,
        noteId: route.noteId,
        html: loadNetworkNote(route.noteId),
      };
    case 'medical-note':
      return {
        kind: 'medical-note' as const,
        noteId: route.noteId,
        html: loadMedicalNote(route.noteId),
      };
    case 'hardware-note':
      return {
        kind: 'hardware-note' as const,
        noteId: route.noteId,
        html: loadHardwareNote(route.noteId),
      };
    case 'projects':
      return { kind: 'projects' as const };
    case 'project-category':
      return { kind: 'project-category' as const, category: route.category };
    case 'project':
      return {
        kind: 'project' as const,
        projectId: route.projectId,
        tags: projectTags(route.projectId, locale),
      };
    case 'research':
      return { kind: 'research' as const };
    case 'not-found':
      return { kind: 'not-found' as const };
  }
}
export type ViewData = ReturnType<typeof loadView>;

function availableLocales(route: RouteDescriptor): Locale[] {
  switch (route.kind) {
    case 'medical-note':
    case 'network-note':
    case 'hardware-note':
      return ['zh-hant'];
    case 'project':
      return [...projectPages[route.projectId].editions];
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
        title: `DennySORA · ${view.profile.publicName} — ${view.profile.introduction.role}`,
        description: view.profile.introduction.shortBio,
      };
    case 'search':
      return {
        title: withSite(searchCopy[locale].title),
        description: searchCopy[locale].intro,
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
    case 'notes':
    case 'medical':
    case 'medical-note':
      return {
        title: withSite(
          view.kind === 'medical-note'
            ? medicalNotes[view.noteId].title[locale]
            : view.kind === 'medical'
              ? noteCopy[locale].medical
              : noteCopy[locale].notes,
        ),
        description:
          view.kind === 'medical-note'
            ? medicalNotes[view.noteId].description
            : noteCopy[locale].intro,
      };
    case 'medical-category':
      return {
        title: withSite(
          medicalCategoryCopy[locale][view.category].title +
            ' · ' +
            noteCopy[locale].medical,
        ),
        description: medicalCategoryCopy[locale][view.category].intro,
      };
    case 'network':
      return {
        title: withSite(networkCopy[locale].title),
        description: networkCopy[locale].intro,
      };
    case 'network-note':
      return {
        title: withSite(networkNotes[view.noteId].title),
        description: networkNotes[view.noteId].description,
      };
    case 'hardware':
      return {
        title: withSite(hardwareCopy[locale].title),
        description: hardwareCopy[locale].intro,
      };
    case 'hardware-category':
      return {
        title: withSite(
          hardwareCategoryCopy[locale][view.category].title +
            ' · ' +
            hardwareCopy[locale].title,
        ),
        description: hardwareCategoryCopy[locale][view.category].intro,
      };
    case 'hardware-note':
      return {
        title: withSite(hardwareNotes[view.noteId].title[locale]),
        description: hardwareNotes[view.noteId].description,
      };
    case 'projects':
      return {
        title: withSite(projectsCopy[locale].title),
        description: projectsCopy[locale].intro,
      };
    case 'project-category':
      return {
        title: withSite(
          projectCategoryCopy[locale][view.category].title +
            ' · ' +
            projectsCopy[locale].title,
        ),
        description: projectCategoryCopy[locale][view.category].intro,
      };
    case 'project': {
      const project = projectPages[view.projectId];
      if (!hasProjectEdition(view.projectId, locale)) notFound();
      return {
        title: withSite(project.title[locale]),
        description: project.description[locale],
      };
    }
    case 'research':
      return {
        title: withSite(t.researchBridgeEyebrow),
        description: t.researchBridgeText,
      };
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
  // The explorer lists the real files of this workspace on every page.
  const workspace = {
    posts: listPosts(locale).map(({ slug, title }) => ({ slug, title })),
  };
  return {
    route,
    locale,
    workspace,
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
              url: `${siteUrl}/${locale}/`,
            },
            mainEntityOfPage: data.canonical,
          }
        : view.kind === 'home'
          ? {
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              url: data.canonical,
              inLanguage: htmlLang[locale],
              mainEntity: {
                '@type': 'Person',
                name: view.profile.publicName,
                alternateName: view.profile.displayName,
                url: `${siteUrl}/${locale}/`,
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
      return <Readme view={view} locale={locale} />;
    case 'search':
      return <SiteSearch locale={locale} />;
    case 'library':
      return <Library view={view} locale={locale} />;
    case 'topic':
    case 'tag':
      return <TaxonomyPage view={view} locale={locale} />;
    case 'tags':
      return <TagIndex view={view} locale={locale} />;
    case 'article':
      return <Article view={view} locale={locale} />;
    case 'notes':
      return <Notes locale={locale} view={{ collection: 'all' }} />;
    case 'medical':
      return <Notes locale={locale} view={{ collection: 'medical' }} />;
    case 'medical-category':
      return (
        <Notes
          locale={locale}
          view={{ collection: 'medical', category: view.category }}
        />
      );
    case 'hardware':
      return <Notes locale={locale} view={{ collection: 'hardware' }} />;
    case 'hardware-category':
      return (
        <Notes
          locale={locale}
          view={{ collection: 'hardware', category: view.category }}
        />
      );
    case 'hardware-note':
      return <HardwareNote html={view.html} />;
    case 'medical-note':
      return (
        <MedicalNote
          html={view.html}
          locale={locale}
          showCover={view.noteId === 'analgesics'}
        />
      );
    case 'network':
      return <NetworkNotes locale={locale} />;
    case 'network-note':
      return <NetworkNote html={view.html} />;
    case 'projects':
      return <Projects locale={locale} />;
    case 'project-category':
      return <Projects locale={locale} category={view.category} />;
    case 'project':
      if (!hasProjectEdition(view.projectId, locale))
        throw new Error(`No ${locale} edition of ${view.projectId}`);
      return (
        <Suspense fallback={null}>
          <ProjectPageChunk view={view} locale={locale} />
        </Suspense>
      );
    case 'research':
      return <ResearchBridge locale={locale} />;
    case 'not-found':
      return <NotFound locale={locale} />;
  }
}
