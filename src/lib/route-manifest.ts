import { isLocale, type Locale } from '../i18n/index.ts';

// The single route contract shared by the loader, prerender list, sitemap,
// canonical URLs, language switching and navigation state.
export type RouteDescriptor =
  | { kind: 'root' }
  | { kind: 'not-found' }
  | { kind: 'home'; locale: Locale }
  | { kind: 'about'; locale: Locale }
  | { kind: 'projects'; locale: Locale }
  | { kind: 'project'; locale: Locale; projectId: string }
  | { kind: 'library'; locale: Locale }
  | { kind: 'article'; locale: Locale; slug: string }
  | { kind: 'topic'; locale: Locale; topicId: string }
  | { kind: 'tags'; locale: Locale }
  | { kind: 'tag'; locale: Locale; tagId: string }
  | { kind: 'papers'; locale: Locale }
  | { kind: 'research'; locale: Locale }
  | { kind: 'privacy'; locale: Locale };
export type RouteKind = RouteDescriptor['kind'];
export type NavSection = 'library' | 'projects' | 'about' | 'papers';

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
    case 'about':
    case 'papers':
    case 'research':
    case 'privacy':
      return rest.length === 0 ? { kind: section, locale } : null;
    case 'projects':
      if (rest.length === 0) return { kind: 'projects', locale };
      return rest.length === 1 && a
        ? { kind: 'project', locale, projectId: a }
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
    case 'project':
      return `/${route.locale}/projects/${route.projectId}/`;
    case 'library':
      return `/${route.locale}/blog/`;
    case 'article':
      return `/${route.locale}/blog/${route.slug}/`;
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
    case 'library':
    case 'article':
    case 'topic':
    case 'tags':
    case 'tag':
      return 'library';
    case 'projects':
    case 'project':
      return 'projects';
    case 'about':
      return 'about';
    case 'papers':
      return 'papers';
    default:
      return null;
  }
}

// React Router prerender paths omit the trailing slash; the static host adds it.
export function prerenderPath(route: RouteDescriptor): string {
  const path = routePath(route);
  return path === '/' ? path : path.replace(/\/$/, '');
}
