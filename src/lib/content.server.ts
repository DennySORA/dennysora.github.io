import {
  medicalNoteIds,
  medicalNotes,
  type MedicalNoteId,
} from './medical-notes.ts';
import {
  networkNoteIds,
  networkNotes,
  type NetworkNoteId,
} from './network-notes.ts';
import {
  hardwareNoteIds,
  hardwareNotes,
  type HardwareNoteId,
} from './hardware-notes.ts';
import {
  collectionNoteIds,
  type CollectionNoteId,
} from './note-collections.ts';
import { folderTrail, noteFolderIds, noteFolderOf } from './note-tree.ts';
import {
  collectionNoteMeta,
  collectionNoteSource,
} from './note-collections.server.ts';
import {
  projectCategories,
  projectPageIds,
  projectPages,
} from './project-pages.ts';
import { addNoteTags } from './note-tags.server.ts';
import { noteMediaUrl } from './note-media.ts';
import {
  checkPostMediaMarkup,
  loadPostMedia,
  postMediaUrl,
} from './post-media.server.ts';
import {
  loadPostSections,
  partitionPostSections,
  type PostSection,
} from './post-sections.server.ts';
import {
  markJapanese,
  translateNote,
  type NoteTranslation,
} from './note-translations.ts';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { locales, type Locale } from '../i18n/index.ts';
import {
  commentsConfigSchema,
  contentTypesSchema,
  headingAnchorsSchema,
  noteMediaSchema,
  postSchema,
  profileSchema,
  projectsSchema,
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

export type RenderedPost = RenderedMarkdown & {
  sections: PostSection[] | null;
};
const renders = new Map<string, RenderedPost>();
export function renderPost(
  id: string,
  locale: Locale,
  options?: { mode: 'draft-preview' },
): RenderedPost {
  const preview = options?.mode === 'draft-preview';
  if (
    preview &&
    loadPosts().find((post) => post.id === id)?.locales[locale]?.publication !==
      'draft'
  )
    throw new Error('Local previews require an existing draft edition');
  const key = `${id}/${locale}`;
  const cached = preview ? undefined : renders.get(key);
  if (cached) return cached;
  const directory = join(contentRoot, 'posts', id);
  const media = loadPostMedia().files.filter((file) =>
    file.path.startsWith(`posts/${id}/`),
  );
  const markdown = readFileSync(join(directory, `${locale}.md`), 'utf8');
  const rendered = renderMarkdown(markdown, {
    locale,
    publishedAnchors: loadHeadingAnchors()[id]?.[locale] ?? [],
    assets: {
      directory,
      urlPrefix: `/content-assets/posts/${id}/`,
      postMedia: { id, files: media },
      ...(preview ? { allowLocalVideos: true as const } : {}),
    },
  });
  const groups = loadPostSections()[id];
  const body: RenderedPost = {
    ...rendered,
    sections: groups
      ? partitionPostSections(markdown, rendered, groups, locale)
      : null,
  };
  if (!preview) {
    checkPostMediaMarkup(id, locale, rendered.html, media);
    renders.set(key, body);
  }
  return body;
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
      html: body.sections ? '' : body.html,
      sections: body.sections,
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

export function publishedRoutes(): RouteDescriptor[] {
  const routes: RouteDescriptor[] = [{ kind: 'root' }, { kind: 'not-found' }];
  for (const locale of locales) {
    routes.push(
      { kind: 'home', locale },
      { kind: 'library', locale },
      { kind: 'search', locale },
      { kind: 'notes', locale },
      { kind: 'projects', locale },
    );
    if (tagsInLocale(locale).length) routes.push({ kind: 'tags', locale });
    for (const folder of noteFolderIds)
      routes.push({ kind: 'note-folder', locale, folder });
    for (const category of projectCategories)
      routes.push({ kind: 'project-category', locale, category });
    for (const post of listPosts(locale))
      routes.push({ kind: 'article', locale, slug: post.slug });
    for (const topicId of topicsInLocale(locale))
      routes.push({ kind: 'topic', locale, topicId });
    for (const tagId of tagsInLocale(locale))
      routes.push({ kind: 'tag', locale, tagId });
    for (const noteId of medicalNoteIds)
      routes.push({ kind: 'medical-note', locale, noteId });
    for (const noteId of networkNoteIds)
      routes.push({ kind: 'network-note', locale, noteId });
    for (const noteId of hardwareNoteIds)
      routes.push({ kind: 'hardware-note', locale, noteId });
    for (const noteId of collectionNoteIds)
      routes.push({ kind: 'collection-note', locale, noteId });
  }
  // A project page is published only in the languages it was written in.
  for (const projectId of projectPageIds)
    for (const locale of projectPages[projectId].editions)
      routes.push({ kind: 'project', locale, projectId });
  return routes;
}
export function isIndexable(route: RouteDescriptor): boolean {
  if (route.kind === 'not-found' || route.kind === 'search') return false;
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
  for (const id of Object.keys(loadPostSections()))
    if (!postIds.has(id))
      problems.push(`Article sections refer to unknown post: ${id}`);
  for (const file of loadPostMedia().files) {
    // The publication gate refuses draft registry placeholders, even when unused.
    postMediaUrl(file);
    if (!postIds.has(file.path.split('/')[1] ?? ''))
      problems.push(`Unknown article owner for media: ${file.path}`);
  }
  const projects = loadProjects();
  const projectIds = new Set(projects.map((project) => project.id));
  const { tags, topics, types } = loadTaxonomy();
  const tagIds = new Set(tags.map((tag) => tag.id));
  if (tagIds.size !== tags.length) problems.push('Duplicate tag id');
  if (new Set(topics.map((topic) => topic.id)).size !== topics.length)
    problems.push('Duplicate topic id');
  if (new Set(types.map((type) => type.id)).size !== types.length)
    problems.push('Duplicate content type id');
  // Note IDs name translation files and search entries, so they are unique site-wide.
  const noteIds = [
    ...medicalNoteIds,
    ...networkNoteIds,
    ...hardwareNoteIds,
    ...collectionNoteIds,
  ];
  for (const id of new Set(noteIds))
    if (noteIds.filter((item) => item === id).length > 1)
      problems.push(`Duplicate note id ${id}`);
  for (const [id, note] of Object.entries({
    ...medicalNotes,
    ...networkNotes,
    ...hardwareNotes,
    ...collectionNoteMeta,
    ...projectPages,
  })) {
    if (note.tagIds.length === 0) problems.push(`Missing tags in note ${id}`);
    if (new Set(note.tagIds).size !== note.tagIds.length)
      problems.push(`Duplicate tags in note ${id}`);
    for (const tag of note.tagIds)
      if (!tagIds.has(tag)) problems.push(`Unknown tag ${tag} in note ${id}`);
  }
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
  // A route is publishable only when its complete translated body is loadable.
  for (const locale of locales) {
    for (const id of medicalNoteIds) loadMedicalNote(id, locale);
    for (const id of networkNoteIds) loadNetworkNote(id, locale);
    for (const id of hardwareNoteIds) loadHardwareNote(id, locale);
    for (const id of collectionNoteIds) loadCollectionNote(id, locale);
  }
  const paths = publishedPaths();
  if (new Set(paths).size !== paths.length) problems.push('Duplicate route');
  if (problems.length)
    throw new Error(`Content validation failed:\n- ${problems.join('\n- ')}`);
}

/** Reviewed, repository-owned static educational content; no executable markup. */
export function loadMedicalNote(
  id: MedicalNoteId = 'analgesics',
  locale: Locale = 'zh-hant',
): string {
  if (!medicalNoteIds.includes(id)) throw new Error('Unknown medical note');
  const path =
    id === 'analgesics'
      ? 'notes/medical.html'
      : 'notes/medical/pathology/brain-cns-tumors.html';
  const html = readFileSync(join(contentRoot, path), 'utf8');
  if (
    /<(?:script|iframe|object|embed|form|style|link)\b|\son[a-z]+\s*=|javascript:/i.test(
      html,
    )
  )
    throw new Error('Executable markup in medical note');
  return addNoteTags(
    noteEdition(html, id, locale),
    medicalNotes[id].tagIds,
    loadTaxonomy().tags,
    locale,
  );
}

/** Only reviewed, repository-owned static fragments; never accepts a visitor path. */
export function loadNetworkNote(
  id: NetworkNoteId,
  locale: Locale = 'zh-hant',
): string {
  if (!networkNoteIds.includes(id)) throw new Error('Unknown network note');
  const html = readFileSync(join(contentRoot, `notes/${id}.html`), 'utf8');
  if (
    /<(?:script|iframe|object|embed|form|style|link)\b|\son[a-z]+\s*=|javascript:|\ssrc\s*=/i.test(
      html,
    )
  )
    throw new Error('Executable markup in network note');
  return addNoteTags(
    noteEdition(html, id, locale),
    networkNotes[id].tagIds,
    loadTaxonomy().tags,
    locale,
  );
}

/** A reviewed static fragment: inline SVG charts and tables, no scripts, styles or remote assets. */
export function loadHardwareNote(
  id: HardwareNoteId,
  locale: Locale = 'zh-hant',
): string {
  if (!hardwareNoteIds.includes(id)) throw new Error('Unknown hardware note');
  const html = readFileSync(
    join(
      contentRoot,
      `notes/${folderTrail(noteFolderOf[id]).join('/')}/${id}.html`,
    ),
    'utf8',
  );
  if (
    /<(?:script|iframe|object|embed|form|style|link|img)\b|\son[a-z]+\s*=|javascript:|\s(?:src|style)\s*=/i.test(
      html,
    )
  )
    throw new Error('Executable or styled markup in hardware note');
  return addNoteTags(
    noteEdition(html, id, locale),
    hardwareNotes[id].tagIds,
    loadTaxonomy().tags,
    locale,
  );
}

/** A note's own photos: same-origin files under /assets/notes/<id>/, never remote. */
export function collectionNoteImages(id: CollectionNoteId, html: string) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => {
    const attribute = (name: string) =>
      tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const src = attribute('src') ?? '';
    const width = Number(attribute('width'));
    const height = Number(attribute('height'));
    if (
      !new RegExp(`^/assets/notes/${id}/[a-z0-9-]+\\.(?:webp|jpg|png)$`).test(
        src,
      ) ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width <= 0 ||
      height <= 0 ||
      !attribute('alt')?.trim()
    )
      throw new Error(`Unsafe or incomplete image in note ${id}: ${tag}`);
    return { src, width, height };
  });
}

