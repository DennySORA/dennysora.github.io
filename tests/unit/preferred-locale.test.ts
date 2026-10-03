import { describe, expect, it } from 'vitest';
import { preferredLocale } from '../../src/lib/preferred-locale.ts';

describe('browser language preference', () => {
  it.each([
    [['zh-TW', 'en-US'], 'zh-hant'],
    [['zh-Hant-HK'], 'zh-hant'],
    [['zh-HK'], 'zh-hant'],
    [['zh-MO'], 'zh-hant'],
    [['zh'], 'zh-hant'],
    [['JA-jp', 'en'], 'ja'],
    [['en-GB', 'ja-JP'], 'en'],
    [['fr-FR', 'ja-JP', 'en-US'], 'ja'],
    [['zh-CN', 'en-US'], 'en'],
    [['de-DE'], 'en'],
    [[], 'en'],
  ])('selects from %j in preference order', (languages, expected) => {
    expect(preferredLocale(languages)).toBe(expected);
  });
});
