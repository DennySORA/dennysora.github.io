import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import { locales } from '../../src/i18n/index.ts';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { noteFolderCopy, noteTree } from '../../src/lib/note-tree.server.ts';
import {
  folderPath,
  noteArea,
  noteFolderIds,
  noteFolderOf,
  noteFolders,
  noteIds,
  notePath,
  resolveNotePath,
  subfolders,
} from '../../src/lib/note-tree.ts';
import {
  navSection,
  noteRoute,
  parseRoute,
  routePath,
} from '../../src/lib/route-manifest.ts';
import { crumbs, fileKind, filePath } from '../../src/lib/workspace.ts';

const load = (path: string) =>
  loader({
    params: { '*': path.slice(1) },
  } as unknown as LoaderFunctionArgs);

describe('the note tree', () => {
  it('files each note in the folder the owner chose', () => {
    expect(
      noteFolderIds.filter((id) => noteFolders[id].parent === null),
    ).toEqual(['software', 'medical', 'hardware', 'japan', 'ai', 'other']);
    expect(folderPath('p2p', 'zh-hant')).toBe(
      '/zh-hant/note/software/network/p2p/',
    );
    expect(notePath('p2p-privacy', 'en')).toBe(
      '/en/note/software/network/p2p/p2p-privacy/',
    );
    expect(notePath('lumbar-spine-care', 'ja')).toBe(
      '/ja/note/medical/daily-care/lumbar-spine-care/',
    );
    expect(notePath('analgesics')).toBe(
      '/zh-hant/note/medical/drugs/analgesics/',
    );
    // Other holds its notes directly, without subfolders.
    expect(notePath('landscape-photography')).toBe(
      '/zh-hant/note/other/landscape-photography/',
    );
    expect(subfolders('other')).toEqual([]);
    // AI is a top-level area of its own; Video / Data comparisons sit in it.
    expect(folderPath('ai', 'zh-hant')).toBe('/zh-hant/ai/');
    expect(folderPath('comparisons', 'en')).toBe('/en/ai/video/comparisons/');
    expect(notePath('h3-dit-components', 'ja')).toBe(
      '/ja/ai/video/comparisons/h3-dit-components/',
    );
    expect(noteArea('comparisons')).toBe('ai');
    expect(noteArea('p2p')).toBe('notes');
  });

  it('answers every folder and note at its own path, in all three languages', () => {
    for (const locale of locales) {
      for (const folder of noteFolderIds) {
        const path = folderPath(folder, locale);
        const route = { kind: 'note-folder', locale, folder } as const;
        expect(parseRoute(path), path).toEqual(route);
        expect(routePath(route)).toBe(path);
        expect(navSection(route)).toBe(noteArea(folder));
        expect(fileKind(route)).toBe('folder');
        expect(publishedPaths()).toContain(path.slice(0, -1));
        expect(load(path).view).toMatchObject({ kind: 'note-folder', folder });
      }
      for (const id of noteIds) {
        const path = notePath(id, locale);
        const route = noteRoute(id, locale);
        expect(parseRoute(path), path).toEqual(route);
        expect(routePath(route)).toBe(path);
        expect(navSection(route)).toBe(noteArea(noteFolderOf[id]));
        expect(publishedPaths()).toContain(path.slice(0, -1));
      }
    }
    // Former locations and misfiled notes are not pages.
    for (const wrong of [
      '/en/note/network/',
      '/en/note/network/p2p-downloader/',
      '/en/note/health/',
      '/en/note/health/lumbar-spine-care/',
      '/en/note/other/photography/',
      '/en/note/other/photography/landscape-photography/',
      '/en/note/software/p2p/',
      '/en/note/software/network/p2p-downloader/',
      '/en/note/medical/drugs/brain-cns-tumors/',
      '/en/note/japan/japanese/lumbar-spine-care/',
      '/en/note/medical/daily-care/lumbar-spine-care/extra/',
      // AI left note/ for the top level; neither area serves the other's folders.
      '/en/note/ai/',
      '/en/note/ai/video/comparisons/h3-dit-components/',
      '/en/ai/software/',
      '/en/ai/h3-dit-components/',
    ])
      expect(parseRoute(wrong), wrong).toBeNull();
    expect(resolveNotePath([])).toBeNull();
  });

  it('names folders in breadcrumbs and file paths by their URL segments', () => {
    expect(
      crumbs({ kind: 'network-note', locale: 'en', noteId: 'p2p-downloader' }),
    ).toEqual([
      { label: 'dennysora', href: '/en/' },
      { label: 'note', href: '/en/note/' },
      { label: 'software', href: '/en/note/software/' },
      { label: 'network', href: '/en/note/software/network/' },
      { label: 'p2p', href: '/en/note/software/network/p2p/' },
      {
        label: 'p2p-downloader.md',
        href: '/en/note/software/network/p2p/p2p-downloader/',
      },
    ]);
    expect(
      filePath({
        kind: 'collection-note',
        locale: 'zh-hant',
        noteId: 'lumbar-spine-care',
      }),
    ).toBe('note/medical/daily-care/lumbar-spine-care.md');
    expect(
      filePath({ kind: 'note-folder', locale: 'ja', folder: 'other' }),
    ).toBe('note/other/');
    // The AI area starts at the top of the workspace, without a note crumb.
    expect(
      crumbs({
        kind: 'collection-note',
        locale: 'en',
        noteId: 'h3-dit-components',
      }).map((crumb) => crumb.label),
    ).toEqual([
      'dennysora',
      'ai',
      'video',
      'comparisons',
      'h3-dit-components.md',
    ]);
    expect(
      filePath({ kind: 'note-folder', locale: 'zh-hant', folder: 'ai' }),
    ).toBe('ai/');
  });

  it('shows folders as cards and filed notes with their summaries', () => {
    for (const locale of locales) {
      const tree = noteTree(locale);
      const root = renderToStaticMarkup(
        createElement(Notes, { locale, folder: null, tree }),
      );
      for (const top of tree.filter((top) => noteArea(top.id) === 'notes')) {
        expect(root).toContain(`href="${top.href}"`);
        expect(root).toContain(noteFolders[top.id].art);
      }
      // The AI area has its own page, not a card in note/.
      expect(root).not.toContain(`href="${folderPath('ai', locale)}"`);
      const medical = renderToStaticMarkup(
        createElement(Notes, { locale, folder: 'medical', tree }),
      );
      for (const inner of ['drugs', 'pathology', 'daily-care'] as const)
        expect(medical).toContain(`href="${folderPath(inner, locale)}"`);
      expect(medical).toContain(notePath('lumbar-spine-care', locale));
      const p2p = renderToStaticMarkup(
        createElement(Notes, { locale, folder: 'p2p', tree }),
      );
      for (const id of ['p2p-downloader', 'p2p-privacy'] as const) {
        expect(p2p).toContain(`href="${notePath(id, locale)}"`);
        expect(noteFolderOf[id]).toBe('p2p');
      }
      // Every link the tree carries stays in the page's language.
      const links = JSON.stringify(tree).match(/"\/[^"]*\/note\/[^"]*"/g) ?? [];
      expect(links.length).toBeGreaterThan(noteIds.length);
      expect(links.every((href) => href.startsWith(`"/${locale}/note/`))).toBe(
        true,
      );
    }
  });

  it('translates every folder name and introduction', () => {
    // Traditional forms never written in Japanese.
    const traditional =
      /[們這麼與為體學讀寫點氣國實變樣應當從號沒裡讓會對說醫藥]/;
    for (const id of noteFolderIds) {
      const { title, intro } = noteFolderCopy[id];
      for (const text of [title.en, intro.en])
        expect(text, `${id} en`).not.toMatch(/[぀-ヿ㐀-鿿]/);
      for (const text of [title.ja, intro.ja])
        expect(text.match(traditional)?.[0], `${id} ja`).toBeUndefined();
      expect(intro.en, id).not.toBe(intro['zh-hant']);
      expect(intro.ja, id).not.toBe(intro['zh-hant']);
    }
  });
});