export const loadNoteMedia = once(() =>
  noteMediaSchema.parse(json(join(root, 'data/note-media.json'))),
);

/**
 * A note's streamed media: recorded files of the owner's Hugging Face dataset,
 * pinned to a commit, that load only when the reader presses play. A video
 * declares its real size and may have a same-origin poster.
 */
export function collectionNoteMedia(id: CollectionNoteId, html: string) {
  const recorded = new Map(
    loadNoteMedia().files.map((file) => [noteMediaUrl(file), file]),
  );
  const read = (tag: string, kind: 'video' | 'audio') => {
    const value = (name: string) =>
      tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const has = (name: string) =>
      new RegExp(`\\s${name}(?=[\\s=/>])`).test(tag);
    const src = value('src') ?? '';
    const file = recorded.get(src);
    const extension = kind === 'video' ? '.mp4' : '.m4a';
    if (
      !file?.path.startsWith(`notes/${id}/`) ||
      !src.endsWith(extension) ||
      value('preload') !== 'none' ||
      has('autoplay')
    )
      throw new Error(`Unrecorded or eager ${kind} in note ${id}: ${tag}`);
    return { value, has, src, file };
  };
  const videos = [...html.matchAll(/<video\b[^>]*>/gi)].map(([tag]) => {
    const { value, has, src, file } = read(tag, 'video');
    const poster = value('poster');
    const width = Number(value('width'));
    const height = Number(value('height'));
    if (
      width !== file.width ||
      height !== file.height ||
      !has('controls') ||
      !has('playsinline') ||
      (poster !== undefined &&
        !new RegExp(`^/assets/notes/${id}/[a-z0-9-]+\\.(?:webp|jpg)$`).test(
          poster,
        ))
    )
      throw new Error(`Unsized or unsafe video in note ${id}: ${tag}`);
    return { src, poster: poster ?? null, width, height };
  });
  const audio = [...html.matchAll(/<audio\b[^>]*>/gi)].map(([tag]) => ({
    src: read(tag, 'audio').src,
  }));
  if (
    (html.match(/\sposter\s*=/gi) ?? []).length !==
    videos.filter((video) => video.poster).length
  )
    throw new Error(`Poster outside a video in note ${id}`);
  return { videos, audio };
}

