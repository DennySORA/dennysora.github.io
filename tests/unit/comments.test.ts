import { describe, expect, it } from 'vitest';
import {
  commentsView,
  commentTarget,
  giscusAttributes,
  giscusReducer,
  parseGiscusMessage,
  type GiscusState,
} from '../../src/lib/comments.ts';
import {
  loadComments,
  loadPosts,
  publishedRoutes,
} from '../../src/lib/content.server.ts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Comments } from '../../src/features/comments/Comments.tsx';
import { locales } from '../../src/i18n/index.ts';
import { routePath } from '../../src/lib/route-manifest.ts';
import { searchableText } from '../../src/lib/site-search.server.ts';
import { commentsConfigSchema } from '../../src/lib/schema.ts';

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

describe('sitewide comment identity and configuration', () => {
  it('gives every real page one locale-independent, collision-free target', () => {
    const targets = new Map<string, string>();
    const paths = new Map<string, string>();
    const posts = loadPosts();
    for (const route of publishedRoutes()) {
      const post =
        route.kind === 'article'
          ? posts.find((post) => post.slug === route.slug)
          : undefined;
      const target = commentTarget(route, post);
      if (route.kind === 'root' || route.kind === 'not-found') {
        expect(target).toBeNull();
        continue;
      }
      if (!target) throw new Error(`Missing comments: ${routePath(route)}`);
      expect(target.commentsEnabled).toBe(true);
      const path = routePath(route).replace(/^\/(?:zh-hant|en|ja)\//, '/');
      if (targets.has(path)) expect(target.id).toBe(targets.get(path));
      if (paths.has(target.id)) expect(path).toBe(paths.get(target.id));
      targets.set(path, target.id);
      paths.set(target.id, path);
    }
    expect(targets.get('/')).toBe('page:home');
    expect(targets.get('/search/')).toBe('page:search');
    expect(targets.get('/blog/')).toBe('index:blog');
    for (const locale of locales) {
      const post = {
        id: 'stable-id',
        discussionNumber: null,
        commentsEnabled: true,
      };
      expect(
        commentTarget(
          { kind: 'article', locale, slug: `translated-${locale}` },
          post,
        )?.id,
      ).toBe('article:stable-id');
    }
  });
  it('preserves recorded native numbers and uses strict stable terms for new pages', () => {
    expect(loadComments()).toHaveProperty(
      'repository',
      'DennySORA/dennysora.github.io',
    );
    const legacy = loadPosts().filter((post) => post.discussionNumber !== null);
    expect(legacy.map((post) => [post.id, post.discussionNumber])).toEqual([
      ['engineering-principles', 1],
      ['production-systems', 2],
    ]);
    const native = commentsConfigSchema.parse({
      mode: 'github-native',
      repository: 'DennySORA/dennysora.github.io',
    });
    for (const post of legacy)
      expect(commentsView(native, post)).toEqual({
        kind: 'native',
        url: `https://github.com/DennySORA/dennysora.github.io/discussions/${post.discussionNumber}`,
      });
    const target = {
      id: 'page:home',
      discussionNumber: null,
      commentsEnabled: true,
    };
    expect(commentsView(native, target)).toEqual({ kind: 'unconfigured' });
    expect(commentsView({ mode: 'unconfigured' }, target)).toEqual({
      kind: 'unconfigured',
    });
    expect(commentsView(giscus, { ...target, commentsEnabled: false })).toEqual(
      { kind: 'disabled' },
    );
    const view = commentsView(giscus, target);
    if (view.kind !== 'giscus') throw new Error('Expected giscus');
    expect(view.mapping).toEqual({
      kind: 'specific',
      term: 'dennysora.me:page:home',
    });
    expect(new URL(view.url).searchParams.get('discussions_q')).toBe(
      '"dennysora.me:page:home" in:title',
    );
    for (const [locale, lang] of [
      ['zh-hant', 'zh-TW'],
      ['en', 'en'],
      ['ja', 'ja'],
    ] as const)
      expect(giscusAttributes(giscus, view.mapping, locale)).toMatchObject({
        'data-mapping': 'specific',
        'data-term': 'dennysora.me:page:home',
        'data-strict': '1',
        'data-theme': 'transparent_dark',
        'data-lang': lang,
        'data-reactions-enabled': '1',
        'data-emit-metadata': '1',
      });
    const numbered = commentsView(giscus, { ...target, discussionNumber: 12 });
    if (numbered.kind !== 'giscus') throw new Error('Expected giscus');
    expect(numbered.mapping).toEqual({ kind: 'number', term: '12' });
    expect(
      giscusAttributes(giscus, numbered.mapping, 'en')['data-mapping'],
    ).toBe('number');
    expect(numbered.url).toBe(
      'https://github.com/DennySORA/site-discussions/discussions/12',
    );
  });
  it('prerenders the automatic widget host without duplicate copy, links or a click gate', () => {
    const view = commentsView(giscus, {
      id: 'page:home',
      discussionNumber: null,
      commentsEnabled: true,
    });
    for (const locale of locales) {
      const html = renderToStaticMarkup(
        createElement(Comments, { view, locale }),
      );
      expect(html).toContain('data-state="loading"');
      expect(html).not.toContain('<a ');
      expect(html).not.toContain('comments-intro');
      expect(html).not.toMatch(
        /Questions, additions|歡迎提出疑問|質問、補足|No comments yet|目前還沒有留言|まだコメントはありません|Find this page|尋找本頁討論|このページの議論を探す/,
      );
      expect(html).toContain('class="giscus-frame-host"');
      expect(html).not.toContain('<button');
      expect(html).not.toMatch(/<div[^>]*\shidden(?:=|>)/);
      expect(html).not.toMatch(/<(?:script|iframe|link|img)\b/);
      expect(html).toContain('aria-labelledby="comments-title"');
      expect(searchableText(`<p>Keep page text</p>${html}`)).toBe(
        'Keep page text',
      );
    }
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
  const loading: GiscusState = { status: 'loading' };
  it('reports real empty, populated and locked outcomes', () => {
    expect(giscusReducer(loading, { type: 'empty' })).toEqual({
      status: 'ready',
      count: 0,
      locked: false,
    });
    expect(
      giscusReducer(loading, { type: 'metadata', count: 4, locked: true }),
    ).toEqual({ status: 'ready', count: 4, locked: true });
  });
  it('keeps slow loads alive, classifies genuine failures and supports retry', () => {
    expect(giscusReducer(loading, { type: 'timeout' })).toEqual({
      status: 'slow',
    });
    for (const [message, reason] of [
      ['Discussion not found', 'missing'],
      ['giscus is not installed', 'blocked'],
      ['Bad credentials', 'authentication'],
      ['Invalid state value', 'authentication'],
      ['State has expired', 'authentication'],
      ['API rate limit exceeded', 'rate-limit'],
    ] as const)
      expect(giscusReducer(loading, { type: 'error', message })).toEqual({
        status: 'failed',
        reason,
      });
    expect(giscusReducer(loading, { type: 'script-error' })).toEqual({
      status: 'failed',
      reason: 'blocked',
    });
    const failed: GiscusState = { status: 'failed', reason: 'blocked' };
    expect(giscusReducer(failed, { type: 'timeout' })).toBe(failed);
    expect(giscusReducer(failed, { type: 'load' })).toEqual(loading);
  });
  it('recovers from late real responses without allowing an old deadline to hide a ready widget', () => {
    const empty = { status: 'ready', count: 0, locked: false };
    const ready: GiscusState = { status: 'ready', count: 3, locked: false };
    for (const state of [
      { status: 'slow' },
      { status: 'failed', reason: 'authentication' },
      { status: 'failed', reason: 'blocked' },
      { status: 'failed', reason: 'rate-limit' },
    ] as GiscusState[]) {
      expect(giscusReducer(state, { type: 'empty' })).toEqual(empty);
      expect(
        giscusReducer(state, { type: 'metadata', count: 3, locked: false }),
      ).toEqual(ready);
    }
    expect(giscusReducer(ready, { type: 'timeout' })).toBe(ready);
    expect(giscusReducer(ready, { type: 'empty' })).toBe(ready);
    // A later real service error is still an error; no synthetic iframe-load
    // event or elapsed deadline can declare a working connection.
    expect(
      giscusReducer(ready, {
        type: 'error',
        message: 'API rate limit exceeded',
      }),
    ).toEqual({ status: 'failed', reason: 'rate-limit' });
  });
  it('accepts messages only from the frame it created on the giscus origin', () => {
    const frame = {};
    const missing = {
      origin: 'https://giscus.app',
      source: frame,
      data: { giscus: { error: 'Discussion not found' } },
    };
    expect(
      parseGiscusMessage(missing, frame, {
        kind: 'specific',
        term: 'page:new',
      }),
    ).toEqual({ type: 'empty' });
    expect(
      parseGiscusMessage(missing, frame, { kind: 'number', term: '1' }),
    ).toEqual({ type: 'error', message: 'Discussion not found' });
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
