import { z } from 'zod';

export const localeSchema = z.enum(['zh-hant', 'en', 'ja']);
const safeId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^[a-f0-9]{40}$/);
const https = z
  .url()
  .refine((value) => new URL(value).protocol === 'https:', 'HTTPS required');
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
    topics: z.array(z.enum(['ai', 'engineering', 'systems'])).min(1),
    featured: z.boolean(),
    discussionNumber: z.number().int().positive().nullable(),
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
const translated = z.object({
  'zh-hant': z.string().min(1),
  en: z.string().min(1),
  ja: z.string().min(1),
});
export const projectsSchema = z.array(
  z
    .object({
      id: safeId,
      title: z.string().min(1),
      url: https,
      tags: z.array(z.string()),
      summary: translated,
      source: https,
      kind: z.enum(['production', 'open-source']),
    })
    .strict(),
);
export type Project = z.infer<typeof projectsSchema>[number];
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
