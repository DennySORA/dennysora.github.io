import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { z } from 'zod';
import { locales, type Locale } from '../i18n/index.ts';
import { localizedSchema, safeId } from './schema.ts';
import { renderMarkdown } from './markdown.server.ts';
import { readImageSize } from './image-size.server.ts';
import type { ArticleCoverData } from './article-covers.ts';

const editionSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    summary: z.string().trim().min(1).max(500),
  })
  .strict();

/** Original writing has no imported-source or translation-review machinery. */
export const thoughtSchema = z
  .object({
    slug: safeId,
    publication: z.enum(['draft', 'published']),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date(),
    locales: z
      .object({
        'zh-hant': editionSchema,
        en: editionSchema,
        ja: editionSchema,
      })
      .strict(),
    cover: z
      .object({
        file: z.string().regex(/^[a-z0-9][a-z0-9-]*\.jpg$/),
        alt: localizedSchema,
      })
      .strict()
      .optional(),
  })
  .strict();
export type Thought = z.infer<typeof thoughtSchema>;
const thoughtsRoot = join(process.cwd(), 'content/thoughts');

export function loadThoughts(directory = thoughtsRoot): Thought[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folder = join(directory, entry.name);
      const thought = thoughtSchema.parse(
        JSON.parse(readFileSync(join(folder, 'meta.json'), 'utf8')),
      );
      if (thought.slug !== entry.name)
        throw new Error(`Mismatched thought slug: ${entry.name}`);
      if (thought.updatedAt < thought.publishedAt)
        throw new Error(`Update precedes thought publication: ${thought.slug}`);
      if (thought.publication === 'published') {
        for (const locale of locales) {
          const body = readFileSync(join(folder, `${locale}.md`), 'utf8');
          if (!body.trim())
            throw new Error(`Empty thought edition: ${thought.slug}/${locale}`);
        }
        if (thought.cover) thoughtCover(thought, 'zh-hant', directory);
      }
      return thought;
    })
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        a.slug.localeCompare(b.slug),
    );
}

export function listThoughts(locale: Locale, directory = thoughtsRoot) {
  return loadThoughts(directory)
    .filter((thought) => thought.publication === 'published')
    .map((thought) => ({
      slug: thought.slug,
      publishedAt: thought.publishedAt,
      updatedAt: thought.updatedAt,
      ...thought.locales[locale],
    }));
}
export type ThoughtSummary = ReturnType<typeof listThoughts>[number];

function coverFile(thought: Thought, directory: string): string | null {
  if (!thought.cover) return null;
  const folder = realpathSync(join(directory, thought.slug));
  const file = realpathSync(join(folder, thought.cover.file));
  const path = relative(folder, file);
  if (path === '..' || path.startsWith(`..${sep}`))
    throw new Error(`Thought cover leaves its folder: ${thought.slug}`);
  return file;
}

export function thoughtCover(
  thought: Thought,
  locale: Locale,
  directory = thoughtsRoot,
): ArticleCoverData | null {
  const file = coverFile(thought, directory);
  if (!file || !thought.cover) return null;
  const bytes = readFileSync(file);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8)
    throw new Error(`Thought cover must be JPEG: ${thought.slug}`);
  const size = readImageSize(file);
  const src = `/content-assets/thoughts/${thought.slug}/${thought.cover.file}`;
  return {
    id: `thought:${thought.slug}`,
    src,
    smallSrc: src,
    socialSrc: src,
    ...size,
    alt: thought.cover.alt[locale],
  };
}

export function renderThought(
  thought: Thought,
  locale: Locale,
  directory = thoughtsRoot,
) {
  if (thought.publication !== 'published')
    throw new Error('Cannot render an unpublished thought');
  const folder = join(directory, thought.slug);
  return renderMarkdown(readFileSync(join(folder, `${locale}.md`), 'utf8'), {
    locale,
    assets: {
      directory: folder,
      urlPrefix: `/content-assets/thoughts/${thought.slug}/`,
    },
  });
}

export function thoughtAssets(thought: Thought, directory = thoughtsRoot) {
  if (thought.publication !== 'published') return [];
  const file = coverFile(thought, directory);
  const cover = thoughtCover(thought, 'zh-hant', directory);
  return [
    ...(file && cover ? [{ source: file, url: cover.src }] : []),
    ...locales.flatMap(
      (locale) => renderThought(thought, locale, directory).images,
    ),
  ];
}

export function loadThought(
  locale: Locale,
  slug: string,
  directory = thoughtsRoot,
) {
  const thought = loadThoughts(directory).find(
    (item) => item.slug === slug && item.publication === 'published',
  );
  if (!thought) return null;
  const body = renderThought(thought, locale, directory);
  return {
    slug: thought.slug,
    publishedAt: thought.publishedAt,
    updatedAt: thought.updatedAt,
    ...thought.locales[locale],
    cover: thoughtCover(thought, locale, directory),
    body: {
      html: body.html,
      headings: body.headings,
      minutes: body.minutes,
      hasMath: body.hasMath,
    },
  };
}
export type ThoughtArticle = NonNullable<ReturnType<typeof loadThought>>;
