import { z } from 'zod';

export const localeSchema = z.enum(['zh-hant', 'en', 'ja']);
export const safeId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^[a-f0-9]{40}$/);
const https = z
  .url()
  .refine((value) => new URL(value).protocol === 'https:', 'HTTPS required');
const text = z.string().min(1);
export const localizedSchema = z
  .object({ 'zh-hant': text, en: text, ja: text })
  .strict();
export type LocalizedText = z.infer<typeof localizedSchema>;

export const topicIds = ['engineering', 'systems', 'ai'] as const;
export const contentTypeIds = [
  'essay',
  'tutorial',
  'research-note',
  'case-study',
] as const;
export type TopicId = (typeof topicIds)[number];
export type ContentTypeId = (typeof contentTypeIds)[number];

export const editionSchema = z
  .object({
    title: z.string().min(1).max(180),
    summary: z.string().min(1).max(500),
    publication: z.enum(['draft', 'published', 'archived']),
    translationState: z.enum([
      'original',
      'machine-draft',
      'reviewed',
      'source-published',
      'stale',
    ]),
    sourceRevision: hash.nullable(),
    reviewEvidence: https.nullable(),
  })
  .strict();
export const postSchema = z
  .object({
    id: safeId,
    slug: safeId,
    author: z.string().min(1),
    sourceLocale: localeSchema,
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date(),
    topics: z.array(z.enum(topicIds)).min(1),
    contentType: z.enum(contentTypeIds),
    tagIds: z.array(safeId).min(1).max(4),
    featured: z.boolean(),
    // Shared by every edition of the content group; never per locale.
    discussionNumber: z.number().int().positive().nullable(),
    commentsEnabled: z.boolean(),
    relatedPostIds: z.array(safeId),
    relatedProjectIds: z.array(safeId),
    source: z
      .object({
        repo: z.string().min(1),
        commit,
        path: z.string().min(1),
        url: https,
        kind: z.enum(['profile-adaptation', 'legacy-blog', 'original']),
      })
      .strict(),
    locales: z.partialRecord(localeSchema, editionSchema),
  })
  .strict();
export type Post = z.infer<typeof postSchema>;
export type Edition = z.infer<typeof editionSchema>;

export const topicsSchema = z.array(
  z
    .object({
      id: z.enum(topicIds),
      label: localizedSchema,
      description: localizedSchema,
    })
    .strict(),
);
export const contentTypesSchema = z.array(
  z.object({ id: z.enum(contentTypeIds), label: localizedSchema }).strict(),
);
export const tagsSchema = z.array(
  z
    .object({
      id: safeId,
      label: localizedSchema,
      aliases: z
        .object({
          'zh-hant': z.array(text),
          en: z.array(text),
          ja: z.array(text),
        })
        .strict(),
    })
    .strict(),
);

export const projectsSchema = z.array(
  z
    .object({
      id: safeId,
      title: z.string().min(1),
      category: z.enum(['open-source', 'work', 'experiment']),
      status: z.enum(['active', 'maintenance', 'archived', 'unknown']),
      owner: z.string().min(1),
      technologies: z.array(z.string().min(1)).max(6),
      domain: localizedSchema,
      headline: localizedSchema,
      summary: localizedSchema,
      role: localizedSchema,
      points: z
        .array(
          z.object({ title: localizedSchema, text: localizedSchema }).strict(),
        )
        .max(3),
      links: z.object({ repository: https, demo: https.optional() }).strict(),
      // A case study is published only with real per-locale content.
      caseStudy: z
        .object({
          publication: z.enum(['draft', 'published']),
          locales: z.array(localeSchema).min(1),
          contentPath: z.string().regex(/^content\/projects\/[a-z0-9-]+\/$/),
        })
        .strict()
        .nullable(),
      relatedPostIds: z.array(safeId),
      sources: z.array(https).min(1),
    })
    .strict(),
);
export type Project = z.infer<typeof projectsSchema>[number];

