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
    tagIds: z.array(safeId).max(4),
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

const originalUrl = https.refine(
  (value) => ['arxiv.org'].includes(new URL(value).hostname),
  'Unapproved paper host',
);
const guideUrl = https.refine(
  (value) => new URL(value).hostname === 'paper.dennysora.me',
  'Unapproved guide host',
);
export const researchSchema = z
  .object({
    sourceRepo: z.literal('DennySORA/daily-paper-report'),
    sourceCommit: commit,
    sourceUrl: https.refine(
      (value) => new URL(value).hostname === 'github.com',
    ),
    generatedAt: z.iso.datetime({ offset: true }),
    period: z.iso.date(),
    reports: z
      .array(
        z
          .object({
            id: z.string().min(1),
            title: z.string().min(1).max(400),
            titleZh: z.string().min(1).max(400),
            publishedAt: z.iso.datetime({ offset: true }),
            originalUrl,
            guideUrl,
            kind: z.literal('daily'),
            language: z.literal('zh-Hant'),
            review: z.literal('machine-generated'),
          })
          .strict(),
      )
      .max(20),
  })
  .strict();
export type Research = z.infer<typeof researchSchema>;

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
