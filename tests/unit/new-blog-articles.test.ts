import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/index.ts';
import {
  articlePath,
  blogFolders,
  populatedBlogFolders,
} from '../../src/lib/blog-tree.ts';
import {
  loadArticle,
  loadPosts,
  publishedPaths,
  renderPost,
} from '../../src/lib/content.server.ts';
import { articleDemoPublication } from '../../src/lib/article-demo-publication.ts';
import { renderStaticArticle } from '../../src/lib/static-article.server.ts';

const articles = [
  {
    id: 'p2p-privacy-boundaries',
    folder: 'network',
    figures: 9,
    tables: 3,
    h2: 14,
    h3: 29,
    svg: 3,
    external: 35,
    controls: 5,
  },
  {
    id: 'browser-translation-architecture',
    folder: 'tools',
    figures: 18,
    tables: 11,
    h2: 15,
    h3: 1,
    svg: 8,
    external: 2,
    controls: 1,
  },
] as const;
describe('new imported article drafts', () => {
  it('keeps all teaching figures, tables, source links and safe editable SVG text', () => {
    for (const article of articles)
      for (const locale of locales) {
        const source = readFileSync(
          `content/posts/${article.id}/${locale}.html`,
          'utf8',
        );
        const body = renderStaticArticle(source);
        for (const [tag, count] of [
          ['figure', article.figures],
          ['table', article.tables],
          ['svg', article.svg],
        ] as const)
          expect(body.html.match(new RegExp(`<${tag}\\b`, 'g'))).toHaveLength(
            count,
          );
        expect(body.headings.filter((h) => h.level === 2)).toHaveLength(
          article.h2,
        );
        expect(body.headings.filter((h) => h.level === 3)).toHaveLength(
          article.h3,
        );
        expect(
          new Set(
            [...body.html.matchAll(/href="(https:[^"]+)"/g)].map((m) => m[1]),
          ).size,
        ).toBe(article.external);
        expect(
          body.html.match(/class="(?:pg|tg)-demo-controls"/g),
        ).toHaveLength(article.controls);
        const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        expect(
          [...body.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
        ).toEqual(ids);
        expect(body.html).not.toMatch(
          /<(?:script|style|input|select|button|iframe|foreignObject)\b|\son\w+=|\sstyle=|\ssrc=/i,
        );
        expect(
          renderPost(article.id, locale, { mode: 'draft-preview' }).html,
        ).toBe(body.html);
        if (locale === 'en')
          expect(body.text.match(/[\u3400-\u9fff]+/g) ?? []).toEqual(
            article.id === 'browser-translation-architecture'
              ? ['漢', '字', '漢字', '再見', '你好']
              : [],
          );
      }
  });
  it('adds a real trilingual tools category but does not expose draft routes', () => {
    for (const locale of locales)
      expect(blogFolders.tools.title[locale].trim()).toBeTruthy();
    expect(
      populatedBlogFolders([{ slug: 'browser-translation-architecture' }]),
    ).toEqual(['tools']);
    for (const article of articles)
      for (const locale of locales) {
        const path = articlePath(article.id, locale);
        expect(path).toBe(`/${locale}/blog/${article.folder}/${article.id}/`);
        expect(publishedPaths()).not.toContain(path.slice(0, -1));
        expect(loadArticle(locale, article.id)).toBeNull();
        const post = loadPosts().find((p) => p.id === article.id);
        expect(post?.locales[locale]?.publication).toBe('draft');
        expect(post?.locales[locale]?.reviewEvidence).toBeNull();
        expect(post?.locales[locale]?.translationState).toBe(
          locale === 'zh-hant' ? 'original' : 'machine-draft',
        );
      }
  });
  it('gates each demo chunk independently from actual publication', () => {
    expect(articleDemoPublication(loadPosts())).toEqual({
      privacy: false,
      translation: false,
    });
    expect(
      articleDemoPublication([
        {
          id: 'p2p-privacy-boundaries',
          locales: { en: { publication: 'published' } },
        },
      ]),
    ).toEqual({ privacy: true, translation: false });
    expect(
      articleDemoPublication([
        {
          id: 'browser-translation-architecture',
          locales: { ja: { publication: 'published' } },
        },
      ]),
    ).toEqual({ privacy: false, translation: true });
    expect(readFileSync('src/lib/translation-demos.ts', 'utf8')).not.toContain(
      'privacy-demo',
    );
    expect(readFileSync('src/lib/privacy-demos.ts', 'utf8')).not.toContain(
      'translation-demo',
    );
  });
  it('keeps dummy/false-positive hatching distinguishable without color', () => {
    const css = readFileSync('src/styles/privacy-guide.css', 'utf8');
    const gradients = [
      ...css.matchAll(/repeating-linear-gradient\(([^;]+)\)/g),
    ];
    expect(gradients).toHaveLength(2);
    for (const gradient of gradients) {
      expect(gradient[1]).toContain('var(--color-entity-kind)');
      expect(gradient[1]).toContain('var(--color-surface)');
    }
    expect(readFileSync('src/styles/article-demos.css', 'utf8')).toContain(
      'dashed CanvasText',
    );
  });
  it('does not widen the static content execution boundary', () => {
    for (const source of [
      '<button type="button">untrusted control</button>',
      '<input type="range">',
      '<svg id="main"></svg>',
      '<div id="x">a</div><span id="x">b</span>',
      '<svg><path id="p" d="M0 0" style="fill:red"/></svg>',
      '<div class="privacy-guide" onclick="alert(1)">x</div>',
    ])
      expect(() => renderStaticArticle(source)).toThrow();
  });
});
