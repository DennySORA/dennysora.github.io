import { z } from 'zod';
import { researchSchema } from './schema.ts';

// Project only approved public metadata; summaries, state and provider data never cross.
const sourceSchema = z.object({
  generated_at: z.iso.datetime({ offset: true }),
  run_date: z.iso.date(),
  top5: z
    .array(
      z.object({
        story_id: z.string(),
        title: z.string(),
        title_zh: z.string(),
        published_at: z.iso.datetime({ offset: true }),
        primary_link: z.object({ url: z.url() }),
      }),
    )
    .min(1),
});
export function importResearch(value: unknown, commit: string) {
  const source = sourceSchema.parse(value);
  return researchSchema.parse({
    sourceRepo: 'DennySORA/daily-paper-report',
    sourceCommit: commit,
    sourceUrl: `https://github.com/DennySORA/daily-paper-report/blob/${commit}/api/daily.json`,
    generatedAt: source.generated_at,
    period: source.run_date,
    reports: source.top5.slice(0, 3).map((paper) => ({
      id: paper.story_id,
      title: paper.title,
      titleZh: paper.title_zh,
      publishedAt: paper.published_at,
      originalUrl: paper.primary_link.url,
      guideUrl: `https://paper.dennysora.me/day/${source.run_date}.html`,
      kind: 'daily',
      language: 'zh-Hant',
      review: 'machine-generated',
    })),
  });
}
