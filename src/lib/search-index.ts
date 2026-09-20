import { z } from 'zod';
import type { Locale } from '../i18n/index.ts';
const entrySchema = z
  .object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    tags: z.array(z.string()),
  })
  .strict();
export type SearchEntry = z.infer<typeof entrySchema>;
export function parseSearchIndex(
  value: unknown,
  locale: Locale,
): SearchEntry[] {
  return z
    .object({
      locale: z.literal(locale),
      entries: z.array(entrySchema).max(2000),
    })
    .strict()
    .parse(value).entries;
}
