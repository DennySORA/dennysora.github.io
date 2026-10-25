import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader, meta } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import { locales } from '../../src/i18n/index.ts';
import { publishedRoutes } from '../../src/lib/content.server.ts';
import { routePath } from '../../src/lib/route-manifest.ts';
import {
  markJapanese,
  noteTranslationSources,
  translateNote,
} from '../../src/lib/note-translations.ts';
import { collectionNoteSource } from '../../src/lib/note-collections.server.ts';
import { noteTree } from '../../src/lib/note-tree.server.ts';
import { collectionNoteIds } from '../../src/lib/note-collections.ts';

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
    // A full stop between two inline items still starts a new English sentence.
    expect(
      translateNote(
        '<p><strong>重點</strong>。<span lang="ja">Nらしい</span></p>',
        entries.slice(1),
        'en',
      ),
    ).toBe('<p><strong>Key point</strong>. <span lang="ja">Nらしい</span></p>');
  });

  it('keeps lang="ja" passages verbatim in every edition while translating the prose around them', () => {
    const html =
      '<p><span lang="ja" title="例文">先生が来ます。</span> 是事件主體。</p><table><tr><td lang="ja"><b>教室に</b>先生がいます。</td><td>教室裡有老師。</td></tr></table><p lang="ja">雨が<span lang="zh-Hant">（中文註）</span>降る。</p><br><img alt="說明" src="/a.webp"><p>結尾。</p>';
    expect(noteTranslationSources(html)).toEqual([
      '是事件主體。',
      '教室裡有老師。',
      '（中文註）',
      '說明',
      '結尾。',
    ]);
    const entries = [
      { source: '是事件主體。', en: 'is the subject.', ja: 'は主体。' },
      { source: '教室裡有老師。', en: 'A teacher is in.', ja: '教室に先生。' },
      { source: '（中文註）', en: '(note)', ja: '（注）' },
      { source: '說明', en: 'Caption', ja: '説明' },
      { source: '結尾。', en: 'End.', ja: '終わり。' },
    ];
    const en = translateNote(html, entries, 'en');
    expect(en).toContain(
      '<span lang="ja" title="例文">先生が来ます。</span> is the subject.',
    );
    expect(en).toContain('<td lang="ja"><b>教室に</b>先生がいます。</td>');
    expect(en).toContain('<span lang="zh-Hant">(note)</span>降る。');
    expect(en).toContain('alt="Caption"');
    expect(en).toContain('<p>End.</p>');
  });

  it('marks Japanese inside English and Chinese text, using the English to place shared kanji', () => {
    expect(
      markJapanese(
        '<p>Use 家族のために働きます。I work. AはBと同じです and PDFの; <span lang="ja">どの</span>, 方.</p><svg><text>テスト</text></svg><select><option>秒です</option></select>',
        'en',
      ),
    ).toBe(
      '<p>Use <span lang="ja">家族のために働きます。</span>I work. <span lang="ja">AはBと同じです</span> and PDF<span lang="ja">の</span>; <span lang="ja">どの</span>, <span lang="ja">方</span>.</p><svg><text>テスト</text></svg><select><option>秒です</option></select>',
    );
    const source = '誰來？が 屬於 来る；是い形容詞';
    expect(
      markJapanese(`<small>${source}</small>`, 'zh-hant', [
        {
          source,
          en: 'Who comes? が belongs to 来る; an i-adjective',
          ja: '-',
        },
      ]),
    ).toBe(
      '<small>誰來？<span lang="ja">が</span> 屬於 <span lang="ja">来る</span>；是<span lang="ja">い</span>形容詞</small>',
    );
    // Japanese with no Chinese around it needs no translation to be placed.
    expect(markJapanese('<a>34｜について／によって</a>', 'zh-hant')).toBe(
      '<a>34｜<span lang="ja">について／によって</span></a>',
    );
  });

  it('loads every full edition with localized metadata and tags while preserving source anchors, links and data', () => {
    const sources: Record<string, string> = {
      analgesics: 'medical.html',
      'brain-cns-tumors': 'medical/pathology/brain-cns-tumors.html',
      'p2p-downloader': 'p2p-downloader.html',
      'p2p-privacy': 'p2p-privacy.html',
      ...Object.fromEntries(
        collectionNoteIds.map((id) => [
          id,
          collectionNoteSource(id).replace(/^notes\//, ''),
        ]),
      ),
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
        route.kind === 'collection-note',
    );
    expect(notes).toHaveLength((4 + collectionNoteIds.length) * 3);
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
          createElement(Notes, {
            locale,
            folder: null,
            tree: noteTree(locale),
          }),
        ) +
        renderToStaticMarkup(
          createElement(Notes, {
            locale,
            folder: 'p2p',
            tree: noteTree(locale),
          }),
        );
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
