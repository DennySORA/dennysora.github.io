import type { MedicalNoteId } from './medical-notes.ts';
import type { NetworkNoteId } from './network-notes.ts';
import type { HardwareNoteId } from './hardware-notes.ts';
import type { CollectionNoteId } from './note-collections.ts';
import {
  folderPath,
  noteKind,
  notePath,
  resolveNotePath,
  type NoteFolderId,
  type NoteId,
} from './note-tree.ts';
import {
  hasProjectEdition,
  projectCategories,
  projectPageIds,
  projectPages,
  type ProjectCategory,
  type ProjectPageId,
} from './project-pages.ts';
import { isLocale, type Locale } from '../i18n/index.ts';

// The single route contract shared by the loader, prerender list, sitemap,
// canonical URLs, language switching and navigation state.
export type RouteDescriptor =
  | { kind: 'root' }
  | { kind: 'not-found' }
  | { kind: 'home'; locale: Locale }
  | { kind: 'library'; locale: Locale }
  | { kind: 'search'; locale: Locale }
  | { kind: 'notes'; locale: Locale }
  | { kind: 'note-folder'; locale: Locale; folder: NoteFolderId }
  | { kind: 'network-note'; locale: Locale; noteId: NetworkNoteId }
  | { kind: 'medical-note'; locale: Locale; noteId: MedicalNoteId }
  | { kind: 'hardware-note'; locale: Locale; noteId: HardwareNoteId }
  | { kind: 'collection-note'; locale: Locale; noteId: CollectionNoteId }
  | { kind: 'projects'; locale: Locale }
  | { kind: 'project-category'; locale: Locale; category: ProjectCategory }
  | { kind: 'project'; locale: Locale; projectId: ProjectPageId }
  | { kind: 'article'; locale: Locale; slug: string }
  | { kind: 'topic'; locale: Locale; topicId: string }
  | { kind: 'tags'; locale: Locale }
  | { kind: 'tag'; locale: Locale; tagId: string }
  | { kind: 'research'; locale: Locale };
export type RouteKind = RouteDescriptor['kind'];
export type NavSection = 'home' | 'library' | 'notes' | 'projects';

// Slugs that would collide with fixed Library routes.
export const reservedSlugs = ['tags', 'topics'] as const;
const segment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseRoute(pathname: string): RouteDescriptor | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { kind: 'root' };
  if (parts.length === 1 && parts[0] === '404') return { kind: 'not-found' };
  const [first, section, ...rest] = parts;
  if (!isLocale(first)) return null;
  const locale = first;
  if (rest.some((part) => !segment.test(part))) return null;
  if (!section) return { kind: 'home', locale };
  const [a, b] = rest;
  switch (section) {
    case 'search':
    case 'research':
      return rest.length === 0 ? { kind: section, locale } : null;
    case 'note': {
      if (rest.length === 0) return { kind: 'notes', locale };
      // Folders and notes come from the note tree; anything else is not a page.
      const found = resolveNotePath(rest);
      if (!found) return null;
      return 'folder' in found
        ? { kind: 'note-folder', locale, folder: found.folder }
        : noteRoute(found.noteId, locale);
    }
    case 'projects':
      if (rest.length === 0) return { kind: 'projects', locale };
      if (!projectCategories.some((category) => category === a)) return null;
      if (rest.length === 1)
        return {
          kind: 'project-category',
          locale,
          category: a as ProjectCategory,
        };
      // A page answers only in the languages it was written in.
      return rest.length === 2 &&
        projectPageIds.some(
          (id) =>
            id === b &&
            projectPages[id].category === a &&
            hasProjectEdition(id, locale),
        )
        ? { kind: 'project', locale, projectId: b as ProjectPageId }
        : null;
    case 'blog':
      if (rest.length === 0) return { kind: 'library', locale };
      if (a === 'tags')
        return rest.length === 1
          ? { kind: 'tags', locale }
          : rest.length === 2 && b
            ? { kind: 'tag', locale, tagId: b }
            : null;
      if (a === 'topics')
        return rest.length === 2 && b
          ? { kind: 'topic', locale, topicId: b }
          : null;
      return rest.length === 1 && a
        ? { kind: 'article', locale, slug: a }
        : null;
    default:
      return null;
  }
}

/** A note's route, of the kind that renders it. */
export function noteRoute(id: NoteId, locale: Locale): RouteDescriptor {
  switch (noteKind(id)) {
    case 'network-note':
      return { kind: 'network-note', locale, noteId: id as NetworkNoteId };
    case 'medical-note':
      return { kind: 'medical-note', locale, noteId: id as MedicalNoteId };
    case 'hardware-note':
      return { kind: 'hardware-note', locale, noteId: id as HardwareNoteId };
    case 'collection-note':
      return {
        kind: 'collection-note',
        locale,
        noteId: id as CollectionNoteId,
      };
  }
}

export function routePath(route: RouteDescriptor): string {
  switch (route.kind) {
    case 'root':
      return '/';
    case 'not-found':
      return '/404/';
    case 'home':
      return `/${route.locale}/`;
    case 'library':
      return `/${route.locale}/blog/`;
    case 'article':
      return `/${route.locale}/blog/${route.slug}/`;
    case 'notes':
      return `/${route.locale}/note/`;
    case 'note-folder':
      return folderPath(route.folder, route.locale);
    case 'network-note':
    case 'medical-note':
    case 'hardware-note':
    case 'collection-note':
      return notePath(route.noteId, route.locale);
    case 'projects':
      return `/${route.locale}/projects/`;
    case 'project-category':
      return `/${route.locale}/projects/${route.category}/`;
    case 'project':
      return `/${route.locale}/projects/${projectPages[route.projectId].category}/${route.projectId}/`;
    case 'topic':
      return `/${route.locale}/blog/topics/${route.topicId}/`;
    case 'tags':
      return `/${route.locale}/blog/tags/`;
    case 'tag':
      return `/${route.locale}/blog/tags/${route.tagId}/`;
    default:
      return `/${route.locale}/${route.kind}/`;
  }
}

export function routeLocale(route: RouteDescriptor): Locale {
  return route.kind === 'root' || route.kind === 'not-found'
    ? 'zh-hant'
    : route.locale;
}

export function withLocale(
  route: RouteDescriptor,
  locale: Locale,
): RouteDescriptor {
  if (route.kind === 'root' || route.kind === 'not-found')
    return { kind: 'home', locale };
  return { ...route, locale };
}

export function navSection(route: RouteDescriptor): NavSection | null {
  switch (route.kind) {
    case 'root':
    case 'home':
      return 'home';
    case 'library':
    case 'article':
    case 'topic':
    case 'tags':
    case 'tag':
      return 'library';
    case 'notes':
    case 'note-folder':
    case 'network-note':
    case 'medical-note':
    case 'hardware-note':
    case 'collection-note':
      return 'notes';
    case 'projects':
    case 'project-category':
    case 'project':
      return 'projects';
    default:
      return null;
  }
}

// React Router prerender paths omit the trailing slash; the static host adds it.
export function prerenderPath(route: RouteDescriptor): string {
  const path = routePath(route);
  return path === '/' ? path : path.replace(/\/$/, '');
}
