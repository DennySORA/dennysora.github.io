import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import {
  operatingPoint,
  quantityCost,
} from '../../src/features/notes/hardware-note-tools.ts';
import {
  loadHardwareNote,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import {
  hardwareNoteIds,
  hardwareNotePath,
} from '../../src/lib/hardware-notes.ts';
import {
  navSection,
  parseRoute,
  routePath,
} from '../../src/lib/route-manifest.ts';
import { crumbs, filePath, fileKind } from '../../src/lib/workspace.ts';

const notePath = '/zh-hant/note/hardware/computer/140mm-case-fans/';

describe('hardware notes', () => {
  it('files the fan note under Hardware / Computers in its source language only', () => {
    const route = {
      kind: 'hardware-note',
      locale: 'zh-hant',
      noteId: '140mm-case-fans',
    } as const;
    expect(hardwareNotePath('140mm-case-fans')).toBe(notePath);
    expect(parseRoute(notePath)).toEqual(route);
    expect(routePath(route)).toBe(notePath);
    expect(filePath(route)).toBe('note/hardware/computer/140mm-case-fans.md');
    expect(navSection(route)).toBe('notes');
    expect(crumbs(route).map((crumb) => crumb.label)).toEqual([
      'dennysora',
      'note',
      'hardware',
      'computer',
      '140mm-case-fans.md',
    ]);
    for (const locale of ['en', 'ja'])
      expect(parseRoute(notePath.replace('zh-hant', locale))).toBeNull();
    expect(parseRoute('/zh-hant/note/hardware/phones/')).toBeNull();
    expect(
      parseRoute('/zh-hant/note/hardware/computer/unknown-note/'),
    ).toBeNull();
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      expect(publishedPaths()).toContain(`/${locale}/note/hardware`);
      expect(publishedPaths()).toContain(`/${locale}/note/hardware/computer`);
      expect(
        fileKind({ kind: 'hardware-category', locale, category: 'computer' }),
      ).toBe('folder');
    }
    expect(publishedPaths()).toContain(notePath.slice(0, -1));
    const data = loader({
      params: { '*': notePath.slice(1) },
    } as unknown as LoaderFunctionArgs);
    expect(data.view.kind).toBe('hardware-note');
    expect(data.languageLinks.filter((link) => link.href)).toEqual([
      { locale: 'zh-hant', href: notePath },
    ]);
  });

  it('keeps the note static, self-consistent and sourced', () => {
    for (const id of hardwareNoteIds) {
      const html = loadHardwareNote(id);
      expect(html).not.toMatch(
        /<(?:script|style|iframe|form|img|link)\b|\s(?:style|src|on\w+)\s*=|javascript:|#[\da-f]{6}\b/i,
      );
      expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
      expect((html.match(/<h2\b/g) ?? []).length).toBe(15);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(
        (match) => match[1],
      );
      expect(new Set(ids).size).toBe(ids.length);
      for (const match of html.matchAll(/href="#([^"]+)"/g))
        expect(ids).toContain(match[1]);
      for (let rank = 1; rank <= 10; rank++)
        expect(ids).toContain(`top-${rank}`);
      expect((html.match(/class="hw-pick"/g) ?? []).length).toBe(10);
      expect((html.match(/<tr\s+id="model-/g) ?? []).length).toBe(27);
      expect((html.match(/id="spec-/g) ?? []).length).toBe(27);
      expect((html.match(/<li\s+id="S\d+"/g) ?? []).length).toBeGreaterThan(90);
      for (const text of [
        '不是加權總分',
        '未購買商品、未自行量測',
        '61.61',
        '73.31',
        '70.70',
        '2026-10-23',
        'Rifle',
        '本站核對紀錄',
      ])
        expect(html).toContain(text);
    }
  });

  it('recomputes the documented operating point and price arithmetic', () => {
    const curve: [number, number][] = [
      [0, 2.3],
      [7.73, 1.78],
      [15.01, 1.49],
      [23.21, 1.17],
      [31.62, 1.1],
      [40, 0.81],
      [47.52, 0.49],
      [55.97, -0.01],
    ];
    const [q, p] = operatingPoint(curve, 0.8);
    expect(q).toBeCloseTo(40.12, 1);
    expect(p).toBeCloseTo(0.8, 2);
    const offer = {
      bic: 1590,
      tsukumo: 1449,
      shipping: 550,
      freeFrom: 3300,
      g2Single: 4720,
      g2Pair: 8481,
    };
    expect(quantityCost(2, offer)).toEqual({
      bic: 3180,
      tsukumo: 3448,
      g2: 8481,
    });
    expect(quantityCost(3, offer)).toEqual({
      bic: 4770,
      tsukumo: 4347,
      g2: 13201,
    });
  });

  it('lists the hardware collection beside the existing note folders', () => {
    const all = renderToStaticMarkup(
      createElement(Notes, { locale: 'en', view: { collection: 'all' } }),
    );
    expect(all).toContain('href="/en/note/hardware/"');
    expect(all).toContain('/assets/illustrations/collection-hardware-v1.webp');
    expect(all).toContain(`href="${notePath}"`);
    const category = renderToStaticMarkup(
      createElement(Notes, {
        locale: 'ja',
        view: { collection: 'hardware', category: 'computer' },
      }),
    );
    expect(category).toContain('コンピューター');
    expect(category).toContain('140mm-case-fans.md');
  });
});
