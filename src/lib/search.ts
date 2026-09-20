import { htmlLang, type Locale } from '../i18n/index.ts';
export type SearchEntry = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};
export function matchSearch(
  entry: SearchEntry,
  query: string,
  locale: Locale,
): boolean {
  const normalized = query
    .normalize('NFKC')
    .toLocaleLowerCase(htmlLang[locale])
    .trim();
  if (!normalized) return true;
  const corpus = [entry.title, entry.text, ...entry.tags]
    .join(' ')
    .normalize('NFKC')
    .toLocaleLowerCase(htmlLang[locale]);
  if (corpus.includes(normalized)) return true;
  const segments = [
    ...new Intl.Segmenter(htmlLang[locale], { granularity: 'word' }).segment(
      normalized,
    ),
  ]
    .filter((item) => item.isWordLike)
    .map((item) => item.segment);
  return (
    segments.length > 0 && segments.every((segment) => corpus.includes(segment))
  );
}
