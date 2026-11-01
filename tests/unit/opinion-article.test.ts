import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { listPosts, publishedPaths } from '../../src/lib/content.server.ts';
import { loadThought } from '../../src/lib/thoughts.server.ts';
import { decodeEntities } from '../../src/lib/html.ts';

describe('owner supplied opinion in Thoughts', () => {
  it('preserves all three reviewed editions outside Blog', () => {
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const original = readFileSync(
        `content/thoughts/we-have-choices/reviewed-${locale}.txt`,
        'utf8',
      )
        .trim()
        .split(/\n+/);
      const thought = loadThought(locale, 'we-have-choices');
      if (!thought) throw new Error('Missing thought');
      const paragraphs = [
        ...thought.body.html.matchAll(/<p>([\s\S]*?)<\/p>/g),
      ].map((match) => decodeEntities(match[1] ?? ''));
      expect(paragraphs).toEqual(original);
      expect(paragraphs).toHaveLength(13);
      expect(publishedPaths()).toContain(`/${locale}/thoughts/we-have-choices`);
      expect(
        listPosts(locale).some((post) => post.slug === 'we-have-choices'),
      ).toBe(false);
      expect(publishedPaths()).not.toContain(
        `/${locale}/blog/opinions/we-have-choices`,
      );
      const page = loader({
        params: { '*': `${locale}/thoughts/we-have-choices/` },
      } as unknown as LoaderFunctionArgs);
      expect(page.commentId).toBe('article:we-have-choices');
      expect(page.canonical).toBe(
        `https://dennysora.me/${locale}/thoughts/we-have-choices/`,
      );
      expect(
        page.languageLinks
          .filter((link) => link.href)
          .map((link) => link.locale),
      ).toEqual(['zh-hant', 'en', 'ja']);
    }
  });
});
