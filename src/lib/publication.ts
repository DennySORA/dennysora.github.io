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
