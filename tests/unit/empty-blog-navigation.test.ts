import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Explorer } from '../../src/components/Explorer.tsx';
import { TabLine } from '../../src/components/TabLine.tsx';
import { locales, type Locale } from '../../src/i18n/index.ts';
import { noteTree } from '../../src/lib/note-tree.server.ts';
import {
  routePath,
  type RouteDescriptor,
} from '../../src/lib/route-manifest.ts';
import { areas, type WorkspaceFiles } from '../../src/lib/workspace.ts';

function navigation(
  locale: Locale,
  route: RouteDescriptor,
  posts: WorkspaceFiles['posts'],
) {
  const files = { posts, notes: noteTree(locale) };
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [routePath(route)] },
      createElement(
        Fragment,
        null,
        createElement(TabLine, {
          locale,
          route,
          files,
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
        createElement(Explorer, { locale, route, files }),
      ),
    ),
  );
}

describe('empty blog navigation category', () => {
  for (const locale of locales) {
    for (const kind of ['home', 'library', 'search'] as const) {
      it(`${locale} hides the empty blog in tabs and both explorers on ${kind}`, () => {
        const html = navigation(locale, { kind, locale }, []);
        expect(html).not.toContain(`href="/${locale}/blog/"`);
        expect(html).not.toContain('data-area="library"');
        expect(html).not.toContain('class="tree-empty"');
        expect(html.match(/class="explorer"/g)).toHaveLength(2);
        for (const area of ['note', 'projects'])
          expect(html).toContain(`href="/${locale}/${area}/"`);
        expect(html).toContain(`href="/${locale}/search/#search"`);
        expect(areas(locale, { posts: [] }).map((area) => area.key)).toEqual([
          'home',
          'notes',
          'projects',
        ]);
      });
    }
    it(`${locale} restores the blog category when an article is published`, () => {
      const posts = [{ slug: 'published-example', title: 'Published example' }];
      const html = navigation(locale, { kind: 'home', locale }, posts);
      expect(html).toContain('data-area="library"');
      // One tab plus the mobile and desktop explorer folders.
      expect(
        html.match(new RegExp(`href="/${locale}/blog/"`, 'g')),
      ).toHaveLength(3);
      expect(
        html.match(
          new RegExp(`href="/${locale}/blog/published-example/"`, 'g'),
        ),
      ).toHaveLength(2);
      expect(areas(locale, { posts }).map((area) => area.key)).toEqual([
        'home',
        'library',
        'notes',
        'projects',
      ]);
    });
  }
});
