import { articleFolder, blogFolders } from '../lib/blog-tree.ts';
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
  loadCollectionNote,
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
import { commentsView, commentTarget } from '../lib/comments.ts';
import { Comments } from '../features/comments/Comments.tsx';
import { localize } from '../lib/localize.ts';
import {
  parseRoute,
  routeLocale,
  routePath,
  withLocale,
  type RouteDescriptor,
} from '../lib/route-manifest.ts';
import { siteUrl } from '../lib/site.ts';
import { crumbs } from '../lib/workspace.ts';
import { SiteLayout } from '../components/SiteLayout.tsx';
import { Readme } from '../features/home/Readme.tsx';
import { SiteSearch } from '../features/search/SiteSearch.tsx';
import { searchCopy } from '../features/search/search-copy.ts';
import { Library } from '../features/library/Library.tsx';
import { TagIndex, TaxonomyPage } from '../features/library/TaxonomyPages.tsx';
import { Article } from '../features/reader/Article.tsx';
import { Notes } from '../features/notes/Notes.tsx';
import { MedicalNote } from '../features/notes/MedicalNote.tsx';
import { medicalNotes } from '../lib/medical-notes.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { loadNotePageModule } from '../features/notes/note-page-module.ts';
import { networkNotes } from '../lib/network-notes.ts';
import { collectionNoteMeta } from '../lib/note-collections.server.ts';
import { noteFolderCopy, noteTree } from '../lib/note-tree.server.ts';
import { noteFolders } from '../lib/note-tree.ts';
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

function NotePageChunk(props: {
  kind: 'network-note' | 'collection-note';
  html: string;
  locale: Locale;
}) {
  const { CollectionNote, NetworkNote } = use(loadNotePageModule());
  return props.kind === 'collection-note' ? (
    <CollectionNote html={props.html} locale={props.locale} />
  ) : (
    <NetworkNote html={props.html} locale={props.locale} />
  );
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
    case 'blog-folder': {
      const posts = listPosts(locale).filter(
        (post) => articleFolder(post.slug) === route.folder,
      );
      if (!posts.length) notFound();
      return {
        kind: 'blog-folder' as const,
        term: {
          id: route.folder,
          label: blogFolders[route.folder].title[locale],
          description: blogFolders[route.folder].description[locale],
        },
        posts,
        taxonomy: taxonomyLabels(locale),
      };
    }
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
      if (!tagsInLocale(locale).length) notFound();
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
        comments: commentsView(loadComments(), {
          ...article.post,
          id: `article:${article.post.id}`,
        }),
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
      return { kind: route.kind };
    case 'note-folder':
      return { kind: route.kind, folder: route.folder };
    case 'collection-note':
      return {
        kind: 'collection-note' as const,
        noteId: route.noteId,
        html: loadCollectionNote(route.noteId, locale),
      };
    case 'network-note':
      return {
        kind: 'network-note' as const,
        noteId: route.noteId,
        html: loadNetworkNote(route.noteId, locale),
      };
    case 'medical-note':
      return {
        kind: 'medical-note' as const,
        noteId: route.noteId,
        html: loadMedicalNote(route.noteId, locale),
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
    case 'not-found':
      return { kind: 'not-found' as const };
  }
}
export type ViewData = ReturnType<typeof loadView>;

function availableLocales(route: RouteDescriptor): Locale[] {
  switch (route.kind) {
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
    case 'tags':
      return locales.filter((locale) => tagsInLocale(locale).length > 0);
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
    case 'blog-folder':
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
      return {
        title: withSite(noteCopy[locale].notes),
        description: noteCopy[locale].intro,
      };
    case 'note-folder': {
      // A subfolder is titled with its parent, as in "P2P · Networks".
      const { parent } = noteFolders[view.folder];
      const title = noteFolderCopy[view.folder].title[locale];
      return {
        title: withSite(
          parent ? `${title} · ${noteFolderCopy[parent].title[locale]}` : title,
        ),
        description: noteFolderCopy[view.folder].intro[locale],
      };
    }
    case 'medical-note':
      return {
        title: withSite(medicalNotes[view.noteId].title[locale]),
        description: medicalNotes[view.noteId].description[locale],
      };
    case 'network-note':
      return {
        title: withSite(networkNotes[view.noteId].title[locale]),
        description: networkNotes[view.noteId].description[locale],
      };
    case 'collection-note':
      return {
        title: withSite(collectionNoteMeta[view.noteId].title[locale]),
        description: collectionNoteMeta[view.noteId].description[locale],
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
    case 'not-found':
      return { title: withSite('404'), description: t.notFoundText };
  }
}

export function loader({ params }: LoaderFunctionArgs) {
  const route = parseRoute('/' + (params['*'] ?? ''));
  if (!route) notFound();
  const locale = routeLocale(route);
  const view = loadView(route);
  const target = commentTarget(
    route,
    view.kind === 'article' ? view.article.post : undefined,
  );
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
    notes: noteTree(locale),
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
    commentId: target?.id ?? null,
    comments: target ? commentsView(loadComments(), target) : null,
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
  const collection = [
    'library',
    'blog-folder',
    'notes',
    'note-folder',
    'projects',
    'project-category',
    'tags',
    'topic',
    'tag',
  ].includes(view.kind);
  // Reuse the visible winbar trail; do not invent URLs for unlinked folders.
  const breadcrumbs = crumbs(data.route).flatMap(({ label, href }) =>
    href ? [{ label, href }] : [],
  );
  return [
    ...(data.comments
      ? [{ name: 'giscus:backlink', content: data.canonical }]
      : []),
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
            ...(article.post.author
              ? {
                  author: {
                    '@type': 'Person',
                    name: article.post.author,
                    url: `${siteUrl}/${locale}/`,
                  },
                }
              : {}),
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
              '@type': collection ? 'CollectionPage' : 'WebPage',
              name: data.title,
              description: data.description,
              url: data.canonical,
              inLanguage: htmlLang[locale],
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                name: 'DennySORA',
                url: `${siteUrl}/`,
              },
            },
    },
    ...(data.indexable && !home && breadcrumbs.length > 1
      ? [
          {
            'script:ld+json': {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: breadcrumbs.map(({ label, href }, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: label,
                item: siteUrl + href,
              })),
            },
          },
        ]
      : []),
  ];
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return (
    <SiteLayout data={data}>
      <View data={data} />
      {data.comments && data.view.kind !== 'article' ? (
        <div className="container site-comments">
          <Comments
            key={`${data.locale}:${data.commentId}`}
            view={data.comments}
            locale={data.locale}
          />
        </div>
      ) : null}
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
    case 'blog-folder':
    case 'topic':
    case 'tag':
      return <TaxonomyPage view={view} locale={locale} />;
    case 'tags':
      return <TagIndex view={view} locale={locale} />;
    case 'article':
      return <Article view={view} locale={locale} />;
    case 'notes':
    case 'note-folder':
      return (
        <Notes
          locale={locale}
          folder={view.kind === 'notes' ? null : view.folder}
          tree={data.workspace.notes}
        />
      );
    case 'network-note':
    case 'collection-note':
      return (
        <Suspense fallback={null}>
          <NotePageChunk kind={view.kind} html={view.html} locale={locale} />
        </Suspense>
      );
    case 'medical-note':
      return (
        <MedicalNote
          html={view.html}
          locale={locale}
          showCover={view.noteId === 'analgesics'}
        />
      );
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
    case 'not-found':
      return <NotFound locale={locale} />;
  }
}
