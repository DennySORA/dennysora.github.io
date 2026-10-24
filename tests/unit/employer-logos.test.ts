import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Readme } from '../../src/features/home/Readme.tsx';
import {
  formatYearMonthDuration,
  locales,
  type Locale,
} from '../../src/i18n/index.ts';
import { escapeHtml } from '../../src/lib/html.ts';

const expectedLogos: Record<string, string> = {
  'trend-micro': '/assets/employer-trend-micro.svg',
  kkstream: '/assets/employer-kkstream.jpg',
};
const requestedCategory: Record<Locale, string> = {
  'zh-hant': '[博弈公司] 天堂遊戲有限公司',
  en: '[Gambling company] 天堂遊戲有限公司',
  ja: '[ギャンブル関連企業] 天堂遊戲有限公司',
};
const requestedDurations: Record<string, Record<Locale, string>> = {
  'trend-micro': {
    'zh-hant': '（3 年 9 個月）',
    en: '(3 years 9 months)',
    ja: '（3年9か月）',
  },
  kkstream: {
    'zh-hant': '（1 年 1 個月）',
    en: '(1 year 1 month)',
    ja: '（1年1か月）',
  },
  tiantang: {
    'zh-hant': '（6 個月）',
    en: '(6 months)',
    ja: '（6か月）',
  },
};

function home(locale: Locale) {
  const data = loader({
    params: { '*': locale },
  } as unknown as LoaderFunctionArgs);
  if (data.view.kind !== 'home') throw new Error('Expected home');
  return data.view;
}

describe('employer wordmarks', () => {
  for (const locale of locales) {
    it(`${locale} keeps work history readable with local decorative logos before its headings`, () => {
      const view = home(locale);
      const html = renderToStaticMarkup(
        createElement(Readme, { view, locale }),
      );
      const entries = html.split('<li class="timeline-entry"').slice(1);
      expect(entries).toHaveLength(view.profile.experience.length);
      expect(html.match(/class="timeline-employer-logo"/g)).toHaveLength(2);
      expect(html.match(/class="timeline-duration"/g)).toHaveLength(
        view.profile.experience.filter((entry) => entry.kind === 'work').length,
      );
      expect(
        view.profile.experience.find((entry) => entry.id === 'tiantang')
          ?.organization,
      ).toBe(requestedCategory[locale]);
      view.profile.experience.forEach((entry, index) => {
        const rendered = entries[index] ?? '';
        const logo = expectedLogos[entry.id];
        // The existing text remains the label and fallback if an image fails.
        for (const text of [entry.role, entry.organization, entry.summary])
          expect(rendered).toContain(escapeHtml(text));
        expect(rendered).toContain(`dateTime="${entry.startDate}"`);
        if (entry.endDate)
          expect(rendered).toContain(`dateTime="${entry.endDate}"`);
        if (entry.kind === 'work')
          expect(rendered).toContain(
            `<span class="timeline-duration">${requestedDurations[entry.id]?.[locale]}</span>`,
          );
        else expect(rendered).not.toContain('timeline-duration');
        if (logo) {
          expect(rendered).toContain(
            `class="timeline-employer-logo" src="${logo}" alt="" width="144" height="32" loading="lazy" decoding="async"`,
          );
          expect(rendered.indexOf(`src="${logo}"`)).toBeLessThan(
            rendered.indexOf('<h3'),
          );
        } else {
          expect(rendered).not.toContain('timeline-employer-logo');
        }
      });
    });
  }

  it('leaves an unverified employer as text instead of guessing a logo', () => {
    const view = home('en');
    view.profile.experience = view.profile.experience
      .filter((entry) => entry.kind === 'work')
      .slice(0, 1)
      .map((entry) => ({ ...entry, id: 'unverified-employer' }));
    const html = renderToStaticMarkup(
      createElement(Readme, { view, locale: 'en' }),
    );
    expect(html).not.toContain('timeline-employer-logo');
    expect(html).toContain(
      escapeHtml(view.profile.experience[0]?.organization ?? ''),
    );
  });

  it('keeps the official SVG passive and self-contained', () => {
    const svg = readFileSync('assets/employer-trend-micro.svg', 'utf8');
    const allowed = new Set(['svg', 'defs', 'clipPath', 'rect', 'g', 'path']);
    for (const [, tag] of svg.matchAll(/<\/?([a-zA-Z][\w:-]*)\b/g))
      expect(allowed.has(tag ?? '')).toBe(true);
    expect(svg).not.toMatch(
      /\bon\w+\s*=|\b(?:xlink:)?href\s*=|<!DOCTYPE|<!ENTITY/i,
    );
    for (const [, reference] of svg.matchAll(/url\(([^)]+)\)/g))
      expect(reference).toMatch(/^#[\w-]+$/);
  });

  it('uses the primary text token and semibold only for employer names', () => {
    const css = readFileSync('src/styles/pages.css', 'utf8');
    const rule = css.match(
      /\.timeline-entry\[data-kind='work'\] \.timeline-org\s*\{([^}]+)\}/,
    )?.[1];
    expect(rule).toContain('color: var(--color-text)');
    expect(rule).toContain('font-weight: 600');
  });
});

describe('calendar-month employment duration', () => {
  it.each([
    [
      '2022-07',
      '2026-04',
      ['（3 年 9 個月）', '(3 years 9 months)', '（3年9か月）'],
    ],
    ['2025-12', '2026-01', ['（1 個月）', '(1 month)', '（1か月）']],
    [
      '2021-06',
      '2022-07',
      ['（1 年 1 個月）', '(1 year 1 month)', '（1年1か月）'],
    ],
    ['2019-01', '2019-07', ['（6 個月）', '(6 months)', '（6か月）']],
    ['2025-04', '2026-04', ['（1 年）', '(1 year)', '（1年）']],
    ['2026-04', '2026-04', ['（0 個月）', '(0 months)', '（0か月）']],
  ] as const)('%s to %s stays precise in all locales', (start, end, labels) => {
    for (const [index, locale] of locales.entries())
      expect(formatYearMonthDuration(start, end, locale)).toBe(labels[index]);
  });

  it.each([
    ['2026-04', '2022-07'],
    ['2022-13', '2026-04'],
    ['2022-07', '2026-00'],
    ['', '2026-04'],
  ])('does not invent a duration for %s to %s', (start, end) => {
    for (const locale of locales)
      expect(formatYearMonthDuration(start, end, locale)).toBeNull();
  });
});