/** Same-origin files a note's fragment shows: its photos and video posters. */
export function collectionNoteAssets(id: CollectionNoteId, html: string) {
  return [
    ...collectionNoteImages(id, html).map((image) => image.src),
    ...collectionNoteMedia(id, html).videos.flatMap((video) =>
      video.poster ? [video.poster] : [],
    ),
  ];
}

/** Accepts only reviewed static markup: tables, inline SVG, the note's own photos and its recorded media. */
export function checkCollectionNoteMarkup(id: CollectionNoteId, html: string) {
  if (
    /<(?:script|iframe|object|embed|form|style|link|picture|source|track)\b|\son[a-z]+\s*=|javascript:|\s(?:style|srcset)\s*=/i.test(
      html,
    )
  )
    throw new Error(`Executable or styled markup in note ${id}`);
  // Every src belongs to an <img> of this note's own photos or to its recorded media.
  const images = collectionNoteImages(id, html);
  const { videos, audio } = collectionNoteMedia(id, html);
  if (
    (html.match(/\ssrc\s*=/gi) ?? []).length !==
    images.length + videos.length + audio.length
  )
    throw new Error(`Source attribute outside an image or media in note ${id}`);
  return images;
}

/** A reviewed static fragment in the requested language, with its tags under the title. */
export function loadCollectionNote(
  id: CollectionNoteId,
  locale: Locale = 'zh-hant',
): string {
  if (!collectionNoteIds.includes(id)) throw new Error('Unknown note');
  const html = readFileSync(
    join(contentRoot, collectionNoteSource(id)),
    'utf8',
  );
  checkCollectionNoteMarkup(id, html);
  const edition = noteEdition(html, id, locale);
  return addNoteTags(
    // The Japanese edition is Japanese throughout; the others mark its parts.
    locale === 'ja'
      ? edition
      : markJapanese(
          edition,
          locale,
          locale === 'zh-hant' ? noteTranslations(id) : [],
        ),
    collectionNoteMeta[id].tagIds,
    loadTaxonomy().tags,
    locale,
  );
}

function noteTranslations(id: string): NoteTranslation[] {
  const entries = json(join(contentRoot, `notes/translations/${id}.json`));
  if (!Array.isArray(entries))
    throw new Error(`Invalid note translations: ${id}`);
  return entries as NoteTranslation[];
}

function noteEdition(html: string, id: string, locale: Locale): string {
  if (locale === 'zh-hant') return html;
  // translateNote checks every field, rejects duplicates and requires exact coverage.
  return translateNote(html, noteTranslations(id), locale);
}
