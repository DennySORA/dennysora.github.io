import registry from '../../data/article-covers.json' with { type: 'json' };
import type { Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from './route-manifest.ts';
import type { ArticleCoverData } from './article-covers.ts';

export function articleCoverForRoute(
  route: RouteDescriptor,
  locale: Locale,
): ArticleCoverData | null {
  const id =
    route.kind === 'article'
      ? route.slug
      : route.kind === 'network-note' ||
          route.kind === 'medical-note' ||
          route.kind === 'collection-note'
        ? route.noteId
        : null;
  const kind = route.kind === 'article' ? 'article' : 'note';
  const cover = registry.covers.find(
    (item) => item.id === id && item.kind === kind,
  );
  if (!cover) return null;
  const wide = cover.assets.find(
    (item) => item.mimeType === 'image/webp' && item.width === 1200,
  );
  const small = cover.assets.find(
    (item) => item.mimeType === 'image/webp' && item.width === 640,
  );
  const social = cover.assets.find((item) => item.mimeType === 'image/jpeg');
  if (!wide || !small || !social)
    throw new Error(`Incomplete article cover: ${id}`);
  return {
    id: cover.id,
    src: '/' + wide.path,
    smallSrc: '/' + small.path,
    socialSrc: '/' + social.path,
    width: wide.width,
    height: wide.height,
    alt: cover.alt[locale],
  };
}
