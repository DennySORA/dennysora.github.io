import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { locales } from '../../src/i18n/index.ts';
import { loader } from '../../src/app/page.tsx';
import {
  isIndexable,
  listPosts,
  loadArticle,
  loadHeadingAnchors,
  loadPosts,
  publishedPaths,
  publishedRoutes,
  relatedPosts,
  renderPost,
  tagsInLocale,
  validateContent,
} from '../../src/lib/content.server.ts';
import { editionStatus } from '../../src/lib/publication.ts';
import {
  navSection,
  parseRoute,
  prerenderPath,
  routePath,
  withLocale,
} from '../../src/lib/route-manifest.ts';
import { postSchema } from '../../src/lib/schema.ts';

function load(path: string) {
  return loader({
    params: { '*': path.replace(/^\//, '') },
  } as unknown as LoaderFunctionArgs);
}

describe('publication boundaries', () => {
  const retained = loadPosts().find(
    (post) => post.id === 'engineering-principles',
  );
  if (!retained) throw new Error('Expected retained source fixture');
  // Publication rules use an isolated fixture, not live example articles.
  const post = structuredClone(retained);
  for (const edition of Object.values(post.locales))
    edition.publication = 'published';
  it('publishes originals and inherited translations with immutable evidence', () => {
    for (const locale of locales)
      expect(editionStatus(post, locale, post.revision)).toBe('published');
    expect(post.source.commit).toMatch(/^[a-f0-9]{40}$/);
  });
  it('detects source edits without silently republishing translations', () => {
    expect(editionStatus(post, 'en', '0'.repeat(64))).toBe('stale');
    expect(editionStatus(post, 'zh-hant', '0'.repeat(64))).toBe('published');
  });
  it('excludes machine drafts, absent translations, and unsupported review claims', () => {
    const value = structuredClone(post);
    const english = value.locales.en;
    if (!english) throw new Error('Fixture missing');
    english.translationState = 'machine-draft';
    expect(editionStatus(value, 'en', post.revision)).toBe('draft');
    english.translationState = 'reviewed';
    english.reviewEvidence = null;
    expect(editionStatus(value, 'en', post.revision)).toBe('draft');
    delete value.locales.ja;
    expect(editionStatus(value, 'ja', post.revision)).toBe('missing');
  });
  it('rejects traversal slugs, executable URL schemes and unknown fields', () => {
    const value = postSchema.parse(
      JSON.parse(
        readFileSync('content/posts/engineering-principles/meta.json', 'utf8'),
      ) as unknown,
    );
    expect(() => postSchema.parse({ ...value, id: '../../secret' })).toThrow();
    expect(() =>
      postSchema.parse({
        ...value,
        source: { ...value.source, url: 'javascript:alert(1)' },
      }),
    ).toThrow();
    expect(() => postSchema.parse({ ...value, contentType: 'blog' })).toThrow();
    expect(() => postSchema.parse({ ...value, extra: true })).toThrow();
  });
  it('keeps every unpublished example out of public article payloads', () => {
    for (const retained of loadPosts())
      for (const locale of locales) {
        expect(editionStatus(retained, locale, retained.revision)).toBe(
          'draft',
        );
        expect(loadArticle(locale, retained.slug)).toBeNull();
      }
    expect(loadArticle('en', 'not-a-post')).toBeNull();
  });
  it('keeps content revisions tied to actual source bytes', () => {
    for (const value of loadPosts())
      expect(value.locales.en?.sourceRevision).toBe(
        createHash('sha256')
          .update(readFileSync(`content/posts/${value.id}/zh-hant.md`))
          .digest('hex'),
      );
  });
});

describe('route manifest', () => {
  it('round-trips every published route through one parser', () => {
    for (const route of publishedRoutes())
      expect(parseRoute(routePath(route))).toEqual(route);
  });
  it('accepts four-segment taxonomy routes and rejects unknown shapes', () => {
    expect(parseRoute('/en/blog/tags/llm/')).toEqual({
      kind: 'tag',
      locale: 'en',
      tagId: 'llm',
    });
    expect(parseRoute('/ja/blog/topics/ai/')).toEqual({
      kind: 'topic',
      locale: 'ja',
      topicId: 'ai',
    });
    expect(parseRoute('/zh-hant/blog/tags/')).toEqual({
      kind: 'tags',
      locale: 'zh-hant',
    });
    expect(parseRoute('/')).toEqual({ kind: 'root' });
    for (const bad of [
      '/fr/',
      '/en/blog/tags/llm/extra/',
      '/en/blog/topics/',
      '/en/about/details/',
      // About is a static home redirect; the migrated papers entry is removed.
      '/en/about/',
      '/en/papers/',
      '/en/blog/Bad_Slug/',
      '/en/unknown/',
      '/en/research/notes/',
    ])
      expect(parseRoute(bad), bad).toBeNull();
  });
  it('switches language without losing identity and marks the nav section', () => {
    expect(
      routePath(withLocale({ kind: 'tag', locale: 'en', tagId: 'llm' }, 'ja')),
    ).toBe('/ja/blog/tags/llm/');
    expect(routePath(withLocale({ kind: 'root' }, 'en'))).toBe('/en/');
    expect(navSection({ kind: 'article', locale: 'en', slug: 'x' })).toBe(
      'library',
    );
    expect(navSection({ kind: 'tag', locale: 'en', tagId: 'x' })).toBe(
      'library',
    );
    expect(navSection({ kind: 'home', locale: 'en' })).toBe('home');
  });
  it('prerenders no migrated AI or video pages', () => {
    const paths = publishedPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).not.toEqual([]);
    for (const locale of locales) {
      expect(paths).not.toContain(prerenderPath({ kind: 'tags', locale }));
      expect(paths).toContain(`/${locale}/projects/tools/dgxtop`);
      expect(tagsInLocale(locale)).toEqual([]);
      expect(listPosts(locale)).toEqual([]);
      for (const path of [
        'ai',
        'research',
        'papers',
        'blog/video-console',
        'blog/trilingual-model-research',
        'blog/tags',
        'blog/tags/video-generation',
        'blog/topics/ai',
      ]) {
        expect(paths).not.toContain(`/${locale}/${path}`);
        try {
          load(`/${locale}/${path}`);
          throw new Error('Expected 404');
        } catch (error) {
          expect(error).toBeInstanceOf(Response);
          expect((error as Response).status).toBe(404);
        }
      }
    }
  });
});

describe('retained content and empty blog', () => {
  it('answers unknown paths, drafts and empty taxonomy with a real 404', () => {
    for (const path of [
      '/en/blog/not-a-post',
      '/en/blog/engineering-principles',
      '/zh-hant/blog/production-systems',
      '/en/blog/tags/llm',
      '/en/blog/topics/engineering',
      '/en/blog/tags/unknown-tag',
      '/en/blog/topics/unknown',
      '/en/projects/unknown',
      '/en/about',
      '/xx/about',
    ]) {
      let status = 0;
      try {
        load(path);
      } catch (error) {
        status = error instanceof Response ? error.status : -1;
      }
      expect(status, path).toBe(404);
    }
  });
  it.each(locales)(
    '%s keeps the localized home, notes and empty blog',
    (locale) => {
      const home = load(`/${locale}/`);
      if (home.view.kind !== 'home') throw new Error('Expected home');
      expect(home.canonical).toBe(`https://dennysora.me/${locale}/`);
      expect(home.indexable).toBe(true);
      expect(home.view.profile.displayName).toBe('DennySORA');
      expect(home.view.recent).toEqual([]);
      expect(home.workspace.posts).toEqual([]);
      expect(home.view.projects.map((project) => project.id)).toEqual([
        'dgxtop',
        'httpulse',
      ]);
      expect(JSON.stringify(home)).not.toContain('provenance');
      const blog = load(`/${locale}/blog/`);
      if (blog.view.kind !== 'library') throw new Error('Expected blog');
      expect(blog.view.posts).toEqual([]);
      expect(blog.indexable).toBe(false);
      expect(isIndexable({ kind: 'library', locale })).toBe(false);
      expect(blog.view.available).toEqual({ topics: [], types: [], tags: [] });
      expect(blog.languageLinks).toEqual(
        locales.map((target) => ({ locale: target, href: `/${target}/blog/` })),
      );
      expect(isIndexable({ kind: 'search', locale })).toBe(false);
      for (const post of loadPosts())
        expect(relatedPosts(locale, post.id)).toEqual([]);
    },
  );
  it('validates retained content and all its frozen heading anchors', () => {
    expect(() => validateContent()).not.toThrow();
    expect(
      loadPosts()
        .map((post) => post.id)
        .sort(),
    ).toEqual(['engineering-principles', 'production-systems']);
    const anchors = loadHeadingAnchors();
    expect(Object.keys(anchors).sort()).toEqual([
      'engineering-principles',
      'production-systems',
    ]);
    for (const [id, editions] of Object.entries(anchors))
      for (const locale of locales) {
        const headings = editions[locale] ?? [];
        expect(headings.length).toBeGreaterThan(0);
        const actual = renderPost(id, locale).headings.map(
          (heading) => heading.id,
        );
        expect(actual).toEqual(headings.map((heading) => heading.id));
      }
  });
});
