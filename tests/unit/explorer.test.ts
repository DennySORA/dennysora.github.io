import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Explorer } from '../../src/components/Explorer.tsx';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { decodeEntities } from '../../src/lib/html.ts';
import { medicalNotes } from '../../src/lib/medical-notes.ts';
import { networkNotes } from '../../src/lib/network-notes.ts';
import { noteCopy } from '../../src/lib/notes-copy.ts';
import { noteTree } from '../../src/lib/note-tree.server.ts';
import {
  projectCategoryCopy,
  projectsCopy,
} from '../../src/lib/project-pages.ts';

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];
}

/** Each folder row as [folder link, open?], in tree order. */
function folderStates(html: string) {
  return [
    ...html.matchAll(
      /<div class="tree-folder-row"><button[^>]*aria-expanded="(true|false)"[^>]*>[\s\S]*?<\/button><a[^>]*href="([^"]+)"[^>]*data-expanded="(true|false)"/g,
    ),
  ].map(([, button, href, link]) => {
    expect(link, href).toBe(button);
    return [href!, button === 'true'] as const;
  });
}

function explorerHtml(route: Parameters<typeof Explorer>[0]['route']) {
  const locale = 'locale' in route ? route.locale : 'zh-hant';
  return renderToStaticMarkup(
    createElement(Explorer, {
      locale,
      route,
      files: { posts: [], notes: noteTree(locale) },
    }),
  );
}

describe('folder disclosures', () => {
  for (const locale of locales) {
    it(`${locale} gives every folder a separate named disclosure and real navigation link`, () => {
      const html = renderToStaticMarkup(
        createElement(Explorer, {
          locale,
          route: { kind: 'home', locale },
          files: { posts: [], notes: noteTree(locale) },
        }),
      );
      const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(
        (match) => match[0],
      );
      // note, software (+network, +p2p), medical (+3 subfolders),
      // hardware (+1), other,
      // projects (+1 category)
      expect(buttons).toHaveLength(13);
      // On the home page no folder is on the current path, so all start closed.
      for (const button of buttons) {
        expect(attribute(button, 'type')).toBe('button');
        expect(attribute(button, 'aria-expanded')).toBe('false');
        expect(attribute(button, 'aria-label')).toContain(
          `${dictionaries[locale].folderExpand}: `,
        );
        expect(attribute(button, 'class')).toContain('requires-js');
        expect(html).toMatch(
          new RegExp(
            `<ul id="${attribute(button, 'aria-controls')}" class="tree-children" style="--tree-level:\\d+" data-collapsed="">`,
          ),
        );
      }
      expect(
        new Set(buttons.map((b) => attribute(b, 'aria-controls'))).size,
      ).toBe(buttons.length);
      const links = [...html.matchAll(/<a\b[^>]*>.*?<\/a>/g)].map(
        (match) => match[0],
      );
      expect(
        links.filter((link) => link.includes('data-kind="folder"')),
      ).toHaveLength(13);
      expect(links.every((link) => !link.includes('<button'))).toBe(true);
      expect(html).not.toContain(' hidden');
      // Every name is in the page's language: no slugs or .md file names.
      const t = dictionaries[locale];
      const names = [...html.matchAll(/class="tree-name">([^<]+)</g)].map(
        ([, name]) => decodeEntities(name!),
      );
      expect(
        names.filter((name) => /\.md$|^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(name)),
      ).toEqual([]);
      // The README comes first, then projects and notes; the empty blog is absent.
      expect(names.slice(0, 5)).toEqual([
        t.navAbout,
        projectsCopy[locale].title,
        projectCategoryCopy[locale].tools.title,
        'dgxtop',
        noteCopy[locale].notes,
      ]);
      expect(names).toEqual(
        expect.arrayContaining([
          medicalNotes['brain-cns-tumors'].name[locale],
          medicalNotes.analgesics.name[locale],
          networkNotes['p2p-privacy'].name[locale],
          'dgxtop',
        ]),
      );
      // The full title stays available as the tooltip and to screen readers.
      expect(html).toContain(
        `title="${medicalNotes.analgesics.title[locale]}"`,
      );
      expect(html).not.toContain(`href="/${locale}/blog/"`);
    });
  }

  it('opens only the folders on the path to the current page', () => {
    const open = (html: string) =>
      folderStates(html)
        .filter(([, expanded]) => expanded)
        .map(([href]) => href);
    const home = folderStates(explorerHtml({ kind: 'home', locale: 'en' }));
    expect(home).toHaveLength(13);
    expect(home.every(([, expanded]) => !expanded)).toBe(true);
    expect(
      open(
        explorerHtml({
          kind: 'medical-note',
          locale: 'zh-hant',
          noteId: 'brain-cns-tumors',
        }),
      ),
    ).toEqual([
      '/zh-hant/note/',
      '/zh-hant/note/medical/',
      '/zh-hant/note/medical/pathology/',
    ]);
    // A folder page opens itself as well as its parents.
    expect(
      open(
        explorerHtml({
          kind: 'note-folder',
          locale: 'ja',
          folder: 'computer',
        }),
      ),
    ).toEqual([
      '/ja/note/',
      '/ja/note/hardware/',
      '/ja/note/hardware/computer/',
    ]);
    expect(
      open(
        explorerHtml({ kind: 'project', locale: 'en', projectId: 'dgxtop' }),
      ),
    ).toEqual(['/en/projects/', '/en/projects/tools/']);
    expect(open(explorerHtml({ kind: 'library', locale: 'en' }))).toEqual([]);
  });

  it("gives each folder's entries the next level, however deep the tree goes", () => {
    const html = explorerHtml({
      kind: 'network-note',
      locale: 'zh-hant',
      noteId: 'p2p-downloader',
    });
    const levels = new Map(
      [
        ...html.matchAll(
          /<ul id="([^"]+)" class="tree-children" style="--tree-level:(\d+)"/g,
        ),
      ].map(([, id, level]) => [id!, Number(level)]),
    );
    const folders = [
      ...html.matchAll(
        /<button[^>]*aria-controls="([^"]+)"[^>]*>[\s\S]*?<\/button><a[^>]*href="([^"]+)"/g,
      ),
    ];
    expect(folders).toHaveLength(13);
    // A folder's entries sit one level below it, so the levels follow the
    // path: /note/ holds level 2 and /note/software/network/p2p/ level 5.
    for (const [, id, href] of folders) {
      const depth = href!.split('/').filter(Boolean).length - 1;
      expect(levels.get(id!), href).toBe(depth + 1);
    }
    expect(Math.max(...levels.values())).toBe(5);
  });

  it('keeps desktop and drawer disclosure IDs unique with the current child exposed', () => {
    const explorer = createElement(Explorer, {
      locale: 'zh-hant',
      route: {
        kind: 'medical-note',
        locale: 'zh-hant',
        noteId: 'brain-cns-tumors',
      },
      files: { posts: [], notes: noteTree('zh-hant') },
    });
    const html = renderToStaticMarkup(
      createElement(Fragment, null, explorer, explorer),
    );
    const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(ids).toHaveLength(26);
    expect(new Set(ids).size).toBe(ids.length);
    const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
    expect(current).toHaveLength(2);
    for (const link of current)
      expect(link[0]).toContain('/note/medical/pathology/brain-cns-tumors/');
    expect(html).not.toContain(' hidden');
  });
});
