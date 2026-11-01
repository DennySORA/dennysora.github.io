import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  loadPosts,
  renderPost,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { decodeEntities } from '../../src/lib/html.ts';
import { editionStatus } from '../../src/lib/publication.ts';

describe('owner supplied opinion', () => {
  it('publishes the supplied editions and requested Japanese translation with reviewed paragraphs intact', () => {
    const post = loadPosts().find((item) => item.id === 'we-have-choices');
    if (!post) throw new Error('Missing opinion');
    expect(post.editions).toEqual(['zh-hant', 'en', 'ja']);
    expect(post.source).toEqual({
      kind: 'supplied-manuscript',
      sourceVersion: 'manuscript:we-have-choices:edition-1',
    });
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const original = readFileSync(
        `content/posts/we-have-choices/reviewed-${locale}.txt`,
        'utf8',
      )
        .trim()
        .split(/\n+/);
      const rendered = renderPost(post.id, locale).html;
      const paragraphs = [...rendered.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(
        (match) => decodeEntities(match[1] ?? ''),
      );
      expect(paragraphs).toEqual(original);
      expect(paragraphs).toHaveLength(13);
      expect(publishedPaths()).toContain(
        `/${locale}/blog/opinions/we-have-choices`,
      );
    }
    const folder = loader({
      params: { '*': 'en/blog/opinions/' },
    } as unknown as LoaderFunctionArgs);
    expect(
      folder.languageLinks
        .filter((link) => link.href)
        .map((link) => link.locale),
    ).toEqual(['zh-hant', 'en', 'ja']);
    expect(editionStatus(post, 'en', post.revision + '-changed')).toBe('stale');
    expect(publishedPaths()).toContain('/ja/blog/opinions/we-have-choices');
  });
});
