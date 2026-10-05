import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { TabLine } from '../../src/components/TabLine.tsx';
import { describe, expect, it } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import {
  loadMedicalNote,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { parseRoute, routePath } from '../../src/lib/route-manifest.ts';
import { filePath } from '../../src/lib/workspace.ts';

const path = '/zh-hant/note/medical/drugs/analgesics/';
describe('medical notes', () => {
  it('publishes the supplied Chinese edition outside the empty blog', () => {
    expect(parseRoute(path)).toEqual({
      kind: 'medical-note',
      locale: 'zh-hant',
      noteId: 'analgesics',
    });
    expect(parseRoute('/en/note/medical/drugs/analgesics/')).toBeNull();
    expect(routePath({ kind: 'notes', locale: 'en' })).toBe('/en/note/');
    expect(
      filePath({
        kind: 'medical-note',
        locale: 'zh-hant',
        noteId: 'analgesics',
      }),
    ).toBe('note/medical/drugs/analgesics.md');
    expect(publishedPaths()).toContain(path.slice(0, -1));
    const data = loader({
      params: { '*': path.slice(1) },
    } as unknown as LoaderFunctionArgs);
    expect(data.view.kind).toBe('medical-note');
    expect(data.languageLinks.filter((link) => link.href)).toEqual([
      { locale: 'zh-hant', href: path },
    ]);
  });
  it('retains reference content with no executable markup or fake risk scales', () => {
    const html = loadMedicalNote();
    expect(html).toContain('N-acetylcysteine');
    expect(html).toContain('4000');
    expect(html).toContain('pmda.go.jp');
    expect(html).not.toMatch(/<script|on[a-z]+=|data-l=|javascript:/i);
    expect((html.match(/<h2\b/g) ?? []).length).toBe(14);
    expect((html.match(/<details\b/g) ?? []).length).toBe(10);
  });
});

describe('medical categories and brain tumor guide', () => {
  it('publishes each note in exactly its category and only its source language', () => {
    const brainPath = '/zh-hant/note/medical/pathology/brain-cns-tumors/';
    const route = {
      kind: 'medical-note',
      locale: 'zh-hant',
      noteId: 'brain-cns-tumors',
    } as const;
    expect(parseRoute(brainPath)).toEqual(route);
    expect(routePath(route)).toBe(brainPath);
    expect(filePath(route)).toBe('note/medical/pathology/brain-cns-tumors.md');
    expect(publishedPaths()).toContain(brainPath.slice(0, -1));
    for (const locale of ['en', 'ja'])
      expect(parseRoute(brainPath.replace('zh-hant', locale))).toBeNull();
    expect(parseRoute(brainPath.replace('pathology', 'drugs'))).toBeNull();
    expect(parseRoute(brainPath.replace('pathology', 'knowledge'))).toBeNull();
    expect(parseRoute('/zh-hant/note/medical/analgesics/')).toBeNull();
    expect(publishedPaths()).not.toContain('/zh-hant/note/medical/analgesics');
    for (const locale of ['zh-hant', 'en', 'ja']) {
      for (const category of ['drugs', 'pathology']) {
        expect(publishedPaths()).toContain(
          `/${locale}/note/medical/${category}`,
        );
      }
    }
    const data = loader({
      params: { '*': brainPath.slice(1) },
    } as unknown as LoaderFunctionArgs);
    expect(data.view.kind).toBe('medical-note');
    expect(data.languageLinks.filter((link) => link.href)).toEqual([
      { locale: 'zh-hant', href: brainPath },
    ]);
  });

  it('retains every supplied chapter and statistics with explicit interpretation limits', () => {
    const html = loadMedicalNote('brain-cns-tumors');
    for (const id of [
      'overview',
      'why',
      'glioma',
      'gbm',
      'other',
      'metastasis',
      'grade',
      'molecular',
      'diagnosis',
      'symptoms',
      'takeaway',
      'sources',
    ])
      expect(html).toContain(`id="${id}"`);
    for (const text of [
      '6.86',
      '22.2%',
      '52.2%',
      '2018–2022',
      '不含腦轉移',
      '不是完全相同的分類口徑',
      '不能單獨解釋',
      'IDH-wildtype',
      '不等於 GBM',
      '具神經元分化',
      'Summary Stage',
      'NHS',
    ])
      expect(html).toContain(text);
    expect((html.match(/<h2\b/g) ?? []).length).toBe(12);
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(
      /<(?:script|style|iframe|form)\b|\s(?:style|on\w+)\s*=|javascript:|#[\da-f]{6}\b|class="bar"/i,
    );
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('scope="col"');
    expect(html).toContain('原稿製作：2026-10-04');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const match of html.matchAll(/href="#([^"]+)"/g))
      expect(ids).toContain(match[1]);
  });
});

it('keeps medical category buffers immediately after the note area', () => {
  for (const category of ['drugs', 'pathology'] as const) {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: [`/zh-hant/note/medical/${category}/`] },
        createElement(TabLine, {
          locale: 'zh-hant',
          route: { kind: 'medical-category', locale: 'zh-hant', category },
          files: { posts: [] },
          languageLinks: [],
          explorer: {
            id: 'test-explorer',
            expanded: true,
            label: 'Explorer',
            onToggle: () => {},
          },
        }),
      ),
    );
    const buffers =
      html.match(/<nav[^>]*class="buffers"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    expect(buffers.indexOf('tab-preview')).toBeGreaterThan(
      buffers.indexOf('href="/zh-hant/note/"'),
    );
    expect(buffers.indexOf('tab-preview')).toBeLessThan(
      buffers.indexOf('href="https://paper.dennysora.me/"'),
    );
    expect(buffers).toContain(category);
  }
});
