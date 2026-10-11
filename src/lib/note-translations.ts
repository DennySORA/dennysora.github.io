import { decodeEntities, escapeHtml } from './html.ts';

export type NoteTranslation = { source: string; en: string; ja: string };

const han = /[\u3400-\u9fff]/;
const tokens = /<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g;
const textAttributes = /(\s)(aria-label|title|placeholder|alt)="([^"]*)"/g;

/** Walk text in our reviewed fragments; never rewrite tags, IDs, URLs or data. */
function mapNoteText(
  html: string,
  visit: (source: string) => string,
  locale?: 'en' | 'ja',
  additionalSources?: ReadonlySet<string>,
): string {
  let pre = false;
  const text = (raw: string, verbatim = false): string => {
    const decoded = decodeEntities(raw);
    const source = verbatim
      ? decoded.trim()
      : decoded.replace(/\s+/g, ' ').trim();
    if (!han.test(source) && !additionalSources?.has(source)) {
      // Punctuation can sit in its own node after inline emphasis or code.
      if (locale === 'en' && !verbatim && !/[\p{L}\p{N}]/u.test(decoded)) {
        const punctuation: Record<string, string> = {
          '。': '.',
          '，': ', ',
          '、': ', ',
          '；': '; ',
          '：': ': ',
          '（': '(',
          '）': ')',
          '「': '“',
          '」': '”',
          '『': '‘',
          '』': '’',
          '！': '!',
          '？': '?',
        };
        return raw.replace(
          /[。，、；：（）「」『』！？]/g,
          (char) => punctuation[char] ?? char,
        );
      }
      return raw;
    }
    const translated = escapeHtml(visit(source));
    return `${raw.match(/^\s*/)?.[0] ?? ''}${translated}${raw.match(/\s*$/)?.[0] ?? ''}`;
  };
  return html.replace(tokens, (token) => {
    if (token.startsWith('<!--')) return token;
    if (token.startsWith('<')) {
      if (/^<pre\b/i.test(token)) pre = true;
      if (/^<\/pre\b/i.test(token)) pre = false;
      return token.replace(
        textAttributes,
        (_, space: string, name: string, value: string) =>
          `${space}${name}="${text(value)}"`,
      );
    }
    return pre
      ? token
          .split('\n')
          .map((line) => text(line, true))
          .join('\n')
      : text(token);
  });
}

/** The source wording is the key: changed prose fails closed until retranslated. */
export function noteTranslationSources(html: string): string[] {
  const sources = new Set<string>();
  mapNoteText(html, (source) => {
    sources.add(source);
    return source;
  });
  return [...sources];
}

export function translateNote(
  html: string,
  translations: readonly NoteTranslation[],
  locale: 'en' | 'ja',
): string {
  const entries = new Map<string, NoteTranslation>();
  for (const entry of translations) {
    if (
      !entry ||
      typeof entry.source !== 'string' ||
      typeof entry.en !== 'string' ||
      typeof entry.ja !== 'string' ||
      !entry.source.trim() ||
      !entry.en.trim() ||
      !entry.ja.trim()
    )
      throw new Error('Incomplete note translation');
    if (entries.has(entry.source))
      throw new Error('Duplicate note translation');
    entries.set(entry.source, entry);
  }
  const used = new Set<string>();
  const result = mapNoteText(
    html,
    (source) => {
      const entry = entries.get(source);
      if (!entry)
        throw new Error(
          `Missing ${locale} note translation: ${source.slice(0, 100)}`,
        );
      used.add(source);
      return entry[locale];
    },
    locale,
    new Set(entries.keys()),
  );
  if (used.size !== entries.size) throw new Error('Stale note translation');
  return result;
}
