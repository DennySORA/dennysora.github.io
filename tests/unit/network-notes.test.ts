import { describe, expect, it } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import {
  loadNetworkNote,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { networkNoteIds } from '../../src/lib/network-notes.ts';
import {
  parseRoute,
  routePath,
  navSection,
} from '../../src/lib/route-manifest.ts';
import { crumbs, filePath } from '../../src/lib/workspace.ts';
import { hasRawAsset } from '../../src/lib/asset-policy.ts';

describe('native network notes', () => {
  for (const noteId of networkNoteIds)
    it(`publishes only the supplied edition: ${noteId}`, () => {
      const route = {
        kind: 'network-note' as const,
        locale: 'zh-hant' as const,
        noteId,
      };
      const path = routePath(route);
      expect(parseRoute(path)).toEqual(route);
      expect(parseRoute(path.replace('zh-hant', 'en'))).toBeNull();
      expect(parseRoute('/zh-hant/note/network/unknown/')).toBeNull();
      expect(publishedPaths()).toContain(path.slice(0, -1));
      expect(filePath(route)).toBe(`note/network/${noteId}.md`);
      expect(navSection(route)).toBe('notes');
      expect(crumbs(route)[2]?.href).toBe('/zh-hant/note/network/');
      const data = loader({
        params: { '*': path.slice(1) },
      } as unknown as LoaderFunctionArgs);
      expect(data.view.kind).toBe('network-note');
      expect(data.languageLinks.filter((link) => link.href)).toEqual([
        { locale: 'zh-hant', href: path },
      ]);
      const html = loadNetworkNote(noteId);
      expect(html).not.toMatch(
        /<(script|iframe|style|link|object|embed|form)\b|\son[a-z]+\s*=|javascript:|\ssrc\s*=/i,
      );
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
      expect(new Set(ids).size).toBe(ids.length);
      for (const match of html.matchAll(/href="#([^"]+)"/g))
        expect(ids).toContain(match[1]);
    });
  it('retains architecture contracts, diagrams, limitations and full static catalog', () => {
    const html = loadNetworkNote('p2p-downloader');
    expect((html.match(/class="p2p-attachment"/g) ?? []).length).toBe(25);
    expect((html.match(/<svg\b/g) ?? []).length).toBe(6);
    for (const term of [
      'unsupported_scope',
      'store-v23.sql',
      'qualified_idle_ms',
      'SQLite',
      '安全性未知',
      'contracts/control.openapi.json',
    ])
      expect(html).toContain(term);
    expect((html.match(/data-catalog-kind=/g) ?? []).length).toBe(134);
  });
  it('retains privacy chapters, original archive, citations and base-rate caveats', () => {
    const html = loadNetworkNote('p2p-privacy');
    expect((html.match(/class="p2p-original-block"/g) ?? []).length).toBe(64);
    expect((html.match(/id="ref-\d+"/g) ?? []).length).toBe(24);
    for (const term of [
      'Ephemeral',
      'Loopix',
      'DAITA',
      'open-world',
      '不是某筆結果的個人身分機率',
      'original-63',
    ])
      expect(html).toContain(term);
  });
  it('allows cited raw source URLs but still rejects automatically loaded raw assets', () => {
    const url = 'https://raw.githubusercontent.com/example/repo/main/source';
    expect(
      hasRawAsset(`<a href="${url}">來源</a><pre>${url}</pre>`, '.html'),
    ).toBe(false);
    for (const markup of [
      `<img src="${url}">`,
      `<link href="${url}">`,
      `<script src="${url}"></script>`,
      `<style>x{background:url(${url})}</style>`,
    ])
      expect(hasRawAsset(markup, '.html')).toBe(true);
    expect(hasRawAsset(`fetch('${url}')`, '.js')).toBe(true);
  });
});
