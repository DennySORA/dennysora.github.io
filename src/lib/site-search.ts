import { isLocale, type Locale } from '../i18n/index.ts';
import { matchSearch } from './search.ts';
import { parseRoute } from './route-manifest.ts';

export const searchKinds = ['all', 'article', 'note', 'page'] as const;
export type SearchKind = (typeof searchKinds)[number];
export type SiteSearchDocument = {
  id: string;
  locale: Locale;
  kind: Exclude<SearchKind, 'all'>;
  href: string;
  title: string;
  summary: string;
  text: string;
};
export function parseSiteSearch(params: URLSearchParams) {
  const kind = params.get('kind');
  return {
    q: (params.get('q') ?? '').slice(0, 160).trim(),
    kind: searchKinds.find((item) => item === kind) ?? 'all',
  };
}
export function parseSearchIndex(value: unknown): SiteSearchDocument[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        ['id', 'href', 'title', 'summary', 'text'].every(
          (key) => typeof (item as Record<string, unknown>)[key] === 'string',
        ) &&
        'locale' in item &&
        typeof item.locale === 'string' &&
        isLocale(item.locale) &&
        'kind' in item &&
        ['article', 'note', 'page'].includes(String(item.kind)) &&
        'href' in item &&
        typeof item.href === 'string' &&
        item.href.startsWith(`/${item.locale}/`) &&
        parseRoute(item.href) !== null,
    )
  )
    throw new Error('Invalid site search index');
  return value as SiteSearchDocument[];
}

/** One result per page, preferring the requested language, then a real edition. */
export function localizedDocuments(
  documents: SiteSearchDocument[],
  locale: Locale,
): SiteSearchDocument[] {
  const selected = new Map<string, SiteSearchDocument>();
  const preference = [...new Set([locale, 'zh-hant', 'en', 'ja'])];
  for (const document of documents) {
    const previous = selected.get(document.id);
    if (
      !previous ||
      preference.indexOf(document.locale) < preference.indexOf(previous.locale)
    )
      selected.set(document.id, document);
  }
  return [...selected.values()];
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase();
export function searchSite(
  documents: SiteSearchDocument[],
  query: string,
  kind: SearchKind,
  locale: Locale,
): SiteSearchDocument[] {
  const q = query.slice(0, 160).trim();
  const score = (document: SiteSearchDocument) => {
    if (!q) return 0;
    if (normalize(document.title).includes(normalize(q))) return 3;
    if (normalize(document.summary).includes(normalize(q))) return 2;
    return 1;
  };
  return localizedDocuments(documents, locale)
    .filter(
      (document) =>
        (kind === 'all' || document.kind === kind) &&
        matchSearch(
          {
            id: document.id,
            title: document.title,
            text: `${document.summary} ${document.text}`,
            tags: [],
          },
          q,
          locale,
        ),
    )
    .sort(
      (a, b) => score(b) - score(a) || a.title.localeCompare(b.title, locale),
    );
}

export function searchExcerpt(document: SiteSearchDocument, query: string) {
  const text = document.text;
  const word = query.trim().split(/\s+/).find(Boolean);
  const match = word ? normalize(text).indexOf(normalize(word)) : -1;
  if (match < 0) return document.summary || text.slice(0, 180);
  const start = Math.max(0, match - 50);
  const end = Math.min(text.length, start + 200);
  return `${start ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}
