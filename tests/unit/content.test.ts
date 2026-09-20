import { importResearch } from '../../src/lib/research-import.server.ts';
import { parseSearchIndex } from '../../src/lib/search-index.ts';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  loadPosts,
  loadProfile,
  loadArticle,
  loadResearch,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { editionStatus, discussionUrl } from '../../src/lib/publication.ts';
import { renderMarkdown } from '../../src/lib/markdown.server.ts';
import { matchSearch } from '../../src/lib/search.ts';
import { researchSchema, postSchema } from '../../src/lib/schema.ts';
import { locales } from '../../src/i18n/index.ts';

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
  it('rejects traversal slugs and executable URL schemes', () => {
    expect(() => postSchema.parse({ ...post, id: '../../secret' })).toThrow();
    const value = postSchema.parse(
      postSchema.parse(
        JSON.parse(
          readFileSync(
            'content/posts/engineering-principles/meta.json',
            'utf8',
          ),
        ) as unknown,
      ),
    );
    expect(() =>
      postSchema.parse({
        ...value,
        source: { ...value.source, url: 'javascript:alert(1)' },
      }),
    ).toThrow();
  });
  it('enumerates every published deep link', () => {
    const paths = publishedPaths();
    expect(new Set(paths).size).toBe(paths.length);
    for (const value of loadPosts())
      for (const locale of value.editions) {
        expect(paths).toContain(`/${locale}/blog/${value.slug}`);
        expect(loadArticle(locale, value.slug)?.body?.html).toContain('<h2');
      }
    expect(loadArticle('en', 'not-a-post')).toBeNull();
  });
  it('exposes only the requested published edition in public article payloads', () => {
    const article = loadArticle('en', 'engineering-principles');
    expect(article).not.toBeNull();
    expect(article?.post).not.toHaveProperty('locales');
    expect(article?.post).not.toHaveProperty('revision');
    expect(article?.edition).not.toHaveProperty('reviewEvidence');
  });
  it('preserves legacy anchors across profile translations', () => {
    for (const locale of locales) {
      const ids = loadProfile(locale).headings.map((heading) => heading.id);
      for (const id of ['skills-h', 'exp-h', 'edu-h', 'depth-h', 'beyond-h'])
        expect(ids).toContain(id);
      expect(
        loadArticle(locale, 'engineering-principles')?.body.html,
      ).toContain('id="how-h"');
    }
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
describe('Markdown trust boundary', () => {
  it('strips scripts, event handlers, SVG, iframes and dangerous URLs', () => {
    const { html } = renderMarkdown(
      '## Safe\n\n<script>alert(1)</script><iframe src="https://evil.invalid"></iframe><svg onload="alert(1)"></svg><img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29) [external](//evil.invalid) [good](https://example.com)',
    );
    expect(html).not.toMatch(
      /<script|iframe|<svg|<img|onerror|javascript:|href="\/\//,
    );
    expect(html).toContain('href="https://example.com"');
  });
  it('keeps code inert, creates unique heading anchors, and preserves tables', () => {
    const result = renderMarkdown(
      '## Repeated\n\n## Repeated\n\n```html\n<script>alert(1)</script>\n```\n\n| Key | Value |\n| --- | --- |\n| A | B |',
    );
    expect(result.headings.map((h) => h.id)).toEqual([
      'section-1',
      'section-2',
    ]);
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).toContain('<table>');
  });
  it('decodes display entities without turning content into executable markup', () => {
    const result = renderMarkdown('## Platform &amp; API\n\nA &lt; B');
    expect(result.headings[0]?.text).toBe('Platform & API');
    expect(result.text).toContain('A < B');
    expect(result.html).toContain('&amp;');
  });
  it('bounds untrusted document size', () =>
    expect(() => renderMarkdown('a'.repeat(500001))).toThrow('size limit'));
});
describe('locale search', () => {
  const entry = {
    id: 'fixture',
    title: 'LLM inference / Rust::Result',
    text: '量化與推論 延遲 日语 日本語の音声評価',
    tags: ['AI'],
  };
  it.each([
    ['zh-hant', '量化'],
    ['en', 'ｌｌｍ'],
    ['en', 'Rust::Result'],
    ['ja', '音声評価'],
    ['zh-hant', '量化 推論'],
  ] as const)('finds %s query %s', (locale, query) =>
    expect(matchSearch(entry, query, locale)).toBe(true),
  );
  it('handles empty queries and misses', () => {
    expect(matchSearch(entry, '', 'en')).toBe(true);
    expect(matchSearch(entry, 'unmatchedtext', 'en')).toBe(false);
  });
  it('rejects the wrong-language or malformed index', () => {
    expect(() =>
      parseSearchIndex({ locale: 'ja', entries: [entry] }, 'en'),
    ).toThrow();
    expect(() =>
      parseSearchIndex({ locale: 'en', entries: [{ id: 'a' }] }, 'en'),
    ).toThrow();
  });
});
describe('research and comments', () => {
  it('imports only allowlisted metadata and refuses malformed input', () => {
    const fixture = {
      generated_at: '2026-09-17T08:23:50Z',
      run_date: '2026-09-17',
      top5: [
        {
          story_id: 'arxiv:1',
          title: 'Paper',
          title_zh: '論文',
          published_at: '2026-09-16T13:03:12Z',
          primary_link: { url: 'https://arxiv.org/abs/1' },
          summary: '<script>not-public</script>',
        },
      ],
      internal_state: 'not-public',
    };
    const result = importResearch(fixture, 'a'.repeat(40));
    expect(result.reports[0]?.guideUrl).toBe(
      'https://paper.dennysora.me/day/2026-09-17.html',
    );
    expect(JSON.stringify(result)).not.toContain('not-public');
    expect(() =>
      importResearch({ ...fixture, top5: [] }, 'a'.repeat(40)),
    ).toThrow();
    expect(() => importResearch(fixture, '../branch')).toThrow();
  });
  it('accepts only a pinned public research snapshot', () => {
    const value = loadResearch();
    expect(value?.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
    expect(value?.generatedAt).toContain('2026-09-17');
  });
  it('rejects other origins, protocol tricks and unknown payload fields', () => {
    const value = loadResearch();
    if (!value) throw new Error('Fixture missing');
    const report = value.reports[0];
    if (!report) throw new Error('Fixture missing');
    for (const originalUrl of [
      'http://arxiv.org/abs/1',
      'https://arxiv.org.evil.invalid/abs/1',
      'javascript:alert(1)',
    ])
      expect(() =>
        researchSchema.parse({
          ...value,
          reports: [{ ...report, originalUrl }],
        }),
      ).toThrow();
    expect(() =>
      researchSchema.parse({ ...value, secret: 'fixture-only' }),
    ).toThrow();
  });
  it('never fabricates a discussion and maps all locales to one identity', () => {
    expect(discussionUrl(null, null)).toBeNull();
    expect(discussionUrl(1, 'attacker/repo')).toBeNull();
    expect(discussionUrl(3, 'DennySORA/blog-comments')).toBe(
      'https://github.com/DennySORA/blog-comments/discussions/3',
    );
    expect(discussionUrl(-1, 'DennySORA/blog-comments')).toBeNull();
  });
});
