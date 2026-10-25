import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { htmlLang, locales } from '../../src/i18n/index.ts';

function metadata(path: string) {
  const data = loader({
    params: { '*': path.replace(/^\//, '') },
  } as unknown as LoaderFunctionArgs);
  const descriptors =
    meta({ loaderData: data } as Parameters<typeof meta>[0]) ?? [];
  return {
    data,
    descriptors,
    schemas: descriptors.flatMap((item) =>
      'script:ld+json' in item ? [item['script:ld+json']] : [],
    ),
  };
}

describe('public page structured data', () => {
  it('describes pages and collections without inventing authors or dates', () => {
    for (const locale of locales)
      for (const [path, type] of [
        ['note/', 'CollectionPage'],
        ['projects/tools/', 'CollectionPage'],
        ['note/medical/daily-care/lumbar-spine-care/', 'WebPage'],
        ['projects/tools/dgxtop/', 'WebPage'],
      ]) {
        const { data, schemas } = metadata(`/${locale}/${path}`);
        expect(schemas[0]).toMatchObject({
          '@type': type,
          name: data.title,
          description: data.description,
          url: data.canonical,
          inLanguage: htmlLang[locale],
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://dennysora.me/#website',
            url: 'https://dennysora.me/',
          },
        });
        for (const field of ['author', 'datePublished', 'dateModified'])
          expect(schemas[0]).not.toHaveProperty(field);
      }
  });

  it('emits crawlable breadcrumbs matching the existing visible path', () => {
    for (const locale of locales) {
      const { schemas } = metadata(`/${locale}/projects/tools/dgxtop/`);
      expect(schemas[1]).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          ['dennysora', `/${locale}/`],
          ['projects', `/${locale}/projects/`],
          ['tools', `/${locale}/projects/tools/`],
          ['dgxtop.md', `/${locale}/projects/tools/dgxtop/`],
        ].map(([name, path], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          item: `https://dennysora.me${path}`,
        })),
      });
    }
  });

  it('preserves the profile, trilingual alternates and non-indexable boundaries', () => {
    for (const locale of locales) {
      const home = metadata(`/${locale}/`);
      expect(home.schemas).toHaveLength(1);
      expect(home.schemas[0]).toMatchObject({
        '@type': 'ProfilePage',
        mainEntity: { '@type': 'Person', alternateName: 'DennySORA' },
      });
      for (const target of locales)
        expect(home.descriptors).toContainEqual({
          tagName: 'link',
          rel: 'alternate',
          hrefLang: htmlLang[target],
          href: `https://dennysora.me/${target}/`,
        });
      const blog = metadata(`/${locale}/blog/`);
      expect(blog.data.indexable).toBe(true);
      expect(blog.schemas[0]).toMatchObject({ '@type': 'CollectionPage' });
      expect(
        blog.descriptors.filter(
          (item) => 'name' in item && item.name === 'robots',
        ),
      ).toEqual([]);
      for (const path of ['search/']) {
        const hidden = metadata(`/${locale}/${path}`);
        expect(hidden.schemas).toHaveLength(1);
        expect(hidden.descriptors).toContainEqual({
          name: 'robots',
          content: 'noindex, follow',
        });
      }
    }
  });
});
