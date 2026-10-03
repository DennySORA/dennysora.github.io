import { networkNoteIds, type NetworkNoteId } from './network-notes.ts';
import { isLocale, type Locale } from '../i18n/index.ts';

// The single route contract shared by the loader, prerender list, sitemap,
// canonical URLs, language switching and navigation state.
export type RouteDescriptor =
  | { kind: 'root' }
  | { kind: 'not-found' }
  | { kind: 'home'; locale: Locale }
  | { kind: 'library'; locale: Locale }
  | { kind: 'notes'; locale: Locale }
  | { kind: 'network'; locale: Locale }
  | { kind: 'network-note'; locale: Locale; noteId: NetworkNoteId }
  | { kind: 'medical'; locale: Locale }
  | { kind: 'medical-note'; locale: Locale }
  | { kind: 'article'; locale: Locale; slug: string }
  | { kind: 'topic'; locale: Locale; topicId: string }
  | { kind: 'tags'; locale: Locale }
  | { kind: 'tag'; locale: Locale; tagId: string }
  | { kind: 'research'; locale: Locale };
export type RouteKind = RouteDescriptor['kind'];
export type NavSection = 'home' | 'library' | 'notes';

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
    case 'research':
      return rest.length === 0 ? { kind: section, locale } : null;
    case 'note':
      if (rest.length === 0) return { kind: 'notes', locale };
      if (a === 'network') {
        if (rest.length === 1) return { kind: 'network', locale };
        return rest.length === 2 &&
          locale === 'zh-hant' &&
          networkNoteIds.some((id) => id === b)
          ? { kind: 'network-note', locale, noteId: b as NetworkNoteId }
          : null;
      }
      if (a !== 'medical') return null;
      if (rest.length === 1) return { kind: 'medical', locale };
      return rest.length === 2 && b === 'analgesics' && locale === 'zh-hant'
        ? { kind: 'medical-note', locale }
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
    case 'network':
      return `/${route.locale}/note/network/`;
    case 'network-note':
      return `/${route.locale}/note/network/${route.noteId}/`;
    case 'medical':
      return `/${route.locale}/note/medical/`;
    case 'medical-note':
      return `/${route.locale}/note/medical/analgesics/`;
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
    case 'medical':
    case 'medical-note':
    case 'network':
    case 'network-note':
      return 'notes';
    default:
      return null;
  }
}

// React Router prerender paths omit the trailing slash; the static host adds it.
export function prerenderPath(route: RouteDescriptor): string {
  const path = routePath(route);
  return path === '/' ? path : path.replace(/\/$/, '');
}
