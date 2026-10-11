import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import {
  hyperfocal,
  ndExposure,
} from '../../src/features/notes/collection-note-tools.ts';
import { collectionToolCopy } from '../../src/features/notes/note-tool-copy.ts';
import { locales } from '../../src/i18n/index.ts';
import {
  checkCollectionNoteMarkup,
  loadCollectionNote,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { readImageSize } from '../../src/lib/image-size.server.ts';
import {
  collectionNoteIds,
  collectionNotePath,
  collectionNotes,
} from '../../src/lib/note-collections.ts';
import {
  collectionEntries,
  collectionNoteMeta,
  collectionNoteSource,
  collectionNoteSummaries,
} from '../../src/lib/note-collections.server.ts';
import {
  navSection,
  parseRoute,
  routePath,
} from '../../src/lib/route-manifest.ts';
import { crumbs, fileKind, filePath } from '../../src/lib/workspace.ts';

const load = (path: string) =>
  loader({
    params: { '*': path.slice(1) },
  } as unknown as LoaderFunctionArgs);
// Traditional Chinese forms and function words that never occur in Japanese text.
const chinese =
  /[們這麼嗎呢說會對與為體學讀寫點氣國實變樣應當從辭號擇沒裡讓很您內聽哪怎關將盡歲來經驗處譯覺聲邊圖畫帶狀斷續數單另屬雖卻吧什歡錢賣腦發是]/;
// Text outside any lang="ja" element that still holds kana (WCAG 3.1.2).
const unmarkedKana = (html: string) => {
  const open: { name: string; japanese: boolean }[] = [];
  const found: string[] = [];
  for (const [token] of html.matchAll(/<[^>]*>|[^<]+/g)) {
    const closing = /^<\/([a-z][\w-]*)/i.exec(token)?.[1];
    const name = /^<([a-z][\w-]*)/i.exec(token)?.[1];
    if (closing) {
      const index = open.map((item) => item.name).lastIndexOf(closing);
      if (index >= 0) open.length = index;
    } else if (name) {
      const lang = /\slang="([^"]*)"/.exec(token)?.[1];
      if (!/^(?:br|img|input|wbr|hr)$/i.test(name) && !token.endsWith('/>'))
        open.push({
          name,
          japanese: lang ? lang === 'ja' : (open.at(-1)?.japanese ?? false),
        });
    } else if (!open.at(-1)?.japanese && /[ぁ-ゖァ-ヺ]/.test(token))
      found.push(token.trim());
  }
  return found;
};
const withoutJapanese = (html: string) =>
  html
    // Prettier may break a closing tag as `</span\n>`.
    .replace(/<([a-z][\w-]*)\b[^>]*\slang="ja"[^>]*>[\s\S]*?<\/\1\s*>/g, ' ')
    .replace(/<[^>]+>/g, ' ');

