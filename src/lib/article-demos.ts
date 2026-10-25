/** Standalone draft-preview entry only; never imported by the site. */
import type { Locale } from '../i18n/index.ts';
import { enhancePrivacyDemos } from './privacy-demos.ts';
import { enhanceTranslationDemos } from './translation-demos.ts';
export function enhanceArticleDemos(root: HTMLElement, locale: Locale) {
  const cleanups: (() => void)[] = [];
  if (root.querySelector('.privacy-guide'))
    cleanups.push(enhancePrivacyDemos(root, locale));
  if (root.querySelector('.translation-guide'))
    cleanups.push(enhanceTranslationDemos(root, locale));
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
