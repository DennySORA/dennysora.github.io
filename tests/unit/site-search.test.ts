import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildSiteSearch,
  searchableText,
} from '../../src/lib/site-search.server.ts';
import {
  localizedDocuments,
  parseSearchIndex,
  parseSiteSearch,
  searchExcerpt,
  searchSite,
  siteSearchTags,
  type SiteSearchDocument,
} from '../../src/lib/site-search.ts';
import { publishedRoutes } from '../../src/lib/content.server.ts';
import { parseRoute, routePath } from '../../src/lib/route-manifest.ts';
import { locales } from '../../src/i18n/index.ts';

const architecture = {
  id: 'architecture',
  label: { 'zh-hant': '架構設計', en: 'Architecture', ja: 'アーキテクチャ' },
  aliases: ['system design', '系統設計'],
};
const note: SiteSearchDocument = {
  id: '/note/network/p2p-downloader/',
  locale: 'zh-hant',
  kind: 'note',
  href: '/zh-hant/note/network/p2p-downloader/',
  title: 'P2P Downloader',
  summary: '連線治理',
  text: 'A body-only mention of choke_lease. 使用可恢復命令。',
  tags: [architecture],
};
const home: SiteSearchDocument = {
  id: '/',
  locale: 'en',
  kind: 'page',
  href: '/en/',
  title: 'DennySORA',
  summary: 'Software engineer',
  text: 'Rust cloud engineering',
  tags: [],
};
const article: SiteSearchDocument = {
  id: '/blog/p2p/',
  locale: 'en',
  kind: 'article',
  href: '/en/blog/p2p/',
  title: 'P2P in practice',
  summary: 'Networks',
  text: 'BitTorrent protocol',
  tags: [architecture],
};
const fixtures = [home, note, article];
const temp: string[] = [];
afterEach(() => {
  for (const path of temp.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe('global site search', () => {
  it('searches note body text, article content, titles and home text', () => {
    expect(searchSite(fixtures, 'choke_lease', 'all', 'en')).toEqual([note]);
    expect(searchSite(fixtures, '可恢復', 'note', 'zh-hant')).toEqual([note]);
    expect(searchSite(fixtures, 'Ｐ２Ｐ', 'all', 'ja')).toHaveLength(2);
    expect(searchSite(fixtures, 'BitTorrent', 'all', 'en')).toEqual([article]);
    expect(searchSite(fixtures, 'Rust', 'all', 'en')).toEqual([home]);
    expect(searchSite(fixtures, 'P2P', 'article', 'en')).toEqual([article]);
    expect(searchSite(fixtures, 'impossible-query', 'all', 'en')).toEqual([]);
    expect(searchSite(fixtures, '', 'all', 'en')).toHaveLength(3);
    expect(searchExcerpt(note, 'choke_lease')).toContain('choke_lease');
  });
  it('matches tag aliases in every language and exact tags across notes and articles', () => {
    for (const query of ['system design', '架構設計', 'アーキテクチャ'])
      expect(searchSite(fixtures, query, 'all', 'en')).toHaveLength(2);
    expect(searchSite(fixtures, '', 'all', 'en', 'architecture')).toHaveLength(
      2,
    );
    expect(searchSite(fixtures, '', 'note', 'en', 'architecture')).toEqual([
      note,
    ]);
    expect(
      searchSite(fixtures, 'BitTorrent', 'article', 'ja', 'architecture'),
    ).toEqual([article]);
    expect(searchSite(fixtures, '', 'all', 'en', 'unknown')).toEqual([]);
    expect(siteSearchTags(fixtures, 'ja')).toEqual([architecture]);
    expect(parseSiteSearch(new URLSearchParams('tag=architecture')).tag).toBe(
      'architecture',
    );
    expect(() => parseSearchIndex([{ ...note, tags: [{}] }])).toThrow();
    expect(() =>
      parseSearchIndex([{ ...note, tags: 'architecture' }]),
    ).toThrow();
  });
  it('uses one preferred edition and keeps the actual original note URL', () => {
    const translated = {
      ...home,
      locale: 'ja' as const,
      href: '/ja/',
      title: '自己紹介',
    };
    expect(localizedDocuments([...fixtures, translated], 'ja')).toContainEqual(
      translated,
    );
    expect(
      localizedDocuments([...fixtures, translated], 'ja'),
    ).not.toContainEqual(home);
    expect(localizedDocuments(fixtures, 'en')).toContainEqual(note);
    expect(parseSearchIndex(fixtures)).toEqual(fixtures);
    expect(() =>
      parseSearchIndex([{ ...note, href: 'https://example.com' }]),
    ).toThrow();
    expect(() =>
      parseSearchIndex([{ ...note, href: '/zh-hant/privacy/' }]),
    ).toThrow();
    expect(() => parseSearchIndex({})).toThrow();
  });
  it('bounds query input and handles unknown content filters', () => {
    expect(parseSiteSearch(new URLSearchParams('q=+P2P+&kind=note'))).toEqual({
      q: 'P2P',
      kind: 'note',
      tag: '',
    });
    expect(parseSiteSearch(new URLSearchParams('kind=private')).kind).toBe(
      'all',
    );
    expect(
      parseSiteSearch(new URLSearchParams({ q: 'x'.repeat(200) })).q,
    ).toHaveLength(160);
  });
  it('extracts readable text without executable content or merged paragraphs', () => {
    expect(
      searchableText(
        '<p>A &amp; B</p><p>next</p><script>private token</script><style>hidden</style>',
      ),
    ).toBe('A & B next');
  });
  it('indexes only published main content including notes when articles are absent', () => {
    const output = mkdtempSync(join(tmpdir(), 'site-search-'));
    temp.push(output);
    const routes = [
      parseRoute('/en/'),
      parseRoute(note.href),
      parseRoute('/en/search/'),
      parseRoute('/en/privacy/'),
    ].filter((route) => route !== null);
    for (const route of routes.filter((item) => item.kind !== 'search')) {
      const directory = join(output, routePath(route));
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(directory, 'index.html'),
        '<html><head><title>Title — DennySORA</title><meta name="description" content="Summary &amp; evidence"></head><body><nav>unrelated chrome</nav><main><p>choke_lease</p><a data-content-tag="architecture">架構設計</a></main><footer>not indexed</footer></body></html>',
      );
    }
    const index = buildSiteSearch(output, routes);
    expect(index).toHaveLength(2);
    expect(index.some((item) => item.kind === 'note')).toBe(true);
    expect(index.every((item) => item.text === 'choke_lease 架構設計')).toBe(
      true,
    );
    expect(index[0]?.summary).toBe('Summary & evidence');
    expect(index[0]?.tags[0]?.id).toBe('architecture');
    expect(index[0]?.tags[0]?.label.en).toBe('Architecture');
    expect(searchSite(index, 'system design', 'note', 'en')).toHaveLength(1);
    expect(index.map((item) => item.href)).not.toContain('/en/search/');
    expect(searchSite(index, 'choke_lease', 'note', 'en')).toHaveLength(1);
  });
  it('publishes separate localized search pages', () => {
    for (const locale of locales) {
      const route = { kind: 'search' as const, locale };
      expect(parseRoute(`/${locale}/search/`)).toEqual(route);
      expect(publishedRoutes()).toContainEqual(route);
    }
  });
});