const sourceRef = z.object({ url: https, note: z.string() }).strict();
const evidenceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('post'), id: safeId }).strict(),
  z.object({ kind: z.literal('project'), id: safeId }).strict(),
  z
    .object({ kind: z.literal('section'), id: z.literal('experience') })
    .strict(),
]);
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const profileSchema = z
  .object({
    id: z.literal('dennysora'),
    displayName: z.literal('DennySORA'),
    publicName: z.string().min(1),
    reviewedAt: z.iso.date(),
    provenance: z
      .object({
        sources: z.array(sourceRef).min(1),
        editorial: z.string().min(1),
        withheld: z.string().min(1),
      })
      .strict(),
    introduction: z
      .object({
        role: localizedSchema,
        shortBio: localizedSchema,
        status: localizedSchema,
      })
      .strict(),
    focusNote: z
      .object({
        heading: localizedSchema,
        items: z
          .array(
            z
              .object({
                id: safeId,
                title: localizedSchema,
                text: localizedSchema,
              })
              .strict(),
          )
          .length(3),
      })
      .strict(),
    competencies: z
      .array(
        z
          .object({
            id: safeId,
            levels: z
              .array(z.enum(['production', 'practice', 'learning']))
              .min(1),
            title: localizedSchema,
            description: localizedSchema,
            examples: z.array(localizedSchema).max(2),
            evidence: z.array(evidenceSchema).min(1).max(2),
            tools: z.array(z.string().min(1)).min(4).max(6),
          })
          .strict(),
      )
      .length(3),
    featuredProjectIds: z.array(safeId).min(2).max(3),
    experience: z.array(
      z
        .object({
          id: safeId,
          kind: z.enum(['work', 'education']),
          startDate: yearMonth,
          endDate: yearMonth.nullable(),
          // null never implies "current"; the source must say so.
          current: z.boolean(),
          role: localizedSchema,
          organization: localizedSchema,
          summary: localizedSchema,
          highlights: z.array(localizedSchema).max(3),
          details: z.array(
            z
              .object({
                title: localizedSchema,
                items: z.array(localizedSchema).min(1),
              })
              .strict(),
          ),
          links: z.array(
            z.object({ label: localizedSchema, url: https }).strict(),
          ),
        })
        .strict(),
    ),
    currentFocus: z
      .object({
        updatedAt: z.iso.date(),
        question: localizedSchema,
        items: z
          .array(
            z
              .object({
                id: safeId,
                title: localizedSchema,
                text: localizedSchema,
              })
              .strict(),
          )
          .min(2)
          .max(3),
        postId: safeId,
      })
      .strict(),
    personal: z
      .object({
        intro: localizedSchema,
        interests: z.array(
          z
            .object({
              id: safeId,
              title: localizedSchema,
              text: localizedSchema,
            })
            .strict(),
        ),
      })
      .strict(),
    education: z.array(
      z
        .object({
          id: safeId,
          institution: localizedSchema,
          period: localizedSchema,
          detail: localizedSchema,
        })
        .strict(),
    ),
    record: z
      .object({
        skills: z.array(
          z
            .object({ title: localizedSchema, items: z.array(localizedSchema) })
            .strict(),
        ),
        depth: z.array(
          z
            .object({
              title: localizedSchema,
              groups: z.array(
                z
                  .object({
                    label: localizedSchema.nullable(),
                    items: z.array(localizedSchema).min(1),
                  })
                  .strict(),
              ),
            })
            .strict(),
        ),
        openSource: z.array(
          z
            .object({
              name: z.string().min(1),
              url: https,
              language: z.string().nullable(),
              description: localizedSchema,
            })
            .strict(),
        ),
        community: z.array(
          z
            .object({
              title: localizedSchema,
              items: z.array(localizedSchema),
              link: z.object({ label: text, url: https }).strict(),
            })
            .strict(),
        ),
        writing: z.array(
          z.object({ title: localizedSchema, url: https, host: text }).strict(),
        ),
      })
      .strict(),
    contact: z
      .object({
        email: z.email(),
        github: https.refine(
          (value) => new URL(value).hostname === 'github.com',
        ),
      })
      .strict(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;

const repository = z.string().regex(/^DennySORA\/[A-Za-z0-9_.-]+$/);
// Public configuration only: giscus ids are not secrets and no token is ever stored.
export const commentsConfigSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('unconfigured') }).strict(),
  z.object({ mode: z.literal('github-native'), repository }).strict(),
  z
    .object({
      mode: z.literal('giscus'),
      repository,
      repositoryId: z.string().regex(/^R_[A-Za-z0-9_-]+$/),
      category: z.string().min(1).max(100),
      categoryId: z.string().regex(/^DIC_[A-Za-z0-9_-]+$/),
      theme: z.enum([
        'transparent_dark',
        'dark',
        'dark_dimmed',
        'noborder_dark',
      ]),
      inputPosition: z.enum(['top', 'bottom']),
      reactionsEnabled: z.boolean(),
    })
    .strict(),
]);
export type CommentsConfig = z.infer<typeof commentsConfigSchema>;

