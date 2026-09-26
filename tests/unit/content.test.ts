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
  const post = loadPosts()[0];
  if (!post) throw new Error('Expected real content fixture');
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
  it('exposes only the requested published edition in public article payloads', () => {
    const article = loadArticle('en', 'engineering-principles');
    expect(article).not.toBeNull();
    expect(article?.post).not.toHaveProperty('locales');
    expect(article?.post).not.toHaveProperty('revision');
    expect(article?.edition).not.toHaveProperty('reviewEvidence');
    // Local image paths from the build machine never reach the page payload.
    expect(article?.body).not.toHaveProperty('images');
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
    expect(navSection({ kind: 'project', locale: 'en', projectId: 'x' })).toBe(
      'projects',
    );
    expect(navSection({ kind: 'research', locale: 'en' })).toBeNull();
  });
  it('prerenders every published article, topic and non-empty tag', () => {
    const paths = publishedPaths();
    expect(new Set(paths).size).toBe(paths.length);
    for (const value of loadPosts())
      for (const locale of value.editions) {
        expect(paths).toContain(`/${locale}/blog/${value.slug}`);
        for (const tag of value.tagIds)
          expect(paths).toContain(`/${locale}/blog/tags/${tag}`);
        for (const topic of value.topics)
          expect(paths).toContain(`/${locale}/blog/topics/${topic}`);
      }
    for (const locale of locales) {
      expect(paths).toContain(`/${locale}/papers`);
      expect(paths).toContain(`/${locale}/research`);
      expect(paths).toContain(prerenderPath({ kind: 'tags', locale }));
    }
    expect(tagsInLocale('en').length).toBeGreaterThan(0);
  });
  it('keeps bridges and projects without a case study out of the index', () => {
    const routes = publishedRoutes();
    for (const route of routes.filter(
      (item) => item.kind === 'research' || item.kind === 'project',
    ))
      expect(isIndexable(route)).toBe(false);
    for (const route of routes.filter(
      (item) => item.kind === 'article' || item.kind === 'tag',
    ))
      expect(isIndexable(route)).toBe(true);
  });
});

describe('loader', () => {
  it('serves every route kind with canonical, robots and language links', () => {
    const about = load('/zh-hant/about');
    expect(about.view.kind).toBe('about');
    expect(about.canonical).toBe('https://dennysora.me/zh-hant/about/');
    expect(about.indexable).toBe(true);
    // Internal provenance notes stay in the repository.
    expect(JSON.stringify(about)).not.toContain('provenance');
    const research = load('/en/research');
    expect(research.indexable).toBe(false);
    const tag = load('/ja/blog/tags/llm');
    expect(tag.view.kind).toBe('tag');
    expect(tag.languageLinks.find((link) => link.locale === 'en')?.href).toBe(
      '/en/blog/tags/llm/',
    );
    const article = load('/en/blog/trilingual-model-research');
    if (article.view.kind !== 'article') throw new Error('Expected an article');
    expect(article.view.comments).toEqual({
      kind: 'native',
      url: 'https://github.com/DennySORA/dennysora.github.io/discussions/3',
    });
    expect(article.view.article.post.contentType).toBe('research-note');
    expect(article.view.article.post.topics).toEqual(['ai']);
  });
  it('answers unknown paths, slugs and empty taxonomy with a real 404', () => {
    for (const path of [
      '/en/blog/not-a-post',
      '/en/blog/tags/unknown-tag',
      '/en/blog/topics/unknown',
      '/en/projects/unknown',
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
});

describe('content graph', () => {
  it('validates taxonomy, relations, reserved slugs and published anchors', () => {
    expect(() => validateContent()).not.toThrow();
  });
  it('merges human research notes into the library as typed content', () => {
    const research = loadPosts().find(
      (post) => post.id === 'trilingual-model-research',
    );
    expect(research?.contentType).toBe('research-note');
    expect(research?.slug).toBe('trilingual-model-research');
    for (const locale of locales)
      expect(listPosts(locale).map((post) => post.id)).toContain(
        'trilingual-model-research',
      );
  });
  it('ranks explicit and shared-tag relations instead of list position', () => {
    const related = relatedPosts('en', 'engineering-principles');
    expect(related.map((post) => post.id)).toEqual([
      'production-systems',
      'trilingual-model-research',
    ]);
    expect(related.length).toBeLessThanOrEqual(3);
  });
  it('keeps every published heading anchor, including section-N aliases', () => {
    const anchors = loadHeadingAnchors();
    let checked = 0;
    for (const [id, editions] of Object.entries(anchors))
      for (const [locale, headings] of Object.entries(editions)) {
        const ids = renderPost(
          id,
          locale as (typeof locales)[number],
        ).headings.map((heading) => heading.id);
        for (const heading of headings ?? []) {
          expect(ids, `${id}/${locale}`).toContain(heading.id);
          checked++;
        }
      }
    expect(checked).toBeGreaterThanOrEqual(51);
    expect(
      renderPost('engineering-principles', 'ja').headings.map(
        (heading) => heading.id,
      ),
    ).toContain('how-h');
  });
});
