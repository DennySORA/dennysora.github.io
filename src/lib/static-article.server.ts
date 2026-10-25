import sanitizeHtml from 'sanitize-html';
import { decodeEntities } from './html.ts';
import type { Heading, RenderedMarkdown } from './markdown.server.ts';
import { reservedIds } from './page-ids.ts';
import { estimateReadingMinutes } from './reading-time.ts';

const tags = [
  'div',
  'p',
  'a',
  'section',
  'h2',
  'h3',
  'span',
  'figure',
  'figcaption',
  'svg',
  'path',
  'circle',
  'rect',
  'polyline',
  'br',
  'b',
  'strong',
  'small',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'i',
  'code',
  'pre',
  'ol',
  'ul',
  'li',
  'details',
  'summary',
  'sup',
  'caption',
  'time',
  'title',
  'desc',
  'defs',
  'marker',
  'g',
  'text',
];
const articleReservedIds = new Set([
  ...reservedIds,
  'source-title',
  'related-title',
]);
const text = (html: string) =>
  decodeEntities(
    sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    }),
  );

/** Separate from Markdown: reviewed static diagrams, never executable HTML. */
export function renderStaticArticle(source: string): RenderedMarkdown {
  if (Buffer.byteLength(source) > 500_000)
    throw new Error('Static article exceeds size limit');
  if (
    /<(?:script|iframe|object|embed|form|style|link|img|image|use|foreignObject|animate|set)\b|\son[a-z]+\s*=|\s(?:style|src|srcset|xlink:href)\s*=/i.test(
      source,
    )
  )
    throw new Error('Executable, styled or externally loaded article markup');
  let svgDepth = 0;
  const svgTags = new Set([
    'title',
    'desc',
    'defs',
    'marker',
    'g',
    'text',
    'path',
    'circle',
    'rect',
    'polyline',
  ]);
  for (const [token, name = ''] of source.matchAll(
    /<\/?([a-z][a-z0-9:-]*)\b[^>]*>/gi,
  )) {
    if (!tags.includes(name))
      throw new Error(`Unsupported static article tag: ${name}`);
    if (name === 'svg')
      svgDepth += token.startsWith('</') ? -1 : token.endsWith('/>') ? 0 : 1;
    else if (svgTags.has(name) && svgDepth < 1)
      throw new Error('SVG element outside its diagram');
    if (svgDepth < 0) throw new Error('Unbalanced SVG diagram');
    if (name !== 'a' && /\shref\s*=/i.test(token))
      throw new Error('Only article links may have href');
  }
  if (svgDepth !== 0) throw new Error('Unbalanced SVG diagram');
  const ids = [...source.matchAll(/\sid="([^"]*)"/g)].map(
    (match) => match[1] ?? '',
  );
  if (
    new Set(ids).size !== ids.length ||
    ids.some(
      (id) => !/^[a-z][a-z0-9-]*$/.test(id) || articleReservedIds.has(id),
    )
  )
    throw new Error('Duplicate, reserved or invalid static article ID');
  for (const [, href = ''] of source.matchAll(/\shref="([^"]*)"/g)) {
    if (!/^https:\/\//.test(href) && !/^#[a-z][a-z0-9-]*$/.test(href))
      throw new Error('Unsafe static article link');
    if (
      href.startsWith('#') &&
      href !== '#article-title' &&
      !ids.includes(href.slice(1))
    )
      throw new Error(`Broken static article anchor: ${href}`);
  }
  // SVG paint servers and accessible names may refer only to this fragment.
  for (const [, target = ''] of source.matchAll(
    /\smarker-(?:start|end)="([^"]*)"/g,
  )) {
    const id = /^url\(#([a-z][a-z0-9-]*)\)$/.exec(target)?.[1];
    if (!id || !ids.includes(id))
      throw new Error('Unsafe or missing local SVG marker');
  }
  for (const [, label = ''] of source.matchAll(
    /\saria-labelledby="([^"]*)"/g,
  )) {
    if (!label.trim() || label.split(/\s+/).some((id) => !ids.includes(id)))
      throw new Error('Broken static article accessible label');
  }
  const parsedIds = new Set<string>();
  const parsedReferences: string[] = [];
  const html = sanitizeHtml(source, {
    transformTags: {
      '*': (tagName, attribs) => {
        const id = attribs['id'];
        if (id !== undefined) {
          if (
            !/^[a-z][a-z0-9-]*$/.test(id) ||
            articleReservedIds.has(id) ||
            parsedIds.has(id)
          )
            throw new Error('Duplicate, reserved or invalid static article ID');
          parsedIds.add(id);
        }
        const href = attribs['href'];
        if (href !== undefined) {
          if (
            tagName !== 'a' ||
            (!/^https:\/\//.test(href) && !/^#[a-z][a-z0-9-]*$/.test(href))
          )
            throw new Error('Unsafe static article link');
          if (href.startsWith('#') && href !== '#article-title')
            parsedReferences.push(href.slice(1));
        }
        for (const attribute of ['marker-start', 'marker-end']) {
          const value = attribs[attribute];
          if (value !== undefined) {
            const match = /^url\(#([a-z][a-z0-9-]*)\)$/.exec(value)?.[1];
            if (!match) throw new Error('Unsafe local SVG marker');
            parsedReferences.push(match);
          }
        }
        const label = attribs['aria-labelledby'];
        if (label !== undefined) parsedReferences.push(...label.split(/\s+/));
        return { tagName, attribs };
      },
    },
    allowedTags: tags,
    allowedAttributes: {
      '*': ['class', 'id', 'aria-live', 'aria-atomic'],
      a: ['href', 'class', 'aria-label'],
      div: ['class', 'aria-hidden', 'aria-label', 'role', 'tabindex'],
      section: ['class', 'id', 'aria-label'],
      p: ['class', 'id'],
      h2: ['id'],
      h3: ['id'],
      span: ['class', 'aria-hidden'],
      figure: ['class', 'aria-label', 'role', 'id'],
      svg: [
        'class',
        'aria-hidden',
        'aria-labelledby',
        'role',
        'viewBox',
        'width',
        'height',
      ],
      path: ['d', 'marker-start', 'marker-end'],
      circle: ['cx', 'cy', 'r'],
      rect: ['x', 'y', 'width', 'height', 'rx'],
      polyline: ['points'],
      th: ['scope'],
      li: ['id'],
      time: ['datetime'],
      title: ['id'],
      desc: ['id'],
      marker: [
        'id',
        'viewBox',
        'refX',
        'refY',
        'markerWidth',
        'markerHeight',
        'orient',
      ],
      g: ['marker-start', 'marker-end'],
      text: ['x', 'y'],
    },
    allowedClasses: {
      '*': [
        'password-guide',
        'network-guide',
        'privacy-guide',
        'translation-guide',
        /^(?:pm|np|pg|tg)-[a-z0-9-]+$/,
      ],
    },
    allowedSchemes: ['https'],
    allowProtocolRelative: false,
    parser: { lowerCaseAttributeNames: false, lowerCaseTags: false },
  });
  if (parsedReferences.some((id) => !parsedIds.has(id)))
    throw new Error('Broken static article reference');
  const headings: Heading[] = [
    ...html.matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g),
  ].map(([, level, id = '', label = '']) => ({
    id,
    text: text(label),
    level: Number(level),
  }));
  const plain = text(html);
  return {
    html,
    headings,
    text: plain,
    minutes: estimateReadingMinutes({
      prose: plain,
      codeLines: 0,
      formulas: 0,
    }),
    images: [],
    previewVideos: [],
    subtitles: [],
    hasMath: false,
  };
}
