import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { locales, type Locale } from '../i18n/index.ts';
import { postSchema, projectsSchema, researchSchema } from './schema.ts';
import { editionStatus, requireEdition } from './publication.ts';
import { headingAliases } from './legacy-anchors.ts';
import { renderMarkdown } from './markdown.server.ts';
import { z } from 'zod';

export { siteUrl } from './site.ts';
const contentRoot = join(process.cwd(), 'content');
function json(path: string): unknown {
  const bytes = readFileSync(path);
  if (bytes.byteLength > 500_000)
    throw new Error(`Data exceeds limit: ${path}`);
  return JSON.parse(bytes.toString()) as unknown;
}
export function loadPosts() {
  const ids = new Set<string>();
  return readdirSync(join(contentRoot, 'posts'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = join(contentRoot, 'posts', entry.name);
      const post = postSchema.parse(json(join(directory, 'meta.json')));
      if (post.id !== entry.name || ids.has(post.id))
        throw new Error(`Duplicate/mismatched content ID: ${post.id}`);
      ids.add(post.id);
      const source = readFileSync(
        join(directory, `${post.sourceLocale}.md`),
        'utf8',
      );
      const revision = createHash('sha256').update(source).digest('hex');
      const editions = locales.filter(
        (locale) => editionStatus(post, locale, revision) === 'published',
      );
      for (const locale of editions)
        if (!existsSync(join(directory, `${locale}.md`)))
          throw new Error(`Missing published body: ${post.id}/${locale}`);
      return { ...post, revision, editions };
    })
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id),
    );
}
export function listPosts(locale: Locale) {
  return loadPosts()
    .filter((post) => post.editions.includes(locale))
    .map((post) => {
      const body = renderMarkdown(
        readFileSync(
          join(contentRoot, 'posts', post.id, `${locale}.md`),
          'utf8',
        ),
      );
      return {
        id: post.id,
        slug: post.slug,
        author: post.author,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        topics: post.topics,
        featured: post.featured,
        title: requireEdition(post, locale).title,
        summary: requireEdition(post, locale).summary,
        minutes: body.minutes,
        editions: post.editions,
      };
    });
}
export type PostSummary = ReturnType<typeof listPosts>[number];
export function loadArticle(locale: Locale, slug: string) {
  const post = loadPosts().find((item) => item.slug === slug);
  if (!post) return null;
  const status = editionStatus(post, locale, post.revision);
  // A loader payload is public too: never serialize draft sibling editions.
  if (status !== 'published') return null;
  const edition = requireEdition(post, locale);
  return {
    post: {
      id: post.id,
      slug: post.slug,
      author: post.author,
      sourceLocale: post.sourceLocale,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      topics: post.topics,
      source: post.source,
      discussionNumber: post.discussionNumber,
      editions: post.editions,
    },
    status,
    edition: {
      title: edition.title,
      summary: edition.summary,
      translationState: edition.translationState,
    },
    body: renderMarkdown(
      readFileSync(join(contentRoot, 'posts', post.id, `${locale}.md`), 'utf8'),
      headingAliases,
    ),
  };
}
export function loadProfile(locale: Locale) {
  return renderMarkdown(
    readFileSync(join(contentRoot, 'profile', `${locale}.md`), 'utf8'),
    headingAliases,
  );
}
export function loadProjects() {
  return projectsSchema.parse(
    json(join(contentRoot, 'projects/projects.json')),
  );
}
export function loadResearch() {
  const path = join(process.cwd(), 'data/research/snapshot.json');
  if (!existsSync(path)) return null;
  return researchSchema.parse(json(path));
}
export function loadComments() {
  return z
    .object({
      repository: z
        .string()
        .regex(/^DennySORA\/[A-Za-z0-9_.-]+$/)
        .nullable(),
    })
    .strict()
    .parse(json(join(process.cwd(), 'data/comments.json')));
}
export function publishedPaths(): string[] {
  const paths = ['/', '/404'];
  for (const locale of locales) {
    for (const page of ['', 'about', 'projects', 'blog', 'research', 'privacy'])
      paths.push(`/${locale}/${page}`.replace(/\/$/, ''));
    for (const post of listPosts(locale))
      paths.push(`/${locale}/blog/${post.slug}`);
    for (const project of loadProjects())
      paths.push(`/${locale}/projects/${project.id}`);
  }
  return paths;
}
