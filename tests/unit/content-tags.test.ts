import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TagLinks } from '../../src/components/TagLink.tsx';
import { locales } from '../../src/i18n/index.ts';
import {
  loadMedicalNote,
  loadNetworkNote,
  loadPosts,
  loadTaxonomy,
} from '../../src/lib/content.server.ts';
import { medicalNoteIds, medicalNotes } from '../../src/lib/medical-notes.ts';
import { networkNoteIds, networkNotes } from '../../src/lib/network-notes.ts';
import { addNoteTags } from '../../src/lib/note-tags.server.ts';
import { postSchema } from '../../src/lib/schema.ts';

const taxonomy = loadTaxonomy().tags;

describe('article and note header tags', () => {
  it('puts every medical and network note tag directly below its existing title', () => {
    const notes = [
      ...medicalNoteIds.map((id) => ({
        html: loadMedicalNote(id),
        tags: medicalNotes[id].tagIds,
      })),
      ...networkNoteIds.map((id) => ({
        html: loadNetworkNote(id),
        tags: networkNotes[id].tagIds,
      })),
    ];
    for (const { html, tags } of notes) {
      expect(html).toMatch(
        /<\/h1>\s*<ul class="ln tag-links content-tags" aria-label="標籤">/,
      );
      expect(html.match(/class="ln tag-links content-tags"/g)).toHaveLength(1);
      expect(tags.length).toBeGreaterThan(0);
      for (const id of tags) {
        expect(html).toContain(
          `href="/zh-hant/search/?tag=${id}" data-content-tag="${id}"`,
        );
        expect(html).toContain(
          taxonomy.find((tag) => tag.id === id)?.label['zh-hant'],
        );
      }
    }
  });
  it('requires tags for posts and retains every existing grounded assignment', () => {
    for (const post of loadPosts()) {
      expect(post.tagIds.length).toBeGreaterThan(0);
      for (const id of post.tagIds)
        expect(taxonomy.some((tag) => tag.id === id)).toBe(true);
      expect(postSchema.shape.tagIds.safeParse([]).success).toBe(false);
    }
  });
  it('renders localized plain links and preserves Pagefind article metadata', () => {
    for (const locale of locales) {
      const html = renderToStaticMarkup(
        createElement(TagLinks, {
          tagIds: ['architecture'],
          labels: new Map([
            [
              'architecture',
              taxonomy.find((tag) => tag.id === 'architecture')!.label[locale],
            ],
          ]),
          locale,
          label: 'Tags',
          siteSearch: true,
          aliases: { architecture: ['system design'] },
        }),
      );
      expect(html).toContain(`href="/${locale}/search/?tag=architecture"`);
      expect(html).toContain('data-content-tag="architecture"');
      expect(html).toContain('data-pagefind-filter="tag:architecture"');
      expect(html).toContain('data-search-aliases="system design"');
    }
    const blog = renderToStaticMarkup(
      createElement(TagLinks, {
        tagIds: ['architecture'],
        labels: new Map(),
        locale: 'en',
        label: 'Tags',
      }),
    );
    expect(blog).toContain('/en/blog/tags/architecture/');
    expect(blog).not.toContain('data-content-tag');
  });
  it('escapes labels, rejects unknown or missing tags and refuses titleless notes', () => {
    const tag = {
      id: 'example',
      label: { 'zh-hant': '<unsafe & text>', en: 'Example', ja: '例' },
    };
    const html = addNoteTags(
      '<h1 id="title">Title</h1><p>Body</p>',
      ['example'],
      [tag],
    );
    expect(html).toContain('&lt;unsafe &amp; text&gt;');
    expect(html).not.toContain('<unsafe');
    expect(() => addNoteTags('<h1>Title</h1>', [], taxonomy)).toThrow(
      'at least one',
    );
    expect(() => addNoteTags('<h1>Title</h1>', ['unknown'], taxonomy)).toThrow(
      'Unknown note tag',
    );
    expect(() => addNoteTags('<p>Body</p>', ['medicine'], taxonomy)).toThrow(
      'Missing note title',
    );
  });
});
