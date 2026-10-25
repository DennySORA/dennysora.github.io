import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { htmlLang, locales } from '../../src/i18n/index.ts';
import { articlePath, populatedBlogFolders } from '../../src/lib/blog-tree.ts';
import {
  listPosts,
  loadPosts,
  publishedPaths,
} from '../../src/lib/content.server.ts';

const articles = [
  'browser-translation-architecture',
  'p2p-downloader-architecture',
  'p2p-privacy-boundaries',
  'password-manager-recommendations',
];
const reviewCommit = '9b1a75b3a89704b7612fcf0e0e8affce3516cb03';

describe('four-article trilingual publication', () => {
  it('publishes exactly the four authorized articles in every language', () => {
    for (const locale of locales) {
      expect(
        listPosts(locale)
          .map((post) => post.id)
          .sort(),
      ).toEqual(articles);
      expect(populatedBlogFolders(listPosts(locale))).toEqual([
        'network',
        'tools',
        'security',
      ]);
    }
    for (const post of loadPosts().filter((post) => articles.includes(post.id)))
      for (const locale of locales) {
        const edition = post.locales[locale];
        expect(edition?.publication).toBe('published');
        expect(edition?.translationState).toBe(
          locale === 'zh-hant' ? 'original' : 'reviewed',
        );
        expect(edition?.sourceRevision).toBe(post.revision);
        expect(edition?.reviewEvidence).toContain(
          `/blob/${reviewCommit}/docs/process/REVIEW-`,
        );
      }
  });

  it('keeps all twelve article canonicals, alternates and schemas coherent', () => {
    for (const id of articles)
      for (const locale of locales) {
        const path = articlePath(id, locale);
        const data = loader({
          params: { '*': path.replace(/^\//, '') },
        } as unknown as LoaderFunctionArgs);
        const tags =
          meta({ loaderData: data } as Parameters<typeof meta>[0]) ?? [];
        expect(data.view.kind).toBe('article');
        expect(data.indexable).toBe(true);
        expect(data.canonical).toBe(`https://dennysora.me${path}`);
        expect(publishedPaths()).toContain(path.slice(0, -1));
        for (const target of locales)
          expect(tags).toContainEqual({
            tagName: 'link',
            rel: 'alternate',
            hrefLang: htmlLang[target],
            href: `https://dennysora.me${articlePath(id, target)}`,
          });
        const schemas = tags.flatMap((tag) =>
          'script:ld+json' in tag ? [tag['script:ld+json']] : [],
        );
        expect(schemas[0]).toMatchObject({
          '@type': 'BlogPosting',
          inLanguage: htmlLang[locale],
          mainEntityOfPage: data.canonical,
        });
        expect(schemas[1]).toMatchObject({ '@type': 'BreadcrumbList' });
        if (
          id === 'browser-translation-architecture' ||
          id === 'password-manager-recommendations'
        )
          expect(schemas[0]).not.toHaveProperty('author');
      }
  });
});
