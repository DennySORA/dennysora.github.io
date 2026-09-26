import { describe, expect, it } from 'vitest';
import {
  commentsView,
  giscusAttributes,
  giscusReducer,
  parseGiscusMessage,
  type GiscusState,
} from '../../src/lib/comments.ts';
import {
  loadComments,
  loadPosts,
  loadResearch,
} from '../../src/lib/content.server.ts';
import { importResearch } from '../../src/lib/research-import.server.ts';
import { commentsConfigSchema, researchSchema } from '../../src/lib/schema.ts';

const parsed = commentsConfigSchema.parse({
  mode: 'giscus',
  repository: 'DennySORA/site-discussions',
  repositoryId: 'R_kgDOTest',
  category: 'Articles',
  categoryId: 'DIC_kwDOTest',
  theme: 'transparent_dark',
  inputPosition: 'top',
  reactionsEnabled: true,
});
if (parsed.mode !== 'giscus') throw new Error('Fixture must use giscus');
const giscus = parsed;

describe('comment configuration', () => {
  it('ships native GitHub threads that every language of an article shares', () => {
    expect(loadComments()).toEqual({
      mode: 'github-native',
      repository: 'DennySORA/dennysora.github.io',
    });
    const numbers = loadPosts().map((post) => post.discussionNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    for (const post of loadPosts())
      expect(commentsView(loadComments(), post)).toEqual({
        kind: 'native',
        url: `https://github.com/DennySORA/dennysora.github.io/discussions/${post.discussionNumber}`,
      });
    expect(
      commentsView(loadComments(), {
        discussionNumber: null,
        commentsEnabled: true,
      }),
    ).toEqual({ kind: 'unconfigured' });
  });
  it('never turns a missing discussion number into zero comments', () => {
    expect(
      commentsView(giscus, { discussionNumber: null, commentsEnabled: true }),
    ).toEqual({
      kind: 'unconfigured',
    });
    expect(
      commentsView(giscus, { discussionNumber: 7, commentsEnabled: false }),
    ).toEqual({ kind: 'disabled' });
  });
  it('maps every locale of an article to one native thread or one giscus number', () => {
    const native = commentsConfigSchema.parse({
      mode: 'github-native',
      repository: 'DennySORA/blog-comments',
    });
    expect(
      commentsView(native, { discussionNumber: 3, commentsEnabled: true }),
    ).toEqual({
      kind: 'native',
      url: 'https://github.com/DennySORA/blog-comments/discussions/3',
    });
    const view = commentsView(giscus, {
      discussionNumber: 12,
      commentsEnabled: true,
    });
    expect(view).toMatchObject({ kind: 'giscus', number: 12 });
    const zh = giscusAttributes(giscus, 12, 'zh-hant');
    expect(zh).toMatchObject({
      'data-mapping': 'number',
      'data-term': '12',
      'data-theme': 'transparent_dark',
      'data-lang': 'zh-TW',
      'data-emit-metadata': '1',
    });
    expect(giscusAttributes(giscus, 12, 'ja')['data-lang']).toBe('ja');
    expect(giscusAttributes(giscus, 12, 'en')['data-lang']).toBe('en');
  });
  it('accepts only public, owner-scoped configuration', () => {
    for (const value of [
      { repository: null },
      { mode: 'github-native', repository: 'attacker/repo' },
      { ...giscus, token: 'ghp_secret' },
      { ...giscus, theme: 'light' },
      { ...giscus, repositoryId: 'not-an-id' },
    ])
      expect(() => commentsConfigSchema.parse(value)).toThrow();
  });
});

describe('giscus runtime states', () => {
  const dormant: GiscusState = { status: 'dormant' };
  it('stays dormant until the reader asks, then reports real outcomes', () => {
    expect(
      giscusReducer(dormant, { type: 'metadata', count: 2, locked: false }),
    ).toBe(dormant);
    expect(giscusReducer(dormant, { type: 'timeout' })).toBe(dormant);
    const loading = giscusReducer(dormant, { type: 'load' });
    expect(loading).toEqual({ status: 'loading' });
    expect(
      giscusReducer(loading, { type: 'metadata', count: 0, locked: false }),
    ).toEqual({
      status: 'ready',
      count: 0,
      locked: false,
    });
    expect(
      giscusReducer(loading, { type: 'metadata', count: 4, locked: true }),
    ).toMatchObject({ locked: true });
  });
  it('classifies failures and keeps later timeouts from overwriting success', () => {
    const loading: GiscusState = { status: 'loading' };
    expect(
      giscusReducer(loading, {
        type: 'error',
        message: 'Discussion not found',
      }),
    ).toEqual({
      status: 'failed',
      reason: 'missing',
    });
    expect(
      giscusReducer(loading, {
        type: 'error',
        message: 'giscus is not installed',
      }),
    ).toEqual({
      status: 'failed',
      reason: 'blocked',
    });
    expect(giscusReducer(loading, { type: 'script-error' })).toEqual({
      status: 'failed',
      reason: 'blocked',
    });
    expect(giscusReducer(loading, { type: 'timeout' })).toEqual({
      status: 'failed',
      reason: 'timeout',
    });
    const ready: GiscusState = { status: 'ready', count: 1, locked: false };
    expect(giscusReducer(ready, { type: 'timeout' })).toBe(ready);
    expect(
      giscusReducer({ status: 'failed', reason: 'timeout' }, { type: 'load' }),
    ).toEqual({ status: 'loading' });
  });
  it('accepts messages only from the frame it created on the giscus origin', () => {
    const frame = {};
    const message = {
      giscus: { discussion: { totalCommentCount: 3, locked: false } },
    };
    expect(
      parseGiscusMessage(
        { origin: 'https://giscus.app', source: frame, data: message },
        frame,
      ),
    ).toEqual({
      type: 'metadata',
      count: 3,
      locked: false,
    });
    expect(
      parseGiscusMessage(
        { origin: 'https://evil.test', source: frame, data: message },
        frame,
      ),
    ).toBeNull();
    expect(
      parseGiscusMessage(
        { origin: 'https://giscus.app', source: {}, data: message },
        frame,
      ),
    ).toBeNull();
    expect(
      parseGiscusMessage(
        { origin: 'https://giscus.app', source: frame, data: message },
        null,
      ),
    ).toBeNull();
    for (const data of [
      'giscus',
      { giscus: { discussion: { totalCommentCount: -1, locked: false } } },
      { giscus: { discussion: { totalCommentCount: 1.5, locked: false } } },
      { giscus: { discussion: { totalCommentCount: 2 } } },
      { other: true },
    ])
      expect(
        parseGiscusMessage(
          { origin: 'https://giscus.app', source: frame, data },
          frame,
        ),
      ).toBeNull();
    expect(
      parseGiscusMessage(
        {
          origin: 'https://giscus.app',
          source: frame,
          data: { giscus: { error: 'x'.repeat(500) } },
        },
        frame,
      ),
    ).toEqual({ type: 'error', message: 'x'.repeat(200) });
  });
});

describe('paper snapshot', () => {
  it('imports only allowlisted metadata and refuses malformed input', () => {
    const fixture = {
      generated_at: '2026-09-17T08:23:50Z',
      run_date: '2026-09-17',
      top5: [
        {
          story_id: 'arxiv:1',
          title: 'Paper',
          title_zh: '論文',
          published_at: '2026-09-16T13:03:12Z',
          primary_link: { url: 'https://arxiv.org/abs/1' },
          summary: '<script>not-public</script>',
        },
      ],
      internal_state: 'not-public',
    };
    const result = importResearch(fixture, 'a'.repeat(40));
    expect(result.reports[0]?.guideUrl).toBe(
      'https://paper.dennysora.me/day/2026-09-17.html',
    );
    expect(result.reports[0]?.review).toBe('machine-generated');
    expect(JSON.stringify(result)).not.toContain('not-public');
    expect(() =>
      importResearch({ ...fixture, top5: [] }, 'a'.repeat(40)),
    ).toThrow();
    expect(() => importResearch(fixture, '../branch')).toThrow();
  });
  it('accepts only a pinned public snapshot from approved hosts', () => {
    const value = loadResearch();
    if (!value) throw new Error('Fixture missing');
    expect(value.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
    const report = value.reports[0];
    if (!report) throw new Error('Fixture missing');
    for (const originalUrl of [
      'http://arxiv.org/abs/1',
      'https://arxiv.org.evil.invalid/abs/1',
      'javascript:alert(1)',
    ])
      expect(() =>
        researchSchema.parse({
          ...value,
          reports: [{ ...report, originalUrl }],
        }),
      ).toThrow();
    expect(() =>
      researchSchema.parse({ ...value, secret: 'fixture-only' }),
    ).toThrow();
  });
});
