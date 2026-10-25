import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Notes } from '../../src/features/notes/Notes.tsx';
import { locales } from '../../src/i18n/index.ts';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { noteTree } from '../../src/lib/note-tree.server.ts';
import { noteIds } from '../../src/lib/note-tree.ts';
import { parseRoute } from '../../src/lib/route-manifest.ts';

const retired = [
  'japan',
  'japan/japanese',
  ...[
    'structure',
    'conjugation',
    'clauses',
    'reasons',
    'expressions',
    'vocabulary',
    'review',
  ].map((part) => `japan/japanese/japanese-${part}`),
  'hardware/computer/140mm-case-fans',
];

describe('owner-retired notes', () => {
  for (const locale of locales) {
    for (const suffix of retired) {
      const path = `/${locale}/note/${suffix}/`;
      it(`${path} is a genuine missing route, not a replacement redirect`, () => {
        expect(parseRoute(path)).toBeNull();
        expect(publishedPaths()).not.toContain(path.slice(0, -1));
        let response: unknown;
        try {
          loader({
            params: { '*': path.slice(1) },
          } as unknown as LoaderFunctionArgs);
        } catch (error) {
          response = error;
        }
        expect(response).toBeInstanceOf(Response);
        expect((response as Response).status).toBe(404);
        expect((response as Response).headers.get('Location')).toBeNull();
      });
    }
    it(`${locale} keeps the other notes, hardware folders and locale home`, () => {
      const tree = noteTree(locale);
      const html = renderToStaticMarkup(
        createElement(Notes, { locale, folder: null, tree }),
      );
      expect(html).not.toContain('/note/japan/');
      expect(html).not.toContain('140mm-case-fans');
      expect(html).toContain(`href="/${locale}/note/hardware/"`);
      expect(parseRoute(`/${locale}/note/hardware/computer/`)).toEqual({
        kind: 'note-folder',
        locale,
        folder: 'computer',
      });
      expect(parseRoute(`/${locale}/`)).toEqual({ kind: 'home', locale });
      expect(noteIds).toEqual([
        'p2p-downloader',
        'p2p-privacy',
        'analgesics',
        'brain-cns-tumors',
        'lumbar-spine-care',
        'landscape-photography',
      ]);
    });
  }
});
