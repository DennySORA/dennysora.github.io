import { describe, expect, it } from 'vitest';
import { parseExcerpt } from '../../src/lib/excerpt.ts';
import {
  effectiveSort,
  emptyLibraryState,
  matchesFilters,
  pagefindFilters,
  paginate,
  parseLibraryState,
  serializeLibraryState,
  toggleTag,
} from '../../src/lib/library-query.ts';
import { matchSearch } from '../../src/lib/search.ts';

const known = {
  topics: ['engineering', 'systems', 'ai'],
  types: ['essay', 'research-note', 'case-study'],
  tags: [
    'llm',
    'quantization',
    'agent',
    'cloud',
    'security',
    'architecture',
    'inference',
  ],
};
const parse = (query: string) =>
  parseLibraryState(new URLSearchParams(query), known);

describe('shareable library state', () => {
  it('parses known values and drops unknown or excessive ones', () => {
    const state = parse(
      'q=KV%20cache&topic=ai&type=research-note&tag=llm&tag=quantization&tag=llm&tag=nope&sort=latest&page=2',
    );
    expect(state).toEqual({
      q: 'KV cache',
      topic: 'ai',
      type: 'research-note',
      tags: ['llm', 'quantization'],
      sort: 'latest',
      page: 2,
    });
    expect(
      parse('topic=cooking&type=poem&sort=random&page=-3').topic,
    ).toBeNull();
    expect(parse('page=abc').page).toBe(1);
    expect(parse(`q=${'x'.repeat(400)}`).q).toHaveLength(160);
    expect(
      parse(known.tags.map((tag) => `tag=${tag}`).join('&')).tags,
    ).toHaveLength(5);
  });
  it('serializes in a stable order without defaults', () => {
    expect(serializeLibraryState(emptyLibraryState).toString()).toBe('');
    const state = parse(
      'tag=quantization&sort=relevance&topic=ai&q=KV%20cache&tag=llm',
    );
    expect(serializeLibraryState(state).toString()).toBe(
      'q=KV+cache&topic=ai&tag=quantization&tag=llm',
    );
    expect(
      serializeLibraryState({
        ...emptyLibraryState,
        sort: 'latest',
      }).toString(),
    ).toBe('');
    expect(
      serializeLibraryState({
        ...emptyLibraryState,
        q: 'x',
        sort: 'latest',
      }).get('sort'),
    ).toBe('latest');
  });
  it('defaults to relevance with a query and newest first without one', () => {
    expect(effectiveSort(parse(''))).toBe('latest');
    expect(effectiveSort(parse('q=rust'))).toBe('relevance');
    expect(effectiveSort(parse('q=rust&sort=latest'))).toBe('latest');
  });
  it('resets the page when a filter changes and clamps pagination', () => {
    expect(toggleTag({ ...emptyLibraryState, page: 3 }, 'llm')).toMatchObject({
      tags: ['llm'],
      page: 1,
    });
    expect(
      toggleTag({ ...emptyLibraryState, tags: ['llm'] }, 'llm').tags,
    ).toEqual([]);
    const items = Array.from({ length: 30 }, (_, index) => index);
    expect(paginate(items, 99)).toMatchObject({ page: 3, totalPages: 3 });
    expect(paginate(items, 2).items[0]).toBe(12);
    expect(paginate([], 1)).toMatchObject({ page: 1, totalPages: 1 });
  });
});

describe('filter semantics', () => {
  const posts = [
    {
      id: 'a',
      topics: ['ai'],
      contentType: 'research-note',
      tagIds: ['llm', 'quantization'],
    },
    { id: 'b', topics: ['ai'], contentType: 'essay', tagIds: ['llm'] },
    {
      id: 'c',
      topics: ['systems'],
      contentType: 'case-study',
      tagIds: ['agent', 'cloud'],
    },
  ];
  const ids = (query: string) =>
    posts
      .filter((post) => matchesFilters(post, parse(query)))
      .map((post) => post.id);
  it('combines dimensions with AND and several tags with OR', () => {
    expect(ids('')).toEqual(['a', 'b', 'c']);
    expect(ids('topic=ai&type=research-note&tag=llm&tag=quantization')).toEqual(
      ['a'],
    );
    expect(ids('tag=quantization&tag=agent')).toEqual(['a', 'c']);
    expect(ids('topic=systems&tag=llm')).toEqual([]);
  });
  it("uses Pagefind's explicit any operator for tags", () => {
    expect(
      pagefindFilters(
        parse('topic=ai&type=research-note&tag=llm&tag=quantization'),
      ),
    ).toEqual({
      topic: 'ai',
      type: 'research-note',
      tag: { any: ['llm', 'quantization'] },
    });
    expect(pagefindFilters(emptyLibraryState)).toEqual({});
  });
});

describe('title and summary fallback search', () => {
  const entry = {
    id: 'fixture',
    title: 'LLM inference / Rust::Result',
    text: '量化與推論 延遲 日语 日本語の音声評価',
    tags: ['AI'],
  };
  it.each([
    ['zh-hant', '量化'],
    ['en', 'ｌｌｍ'],
    ['en', 'Rust::Result'],
    ['ja', '音声評価'],
    ['zh-hant', '量化 推論'],
  ] as const)('finds %s query %s', (locale, query) => {
    expect(matchSearch(entry, query, locale)).toBe(true);
  });
  it('handles empty queries and misses', () => {
    expect(matchSearch(entry, '', 'en')).toBe(true);
    expect(matchSearch(entry, 'unmatchedtext', 'en')).toBe(false);
  });
});

describe('search excerpts', () => {
  it('keeps only mark structure and decodes escaped text', () => {
    expect(
      parseExcerpt(
        'A <mark>static</mark> page from the &lt;body&gt; &amp; more',
      ),
    ).toEqual([
      { text: 'A ', mark: false },
      { text: 'static', mark: true },
      { text: ' page from the <body> & more', mark: false },
    ]);
  });
  it('never turns other markup into elements', () => {
    const parts = parseExcerpt(
      '<img src=x onerror=alert(1)><mark>hit</mark><b>bold</b>',
    );
    expect(parts).toEqual([
      { text: '<img src=x onerror=alert(1)>', mark: false },
      { text: 'hit', mark: true },
      { text: '<b>bold</b>', mark: false },
    ]);
  });
});
