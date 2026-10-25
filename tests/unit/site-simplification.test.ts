import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, type LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { TabLine } from '../../src/components/TabLine.tsx';
import { Readme } from '../../src/features/home/Readme.tsx';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { parseRoute } from '../../src/lib/route-manifest.ts';
import { areas } from '../../src/lib/workspace.ts';
import { noteTree } from '../../src/lib/note-tree.server.ts';

describe('requested website simplification', () => {
  for (const locale of locales) {
    it(`${locale} keeps privacy and the old flat project URL removed, with Projects as an area`, () => {
      // Projects returned as folders (projects/tools/dgxtop); the removed
      // flat project page and privacy stay real 404s.
      expect(parseRoute(`/${locale}/projects/`)).toEqual({
        kind: 'projects',
        locale,
      });
      for (const path of [
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
      expect(areas(locale, { posts: [] }).map((area) => area.key)).toEqual([
        'home',
        'notes',
        'projects',
      ]);
    });
    it(`${locale} names every quick link with its visible label and draws chrome icons as vectors`, () => {
      // The language menu reads the location, so it renders inside a router.
      const html = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          { initialEntries: [`/${locale}/`] },
          createElement(TabLine, {
            locale,
            route: { kind: 'home', locale },
            files: { posts: [], notes: noteTree(locale) },
            languageLinks: locales.map((target) => ({
              locale: target,
              href: `/${target}/`,
            })),
            explorer: {
              id: 'desktop-explorer',
              expanded: true,
              label: 'Explorer',
              onToggle: () => {},
            },
          }),
        ),
      );
      const links = [
        ...html.matchAll(/<a[^>]*aria-label="([^"]+)"[^>]*>(.*?)<\/a>/g),
      ].filter((link) => link[2]?.includes('quick-link-text'));
      // Two quick links in the tabline and the same two in the explorer dialog.
      expect(links).toHaveLength(4);
      for (const link of links) {
        const caption = link[2]?.match(
          /class="quick-link-text"[^>]*>([^<]+)</,
        )?.[1];
        expect(caption).toBeTruthy();
        expect(link[1]).toContain(caption);
      }
      const buffers = html.match(/<nav class="buffers"[\s\S]*?<\/nav>/)?.[0];
      expect(
        [...(buffers ?? '').matchAll(/class="tab-name">([^<]+)</g)].map(
          (match) => match[1],
        ),
      ).toEqual(['README.md', 'note', 'projects']);
      expect(html).toContain(`href="/${locale}/search/#search"`);
      expect(html).not.toMatch(/navigation-icons|activity-art|<img[^>]*sprite/);
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
      expect(html).toContain(
        'https://github.com/trendmicro/adk-agui-middleware',
      );
      expect(html).not.toMatch(/class="dashboard"|class="dash-item"/);
      const community = html.match(
        /<section[^>]*id="community-title"[^>]*>([\s\S]*?)<\/section>/,
      )?.[1];
      expect(community).toBeDefined();
      expect(html).toContain(
        `aria-label="${dictionaries[locale].communityTitle}"`,
      );
      expect(community).not.toMatch(/<h[1-6]\b/);
      expect(community).toContain('class="text-action community-link"');
      expect(community).toContain(dictionaries[locale].communityInvitation);
      expect(community).toContain('<span lang="zh-Hant">硬核 AI 交流社</span>');
      expect(community).toContain(
        'href="https://www.facebook.com/groups/915613384421068" rel="noopener noreferrer"',
      );
      expect(community).toContain(dictionaries[locale].newTab);
      expect(community).not.toMatch(/<(script|iframe|img)\b|target="_blank"/);
      const metadata = meta({ loaderData: data } as Parameters<typeof meta>[0]);
      expect(JSON.stringify(metadata)).toContain(
        '"name":"李汶道","alternateName":"DennySORA"',
      );
    });
  }
});
