import { locales } from '../src/i18n/index.ts';
import {
  listPosts,
  loadPosts,
  publishedPaths,
  validateContent,
} from '../src/lib/content.server.ts';

validateContent();
const paths = publishedPaths();
const editions = locales
  .map((locale) => `${locale} ${listPosts(locale).length}`)
  .join(', ');
console.log(
  `Content validated: ${loadPosts().length} notes (${editions}), taxonomy and anchors consistent, ${paths.length} prerendered paths.`,
);
