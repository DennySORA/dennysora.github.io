import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import registry from '../../data/article-covers.json' with { type: 'json' };
import { loader, meta } from '../../src/app/page.tsx';
import { ArticleCover } from '../../src/components/ArticleCover.tsx';
import { locales } from '../../src/i18n/index.ts';
import { articleCoverForRoute } from '../../src/lib/article-covers.server.ts';
import { publishedRoutes } from '../../src/lib/content.server.ts';
import { readImageSize } from '../../src/lib/image-size.server.ts';
import { routeLocale, routePath } from '../../src/lib/route-manifest.ts';

const routes = publishedRoutes().filter((route) =>
  ['article', 'network-note', 'medical-note', 'collection-note'].includes(
    route.kind,
  ),
);

describe('published article covers', () => {
  it('covers all ten real articles and shares one image across all three editions', () => {
    expect(routes).toHaveLength(30);
    expect(registry.covers).toHaveLength(10);
    const counts = new Map<string, number>();
    const images = new Map<string, Set<string>>();
    const alts = new Map<string, Set<string>>();
    for (const route of routes) {
      const cover = articleCoverForRoute(route, routeLocale(route));
      expect(cover).not.toBeNull();
      if (!cover) throw new Error('Missing cover');
      counts.set(cover.id, (counts.get(cover.id) ?? 0) + 1);
      images.set(
        cover.id,
        (images.get(cover.id) ?? new Set()).add(cover.socialSrc),
      );
      alts.set(cover.id, (alts.get(cover.id) ?? new Set()).add(cover.alt));
    }
    expect([...counts.keys()].sort()).toEqual(
      registry.covers.map(({ id }) => id).sort(),
    );
    for (const id of counts.keys()) {
      expect(counts.get(id)).toBe(locales.length);
      expect(images.get(id)?.size).toBe(1);
      expect(alts.get(id)?.size).toBe(locales.length);
    }
    expect(
      articleCoverForRoute({ kind: 'home', locale: 'en' }, 'en'),
    ).toBeNull();
    expect(
      articleCoverForRoute(
        { kind: 'article', locale: 'en', slug: 'engineering-principles' },
        'en',
      ),
    ).toBeNull();
  });

  it('records real optimized raster bytes, dimensions and complete localized descriptions', () => {
    for (const cover of registry.covers) {
      expect(cover.assets).toHaveLength(3);
      for (const locale of locales)
        expect(cover.alt[locale].length).toBeGreaterThan(15);
      for (const asset of cover.assets) {
        const bytes = readFileSync(asset.path);
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(
          asset.sha256,
        );
        expect(readImageSize(asset.path)).toEqual({
          width: asset.width,
          height: asset.height,
        });
        expect(asset.bytes).toBeLessThan(
          asset.mimeType === 'image/jpeg'
            ? 250_000
            : asset.width === 640
              ? 65_000
              : 165_000,
        );
        expect(asset.height / asset.width).toBe(630 / 1200);
      }
    }
  });

  it('prerenders complete absolute Open Graph and large-image Twitter metadata', () => {
    for (const route of routes) {
      const data = loader({
        params: { '*': routePath(route).slice(1) },
      } as unknown as LoaderFunctionArgs);
      const tags =
        meta({ loaderData: data } as Parameters<typeof meta>[0]) ?? [];
      const cover = data.cover;
      if (!cover) throw new Error('Missing loader cover');
      const url = `https://dennysora.me${cover.socialSrc}`;
      for (const [property, content] of [
        ['og:image', url],
        ['og:image:secure_url', url],
        ['og:image:type', 'image/jpeg'],
        ['og:image:width', '1200'],
        ['og:image:height', '630'],
        ['og:image:alt', cover.alt],
      ])
        expect(tags).toContainEqual({ property, content });
      for (const [name, content] of [
        ['twitter:card', 'summary_large_image'],
        ['twitter:image', url],
        ['twitter:image:alt', cover.alt],
        ['twitter:title', data.title],
        ['twitter:description', data.description],
      ])
        expect(tags).toContainEqual({ name, content });
      const schema = tags.find((item) => 'script:ld+json' in item);
      expect(schema).toMatchObject({ 'script:ld+json': { image: url } });
      expect(
        tags.filter(
          (item) => 'property' in item && item.property === 'og:image',
        ),
      ).toHaveLength(1);
    }
  });

  it('renders stable responsive eager images without scripts or embedded lettering', () => {
    const route = routes[0];
    if (!route) throw new Error('Missing published route');
    const cover = articleCoverForRoute(route, routeLocale(route));
    const html = renderToStaticMarkup(createElement(ArticleCover, { cover }));
    expect(html).toContain('class="article-cover"');
    expect(html).toContain('data-pagefind-ignore="all"');
    expect(html).toContain('width="1200" height="630"');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('640w,');
    expect(html).toContain('1200w');
    expect(html).not.toContain('<script');
    expect(
      renderToStaticMarkup(createElement(ArticleCover, { cover: null })),
    ).toBe('');
  });
});
