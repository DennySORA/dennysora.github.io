import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { locales, type Locale } from '../i18n/index.ts';
import {
  commentsConfigSchema,
  contentTypesSchema,
  headingAnchorsSchema,
  postSchema,
  profileSchema,
  projectsSchema,
  researchSchema,
  tagsSchema,
  topicsSchema,
  type ContentTypeId,
  type Post,
  type TopicId,
} from './schema.ts';
import { editionStatus, requireEdition } from './publication.ts';
import { renderMarkdown, type RenderedMarkdown } from './markdown.server.ts';
import {
  prerenderPath,
  reservedSlugs,
  type RouteDescriptor,
} from './route-manifest.ts';

export { siteUrl } from './site.ts';
const root = process.cwd();
const contentRoot = join(root, 'content');

function json(path: string): unknown {
  const bytes = readFileSync(path);
  if (bytes.byteLength > 500_000)
    throw new Error(`Data exceeds limit: ${path}`);
  return JSON.parse(bytes.toString()) as unknown;
}
function once<T>(load: () => T): () => T {
  let value: { current: T } | null = null;
  return () => (value ??= { current: load() }).current;
}

export const loadTaxonomy = once(() => ({
  topics: topicsSchema.parse(json(join(contentRoot, 'taxonomy/topics.json'))),
  types: contentTypesSchema.parse(
    json(join(contentRoot, 'taxonomy/content-types.json')),
  ),
  tags: tagsSchema.parse(json(join(contentRoot, 'taxonomy/tags.json'))),
}));
export const loadProjects = once(() =>
  projectsSchema.parse(json(join(contentRoot, 'projects/projects.json'))),
);
export const loadProfile = once(() =>
  profileSchema.parse(json(join(contentRoot, 'profile/profile.json'))),
);
export const loadComments = once(() =>
  commentsConfigSchema.parse(json(join(root, 'data/comments.json'))),
);
export const loadHeadingAnchors = once(() =>
  headingAnchorsSchema.parse(
    json(join(root, 'data/migration/heading-anchors.json')),
  ),
);
export function loadResearch() {
  const path = join(root, 'data/research/snapshot.json');
  if (!existsSync(path)) return null;
  return researchSchema.parse(json(path));
}

export type LoadedPost = Post & { revision: string; editions: Locale[] };
export const loadPosts = once((): LoadedPost[] => {
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
});

const renders = new Map<string, RenderedMarkdown>();
export function renderPost(id: string, locale: Locale): RenderedMarkdown {
  const key = `${id}/${locale}`;
  const cached = renders.get(key);
  if (cached) return cached;
  const directory = join(contentRoot, 'posts', id);
  const rendered = renderMarkdown(
    readFileSync(join(directory, `${locale}.md`), 'utf8'),
    {
      locale,
      publishedAnchors: loadHeadingAnchors()[id]?.[locale] ?? [],
      assets: { directory, urlPrefix: `/content-assets/posts/${id}/` },
    },
  );
  renders.set(key, rendered);
  return rendered;
}

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  topics: TopicId[];
  contentType: ContentTypeId;
  tagIds: string[];
  featured: boolean;
  minutes: number;
};
export function listPosts(locale: Locale): PostSummary[] {
  return loadPosts()
    .filter((post) => post.editions.includes(locale))
    .map((post) => {
      const edition = requireEdition(post, locale);
      return {
        id: post.id,
        slug: post.slug,
        title: edition.title,
        summary: edition.summary,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        topics: post.topics,
        contentType: post.contentType,
        tagIds: post.tagIds,
        featured: post.featured,
        minutes: renderPost(post.id, locale).minutes,
      };
    });
}

export function loadArticle(locale: Locale, slug: string) {
  const post = loadPosts().find((item) => item.slug === slug);
  if (!post) return null;
  // A loader payload is public too: never serialize draft sibling editions.
  if (editionStatus(post, locale, post.revision) !== 'published') return null;
  const edition = requireEdition(post, locale);
  const body = renderPost(post.id, locale);
  return {
    post: {
      id: post.id,
      slug: post.slug,
      author: post.author,
      sourceLocale: post.sourceLocale,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      topics: post.topics,
      contentType: post.contentType,
      tagIds: post.tagIds,
      source: post.source,
      discussionNumber: post.discussionNumber,
      commentsEnabled: post.commentsEnabled,
      editions: post.editions,
    },
    edition: {
      title: edition.title,
      summary: edition.summary,
      translationState: edition.translationState,
    },
    // Local image paths stay on the build machine; only public output is returned.
    body: {
      html: body.html,
      headings: body.headings,
      minutes: body.minutes,
      hasMath: body.hasMath,
    },
  };
}
export type Article = NonNullable<ReturnType<typeof loadArticle>>;

/** Related posts: explicit ids first, then shared tags and topics. */
export function relatedPosts(
  locale: Locale,
  postId: string,
  limit = 3,
): PostSummary[] {
  const posts = listPosts(locale);
  const current = loadPosts().find((post) => post.id === postId);
  if (!current) return [];
  const score = (post: PostSummary) =>
    (current.relatedPostIds.includes(post.id) ? 100 : 0) +
    post.tagIds.filter((tag) => current.tagIds.includes(tag)).length * 2 +
    post.topics.filter((topic) => current.topics.includes(topic)).length;
  return posts
    .filter((post) => post.id !== postId && score(post) > 0)
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        b.publishedAt.localeCompare(a.publishedAt) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}

