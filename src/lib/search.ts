import { htmlLang, type Locale } from '../i18n/index.ts';

export type SearchEntry = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};

const normalize = (value: string, locale: Locale) =>
  value.normalize('NFKC').toLocaleLowerCase(htmlLang[locale]).trim();

/**
 * Title-and-summary matching used only while the full-text index is unavailable.
 * It filters; it never ranks, so production keeps one relevance model.
 */
export function matchSearch(
  entry: SearchEntry,
  query: string,
  locale: Locale,
): boolean {
  const needle = normalize(query, locale);
  if (!needle) return true;
  const corpus = normalize(
    [entry.title, entry.text, ...entry.tags].join(' '),
    locale,
  );
  if (corpus.includes(needle)) return true;
  const segments = [
    ...new Intl.Segmenter(htmlLang[locale], { granularity: 'word' }).segment(
      needle,
    ),
  ]
    .filter((item) => item.isWordLike)
    .map((item) => item.segment);
  return (
    segments.length > 0 && segments.every((segment) => corpus.includes(segment))
  );
}
