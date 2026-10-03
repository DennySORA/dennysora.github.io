import type { Locale } from '../i18n/index.ts';

/** First supported browser preference wins; explicit locale URLs never use this. */
export function preferredLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const tag = language.toLowerCase().replaceAll('_', '-');
    if (/^ja(?:-|$)/.test(tag)) return 'ja';
    if (/^en(?:-|$)/.test(tag)) return 'en';
    if (
      tag === 'zh' ||
      /^zh-hant(?:-|$)/.test(tag) ||
      /^zh-(?:tw|hk|mo)(?:-|$)/.test(tag)
    )
      return 'zh-hant';
  }
  return 'en';
}