export function tagsInLocale(locale: Locale): string[] {
  const used = new Set(listPosts(locale).flatMap((post) => post.tagIds));
  return loadTaxonomy()
    .tags.map((tag) => tag.id)
    .filter((id) => used.has(id));
}
export function topicsInLocale(locale: Locale): TopicId[] {
  const used = new Set(listPosts(locale).flatMap((post) => post.topics));
  return loadTaxonomy()
    .topics.map((topic) => topic.id)
    .filter((id) => used.has(id));
}

export function hasPublishedCaseStudy(
  projectId: string,
  locale: Locale,
): boolean {
  const project = loadProjects().find((item) => item.id === projectId);
  return Boolean(
    project?.caseStudy?.publication === 'published' &&
    project.caseStudy.locales.includes(locale),
  );
}

export function publishedRoutes(): RouteDescriptor[] {
  const routes: RouteDescriptor[] = [{ kind: 'root' }, { kind: 'not-found' }];
  for (const locale of locales) {
    routes.push(
      { kind: 'home', locale },
      { kind: 'about', locale },
      { kind: 'projects', locale },
      { kind: 'library', locale },
      { kind: 'tags', locale },
      { kind: 'papers', locale },
      { kind: 'research', locale },
      { kind: 'privacy', locale },
    );
    for (const post of listPosts(locale))
      routes.push({ kind: 'article', locale, slug: post.slug });
    for (const topicId of topicsInLocale(locale))
      routes.push({ kind: 'topic', locale, topicId });
    for (const tagId of tagsInLocale(locale))
      routes.push({ kind: 'tag', locale, tagId });
    for (const project of loadProjects())
      routes.push({ kind: 'project', locale, projectId: project.id });
  }
  return routes;
}
export function isIndexable(route: RouteDescriptor): boolean {
  if (route.kind === 'not-found' || route.kind === 'research') return false;
  if (route.kind === 'project')
    return hasPublishedCaseStudy(route.projectId, route.locale);
  return true;
}
export function publishedPaths(): string[] {
  return publishedRoutes().map(prerenderPath);
}

/** Cross-reference checks that schemas alone cannot express. Throws on the first defect list. */
export function validateContent(): void {
  const problems: string[] = [];
  const posts = loadPosts();
  const postIds = new Set(posts.map((post) => post.id));
  const projects = loadProjects();
  const projectIds = new Set(projects.map((project) => project.id));
  const { tags, topics, types } = loadTaxonomy();
  const tagIds = new Set(tags.map((tag) => tag.id));
  if (tagIds.size !== tags.length) problems.push('Duplicate tag id');
  if (new Set(topics.map((topic) => topic.id)).size !== topics.length)
    problems.push('Duplicate topic id');
  if (new Set(types.map((type) => type.id)).size !== types.length)
    problems.push('Duplicate content type id');
  const slugs = new Set<string>();
  for (const post of posts) {
    if (slugs.has(post.slug)) problems.push(`Duplicate slug: ${post.slug}`);
    slugs.add(post.slug);
    if ((reservedSlugs as readonly string[]).includes(post.slug))
      problems.push(`Reserved slug: ${post.slug}`);
    if (post.updatedAt < post.publishedAt)
      problems.push(`Update precedes publication: ${post.id}`);
    for (const tag of post.tagIds)
      if (!tagIds.has(tag)) problems.push(`Unknown tag ${tag} in ${post.id}`);
    for (const id of post.relatedPostIds)
      if (!postIds.has(id) || id === post.id)
        problems.push(`Invalid related post ${id} in ${post.id}`);
    for (const id of post.relatedProjectIds)
      if (!projectIds.has(id))
        problems.push(`Unknown project ${id} in ${post.id}`);
    for (const locale of locales) {
      const edition = post.locales[locale];
      if (
        edition?.publication === 'published' &&
        editionStatus(post, locale, post.revision) !== 'published'
      )
        problems.push(
          `Unreviewed or stale published translation: ${post.id}/${locale}`,
        );
    }
    // Published anchors may never silently disappear from a published edition.
    for (const locale of post.editions) {
      const ids = new Set(
        renderPost(post.id, locale).headings.map((heading) => heading.id),
      );
      for (const anchor of loadHeadingAnchors()[post.id]?.[locale] ?? [])
        if (!ids.has(anchor.id))
          problems.push(
            `Published anchor #${anchor.id} (“${anchor.text}”) is missing in ${post.id}/${locale}; restore the heading or add {#${anchor.id}} to its replacement`,
          );
    }
  }
  for (const project of projects) {
    for (const id of project.relatedPostIds)
      if (!postIds.has(id))
        problems.push(`Unknown post ${id} in project ${project.id}`);
    if (project.caseStudy?.publication === 'published')
      for (const locale of project.caseStudy.locales)
        if (
          !existsSync(join(root, project.caseStudy.contentPath, `${locale}.md`))
        )
          problems.push(
            `Published case study missing ${locale} content: ${project.id}`,
          );
  }
  const profile = loadProfile();
  for (const id of profile.featuredProjectIds)
    if (!projectIds.has(id)) problems.push(`Unknown featured project ${id}`);
  if (!postIds.has(profile.currentFocus.postId))
    problems.push(`Unknown current-focus post ${profile.currentFocus.postId}`);
  for (const competency of profile.competencies)
    for (const evidence of competency.evidence)
      if (
        (evidence.kind === 'post' && !postIds.has(evidence.id)) ||
        (evidence.kind === 'project' && !projectIds.has(evidence.id))
      )
        problems.push(
          `Unknown evidence ${evidence.kind}:${evidence.id} in ${competency.id}`,
        );
  loadComments();
  loadResearch();
  const paths = publishedPaths();
  if (new Set(paths).size !== paths.length) problems.push('Duplicate route');
  if (problems.length)
    throw new Error(`Content validation failed:\n- ${problems.join('\n- ')}`);
}
