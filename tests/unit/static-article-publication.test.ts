import { describe, expect, it, vi } from 'vitest';

// Isolated fixture: simulate accidentally publishing only the original, never
// fabricate translation review evidence or change on-disk publication state.
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
      const bytes = fs.readFileSync(...args);
      if (
        !String(args[0]).endsWith(
          '/posts/password-manager-recommendations/meta.json',
        )
      )
        return bytes;
      const post = JSON.parse(bytes.toString()) as {
        locales: { 'zh-hant': { publication: string } };
      };
      post.locales['zh-hant'].publication = 'published';
      const value = JSON.stringify(post);
      return typeof bytes === 'string' ? value : Buffer.from(value);
    },
  };
});

import { validateContent } from '../../src/lib/content.server.ts';

describe('imported article release contract', () => {
  it('blocks publication while sibling translations are still drafts', () => {
    expect(() => validateContent()).toThrow(
      'Static article requires all three reviewed editions',
    );
  });
});
