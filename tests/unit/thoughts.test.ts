import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { Thoughts, Thought } from '../../src/features/thoughts/Thoughts.tsx';
import { dictionaries, htmlLang, locales } from '../../src/i18n/index.ts';
import { listPosts, publishedRoutes } from '../../src/lib/content.server.ts';
import { commentTarget } from '../../src/lib/comments.ts';
import { parseRoute, routePath } from '../../src/lib/route-manifest.ts';
import { areaState, areas, filePath } from '../../src/lib/workspace.ts';
import { buildSiteSearch } from '../../src/lib/site-search.server.ts';
import { parseSearchIndex, searchSite } from '../../src/lib/site-search.ts';
import * as content from '../../src/lib/thoughts.server.ts';
import { escapeHtml } from '../../src/lib/html.ts';
import covers from '../../data/article-covers.json';

const folders: string[] = [];
function fixture(publication: 'draft' | 'published' = 'published') {
  const root = mkdtempSync(join(tmpdir(), 'thoughts-'));
  folders.push(root);
  const folder = join(root, 'fixture');
  mkdirSync(folder);
  const thought: content.Thought = {
    slug: 'fixture',
    publication,
    publishedAt: '2026-10-27',
    updatedAt: '2026-10-27',
    locales: {
      'zh-hant': { title: '測試想法', summary: '測試摘要。' },
      en: { title: 'A test thought', summary: 'A test summary.' },
      ja: { title: 'テストの考え', summary: 'テストの概要。' },
    },
  };
  writeFileSync(join(folder, 'meta.json'), JSON.stringify(thought));
  const bodies = {
    'zh-hant': '這是一個測試想法。',
    en: 'This is a test thought.',
    ja: 'これはテストの考えです。',
  };
  for (const locale of locales)
    writeFileSync(join(folder, `${locale}.md`), bodies[locale]);
  return { root, folder, thought, bodies };
}
function page(path: string) {
  return loader({
    params: { '*': path.replace(/^\//, '') },
  } as unknown as LoaderFunctionArgs);
}
afterEach(() => {
  vi.restoreAllMocks();
  for (const folder of folders.splice(0))
    rmSync(folder, { recursive: true, force: true });
});

describe('independent Thoughts', () => {
  it('keeps an empty trilingual category navigable without inventing published content', () => {
    expect(content.loadThoughts('/nonexistent-thought-fixture')).toEqual([]);
    vi.spyOn(content, 'listThoughts').mockReturnValue([]);
    for (const locale of locales) {
      const route = { kind: 'thoughts' as const, locale };
      expect(parseRoute(routePath(route))).toEqual(route);
      expect(publishedRoutes()).toContainEqual(route);
      const data = page(routePath(route));
      expect(data.view).toEqual({ kind: 'thoughts', thoughts: [] });
      expect(data.indexable).toBe(false);
      expect(data.commentId).toBe('index:thoughts');
      expect(data.workspace.thoughts).toEqual([]);
      expect(areas(locale, { posts: [] }).map((area) => area.key)).toContain(
        'thoughts',
      );
      expect(areaState(route, 'thoughts')).toBe('page');
      expect(filePath(route)).toBe('thoughts/');
      const html = renderToStaticMarkup(
        createElement(Thoughts, { thoughts: [], locale }),
      );
      expect(html).toContain(dictionaries[locale].thoughtsEmptyTitle);
      expect(html).not.toContain('article-cover');
      expect(() => page(`/${locale}/thoughts/missing/`)).toThrow();
      expect(parseRoute(`/${locale}/thoughts/extra/path/`)).toBeNull();
    }
  });

  it('connects published editions to routes, metadata, stable comments and only sitewide search', () => {
    const { root, bodies } = fixture();
    const built = mkdtempSync(join(tmpdir(), 'thoughts-built-'));
    folders.push(built);
    const list = content.listThoughts;
    const load = content.loadThought;
    vi.spyOn(content, 'listThoughts').mockImplementation((locale) =>
      list(locale, root),
    );
    vi.spyOn(content, 'loadThought').mockImplementation((locale, slug) =>
      load(locale, slug, root),
    );
    const routes = publishedRoutes().filter(
      (route) => route.kind === 'thought',
    );
    expect(routes).toHaveLength(3);
    for (const locale of locales) {
      const route = { kind: 'thought' as const, locale, slug: 'fixture' };
      const href = routePath(route);
      expect(parseRoute(href)).toEqual(route);
      expect(areaState(route, 'thoughts')).toBe('true');
      expect(filePath(route)).toBe('thoughts/fixture.md');
      const data = page(href);
      if (data.view.kind !== 'thought') throw new Error('Expected a thought');
      expect(data.canonical).toBe(`https://dennysora.me${href}`);
      expect(data.commentId).toBe('thought:fixture');
      expect(commentTarget(route)?.id).toBe('thought:fixture');
      expect(listPosts(locale).some((post) => post.slug === 'fixture')).toBe(
        false,
      );
      const descriptors =
        meta({ loaderData: data } as Parameters<typeof meta>[0]) ?? [];
      expect(descriptors).toContainEqual({
        property: 'og:type',
        content: 'article',
      });
      for (const target of locales)
        expect(descriptors).toContainEqual({
          tagName: 'link',
          rel: 'alternate',
          hrefLang: htmlLang[target],
          href: `https://dennysora.me/${target}/thoughts/fixture/`,
        });
      expect(
        descriptors.find((item) => 'script:ld+json' in item),
      ).toMatchObject({
        'script:ld+json': {
          '@type': 'Article',
          headline: data.view.thought.title,
        },
      });
      const html = renderToStaticMarkup(
        createElement(Thought, { thought: data.view.thought, locale }),
      );
      expect(html).toContain(bodies[locale]);
      expect(html).not.toMatch(
        /data-pagefind-body|source-note|article-cover|translationState|sourceRevision|reviewEvidence/,
      );
      expect(JSON.stringify(data.view)).not.toMatch(
        /"(?:source|commit|revision|reviewEvidence|publication|locales)"/,
      );
      const output = join(built, href);
      mkdirSync(output, { recursive: true });
      writeFileSync(
        join(output, 'index.html'),
        `<title>${escapeHtml(data.title)}</title><meta name="description" content="${escapeHtml(data.description)}"><main>${html}</main>`,
      );
    }
    const index = parseSearchIndex(buildSiteSearch(built, routes));
    expect(index.every((entry) => entry.kind === 'thought')).toBe(true);
    expect(searchSite(index, 'test thought', 'thought', 'en')[0]?.href).toBe(
      '/en/thoughts/fixture/',
    );
    expect(searchSite(index, 'test thought', 'article', 'en')).toEqual([]);
  });

  it('withholds drafts and rejects missing translations and imported-source metadata', () => {
    const { root, folder, thought } = fixture('draft');
    unlinkSync(join(folder, 'ja.md'));
    expect(content.listThoughts('en', root)).toEqual([]);
    expect(content.loadThought('en', 'fixture', root)).toBeNull();
    expect(content.thoughtAssets(thought, root)).toEqual([]);
    writeFileSync(
      join(folder, 'meta.json'),
      JSON.stringify({ ...thought, publication: 'published' }),
    );
    expect(() => content.loadThoughts(root)).toThrow();
    expect(
      content.thoughtSchema.safeParse({
        ...thought,
        locales: { en: thought.locales.en },
      }).success,
    ).toBe(false);
    expect(
      content.thoughtSchema.safeParse({
        ...thought,
        source: { repo: 'not-needed' },
      }).success,
    ).toBe(false);
    expect(
      content.thoughtSchema.safeParse({
        ...thought,
        cover: {
          file: '../outside.jpg',
          alt: { 'zh-hant': '圖', en: 'Image', ja: '画像' },
        },
      }).success,
    ).toBe(false);
  });

  it('supports optional localized JPEG covers and ships only confined published assets', () => {
    const { root, folder, thought } = fixture();
    expect(content.loadThought('en', 'fixture', root)?.cover).toBeNull();
    const image = covers.covers
      .flatMap((cover) => cover.assets)
      .find((asset) => asset.path.endsWith('.jpg'));
    if (!image) throw new Error('Expected an existing repository JPEG fixture');
    cpSync(image.path, join(folder, 'cover.jpg'));
    thought.cover = {
      file: 'cover.jpg',
      alt: { 'zh-hant': '測試封面', en: 'Test cover', ja: 'テスト表紙' },
    };
    writeFileSync(join(folder, 'meta.json'), JSON.stringify(thought));
    const article = content.loadThought('en', 'fixture', root);
    if (!article) throw new Error('Expected published fixture');
    expect(article.cover).toMatchObject({
      src: '/content-assets/thoughts/fixture/cover.jpg',
      alt: 'Test cover',
      width: image.width,
      height: image.height,
    });
    expect(content.thoughtAssets(thought, root)[0]?.source).toBe(
      join(folder, 'cover.jpg'),
    );
    const html = renderToStaticMarkup(
      createElement(Thought, { thought: article, locale: 'en' }),
    );
    expect(html).toContain('class="article-cover"');
    expect(html).toContain('alt="Test cover"');
    writeFileSync(join(root, 'outside.jpg'), readFileSync(image.path));
    unlinkSync(join(folder, 'cover.jpg'));
    symlinkSync(join(root, 'outside.jpg'), join(folder, 'cover.jpg'));
    expect(() => content.loadThoughts(root)).toThrow('leaves its folder');
  });
});
