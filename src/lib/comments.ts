import type { Locale } from '../i18n/index.ts';
import type { CommentsConfig } from './schema.ts';
import type { RouteDescriptor } from './route-manifest.ts';

export const giscusOrigin = 'https://giscus.app';
export const giscusTimeoutMs = 15_000;
const giscusLang: Record<Locale, string> = {
  'zh-hant': 'zh-TW',
  en: 'en',
  ja: 'ja',
};

export type GiscusMapping =
  { kind: 'number'; term: string } | { kind: 'specific'; term: string };

export type CommentTarget = {
  id: string;
  discussionNumber: number | null;
  commentsEnabled: boolean;
};

/** Stable, namespaced content identity: never a translated title or URL. */
export function commentTarget(
  route: RouteDescriptor,
  post?: CommentTarget,
): CommentTarget | null {
  let id: string;
  switch (route.kind) {
    case 'root':
    case 'not-found':
      return null;
    case 'article':
      if (!post) throw new Error('Article comments require a content ID');
      return { ...post, id: `article:${post.id}` };
    case 'thought':
      id = `thought:${route.slug}`;
      break;
    case 'thoughts':
      id = 'index:thoughts';
      break;
    case 'home':
    case 'search':
      id = `page:${route.kind}`;
      break;
    case 'library':
      id = 'index:blog';
      break;
    case 'notes':
    case 'projects':
    case 'tags':
      id = `index:${route.kind}`;
      break;
    case 'blog-folder':
      id = `folder:blog:${route.folder}`;
      break;
    case 'note-folder':
      id = `folder:notes:${route.folder}`;
      break;
    case 'medical-note':
    case 'network-note':
    case 'collection-note':
      id = `note:${route.noteId}`;
      break;
    case 'project-category':
      id = `folder:projects:${route.category}`;
      break;
    case 'project':
      id = `project:${route.projectId}`;
      break;
    case 'topic':
      id = `taxonomy:topic:${route.topicId}`;
      break;
    case 'tag':
      id = `taxonomy:tag:${route.tagId}`;
  }
  return { id, discussionNumber: null, commentsEnabled: true };
}

type GiscusConfig = Extract<CommentsConfig, { mode: 'giscus' }>;
export type CommentsView =
  | { kind: 'unconfigured' }
  | { kind: 'disabled' }
  | { kind: 'native'; url: string }
  | {
      kind: 'giscus';
      url: string;
      mapping: GiscusMapping;
      config: GiscusConfig;
    };

export function discussionUrl(repository: string, number: number): string {
  return `https://github.com/${repository}/discussions/${number}`;
}

/** Missing public configuration must never look like a working empty thread. */
export function commentsView(
  config: CommentsConfig,
  target: CommentTarget,
): CommentsView {
  if (!target.commentsEnabled) return { kind: 'disabled' };
  if (config.mode === 'unconfigured') return { kind: 'unconfigured' };
  if (config.mode === 'github-native')
    return target.discussionNumber === null
      ? { kind: 'unconfigured' }
      : {
          kind: 'native',
          url: discussionUrl(config.repository, target.discussionNumber),
        };
  const mapping: GiscusMapping =
    target.discussionNumber === null
      ? { kind: 'specific', term: `dennysora.me:${target.id}` }
      : { kind: 'number', term: String(target.discussionNumber) };
  // New pages have no discussion number until the first real comment/reaction.
  // A repository search is a usable no-JavaScript fallback, not a fake thread URL.
  const url =
    mapping.kind === 'number'
      ? discussionUrl(config.repository, Number(mapping.term))
      : `https://github.com/${config.repository}/discussions?discussions_q=${encodeURIComponent(`"${mapping.term}" in:title`)}`;
  return { kind: 'giscus', url, mapping, config };
}

export function giscusAttributes(
  config: GiscusConfig,
  mapping: GiscusMapping,
  locale: Locale,
): Record<string, string> {
  return {
    'data-repo': config.repository,
    'data-repo-id': config.repositoryId,
    'data-category': config.category,
    'data-category-id': config.categoryId,
    // Keep recorded legacy numbers; new content uses exact, locale-free IDs.
    'data-mapping': mapping.kind,
    'data-term': mapping.term,
    'data-strict': '1',
    'data-reactions-enabled': config.reactionsEnabled ? '1' : '0',
    'data-emit-metadata': '1',
    'data-input-position': config.inputPosition,
    'data-theme': config.theme,
    'data-lang': giscusLang[locale],
    'data-loading': 'eager',
  };
}

export type FailureReason =
  'blocked' | 'missing' | 'authentication' | 'rate-limit';
export type GiscusState =
  | { status: 'loading' }
  | { status: 'slow' }
  | { status: 'ready'; count: number | null; locked: boolean }
  | { status: 'failed'; reason: FailureReason };
export type GiscusEvent =
  | { type: 'load' }
  | { type: 'empty' }
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
    case 'empty':
      // A validated response can arrive after a slow network or an error that
      // the official client recovers from (for example, an expired session).
      return state.status === 'ready'
        ? state
        : { status: 'ready', count: 0, locked: false };
    case 'metadata':
      return { status: 'ready', count: event.count, locked: event.locked };
    case 'error':
      return {
        status: 'failed',
        reason: /not found/i.test(event.message)
          ? 'missing'
          : /bad credentials|invalid state value|state has expired/i.test(
                event.message,
              )
            ? 'authentication'
            : /rate limit/i.test(event.message)
              ? 'rate-limit'
              : 'blocked',
      };
    case 'script-error':
      return state.status === 'loading' || state.status === 'slow'
        ? { status: 'failed', reason: 'blocked' }
        : state;
    case 'timeout':
      // A deadline is not proof of failure. Keep the live frame visible so it
      // can finish on mobile/slow networks and accept its later real result.
      return state.status === 'loading' ? { status: 'slow' } : state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Accepts only well-formed messages sent by the giscus frame this page created. */
export function parseGiscusMessage(
  event: { origin: string; source: unknown; data: unknown },
  frame: unknown,
  mapping?: GiscusMapping,
): GiscusEvent | null {
  if (event.origin !== giscusOrigin || !frame || event.source !== frame)
    return null;
  if (!isRecord(event.data) || !isRecord(event.data['giscus'])) return null;
  const message = event.data['giscus'];
  if (typeof message['error'] === 'string') {
    // A missing specific-term discussion is a usable empty widget: giscus
    // creates it on the first contribution. A missing recorded number is not.
    if (
      mapping?.kind === 'specific' &&
      /discussion not found/i.test(message['error'])
    )
      return { type: 'empty' };
    return { type: 'error', message: message['error'].slice(0, 200) };
  }
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
