import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Explorer } from '../../src/components/Explorer.tsx';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { collectionEntries } from '../../src/lib/note-collections.server.ts';

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];
}

describe('folder disclosures', () => {
  for (const locale of locales) {
    it(`${locale} gives every folder a separate named disclosure and real navigation link`, () => {
      const html = renderToStaticMarkup(
        createElement(Explorer, {
          locale,
          route: { kind: 'home', locale },
          files: { posts: [], collections: collectionEntries(locale) },
        }),
      );
      const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(
        (match) => match[0],
      );
      // blog, note, network, medical (+2 categories), hardware (+1 category),
      // japan (+1 category), health, other (+1 category), projects (+1 category)
      expect(buttons).toHaveLength(15);
      for (const button of buttons) {
        expect(attribute(button, 'type')).toBe('button');
        expect(attribute(button, 'aria-expanded')).toBe('true');
        expect(attribute(button, 'aria-label')).toContain(
          `${dictionaries[locale].folderCollapse}: `,
        );
        expect(attribute(button, 'class')).toContain('requires-js');
        expect(html).toContain(
          `<ul id="${attribute(button, 'aria-controls')}" class="tree-children">`,
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
      ).toHaveLength(15);
      expect(links.every((link) => !link.includes('<button'))).toBe(true);
      expect(html).not.toContain(' hidden');
      expect(html).toContain('brain-cns-tumors.md');
      expect(html).toContain('analgesics.md');
      expect(html).toContain('140mm-case-fans.md');
      expect(html).toContain('dgxtop.md');
      expect(html).toContain(dictionaries[locale].emptyFolder);
    });
  }

  it('keeps desktop and drawer disclosure IDs unique with the current child exposed', () => {
    const explorer = createElement(Explorer, {
      locale: 'zh-hant',
      route: {
        kind: 'medical-note',
        locale: 'zh-hant',
        noteId: 'brain-cns-tumors',
      },
      files: { posts: [], collections: collectionEntries('zh-hant') },
    });
    const html = renderToStaticMarkup(
      createElement(Fragment, null, explorer, explorer),
    );
    const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(ids).toHaveLength(30);
    expect(new Set(ids).size).toBe(ids.length);
    const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
    expect(current).toHaveLength(2);
    for (const link of current)
      expect(link[0]).toContain('/note/medical/pathology/brain-cns-tumors/');
    expect(html).not.toContain(' hidden');
  });
});
