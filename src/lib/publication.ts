import type { Edition, Post } from './schema.ts';
import type { Locale } from '../i18n/index.ts';

export function editionStatus(
  post: Post,
  locale: Locale,
  sourceRevision: string,
): 'published' | 'missing' | 'draft' | 'stale' {
  const edition = post.locales[locale];
  if (!edition) return 'missing';
  if (edition.publication !== 'published') return 'draft';
  if (locale === post.sourceLocale && edition.translationState === 'original')
    return 'published';
  if (
    edition.sourceRevision !== sourceRevision ||
    edition.translationState === 'stale'
  )
    return 'stale';
  if (
    ['reviewed', 'source-published'].includes(edition.translationState) &&
    edition.reviewEvidence
  )
    return 'published';
  return 'draft';
}
export function requireEdition(post: Post, locale: Locale): Edition {
  const edition = post.locales[locale];
  if (!edition) throw new Error(`Missing edition: ${post.id}/${locale}`);
  return edition;
}
export const topicNames = {
  ai: { 'zh-hant': 'AI 與模型', en: 'AI & Models', ja: 'AI とモデル' },
  engineering: {
    'zh-hant': '工程思考',
    en: 'Engineering',
    ja: 'エンジニアリング',
  },
  systems: { 'zh-hant': '系統與平台', en: 'Systems', ja: 'システム' },
};
export function discussionUrl(
  number: number | null,
  repository: string | null,
): string | null {
  if (
    !repository ||
    !/^DennySORA\/[A-Za-z0-9_.-]+$/.test(repository) ||
    !number ||
    !Number.isSafeInteger(number) ||
    number < 1
  )
    return null;
  return `https://github.com/${repository}/discussions/${number}`;
}
