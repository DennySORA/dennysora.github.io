import { describe, expect, it, vi } from 'vitest';

// Make retained examples published only within this isolated test module.
// Source metadata stays draft on disk and the production build stays empty.
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
      const bytes = fs.readFileSync(...args);
      if (!/\/content\/posts\/[^/]+\/meta\.json$/.test(String(args[0])))
        return bytes;
      const post = JSON.parse(bytes.toString()) as {
        locales: Record<string, { publication: string }>;
      };
      for (const edition of Object.values(post.locales))
        edition.publication = 'published';
      const json = JSON.stringify(post);
      return typeof bytes === 'string' ? json : Buffer.from(json);
    },
  };
});

import { locales } from '../../src/i18n/index.ts';
import {
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
    for (const post of loadPosts())
      for (const locale of locales) {
        expect(post.editions).toContain(locale);
        expect(paths).toContain(`/${locale}/blog/${post.slug}`);
        for (const tag of post.tagIds)
          expect(paths).toContain(`/${locale}/blog/tags/${tag}`);
        for (const topic of post.topics)
          expect(paths).toContain(`/${locale}/blog/topics/${topic}`);
      }
  });

  it('ranks shared-tag relations instead of list position', () => {
    const related = relatedPosts('en', 'engineering-principles');
    expect(related.map((post) => post.id)).toEqual([
      'production-systems',
      'trilingual-model-research',
    ]);
    expect(related.length).toBeLessThanOrEqual(3);
  });
});
