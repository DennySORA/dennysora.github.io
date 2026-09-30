import { describe, expect, it } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../src/app/page.tsx';
import {
  loadMedicalNote,
  publishedPaths,
} from '../../src/lib/content.server.ts';
import { parseRoute, routePath } from '../../src/lib/route-manifest.ts';
import { filePath } from '../../src/lib/workspace.ts';

const path = '/zh-hant/note/medical/analgesics/';
describe('medical notes', () => {
  it('publishes the supplied Chinese edition outside the empty blog', () => {
    expect(parseRoute(path)).toEqual({
      kind: 'medical-note',
      locale: 'zh-hant',
    });
    expect(parseRoute('/en/note/medical/analgesics/')).toBeNull();
    expect(routePath({ kind: 'notes', locale: 'en' })).toBe('/en/note/');
    expect(filePath({ kind: 'medical-note', locale: 'zh-hant' })).toBe(
      'note/medical/analgesics.md',
    );
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
