import type { Locale } from '../i18n/index.ts';

type LocalizedText = { 'zh-hant': string; en: string; ja: string };
export type Localized<T> = T extends LocalizedText
  ? string
  : T extends readonly (infer Item)[]
    ? Localized<Item>[]
    : T extends object
      ? { [Key in keyof T]: Localized<T[Key]> }
      : T;

function isLocalizedText(value: object): value is LocalizedText {
  const keys = Object.keys(value);
  return (
    keys.length === 3 &&
    ['zh-hant', 'en', 'ja'].every(
      (key) => typeof (value as Record<string, unknown>)[key] === 'string',
    )
  );
}

/** Resolves every trilingual text object to one locale before data reaches the page. */
export function localize<T>(value: T, locale: Locale): Localized<T> {
  if (Array.isArray(value))
    return value.map((item: unknown) => localize(item, locale)) as Localized<T>;
  if (value !== null && typeof value === 'object') {
    if (isLocalizedText(value)) return value[locale] as Localized<T>;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localize(item, locale)]),
    ) as Localized<T>;
  }
  return value as Localized<T>;
}
