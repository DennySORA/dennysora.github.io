import type { Locale } from '../i18n/index.ts';
import {
  navSection,
  routeLocale,
  routePath,
  type NavSection,
  type RouteDescriptor,
} from './route-manifest.ts';
import { papersUrl } from './site.ts';

// The site is presented as a code workspace: every page is a file or folder,
// and the editor chrome (tabs, breadcrumbs, status bar) names it truthfully.

export type WorkspaceFiles = {
  posts: { slug: string; title: string }[];
  projects: { id: string; title: string }[];
};

export type AreaKey = NavSection | 'papers';
export type Area = {
  key: AreaKey;
  file: string;
  href: string;
  external: boolean;
};

/** The workspace's top-level areas, in tab order. Paper Daily is its own site. */
export function areas(locale: Locale): Area[] {
  return [
    { key: 'home', file: 'README.md', href: `/${locale}/`, external: false },
    { key: 'library', file: 'blog', href: `/${locale}/blog/`, external: false },
    { key: 'notes', file: 'note', href: `/${locale}/note/`, external: false },
    {
      key: 'projects',
      file: 'projects',
      href: `/${locale}/projects/`,
      external: false,
    },
    { key: 'papers', file: 'paper-daily', href: papersUrl, external: true },
  ];
}

/** A path segment; segments without a page of their own have no link. */
export type Crumb = { label: string; href: string | null };

export function crumbs(route: RouteDescriptor): Crumb[] {
  const locale = routeLocale(route);
  const home: Crumb = { label: 'dennysora', href: `/${locale}/` };
  const blog: Crumb = { label: 'blog', href: `/${locale}/blog/` };
  const projects: Crumb = { label: 'projects', href: `/${locale}/projects/` };
  const tags: Crumb = { label: 'tags', href: `/${locale}/blog/tags/` };
  const self = routePath(route);
  switch (route.kind) {
    case 'root':
    case 'home':
      return [home, { label: 'README.md', href: self }];
    case 'library':
      return [home, blog];
    case 'notes':
      return [home, { label: 'note', href: self }];
    case 'medical':
      return [
        home,
        { label: 'note', href: `/${locale}/note/` },
        { label: 'medical', href: self },
      ];
    case 'network':
      return [
        home,
        { label: 'note', href: `/${locale}/note/` },
        { label: 'network', href: self },
      ];
    case 'network-note':
      return [
        home,
        { label: 'note', href: `/${locale}/note/` },
        { label: 'network', href: `/${locale}/note/network/` },
        { label: `${route.noteId}.md`, href: self },
      ];
    case 'medical-note':
      return [
        home,
        { label: 'note', href: `/${locale}/note/` },
        { label: 'medical', href: `/${locale}/note/medical/` },
        { label: 'analgesics.md', href: self },
      ];
    case 'article':
      return [home, blog, { label: `${route.slug}.md`, href: self }];
    case 'topic':
      return [
        home,
        blog,
        { label: 'topics', href: null },
        { label: route.topicId, href: self },
      ];
    case 'tags':
      return [home, blog, tags];
    case 'tag':
      return [home, blog, tags, { label: route.tagId, href: self }];
    case 'projects':
      return [home, projects];
    case 'project':
      return [home, projects, { label: route.projectId, href: self }];
    case 'privacy':
      return [home, { label: 'privacy.md', href: self }];
    case 'research':
      return [home, { label: 'research.md', href: self }];
    case 'not-found':
      return [home, { label: '404', href: null }];
  }
}

const folders: RouteDescriptor['kind'][] = [
  'library',
  'notes',
  'medical',
  'network',
  'projects',
  'tags',
  'topic',
  'tag',
];

/** The page's path inside the workspace, e.g. `blog/engineering-principles.md`. */
export function filePath(route: RouteDescriptor): string {
  const path = crumbs(route)
    .slice(1)
    .map((crumb) => crumb.label)
    .join('/');
  return folders.includes(route.kind) ? `${path}/` : path;
}

/** Section landing pages are the current page; articles and tags sit inside one. */
export function areaState(
  route: RouteDescriptor,
  key: AreaKey,
): 'page' | 'true' | undefined {
  if (navSection(route) !== key) return undefined;
  return ['root', 'home', 'library', 'projects', 'notes'].includes(route.kind)
    ? 'page'
    : 'true';
}
