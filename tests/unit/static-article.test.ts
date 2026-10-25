import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderStaticArticle } from '../../src/lib/static-article.server.ts';
import {
  loadArticle,
  publishedPaths,
  renderPost,
} from '../../src/lib/content.server.ts';
import { articlePath, populatedBlogFolders } from '../../src/lib/blog-tree.ts';
import { parseRoute, routePath } from '../../src/lib/route-manifest.ts';

describe('imported static article boundary', () => {
  it('preserves the password guide diagrams, disclosures and reference anchors', () => {
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const source = readFileSync(
        `content/posts/password-manager-recommendations/${locale}.html`,
        'utf8',
      );
      const body = renderStaticArticle(source);
      expect(body.html.match(/<figure\b/g)).toHaveLength(9);
      expect(body.html.match(/<details\b/g)).toHaveLength(9);
      expect(body.headings).toHaveLength(10);
      for (let n = 1; n <= 22; n++)
        expect(body.html).toContain(`id="src-${String(n).padStart(2, '0')}"`);
      expect(body.html).toContain('viewBox="0 0 24 24"');
      expect(body.html).not.toMatch(/<script|\son\w+=|\sstyle=|\ssrc=/i);
      expect(
        renderPost('password-manager-recommendations', locale, {
          mode: 'draft-preview',
        }).html,
      ).toBe(body.html);
    }
  });

  it('preserves the networking diagrams, tables and all static coverage cases', () => {
    // The supplied example's original constants; no uploaded JavaScript runs.
    const local = [1, 2, 3];
    const peers: Record<string, number[]> = {
      A: [1, 2, 4, 5, 6],
      B: [6, 7, 8, 9],
      C: [9, 10, 11, 12],
    };
    const required = Array.from({ length: 12 }, (_, index) => index + 1);
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const source = readFileSync(
        `content/posts/p2p-downloader-architecture/${locale}.html`,
        'utf8',
      );
      const body = renderStaticArticle(source);
      for (const [tag, count] of [
        ['figure', 6],
        ['table', 15],
        ['svg', 3],
        ['text', 87],
        ['sup', 43],
      ] as const)
        expect(body.html.match(new RegExp(`<${tag}\\b`, 'g'))).toHaveLength(
          count,
        );
      expect(
        body.headings.filter((heading) => heading.level === 2),
      ).toHaveLength(17);
      expect(
        body.headings.filter((heading) => heading.level === 3),
      ).toHaveLength(52);
      expect(body.html.match(/href="https:\/\//g)).toHaveLength(21);
      expect(body.html).not.toMatch(/<script|<input|\son\w+=|\sstyle=|\ssrc=/i);
      expect(
        renderPost('p2p-downloader-architecture', locale, {
          mode: 'draft-preview',
        }).html,
      ).toBe(body.html);
      const comparison =
        /<details class="np-coverage-cases">([\s\S]*?)<\/details>/.exec(
          body.html,
        )?.[1] ?? '';
      const rows = [...comparison.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1);
      expect(rows).toHaveLength(8);
      const combinations = new Set<string>();
      for (const row of rows) {
        const cells = [
          ...(row[1] ?? '').matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g),
        ].map((cell) => cell[1] ?? '');
        const active = cells[0]?.match(/[ABC]/g) ?? [];
        combinations.add(active.join(''));
        const remote = new Set(active.flatMap((peer) => peers[peer] ?? []));
        const covered = required.filter(
          (piece) => local.includes(piece) || remote.has(piece),
        );
        const supplied = required.filter(
          (piece) => !local.includes(piece) && remote.has(piece),
        );
        const missing = required.filter(
          (piece) => !local.includes(piece) && !remote.has(piece),
        );
        const numbers = (value: string | undefined) =>
          (value?.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
        const [coverage, total, percent] = numbers(cells[1]);
        expect([coverage, total]).toEqual([covered.length, 12]);
        expect(percent).toBeCloseTo((covered.length / 12) * 100, 1);
        expect(numbers(cells[2])).toEqual([supplied.length, 9]);
        expect(numbers(cells[3])).toEqual(missing);
      }
      expect(combinations.size).toBe(8);
      const path = articlePath('p2p-downloader-architecture', locale);
      expect(path).toBe(`/${locale}/blog/network/p2p-downloader-architecture/`);
      const route = parseRoute(path);
      expect(route).not.toBeNull();
      if (route) expect(routePath(route)).toBe(path);
      expect(loadArticle(locale, 'p2p-downloader-architecture')).toBeNull();
      expect(publishedPaths()).not.toContain(path.slice(0, -1));
    }
  });

  it('rejects execution, external SVG resources, unsafe links and broken IDs', () => {
    for (const input of [
      '<script>alert(1)</script>',
      '<svg onload="alert(1)"></svg>',
      '<svg><foreignObject><p>unsafe</p></foreignObject></svg>',
      '<svg><use href="https://example.com/icons.svg#x"></use></svg>',
      '<svg><path href="https://example.com/"></path></svg>',
      '<a href="javascript:alert(1)">unsafe</a>',
      '<a href="#missing">broken</a>',
      '<p style="background:url(https://example.com/)">unsafe</p>',
      '<h2 id="main">reserved</h2>',
      '<h2 id="source-title">reserved</h2>',
      "<p id='main'>reserved with alternate quoting</p>",
      "<p id='x'>a</p><p id='x'>duplicate</p>",
      '<p id="x">a</p><p id="x">b</p>',
    ])
      expect(() => renderStaticArticle(input)).toThrow();
  });

  it('uses the populated security folder and keeps draft articles private', () => {
    expect(populatedBlogFolders([])).toEqual([]);
    expect(
      populatedBlogFolders([{ slug: 'password-manager-recommendations' }]),
    ).toEqual(['security']);
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const path = articlePath('password-manager-recommendations', locale);
      expect(path).toBe(
        `/${locale}/blog/security/password-manager-recommendations/`,
      );
      const route = parseRoute(path);
      expect(route).not.toBeNull();
      if (route) expect(routePath(route)).toBe(path);
      expect(
        parseRoute(`/${locale}/blog/password-manager-recommendations/`),
      ).toBeNull();
      expect(publishedPaths()).not.toContain(path.slice(0, -1));
      expect(
        loadArticle(locale, 'password-manager-recommendations'),
      ).toBeNull();
    }
  });

  it('preserves accessible SVG text and only local marker references', () => {
    const safe =
      '<svg role="img" aria-labelledby="diagram-title" viewBox="0 0 100 100"><title id="diagram-title">Diagram</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L5 5" /></marker></defs><g marker-end="url(#arrow)"><path d="M0 0L10 10" /><text class="np-svg-font-size-13" x="2" y="3">A label</text></g></svg>';
    const html = renderStaticArticle(safe).html;
    expect(html).toContain('aria-labelledby="diagram-title"');
    expect(html).toContain('marker-end="url(#arrow)"');
    expect(html).toContain('class="np-svg-font-size-13"');
    expect(html).toContain('>A label</text>');
    expect(() =>
      renderStaticArticle('<title id="title">Outside SVG</title>'),
    ).toThrow();
    expect(() =>
      renderStaticArticle(
        safe.replace('url(#arrow)', 'url(https://example.com/arrow.svg#a)'),
      ),
    ).toThrow();
    // Attribute allowlists also handle alternate quoting and entity decoding.
    const alternate = safe.replace(
      'marker-end="url(#arrow)"',
      "marker-end='url(https://example.com/arrow.svg#a)'",
    );
    expect(() => renderStaticArticle(alternate)).toThrow();
  });
});
