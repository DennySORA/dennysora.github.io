import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Lexer, type Tokens } from 'marked';
import type { Locale } from '../i18n/index.ts';
import type { RenderedMarkdown } from './markdown.server.ts';
import { postSectionsSchema, type PostSectionGroup } from './schema.ts';
import { reservedIds } from './page-ids.ts';

export type PostSection = {
  id: string;
  label: string;
  icon: PostSectionGroup['icon'];
  html: string;
};

let sections: ReturnType<typeof postSectionsSchema.parse> | undefined;
export function loadPostSections() {
  if (sections) return sections;
  const bytes = readFileSync(join(process.cwd(), 'data/post-sections.json'));
  if (bytes.byteLength > 500_000)
    throw new Error('Article section data exceeds limit');
  sections = postSectionsSchema.parse(JSON.parse(bytes.toString()));
  return sections;
}

/** Split only adjacent top-level H2 blocks; the rendered content stays intact. */
export function partitionPostSections(
  markdown: string,
  rendered: RenderedMarkdown,
  groups: readonly PostSectionGroup[],
  locale: Locale,
): PostSection[] {
  const expected = groups.flatMap((group) => group.headings);
  const topLevel = Lexer.lex(markdown)
    .filter(
      (token): token is Tokens.Heading =>
        token.type === 'heading' && token.depth === 2,
    )
    .map((token) => /\s*\{#([a-z][a-z0-9-]*)\}\s*$/.exec(token.text)?.[1]);
  const actual = rendered.headings
    .filter((heading) => heading.level === 2)
    .map((heading) => heading.id);
  if (
    JSON.stringify(expected) !== JSON.stringify(topLevel) ||
    JSON.stringify(expected) !== JSON.stringify(actual)
  )
    throw new Error(
      'Article sections must cover every top-level explicit H2 once, in order',
    );

  const ids = new Set([
    ...reservedIds,
    ...Array.from(
      rendered.html.matchAll(/\bid="([^"]+)"/g),
      (match) => match[1],
    ),
  ]);
  const starts = groups.map((group) => {
    const id = `article-tab-${group.id}`;
    for (const ownedId of [id, `${id}-tab`]) {
      if (ids.has(ownedId))
        throw new Error(`Article section ID collision: ${ownedId}`);
      ids.add(ownedId);
    }
    const marker = `<h2 id="${group.headings[0]}">`;
    const start = rendered.html.indexOf(marker);
    if (start < 0 || rendered.html.indexOf(marker, start + marker.length) >= 0)
      throw new Error('Article section boundary is missing or ambiguous');
    return start;
  });
  return groups.map((group, index) => ({
    id: `article-tab-${group.id}`,
    label: group.label[locale],
    icon: group.icon,
    html: rendered.html.slice(
      index === 0 ? 0 : starts[index],
      starts[index + 1],
    ),
  }));
}
