import { locales } from '../src/i18n/index.ts';
import {
  listPosts,
  loadPosts,
  publishedPaths,
  publishedRoutes,
  validateContent,
} from '../src/lib/content.server.ts';

validateContent();
const paths = publishedPaths();
const noteEditions = publishedRoutes().filter((route) =>
  ['medical-note', 'network-note', 'hardware-note'].includes(route.kind),
).length;
const editions = locales
  .map((locale) => `${locale} ${listPosts(locale).length}`)
  .join(', ');
console.log(
  `Content validated: ${loadPosts().length} posts (${editions} published), ${noteEditions} full note editions, taxonomy and anchors consistent, ${paths.length} prerendered paths.`,
);
