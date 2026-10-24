import {
  folderPath,
  folderTrail,
  noteFolderOf,
  type NoteFolderId,
  type NoteTreeFolder,
} from './note-tree.ts';
import { projectPages } from './project-pages.ts';
import type { Locale } from '../i18n/index.ts';
import {
  navSection,
  routeLocale,
  routePath,
  type NavSection,
  type RouteDescriptor,
} from './route-manifest.ts';

// The site is presented as a code workspace: every page is a file or folder,
// and the editor chrome (tabs, breadcrumbs, status bar) names it truthfully.

export type WorkspaceFiles = {
  posts: { slug: string; title: string }[];
  /** The note/ tree in the page's language; their copy
   * arrives as loader data. */
  notes: NoteTreeFolder[];
};

export type AreaKey = NavSection;
export type Area = {
  key: AreaKey;
  file: string;
  href: string;
  external: boolean;
};

/** Navigable areas in tab order; an empty blog is not a navigation category. */
export function areas(
  locale: Locale,
  files: Pick<WorkspaceFiles, 'posts'>,
): Area[] {
  return [
    { key: 'home', file: 'README.md', href: `/${locale}/`, external: false },
    ...(files.posts.length
      ? [
          {
            key: 'library' as const,
            file: 'blog',
            href: `/${locale}/blog/`,
            external: false,
          },
        ]
      : []),
    { key: 'notes', file: 'note', href: `/${locale}/note/`, external: false },
    {
      key: 'projects',
      file: 'projects',
      href: `/${locale}/projects/`,
      external: false,
    },
  ];
}

/** A path segment; segments without a page of their own have no link. */
export type Crumb = { label: string; href: string | null };

/**
 * Each folder from the top of its area down to this one, named by its URL
 * segment; all folders sit under the note crumb.
 */
function folderCrumbs(folder: NoteFolderId, locale: Locale): Crumb[] {
  const trail = folderTrail(folder).map((id) => ({
    label: id,
    href: folderPath(id, locale),
  }));
  return [{ label: 'note', href: `/${locale}/note/` }, ...trail];
}

export function crumbs(route: RouteDescriptor): Crumb[] {
  const locale = routeLocale(route);
  const home: Crumb = { label: 'dennysora', href: `/${locale}/` };
  const blog: Crumb = { label: 'blog', href: `/${locale}/blog/` };
  const tags: Crumb = { label: 'tags', href: `/${locale}/blog/tags/` };
  const self = routePath(route);
  switch (route.kind) {
    case 'root':
    case 'home':
      return [home, { label: 'README.md', href: self }];
    case 'library':
      return [home, blog];
    case 'search':
      return [home, { label: 'search', href: self }];
    case 'notes':
      return [home, { label: 'note', href: self }];
    case 'note-folder':
      return [home, ...folderCrumbs(route.folder, locale)];
    case 'network-note':
    case 'medical-note':
    case 'hardware-note':
    case 'collection-note':
      return [
        home,
        ...folderCrumbs(noteFolderOf[route.noteId], locale),
        { label: `${route.noteId}.md`, href: self },
      ];
    case 'projects':
      return [home, { label: 'projects', href: self }];
    case 'project-category':
      return [
        home,
        { label: 'projects', href: `/${locale}/projects/` },
        { label: route.category, href: self },
      ];
    case 'project': {
      const { category } = projectPages[route.projectId];
      return [
        home,
        { label: 'projects', href: `/${locale}/projects/` },
        { label: category, href: `/${locale}/projects/${category}/` },
        { label: `${route.projectId}.md`, href: self },
      ];
    }
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
    case 'not-found':
      return [home, { label: '404', href: null }];
  }
}

const folders: RouteDescriptor['kind'][] = [
  'library',
  'notes',
  'note-folder',
  'projects',
  'project-category',
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

/** What the open page is in the workspace, which picks its icon and filetype. */
export type FileKind = 'markdown' | 'folder' | 'search' | 'missing';

export function fileKind(route: RouteDescriptor): FileKind {
  if (folders.includes(route.kind)) return 'folder';
  if (route.kind === 'search') return 'search';
  if (route.kind === 'not-found') return 'missing';
  return 'markdown';
}

/** An area's own landing page, such as blog/ or note/, rather than a page inside it. */
export function isAreaLanding(route: RouteDescriptor): boolean {
  return ['root', 'home', 'library', 'notes', 'projects'].includes(route.kind);
}

/** Section landing pages are the current page; articles and tags sit inside one. */
export function areaState(
  route: RouteDescriptor,
  key: AreaKey,
): 'page' | 'true' | undefined {
  if (navSection(route) !== key) return undefined;
  return isAreaLanding(route) ? 'page' : 'true';
}
