import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import { NetworkNotes } from '../../src/features/notes/NetworkNotes.tsx';
import { locales } from '../../src/i18n/index.ts';
import { publishedRoutes } from '../../src/lib/content.server.ts';
import { routePath } from '../../src/lib/route-manifest.ts';
import {
  noteTranslationSources,
  translateNote,
} from '../../src/lib/note-translations.ts';

describe('note translation contract', () => {
  it('requires complete, current translations and escapes text without changing markup or code indentation', () => {
    const html =
      '<h1 id="stable" title="標題" data-title="保留"> 標題 </h1><pre><code>  # 說明\nkey = 42</code></pre><a href="#stable">link</a>';
    const entries = [
      { source: '標題', en: '<unsafe & "quoted">', ja: 'タイトル' },
      { source: '# 說明', en: '# Explanation', ja: '# 説明' },
    ];
    expect(noteTranslationSources(html)).toEqual(['標題', '# 說明']);
    expect(translateNote(html, entries, 'en')).toContain(
      'title="&lt;unsafe &amp; &quot;quoted&quot;&gt;" data-title="保留"',
    );
    expect(translateNote(html, entries, 'en')).toContain(
      '<pre><code>  # Explanation\nkey = 42</code></pre>',
    );
    expect(translateNote(html, entries, 'ja')).toContain('id="stable"');
    expect(() => translateNote(html, entries.slice(0, 1), 'en')).toThrow(
      'Missing en',
    );
    expect(() => translateNote(html, [...entries, entries[0]!], 'ja')).toThrow(
      'Duplicate',
    );
    expect(() =>
      translateNote(
        html,
        [...entries, { source: '過期', en: 'Stale', ja: '古い' }],
        'en',
      ),
    ).toThrow('Stale');
    expect(() =>
      translateNote(html, [{ ...entries[0]!, ja: '' }, entries[1]!], 'en'),
    ).toThrow('Incomplete');
  });

  it('translates explicitly selected English prose while preserving code and punctuation', () => {
    const html =
      '<h2>Evidence hierarchy</h2><code>stable_id</code><strong>重點</strong>。';
    const entries = [
      {
        source: 'Evidence hierarchy',
        en: 'Evidence hierarchy',
        ja: 'エビデンスの階層',
      },
      { source: '重點', en: 'Key point', ja: '要点' },
    ];
    expect(translateNote(html, entries, 'ja')).toBe(
      '<h2>エビデンスの階層</h2><code>stable_id</code><strong>要点</strong>。',
    );
    expect(translateNote(html, entries, 'en')).toBe(
      '<h2>Evidence hierarchy</h2><code>stable_id</code><strong>Key point</strong>.',
    );
  });

  it('loads every full edition with localized metadata and tags while preserving source anchors, links and data', () => {
    const sources: Record<string, string> = {
      analgesics: 'medical.html',
      'brain-cns-tumors': 'medical/pathology/brain-cns-tumors.html',
      'p2p-downloader': 'p2p-downloader.html',
      'p2p-privacy': 'p2p-privacy.html',
      '140mm-case-fans': 'hardware/computer/140mm-case-fans.html',
    };
    const structure = (html: string) =>
      [...html.matchAll(/\s(?:id|href|src|data-[\w-]+)="[^"]*"/g)]
        .map((match) => match[0])
        .filter(
          (value) =>
            !value.includes('/search/?tag=') &&
            !value.includes('data-content-tag'),
        );
    const notes = publishedRoutes().filter(
      (route) =>
        route.kind === 'medical-note' ||
        route.kind === 'network-note' ||
        route.kind === 'hardware-note',
    );
    expect(notes).toHaveLength(15);
    for (const route of notes) {
      if (!('noteId' in route)) throw new Error('Expected note');
      const path = routePath(route);
      const data = loader({
        params: { '*': path.slice(1) },
      } as unknown as LoaderFunctionArgs);
      if (!('html' in data.view)) throw new Error('Expected full note body');
      const source = readFileSync(
        `content/notes/${sources[route.noteId]}`,
        'utf8',
      );
      expect(structure(data.view.html), path).toEqual(structure(source));
      expect(
        data.languageLinks.every((link) => link.href !== null),
        path,
      ).toBe(true);
      expect(data.view.html).toContain(`href="/${route.locale}/search/?tag=`);
      if (route.locale !== 'zh-hant') {
        expect(data.view.html, path).not.toBe(source);
        expect(data.title).not.toBe(
          loader({
            params: { '*': path.replace(/^\/(en|ja)\//, '/zh-hant/').slice(1) },
          } as unknown as LoaderFunctionArgs).title,
        );
      }
      const metadata =
        meta({ loaderData: data } as Parameters<typeof meta>[0]) ?? [];
      expect(
        metadata.filter(
          (item) =>
            'rel' in item && item.rel === 'alternate' && 'hrefLang' in item,
        ),
      ).toHaveLength(3);
    }
  });

  it('keeps every note-directory destination in the reader’s language', () => {
    for (const locale of locales) {
      const html =
        renderToStaticMarkup(
          createElement(Notes, { locale, view: { collection: 'all' } }),
        ) + renderToStaticMarkup(createElement(NetworkNotes, { locale }));
      const noteLinks = [
        ...html.matchAll(/href="(\/(?:zh-hant|en|ja)\/note\/[^"]+)"/g),
      ].map((match) => match[1]!);
      expect(noteLinks.length).toBeGreaterThanOrEqual(5);
      expect(
        noteLinks.every((href) => href.startsWith(`/${locale}/note/`)),
      ).toBe(true);
    }
  });
});
