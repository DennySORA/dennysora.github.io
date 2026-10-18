import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Post } from '../../src/lib/schema.ts';

const root = process.cwd();
const directory = mkdtempSync(join(tmpdir(), 'draft-post-preview-'));
const id = 'draft-video-fixture';
const articleDirectory = join(directory, 'content/posts', id);
mkdirSync(articleDirectory, { recursive: true });
mkdirSync(join(directory, 'data/migration'), { recursive: true });
const metadata = JSON.parse(
  readFileSync(
    join(root, 'content/posts/engineering-principles/meta.json'),
    'utf8',
  ),
) as Post;
metadata.id = id;
metadata.slug = id;
for (const edition of Object.values(metadata.locales))
  edition.publication = 'draft';
writeFileSync(join(articleDirectory, 'meta.json'), JSON.stringify(metadata));
for (const locale of ['zh-hant', 'en', 'ja'])
  writeFileSync(
    join(articleDirectory, `${locale}.md`),
    '![Preview fixture](./demo.mp4)',
  );
writeFileSync(join(articleDirectory, 'demo.mp4'), 'local video fixture');
copyFileSync(
  join(root, 'assets/logo-hero.webp'),
  join(articleDirectory, 'demo.webp'),
);
writeFileSync(join(directory, 'data/migration/heading-anchors.json'), '{}');
writeFileSync(
  join(directory, 'data/post-media.json'),
  JSON.stringify({
    checkedAt: '2026-10-18',
    note: 'Isolated draft preview fixture.',
    repository:
      'https://huggingface.co/datasets/DennySORA/dennysora-site-media',
    files: [],
  }),
);

writeFileSync(join(directory, 'data/post-sections.json'), '{}');

let content: typeof import('../../src/lib/content.server.ts');
let restoreCwd: () => void;
beforeAll(async () => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(directory);
  restoreCwd = () => cwd.mockRestore();
  vi.resetModules();
  content = await import('../../src/lib/content.server.ts');
});
afterAll(() => {
  restoreCwd?.();
  rmSync(directory, { recursive: true, force: true });
});

describe('draft video preview isolation', () => {
  it('never reuses preview HTML in the production renderer or article loader', () => {
    const preview = content.renderPost(id, 'en', { mode: 'draft-preview' });
    expect(preview.previewVideos).toHaveLength(1);
    expect(preview.html).toContain('<video controls');
    expect(() => content.renderPost(id, 'en')).toThrow('draft previews');
    expect(content.loadArticle('en', id)).toBeNull();
    expect(() =>
      content.renderPost('missing-article', 'en', { mode: 'draft-preview' }),
    ).toThrow('existing draft');
  });
});
