import { decodeEntities, escapeHtml } from './html.ts';

export type NoteTranslation = { source: string; en: string; ja: string };

const han = /[\u3400-\u9fff]/;
const tokens = /<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g;
const textAttributes = /(\s)(aria-label|title|placeholder|alt)="([^"]*)"/g;
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

/** Walk text in our reviewed fragments; never rewrite tags, IDs, URLs or data. */
function mapNoteText(
  html: string,
  visit: (source: string) => string,
  locale?: 'en' | 'ja',
  additionalSources?: ReadonlySet<string>,
): string {
  let pre = false;
  const text = (raw: string, verbatim = false, next = ''): string => {
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
        const mapped = raw.replace(
          /[。，、；：（）「」『』！？]/g,
          (char) => punctuation[char] ?? char,
        );
        // A full stop between two inline items still starts a new English sentence.
        return /[.!?]$/.test(mapped) && /^<[a-z]/i.test(next)
          ? `${mapped} `
          : mapped;
      }
      return raw;
    }
    const translated = escapeHtml(visit(source));
    return `${raw.match(/^\s*/)?.[0] ?? ''}${translated}${raw.match(/\s*$/)?.[0] ?? ''}`;
  };
  // Text marked lang="ja" is Japanese subject matter, such as example
  // sentences in a Japanese note: every edition keeps it verbatim.
  const open: { name: string; japanese: boolean }[] = [];
  const japanese = () => open.at(-1)?.japanese ?? false;
  return html.replace(tokens, (token, offset: number) => {
    if (token.startsWith('<!--')) return token;
    if (token.startsWith('<')) {
      if (/^<pre\b/i.test(token)) pre = true;
      if (/^<\/pre\b/i.test(token)) pre = false;
      const closing = /^<\/([a-z][\w:-]*)/i.exec(token)?.[1]?.toLowerCase();
      if (closing) {
        const index = open.map(({ name }) => name).lastIndexOf(closing);
        if (index >= 0) open.length = index;
        return token;
      }
      const name = /^<([a-z][\w:-]*)/i.exec(token)?.[1]?.toLowerCase();
      const lang = /\slang="([^"]*)"/i.exec(token)?.[1];
      const verbatim =
        lang === undefined ? japanese() : /^ja(?:-|$)/i.test(lang);
      if (name && !voidElements.has(name) && !token.endsWith('/>'))
        open.push({ name, japanese: verbatim });
      return verbatim
        ? token
        : token.replace(
            textAttributes,
            (_, space: string, attribute: string, value: string) =>
              `${space}${attribute}="${text(value)}"`,
          );
    }
    if (japanese()) return token;
    return pre
      ? token
          .split('\n')
          .map((line) => text(line, true))
          .join('\n')
      : text(
          token,
          false,
          html.slice(offset + token.length, offset + token.length + 2),
        );
  });
}

// Japanese inside Chinese or English prose: kana and kanji, the marks that join
// them, and one-letter placeholders such as the A, B and N of AはBと同じ or
// Nにいい, never the first letter of an English word after 。.
const japaneseLetter = String.raw`[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}々〆ー〜～・／［］（）「」『』＿\u3000]`;
const japaneseWord = String.raw`${japaneseLetter}(?:[A-Z]?${japaneseLetter})*`;
const japaneseRuns = new RegExp(
  String.raw`(?:(?<![A-Za-z])[A-Z])?${japaneseWord}(?:[、。？！][A-Z]?${japaneseWord})*(?:[。？！]|[A-Z](?![A-Za-z]))?`,
  'gu',
);
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}ー]/u;
const script = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const kanaRuns = /[\p{Script=Hiragana}\p{Script=Katakana}ー〜～・]+/gu;
// Elements whose text cannot hold a <span>, or whose layout must stay exact.
const unmarkedElements = new Set([
  'svg',
  'math',
  'pre',
  'option',
  'select',
  'textarea',
  'title',
  'script',
  'style',
]);

/**
 * Marks Japanese inside Chinese or English text so screen readers switch voice
 * and fonts use Japanese glyphs (WCAG 3.1.2). English text holds no Chinese, so
 * every kana or kanji run there is Japanese. Chinese and Japanese share kanji,
 * so a Chinese node marks the exact runs its English translation kept verbatim,
 * then any kana that is still unmarked, such as the た of た形.
 */
export function markJapanese(
  html: string,
  locale: 'zh-hant' | 'en',
  translations: readonly NoteTranslation[] = [],
): string {
  const english = new Map(
    translations.map((entry) => [entry.source, entry.en]),
  );
  const wrap = (run: string) => `<span lang="ja">${run}</span>`;
  const markKana = (text: string) =>
    text
      .split(/(<span lang="ja">[^<]*<\/span>)/)
      .map((part) =>
        part.startsWith('<span') ? part : part.replace(kanaRuns, wrap),
      )
      .join('');
  // Brackets and marks join Japanese words but are never a run by themselves.
  const wrapWords = (run: string) => (script.test(run) ? wrap(run) : run);
  const mark = (raw: string): string => {
    if (locale === 'en' || !han.test(raw))
      return raw.replace(japaneseRuns, wrapWords);
    const source = decodeEntities(raw).replace(/\s+/g, ' ').trim();
    const runs = [
      ...new Set(
        (english.get(source)?.match(japaneseRuns) ?? []).filter((run) =>
          kana.test(run),
        ),
      ),
    ].sort((a, b) => b.length - a.length);
    const guided = runs.length
      ? raw.replace(
          new RegExp(
            runs
              .map((run) => run.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              .join('|'),
            'gu',
          ),
          wrap,
        )
      : raw;
    return markKana(guided);
  };
  const open: { name: string; japanese: boolean; frozen: boolean }[] = [];
  return html.replace(tokens, (token) => {
    if (token.startsWith('<!--')) return token;
    if (token.startsWith('<')) {
      const closing = /^<\/([a-z][\w:-]*)/i.exec(token)?.[1]?.toLowerCase();
      if (closing) {
        const index = open.map(({ name }) => name).lastIndexOf(closing);
        if (index >= 0) open.length = index;
        return token;
      }
      const name = /^<([a-z][\w:-]*)/i.exec(token)?.[1]?.toLowerCase();
      const lang = /\slang="([^"]*)"/i.exec(token)?.[1];
      const parent = open.at(-1);
      if (name && !voidElements.has(name) && !token.endsWith('/>'))
        open.push({
          name,
          japanese:
            lang === undefined
              ? (parent?.japanese ?? false)
              : /^ja(?:-|$)/i.test(lang),
          frozen: (parent?.frozen ?? false) || unmarkedElements.has(name),
        });
      return token;
    }
    const parent = open.at(-1);
    if (parent?.japanese || parent?.frozen) return token;
    return kana.test(token) || (locale === 'en' && han.test(token))
      ? mark(token)
      : token;
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
