import type {
  LoaderFunctionArgs,
  MetaFunction,
  ShouldRevalidateFunctionArgs,
} from 'react-router';
import { useLoaderData } from 'react-router';
import {
  dictionaries,
  htmlLang,
  isLocale,
  locales,
  type Locale,
} from '../i18n/index.ts';
import {
  listPosts,
  loadArticle,
  loadProfile,
  loadProjects,
  loadResearch,
  loadComments,
} from '../lib/content.server.ts';
import { siteUrl } from '../lib/site.ts';
import { Shell, type Section } from '../components/Shell.tsx';
import { Home } from '../features/Home.tsx';
import { Article } from '../features/Article.tsx';
import { Research } from '../features/Research.tsx';
import {
  About,
  Blog,
  Projects,
  ProjectDetail,
  Privacy,
  NotFound,
} from '../features/ProfilePages.tsx';

export function loader({ params }: LoaderFunctionArgs) {
  const path = '/' + (params['*'] ?? '');
  const segments = path.split('/').filter(Boolean);
  const locale: Locale = isLocale(segments[0]) ? segments[0] : 'zh-hant';
  const root = segments.length === 0;
  const section = (root ? 'home' : (segments[1] ?? 'home')) as Section;
  if (!root && !isLocale(segments[0]) && path !== '/404')
    throw new Response('Not found', { status: 404 });
  if (
    !['home', 'about', 'blog', 'projects', 'research', 'privacy'].includes(
      section,
    ) ||
    segments.length > 3
  )
    throw new Response('Not found', { status: 404 });
  const projects = loadProjects();
  const posts = listPosts(locale);
  const slug = segments[2];
  const article = section === 'blog' && slug ? loadArticle(locale, slug) : null;
  const project =
    section === 'projects' && slug
      ? (projects.find((item) => item.id === slug) ?? null)
      : null;
  if (
    (section === 'blog' && slug && !article) ||
    (section === 'projects' && slug && !project) ||
    (slug && !['blog', 'projects'].includes(section))
  )
    throw new Response('Not found', { status: 404 });
  const t = dictionaries[locale];
  const is404 = path === '/404';
  const suffix =
    section === 'home' ? '' : `${section}/${slug ? slug + '/' : ''}`;
  const title = is404
    ? '404'
    : (article?.edition?.title ??
      project?.title ??
      (section === 'home'
        ? 'DennySORA'
        : t[section === 'not-found' ? 'home' : section]));
  const description =
    article?.edition?.summary ??
    (project
      ? project.summary[locale]
      : section === 'blog'
        ? t.blogIntro
        : section === 'projects'
          ? t.projectIntro
          : section === 'research'
            ? t.researchIntro
            : section === 'privacy'
              ? t.privacyIntro
              : t.heroIntro);
  return {
    locale,
    section: is404 ? ('not-found' as const) : section,
    suffix,
    title,
    description,
    posts,
    projects,
    article,
    project,
    profile: section === 'about' ? loadProfile(locale) : null,
    research: section === 'research' ? loadResearch() : null,
    comments: loadComments(),
    canonical: root ? siteUrl + '/' : `${siteUrl}/${locale}/${suffix}`,
    root,
  };
}
export function shouldRevalidate({
  currentUrl,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname;
}
export const meta: MetaFunction<typeof loader> = ({ loaderData: data }) => {
  if (!data) return [{ title: 'DennySORA' }];
  const alternates = data.article ? data.article.post.editions : [...locales];
  const noindex = data.section === 'not-found';
  return [
    {
      title:
        data.title === 'DennySORA'
          ? `DennySORA — ${dictionaries[data.locale].builtOn}`
          : `${data.title} — DennySORA`,
    },
    { name: 'description', content: data.description },
    { tagName: 'link', rel: 'canonical', href: data.canonical },
    ...(!noindex
      ? alternates.map((locale) => ({
          tagName: 'link',
          rel: 'alternate',
          hrefLang: htmlLang[locale],
          href: `${siteUrl}/${locale}/${data.suffix}`,
        }))
      : []),
    ...(!noindex && data.section === 'home'
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
      title: `DennySORA (${htmlLang[data.locale]})`,
      href: `/${data.locale}/rss.xml`,
    },
    { property: 'og:title', content: data.title },
    { property: 'og:description', content: data.description },
    { property: 'og:url', content: data.canonical },
    { property: 'og:type', content: data.article ? 'article' : 'website' },
    {
      property: 'og:locale',
      content:
        data.locale === 'zh-hant'
          ? 'zh_TW'
          : data.locale === 'ja'
            ? 'ja_JP'
            : 'en_US',
    },
    { property: 'og:image', content: siteUrl + '/assets/avatar.png' },
    { name: 'twitter:card', content: 'summary' },
    ...(noindex ? [{ name: 'robots', content: 'noindex, follow' }] : []),
    {
      'script:ld+json': data.article
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: data.title,
            description: data.description,
            datePublished: data.article.post.publishedAt,
            dateModified: data.article.post.updatedAt,
            inLanguage: htmlLang[data.locale],
            author: { '@type': 'Person', name: data.article.post.author },
            mainEntityOfPage: data.canonical,
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'DennySORA',
            url: data.canonical,
            inLanguage: htmlLang[data.locale],
          },
    },
  ];
};

export type PageData = ReturnType<typeof loader>;
export default function Page() {
  const data = useLoaderData<typeof loader>();
  const { locale, section, article, project } = data;
  const views = {
    home: Home,
    about: About,
    blog: Blog,
    projects: Projects,
    research: Research,
    privacy: Privacy,
    'not-found': NotFound,
  };
  const View = article ? Article : project ? ProjectDetail : views[section];
  return (
    <Shell
      locale={locale}
      section={section}
      suffix={data.suffix}
      availableLocales={article?.post.editions ?? [...locales]}
    >
      <View data={data} />
    </Shell>
  );
}
