import { enhanceArticleDemos } from '../src/lib/article-demos.ts';
const locale =
  document.documentElement.lang === 'ja'
    ? 'ja'
    : document.documentElement.lang === 'en'
      ? 'en'
      : 'zh-hant';
const root = document.querySelector<HTMLElement>('article');
if (root) enhanceArticleDemos(root, locale);
