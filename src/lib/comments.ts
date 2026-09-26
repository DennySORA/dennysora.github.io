import type { Locale } from '../i18n/index.ts';
import type { CommentsConfig } from './schema.ts';

export const giscusOrigin = 'https://giscus.app';
export const giscusTimeoutMs = 15_000;
const giscusLang: Record<Locale, string> = {
  'zh-hant': 'zh-TW',
  en: 'en',
  ja: 'ja',
};

type GiscusConfig = Extract<CommentsConfig, { mode: 'giscus' }>;
export type CommentsView =
  | { kind: 'unconfigured' }
  | { kind: 'disabled' }
  | { kind: 'native'; url: string }
  | { kind: 'giscus'; url: string; number: number; config: GiscusConfig };

export function discussionUrl(repository: string, number: number): string {
  return `https://github.com/${repository}/discussions/${number}`;
}

/**
 * Decides what the article footer may promise. A missing repository or
 * discussion number is "not configured", never "zero comments".
 */
export function commentsView(
  config: CommentsConfig,
  post: { discussionNumber: number | null; commentsEnabled: boolean },
): CommentsView {
  if (!post.commentsEnabled) return { kind: 'disabled' };
  if (config.mode === 'unconfigured' || post.discussionNumber === null)
    return { kind: 'unconfigured' };
  const url = discussionUrl(config.repository, post.discussionNumber);
  if (config.mode === 'github-native') return { kind: 'native', url };
  return { kind: 'giscus', url, number: post.discussionNumber, config };
}

export function giscusAttributes(
  config: GiscusConfig,
  number: number,
  locale: Locale,
): Record<string, string> {
  return {
    'data-repo': config.repository,
    'data-repo-id': config.repositoryId,
    'data-category': config.category,
    'data-category-id': config.categoryId,
    // Number mapping never creates discussions; every one must already exist.
    'data-mapping': 'number',
    'data-term': String(number),
    'data-reactions-enabled': config.reactionsEnabled ? '1' : '0',
    'data-emit-metadata': '1',
    'data-input-position': config.inputPosition,
    'data-theme': config.theme,
    'data-lang': giscusLang[locale],
    'data-loading': 'eager',
  };
}

export type FailureReason = 'timeout' | 'blocked' | 'missing';
export type GiscusState =
  | { status: 'dormant' }
  | { status: 'loading' }
  | { status: 'ready'; count: number | null; locked: boolean }
  | { status: 'failed'; reason: FailureReason };
export type GiscusEvent =
  | { type: 'load' }
  | { type: 'metadata'; count: number; locked: boolean }
  | { type: 'error'; message: string }
  | { type: 'script-error' }
  | { type: 'timeout' };

export function giscusReducer(
  state: GiscusState,
  event: GiscusEvent,
): GiscusState {
  switch (event.type) {
    case 'load':
      return { status: 'loading' };
    case 'metadata':
      return state.status === 'dormant'
        ? state
        : { status: 'ready', count: event.count, locked: event.locked };
    case 'error':
      return state.status === 'dormant'
        ? state
        : {
            status: 'failed',
            reason: /not found/i.test(event.message) ? 'missing' : 'blocked',
          };
    case 'script-error':
      return state.status === 'loading'
        ? { status: 'failed', reason: 'blocked' }
        : state;
    case 'timeout':
      return state.status === 'loading'
        ? { status: 'failed', reason: 'timeout' }
        : state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Accepts only well-formed messages sent by the giscus frame this page created. */
export function parseGiscusMessage(
  event: { origin: string; source: unknown; data: unknown },
  frame: unknown,
): GiscusEvent | null {
  if (event.origin !== giscusOrigin || !frame || event.source !== frame)
    return null;
  if (!isRecord(event.data) || !isRecord(event.data['giscus'])) return null;
  const message = event.data['giscus'];
  if (typeof message['error'] === 'string')
    return { type: 'error', message: message['error'].slice(0, 200) };
  const discussion = message['discussion'];
  if (
    isRecord(discussion) &&
    typeof discussion['totalCommentCount'] === 'number' &&
    Number.isSafeInteger(discussion['totalCommentCount']) &&
    discussion['totalCommentCount'] >= 0 &&
    typeof discussion['locked'] === 'boolean'
  )
    return {
      type: 'metadata',
      count: discussion['totalCommentCount'],
      locked: discussion['locked'],
    };
  return null;
}