export const headingAnchorsSchema = z.record(
  safeId,
  z.partialRecord(
    localeSchema,
    z.array(
      z
        .object({
          id: z.string().regex(/^[a-z][a-z0-9-]*$/),
          text: text,
          level: z.number().int().min(2).max(6),
        })
        .strict(),
    ),
  ),
);

/** Videos and audio that notes stream from the owner's Hugging Face dataset. */
export const noteMediaSchema = z
  .object({
    checkedAt: z.iso.date(),
    note: text,
    repository: https,
    files: z.array(
      z
        .object({
          path: z
            .string()
            .regex(
              /^notes\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9-]+\/[a-z0-9-]+\.(?:mp4|m4a)$/,
            ),
          revision: commit,
          bytes: z.number().int().positive(),
          sha256: hash,
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
          seconds: z.number().positive(),
          audioTracks: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .strict();
export type NoteMedia = z.infer<typeof noteMediaSchema>;

/** Article media is independent of the notes registry and markup policy. */
export const postMediaRepository =
  'https://huggingface.co/datasets/DennySORA/dennysora-site-media';
export const postMediaFileSchema = z
  .object({
    path: z
      .string()
      .regex(
        /^posts\/[a-z0-9]+(?:-[a-z0-9]+)*\/media\/[a-z0-9]+(?:-[a-z0-9]+)*\.mp4$/,
      ),
    revision: commit,
    bytes: z.number().int().nonnegative(),
    sha256: hash,
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative(),
    seconds: z.number().nonnegative(),
    audioTracks: z.number().int().nonnegative(),
    subtitles: z.literal(true).optional(),
  })
  .strict();
export const postMediaSchema = z
  .object({
    checkedAt: z.iso.date(),
    note: text,
    repository: z.literal(postMediaRepository),
    files: z
      .array(postMediaFileSchema)
      .refine(
        (files) =>
          new Set(files.map((file) => file.path)).size === files.length,
        'Duplicate article media path',
      ),
  })
  .strict();
export type PostMediaFile = z.infer<typeof postMediaFileSchema>;

/** Optional article navigation: adjacent H2 groups, shared by all editions. */
const postSectionGroupSchema = z
  .object({
    id: safeId,
    label: localizedSchema,
    icon: z.enum(['list', 'film', 'server', 'chart', 'info']),
    headings: z.array(safeId).min(1),
  })
  .strict();
export type PostSectionGroup = z.infer<typeof postSectionGroupSchema>;
export const postSectionsSchema = z.record(
  safeId,
  z
    .array(postSectionGroupSchema)
    .min(2)
    .max(8)
    .refine((groups) => {
      const ids = groups.map((group) => group.id);
      const headings = groups.flatMap((group) => group.headings);
      return (
        new Set(ids).size === ids.length &&
        new Set(headings).size === headings.length
      );
    }, 'Article section IDs and headings must be unique'),
);
