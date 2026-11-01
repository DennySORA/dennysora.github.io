import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sourceStrings from '../fixtures/vpn-manuscript-strings.json' with { type: 'json' };
import { loadPosts, renderPost } from '../../src/lib/content.server.ts';
import { decodeEntities } from '../../src/lib/html.ts';
import { renderStaticArticle } from '../../src/lib/static-article.server.ts';
import { editionStatus } from '../../src/lib/publication.ts';

const directory = join(process.cwd(), 'content/posts/vpn-manager-architecture');
const normalize = (text: string) =>
  decodeEntities(text).replace(/\s+/g, ' ').trim();

describe('VPN Manager manuscript preservation and safe integration', () => {
  it('retains every original text fragment, diagrams and screenshots in all editions', () => {
    const post = loadPosts().find(
      ({ id }) => id === 'vpn-manager-architecture',
    );
    if (!post) throw new Error('Missing VPN article');
    const source = readFileSync(join(directory, 'zh-hant.html'), 'utf8');
    const original = normalize(source + post.locales['zh-hant']?.title);
    const plain = normalize(source.replace(/<[^>]+>/g, ' '));
    for (const value of Object.values(sourceStrings))
      expect(
        original.includes(normalize(value)) || plain.includes(normalize(value)),
        value,
      ).toBe(true);
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const body = renderPost(post.id, locale);
      expect(body.html.match(/<svg\b/g)).toHaveLength(9);
      expect(body.html.match(/<figure\b/g)).toHaveLength(13);
      expect(body.html.match(/<text\b/g)).toHaveLength(332);
      expect(body.html.match(/<table\b/g)).toHaveLength(1);
      expect(body.images).toHaveLength(3);
      expect(body.html).not.toMatch(
        /<script|\son\w+=|\sstyle=|data:image|src="https?:/i,
      );
      expect(body.headings.filter(({ level }) => level === 2)).toHaveLength(7);
      for (const image of body.images)
        expect(image.url).toMatch(
          /^\/content-assets\/posts\/vpn-manager-architecture\/screenshot-[123]\.png$/,
        );
      if (locale === 'en') expect(body.text).not.toMatch(/[\u3400-\u9fff]/);
    }
    expect(source).toBe(
      readFileSync(join(directory, 'reviewed-source.html'), 'utf8'),
    );
    expect(post.source).toMatchObject({
      kind: 'library-manuscript',
      version: 0,
      edition: 1,
    });
    expect(post.revision).toBe(
      'library:libfile_3adfe16a96dc819181b3efea6af56781:v0:edition-1',
    );
    expect(editionStatus(post, 'en', post.revision + '-changed')).toBe('stale');
    expect(post.source).not.toHaveProperty('sha256');
  });

  it('rejects unbound, remote and escaping images and validates local dimensions', () => {
    const options = {
      directory,
      urlPrefix: '/content-assets/posts/vpn-manager-architecture/',
    };
    const image = (src: string, width = 1514) =>
      `<img src="${src}" width="${width}" height="769" alt="VPN overview">`;
    expect(() => renderStaticArticle(image('screenshot-1.png'))).toThrow();
    for (const src of [
      'https://example.com/x.png',
      '//example.com/x.png',
      '../screenshot-1.png',
      'data:image/png;base64,AA==',
      '%2e%2e/x.png',
    ])
      expect(() => renderStaticArticle(image(src), options)).toThrow();
    expect(() =>
      renderStaticArticle(image('screenshot-1.png', 1), options),
    ).toThrow();
    expect(
      renderStaticArticle(image('screenshot-1.png'), options).images,
    ).toHaveLength(1);
  });
});