describe('Japan, Health and Other note collections', () => {
  it('answers each note only at its own collection path, in all three languages', () => {
    for (const id of collectionNoteIds) {
      const path = collectionNotePath(id);
      const route = { kind: 'collection-note', locale: 'zh-hant', noteId: id };
      expect(parseRoute(path)).toEqual(route);
      expect(routePath(route as never)).toBe(path);
      expect(navSection(route as never)).toBe('notes');
      expect(filePath(route as never)).toBe(
        `${path.replace('/zh-hant/', '').slice(0, -1)}.md`,
      );
      for (const locale of locales) {
        expect(publishedPaths()).toContain(
          path.replace('/zh-hant/', `/${locale}/`).slice(0, -1),
        );
        const data = load(path.replace('/zh-hant/', `/${locale}/`));
        expect(data.view.kind).toBe('collection-note');
        expect(data.title).toBe(
          `${collectionNoteMeta[id].title[locale]} — DennySORA`,
        );
        expect(data.languageLinks.every((link) => link.href !== null)).toBe(
          true,
        );
      }
    }
    expect(parseRoute('/en/note/japan/')).toEqual({
      kind: 'note-collection',
      locale: 'en',
      collection: 'japan',
    });
    expect(parseRoute('/ja/note/japan/japanese/')).toEqual({
      kind: 'note-category',
      locale: 'ja',
      collection: 'japan',
      category: 'japanese',
    });
    for (const wrong of [
      '/en/note/health/japanese/',
      '/en/note/japan/lumbar-spine-care/',
      '/en/note/japan/japanese/lumbar-spine-care/',
      '/en/note/other/landscape-photography/',
      '/en/note/other/photography/japanese-review/',
      '/en/note/japan/photography/',
      '/en/note/health/lumbar-spine-care/extra/',
    ])
      expect(parseRoute(wrong), wrong).toBeNull();
    expect(
      crumbs({
        kind: 'collection-note',
        locale: 'en',
        noteId: 'japanese-structure',
      }).map((crumb) => crumb.label),
    ).toEqual([
      'dennysora',
      'note',
      'japan',
      'japanese',
      'japanese-structure.md',
    ]);
    expect(
      crumbs({
        kind: 'collection-note',
        locale: 'en',
        noteId: 'lumbar-spine-care',
      }).map((crumb) => crumb.label),
    ).toEqual(['dennysora', 'note', 'health', 'lumbar-spine-care.md']);
    expect(
      fileKind({
        kind: 'note-category',
        locale: 'en',
        collection: 'japan',
        category: 'japanese',
      }),
    ).toBe('folder');
    expect(
      fileKind({ kind: 'note-collection', locale: 'en', collection: 'health' }),
    ).toBe('folder');
  });

  it('lists the collections in the reader’s language from loader data', () => {
    for (const locale of locales) {
      const entries = collectionEntries(locale);
      expect(entries.map((entry) => entry.id)).toEqual([
        'japan',
        'health',
        'other',
      ]);
      expect(entries[0]?.categories[0]?.notes).toHaveLength(7);
      expect(entries[1]?.categories).toEqual([]);
      expect(entries[1]?.notes.map((note) => note.id)).toEqual([
        'lumbar-spine-care',
      ]);
      expect(entries[2]?.categories[0]?.notes.map((note) => note.id)).toEqual([
        'landscape-photography',
      ]);
      const links =
        JSON.stringify(entries).match(/"\/[^"]*\/note\/[^"]*"/g) ?? [];
      expect(links.every((href) => href.startsWith(`"/${locale}/note/`))).toBe(
        true,
      );
      const all = renderToStaticMarkup(
        createElement(Notes, {
          locale,
          view: { collection: 'all' },
          collections: entries,
        }),
      );
      for (const art of ['japan', 'health', 'other'])
        expect(all).toContain(
          `/assets/illustrations/collection-${art}-v1.webp`,
        );
      const health = renderToStaticMarkup(
        createElement(Notes, {
          locale,
          view: { collection: 'health' },
          collections: entries,
          summaries: collectionNoteSummaries('health', locale),
        }),
      );
      expect(health).toContain(
        collectionNoteMeta['lumbar-spine-care'].description[locale],
      );
      const japanese = renderToStaticMarkup(
        createElement(Notes, {
          locale,
          view: { collection: 'japan', category: 'japanese' },
          collections: entries,
        }),
      );
      expect(japanese.match(/japanese-[a-z]+\.md/g)).toHaveLength(7);
    }
    expect(load('/en/note/health/').view).toMatchObject({
      kind: 'note-collection',
      collection: 'health',
    });
  });

  it('keeps every fragment static, linked and limited to its own sized photos', () => {
    const anchors = new Map<string, string[]>();
    for (const id of collectionNoteIds) {
      const html = readFileSync(`content/${collectionNoteSource(id)}`, 'utf8');
      anchors.set(
        id,
        [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!),
      );
    }
    for (const id of collectionNoteIds) {
      const html = loadCollectionNote(id);
      const ids = anchors.get(id)!;
      expect(new Set(ids).size, id).toBe(ids.length);
      expect(html.match(/<h1\b/g), id).toHaveLength(1);
      expect(html).toContain('id="note-title"');
      expect(html).not.toMatch(/#[\da-f]{6}\b|\sstyle\s*=/i);
      for (const [, target] of html.matchAll(/href="#([^"]+)"/g))
        expect(ids, `${id} → #${target}`).toContain(target);
      // Series links stay relative so every edition keeps its own language.
      for (const [, note, target] of html.matchAll(
        /href="\.\.\/([a-z-]+)\/(?:#([^"]+))?"/g,
      )) {
        expect(collectionNoteIds, note).toContain(note);
        if (target)
          expect(anchors.get(note!)!, `${id} → ${note}#${target}`).toContain(
            target,
          );
      }
      const images = checkCollectionNoteMarkup(id, html);
      const directory = `assets/notes/${id}`;
      if (!images.length) {
        expect(existsSync(directory), id).toBe(false);
        continue;
      }
      for (const image of images)
        expect(readImageSize(image.src.slice(1)), image.src).toEqual({
          width: image.width,
          height: image.height,
        });
      // No photo ships without a page that shows it.
      const used = new Set(images.map((image) => image.src.split('/').at(-1)));
      expect(readdirSync(directory).filter((file) => !used.has(file))).toEqual(
        [],
      );
    }
    const reject = (html: string) => () =>
      checkCollectionNoteMarkup('landscape-photography', html);
    expect(
      reject(
        '<img src="https://example.com/a.webp" width="1" height="1" alt="x">',
      ),
    ).toThrow();
    expect(
      reject(
        '<img src="/assets/notes/other/a.webp" width="1" height="1" alt="x">',
      ),
    ).toThrow();
    expect(
      reject(
        '<img src="/assets/notes/landscape-photography/a.webp" width="1" height="1">',
      ),
    ).toThrow();
    expect(reject('<p style="color: red">x</p>')).toThrow();
    expect(
      reject(
        '<video src="/assets/notes/landscape-photography/a.webm"></video>',
      ),
    ).toThrow();
    expect(reject('<a href="javascript:void 0">x</a>')).toThrow();
  });

  it('publishes complete editions: Japanese examples verbatim and no Chinese left over', () => {
    for (const id of collectionNoteIds) {
      const source = loadCollectionNote(id);
      const japanese = [...source.matchAll(/<p lang="ja">([^<]+)<\/p>/g)].map(
        (match) => match[1]!,
      );
      for (const locale of ['en', 'ja'] as const) {
        const html = loadCollectionNote(id, locale);
        for (const sentence of japanese)
          expect(html, `${id}/${locale}`).toContain(sentence);
        const text =
          locale === 'en'
            ? withoutJapanese(html)
            : html.replace(/<[^>]+>/g, ' ');
        expect(text.match(chinese)?.[0], `${id}/${locale}`).toBeUndefined();
      }
    }
    // Japanese inside Chinese or English text is marked for voices and fonts.
    for (const id of collectionNoteIds)
      for (const locale of ['zh-hant', 'en'] as const)
        expect(
          unmarkedKana(loadCollectionNote(id, locale)),
          `${id}/${locale}`,
        ).toEqual([]);
    const photo = (locale: 'zh-hant' | 'en' | 'ja') =>
      loadCollectionNote('landscape-photography', locale);
    for (const locale of locales) {
      const t = collectionToolCopy[locale];
      expect(photo(locale)).toContain(t.near('1.21'));
      expect(photo(locale)).toContain(t.archiveCount(31, 31));
    }
  });

  it('labels every generated composition image as generated, in every edition', () => {
    for (const locale of locales) {
      const html = loadCollectionNote('landscape-photography', locale);
      const figures = [
        ...html.matchAll(
          /<figure\s+class="sn-photo sn-atlas"[\s\S]*?<\/figure>/g,
        ),
      ].map(([figure]) => figure);
      expect(figures, locale).toHaveLength(21);
      for (const figure of figures) {
        expect(figure).toMatch(
          /src="\/assets\/notes\/landscape-photography\/gpt-[a-z-]+\.webp"/,
        );
        expect(figure).toMatch(/class="float-meta">GPT/);
        expect(figure.match(/\salt="([^"]*)"/)?.[1], locale).toContain('GPT');
      }
      // The author's photos never carry the generated label.
      for (const [image] of html.matchAll(/<img\b[^>]*\/pxl-[^>]*>/g))
        expect(image).not.toContain('GPT');
    }
  });

  it('recomputes the hyperfocal and ND results the static note shows', () => {
    const { h, near } = hyperfocal(24, 8, 0.03);
    expect(h).toBeCloseTo(2424, 6);
    expect(near).toBeCloseTo(1212, 6);
    expect((h / 1000).toFixed(2)).toBe('2.42');
    expect((near / 1000).toFixed(2)).toBe('1.21');
    const nd = ndExposure(0.0166666667, 10);
    expect(nd.factor).toBe(1024);
    expect(nd.seconds.toFixed(2)).toBe('17.07');
    const html = loadCollectionNote('landscape-photography');
    for (const value of ['2.42 m', '約 1.21 m', '17.07 s', '×1,024'])
      expect(html).toContain(value);
    expect(collectionNotes['landscape-photography'].category).toBe(
      'photography',
    );
  });
});
