import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { ActivityBar } from '../../src/components/ActivityBar.tsx';
import { Readme } from '../../src/features/home/Readme.tsx';
import { locales } from '../../src/i18n/index.ts';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { parseRoute } from '../../src/lib/route-manifest.ts';
import { areas } from '../../src/lib/workspace.ts';

describe('requested website simplification', () => {
  for (const locale of locales) {
    it(`${locale} removes Projects and privacy from routes and navigation`, () => {
      for (const path of [
        `/${locale}/projects/`,
        `/${locale}/projects/dgxtop/`,
        `/${locale}/privacy/`,
      ]) {
        expect(parseRoute(path)).toBeNull();
        expect(publishedPaths()).not.toContain(path.replace(/\/$/, ''));
        expect(() =>
          loader({
            params: { '*': path.slice(1) },
          } as unknown as LoaderFunctionArgs),
        ).toThrow();
      }
      expect(areas(locale).map((area) => area.key)).toEqual([
        'home',
        'library',
        'notes',
        'papers',
      ]);
    });
    it(`${locale} exposes a visible label matching every quick link's accessible name`, () => {
      const html = renderToStaticMarkup(
        createElement(ActivityBar, {
          locale,
          route: { kind: 'home', locale },
          explorerId: 'desktop-explorer',
          explorerExpanded: true,
          explorerLabel: 'Explorer',
          explorerToggleRef: { current: null },
          onToggleExplorer: () => {},
        }),
      );
      const links = [
        ...html.matchAll(/<a[^>]*aria-label="([^"]+)"[^>]*>(.*?)<\/a>/g),
      ];
      expect(links).toHaveLength(7);
      for (const link of links) {
        const caption = link[2]?.match(
          /class="activity-label"[^>]*>([^<]+)</,
        )?.[1];
        expect(caption).toBeTruthy();
        expect(link[1]).toContain(caption);
      }
      expect([...html.matchAll(/class="activity-art"/g)]).toHaveLength(5);
    });
    it(`${locale} retains the core résumé, correct identity and repository evidence`, () => {
      const data = loader({
        params: { '*': locale },
      } as unknown as LoaderFunctionArgs);
      if (data.view.kind !== 'home') throw new Error('Expected home');
      const html = renderToStaticMarkup(
        createElement(Readme, { view: data.view, locale }),
      );
      expect(html).toMatch(
        /<dt lang="en">name<\/dt><dd lang="zh-Hant">李汶道<\/dd>/,
      );
      expect(html).toMatch(/<dt lang="en">alias<\/dt><dd>DennySORA<\/dd>/);
      for (const id of [
        'readme-title',
        'competencies-title',
        'experience-title',
      ])
        expect(html).toContain(`id="${id}"`);
      for (const id of [
        'works-title',
        'exploring',
        'beyond',
        'record-title',
        'contact-title',
      ])
        expect(html).not.toContain(`id="${id}"`);
      for (const key of [
        'focusNote',
        'currentFocus',
        'personal',
        'record',
        'education',
        'featuredProjectIds',
      ])
        expect(data.view.profile).not.toHaveProperty(key);
      expect(html).not.toContain('/projects/');
      expect(html).toContain('https://github.com/DennySORA/httpulse');
      const metadata = meta({ loaderData: data } as Parameters<typeof meta>[0]);
      expect(JSON.stringify(metadata)).toContain(
        '"name":"李汶道","alternateName":"DennySORA"',
      );
    });
  }
});
