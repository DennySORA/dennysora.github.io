import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { decodeEntities } from './html.ts';
import {
  routeLocale,
  routePath,
  type RouteDescriptor,
} from './route-manifest.ts';
import type { SiteSearchDocument } from './site-search.ts';

export function searchableText(html: string): string {
  return decodeEntities(
    sanitizeHtml(
      html.replace(
        /<\/(?:p|div|li|h[1-6]|tr|td|th|section|article|pre|summary)>|<br\s*\/?>/gi,
        ' ',
      ),
      { allowedTags: [], allowedAttributes: {} },
    ),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Read only real published main content, never source JSON, scripts or drafts. */
export function buildSiteSearch(
  output: string,
  routes: RouteDescriptor[],
): SiteSearchDocument[] {
  return routes.flatMap((route) => {
    if (['root', 'not-found', 'search', 'research'].includes(route.kind))
      return [];
    const href = routePath(route);
    const html = readFileSync(join(output, href, 'index.html'), 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main) throw new Error(`Missing searchable main: ${href}`);
    const title = decodeEntities(
      html.match(/<title>(.*?)<\/title>/)?.[1] ?? '',
    ).replace(/ — DennySORA$/, '');
    const summary = decodeEntities(
      html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '',
    );
    return [
      {
        id: href.replace(/^\/(?:zh-hant|en|ja)\//, '/'),
        locale: routeLocale(route),
        kind:
          route.kind === 'article'
            ? 'article'
            : ['medical-note', 'network-note'].includes(route.kind)
              ? 'note'
              : 'page',
        href,
        title,
        summary,
        text: searchableText(main),
      } satisfies SiteSearchDocument,
    ];
  });
}
