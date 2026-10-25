import { describe, expect, it, vi } from 'vitest';

// Make retained examples published only within this isolated test module.
// Retained example metadata stays draft on disk; the real article is unaffected.
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
      const bytes = fs.readFileSync(...args);
      if (!/\/content\/posts\/[^/]+\/meta\.json$/.test(String(args[0])))
        return bytes;
      const post = JSON.parse(bytes.toString()) as {
        source: { kind: string };
        locales: Record<string, { publication: string }>;
      };
      if (post.source.kind !== 'profile-adaptation') return bytes;
      for (const edition of Object.values(post.locales))
        edition.publication = 'published';
      const json = JSON.stringify(post);
      return typeof bytes === 'string' ? json : Buffer.from(json);
    },
  };
});

import { locales } from '../../src/i18n/index.ts';
import {
  isIndexable,
  loadArticle,
  loadPosts,
  publishedPaths,
  relatedPosts,
} from '../../src/lib/content.server.ts';

describe('published content fixtures', () => {
  it('exposes only the requested edition in public article payloads', () => {
    const article = loadArticle('en', 'engineering-principles');
    expect(article).not.toBeNull();
    expect(article?.post).not.toHaveProperty('locales');
    expect(article?.post).not.toHaveProperty('revision');
    expect(article?.edition).not.toHaveProperty('reviewEvidence');
    expect(article?.body).not.toHaveProperty('images');
  });

  it('prerenders published articles and their populated taxonomy', () => {
    const paths = publishedPaths();
    for (const post of loadPosts().filter(
      (post) => post.source.kind === 'profile-adaptation',
    ))
      for (const locale of locales) {
        expect(post.editions).toContain(locale);
        expect(paths).toContain(`/${locale}/blog/${post.slug}`);
        expect(isIndexable({ kind: 'library', locale })).toBe(true);
        expect(paths).toContain(`/${locale}/blog/tags`);
        for (const tag of post.tagIds)
          expect(paths).toContain(`/${locale}/blog/tags/${tag}`);
        for (const topic of post.topics)
          expect(paths).toContain(`/${locale}/blog/topics/${topic}`);
      }
  });

  it('ranks shared-tag relations instead of list position', () => {
    const related = relatedPosts('en', 'engineering-principles');
    expect(related.map((post) => post.id)).toEqual(['production-systems']);
    expect(related.length).toBeLessThanOrEqual(3);
  });
});
