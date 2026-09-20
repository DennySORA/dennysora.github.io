import {
  loadPosts,
  loadProjects,
  loadResearch,
  loadComments,
  listPosts,
  loadProfile,
  publishedPaths,
} from '../src/lib/content.server.ts';
import { locales } from '../src/i18n/index.ts';
import { editionStatus } from '../src/lib/publication.ts';

const posts = loadPosts();
const ids = new Set<string>();
for (const post of posts) {
  if (ids.has(post.slug)) throw new Error(`Duplicate slug: ${post.slug}`);
  ids.add(post.slug);
  if (post.updatedAt < post.publishedAt)
    throw new Error(`Update precedes publication: ${post.id}`);
  for (const locale of locales) {
    const edition = post.locales[locale];
    if (
      edition?.publication === 'published' &&
      editionStatus(post, locale, post.revision) !== 'published'
    )
      throw new Error(
        `Unreviewed or stale published translation: ${post.id}/${locale}`,
      );
  }
}
loadProjects();
loadResearch();
loadComments();
for (const locale of locales) {
  listPosts(locale);
  loadProfile(locale);
}
const paths = publishedPaths();
if (new Set(paths).size !== paths.length) throw new Error('Duplicate route');
console.log(
  `Content validated: ${posts.length} notes, ${locales.length} locales, ${paths.length} prerendered paths.`,
);
