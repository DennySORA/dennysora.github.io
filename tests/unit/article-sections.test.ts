import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ArticleSections } from '../../src/components/ArticleSections.tsx';
import { locales } from '../../src/i18n/index.ts';
import { loadPosts, renderPost } from '../../src/lib/content.server.ts';
import { renderMarkdown } from '../../src/lib/markdown.server.ts';
import {
  loadPostSections,
  partitionPostSections,
} from '../../src/lib/post-sections.server.ts';
import {
  postSectionsSchema,
  type PostSectionGroup,
} from '../../src/lib/schema.ts';

const groups: PostSectionGroup[] = [
  {
    id: 'start',
    label: { 'zh-hant': '開始', en: 'Start', ja: 'はじめに' },
    icon: 'list',
    headings: ['one', 'two'],
  },
  {
    id: 'finish',
    label: { 'zh-hant': '後續', en: 'Next', ja: '次へ' },
    icon: 'info',
    headings: ['three'],
  },
];
const markdown = `Introduction.

## One {#one}

An opening paragraph with a footnote.[^1]

## Two {#two}

### Details {#details}

> A nested paragraph stays with this heading.

## Three {#three}

Final paragraph.

[^1]: A footnote at the end.
`;

describe('article sections contract', () => {
  it('preserves every rendered byte, heading, intro and footnote in adjacent groups', () => {
    const rendered = renderMarkdown(markdown, { locale: 'en' });
    const sections = partitionPostSections(markdown, rendered, groups, 'en');
    expect(sections.map((section) => section.html).join('')).toBe(
      rendered.html,
    );
    expect(sections[0]?.html).toContain('Introduction.');
    expect(sections[0]?.html).toContain('id="details"');
    expect(sections[1]?.html).toContain('A footnote at the end.');
    expect(sections.map((section) => section.id)).toEqual([
      'article-tab-start',
      'article-tab-finish',
    ]);
  });

  it.each([
    ['unregistered heading', markdown.replace('{#two}', '{#other}')],
    ['implicit heading', markdown.replace(' {#two}', '')],
    ['nested heading', markdown.replace('## Two', '> ## Two')],
    ['H1 promoted by the renderer', markdown.replace('## Two', '# Two')],
    ['missing heading', markdown.replace('## Two {#two}', 'Second paragraph')],
  ])('rejects %s before partitioning', (_name, source) => {
    const rendered = renderMarkdown(source, { locale: 'en' });
    expect(() => partitionPostSections(source, rendered, groups, 'en')).toThrow(
      'cover every top-level explicit H2 once, in order',
    );
  });

  it('rejects nonadjacent or reordered groups', () => {
    const rendered = renderMarkdown(markdown, { locale: 'en' });
    expect(() =>
      partitionPostSections(markdown, rendered, [...groups].reverse(), 'en'),
    ).toThrow('in order');
  });

  it('rejects a heading that collides with a generated panel or tab ID', () => {
    for (const id of ['article-tab-start', 'article-tab-start-tab']) {
      const source = `${markdown}\n### Collision {#${id}}\n`;
      expect(() =>
        partitionPostSections(
          source,
          renderMarkdown(source, { locale: 'en' }),
          groups,
          'en',
        ),
      ).toThrow('Article section ID collision');
    }
  });

  it('rejects duplicate groups, duplicate headings, absent translations and arbitrary fields', () => {
    const source = { fixture: groups };
    expect(postSectionsSchema.safeParse(source).success).toBe(true);
    for (const replacement of [
      { ...groups[1], id: 'start' },
      { ...groups[1], headings: ['one'] },
      { ...groups[1], label: { en: 'Missing translations' } },
      { ...groups[1], hidden: true },
      { ...groups[1], icon: 'unregistered-icon' },
    ])
      expect(
        postSectionsSchema.safeParse({ fixture: [groups[0], replacement] })
          .success,
      ).toBe(false);
  });
});

describe('video article navigation', () => {
  it.each(locales)(
    'keeps all 13 anchors and five readable static panels in %s',
    (locale) => {
      const source = readFileSync(
        `content/posts/video-console/${locale}.md`,
        'utf8',
      );
      const draft =
        loadPosts().find((post) => post.id === 'video-console')?.locales[locale]
          ?.publication === 'draft';
      const rendered = renderPost(
        'video-console',
        locale,
        draft ? { mode: 'draft-preview' } : undefined,
      );
      const expected = loadPostSections()['video-console'];
      if (!expected || !rendered.sections)
        throw new Error('Missing article sections');
      const sections = partitionPostSections(
        source,
        rendered,
        expected,
        locale,
      );
      expect(rendered.sections).toEqual(sections);
      expect(sections).toHaveLength(5);
      expect(sections.map((section) => section.html).join('')).toBe(
        rendered.html,
      );
      expect(
        rendered.headings.filter((heading) => heading.level === 2),
      ).toHaveLength(13);
      const html = renderToStaticMarkup(
        createElement(ArticleSections, { sections, locale }),
      );
      expect(html.match(/class="sn-tabpanel"/g)).toHaveLength(5);
      expect(html.match(/class="prose"/g)).toHaveLength(5);
      expect(html).not.toMatch(/\shidden(?:[ =>])|role="tab(?:list|panel)?"/);
      for (const [index, section] of sections.entries()) {
        expect(section.label).toBe(expected[index]?.label[locale]);
        expect(html).toContain(`href="#${section.id}"`);
        expect(html).toContain(`id="${section.id}-tab"`);
      }
      for (const heading of rendered.headings)
        expect(html.split(`id="${heading.id}"`)).toHaveLength(2);
    },
  );
});
