import { randomBytes } from 'node:crypto';
import { extname, join, normalize, relative, sep } from 'node:path';
import {
  Lexer,
  Marked,
  type Token,
  type TokenizerAndRendererExtension,
  type Tokens,
} from 'marked';
import markedFootnote from 'marked-footnote';
import sanitizeHtml from 'sanitize-html';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { highlightCode, isHighlightable } from './highlight.server.ts';
import { decodeEntities, escapeHtml } from './html.ts';
import { readImageSize } from './image-size.server.ts';
import { renderMath } from './math.server.ts';
import { reservedIds } from './page-ids.ts';
import { estimateReadingMinutes } from './reading-time.ts';

export type Heading = { id: string; text: string; level: number };
export type RenderedImage = { source: string; url: string };
export type RenderOptions = {
  locale: Locale;
  /** Published heading anchors, in document order, that must keep their ids. */
  publishedAnchors?: ReadonlyArray<{ id: string; text: string }>;
  /** Directory holding the document's images and the URL prefix they are served from. */
  assets?: { directory: string; urlPrefix: string };
};
export type RenderedMarkdown = {
  html: string;
  headings: Heading[];
  text: string;
  minutes: number;
  images: RenderedImage[];
  hasMath: boolean;
};

const maxBytes = 500_000;
const imageTypes = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const explicitId = /\s*\{#([a-z][a-z0-9-]{0,63})\}\s*$/;
const footnoteId = /^footnote-(?:ref-)?\d+$|^footnote-label$/;
const alignClasses = ['align-left', 'align-center', 'align-right'];
const languageAliases: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  dockerfile: 'docker',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rs: 'rust',
  yml: 'yaml',
  md: 'markdown',
};

function plainText(html: string): string {
  return decodeEntities(
    sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  );
}

function hash(value: string): string {
  let result = 0x811c9dc5;
  for (const char of value) {
    result ^= char.codePointAt(0) ?? 0;
    result = Math.imul(result, 0x01000193) >>> 0;
  }
  return result.toString(36);
}

/** ASCII slug for new headings; non-Latin headings get a stable text hash. */
export function slugifyHeading(text: string): string {
  const ascii = text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/, '');
  return ascii.length >= 2 && /^[a-z]/.test(ascii) ? ascii : `h-${hash(text)}`;
}

function parseInfo(info: string): { language: string; title: string | null } {
  const [first = ''] = info.trim().split(/\s+/);
  const language = first.toLowerCase().replace(/[^a-z0-9+#-]/g, '');
  const title = /\btitle="([^"]{1,120})"/.exec(info)?.[1] ?? null;
  return { language: languageAliases[language] ?? language, title };
}

export function renderMarkdown(
  markdown: string,
  options: RenderOptions,
): RenderedMarkdown {
  if (Buffer.byteLength(markdown) > maxBytes)
    throw new Error('Markdown exceeds size limit');
  const t = dictionaries[options.locale];
  const headings: Heading[] = [];
  const usedIds = new Set<string>();
  const published = new Map<string, string[]>();
  for (const anchor of options.publishedAnchors ?? [])
    published.set(anchor.text, [
      ...(published.get(anchor.text) ?? []),
      anchor.id,
    ]);
  const explicitIds = new WeakMap<object, string>();
  const images: RenderedImage[] = [];
  const codeBlocks: { language: string; title: string | null; text: string }[] =
    [];
  const formulas: { tex: string; display: boolean }[] = [];
  // Generated code and math replace these unguessable slots after the author
  // content has been sanitized, so each follows its own bounded policy.
  const nonce = randomBytes(8).toString('hex');
  const slot = (kind: 'code' | 'math', index: number) =>
    `%%${kind}-${nonce}-${index}%%`;

  function assignId(text: string, explicit: string | undefined): string {
    const queue = published.get(text);
    const base = explicit ?? queue?.shift() ?? slugifyHeading(text);
    let id = base;
    for (let n = 2; usedIds.has(id) || reservedIds.has(id); n++)
      id = `${base}-${n}`;
    usedIds.add(id);
    return id;
  }

  function resolveImage(href: string): {
    url: string;
    width: number;
    height: number;
  } {
    if (!options.assets)
      throw new Error('Images are only supported in article content');
    if (/^[a-z][a-z0-9+.-]*:|^\/|^\\/i.test(href))
      throw new Error(
        `Only images stored next to the article are allowed: ${href}`,
      );
    const directory = normalize(options.assets.directory);
    const file = normalize(
      join(directory, decodeURIComponent(href.split(/[?#]/)[0] ?? '')),
    );
    if (
      !file.startsWith(directory + sep) ||
      !imageTypes.has(extname(file).toLowerCase())
    )
      throw new Error(
        `Image path is outside the article or unsupported: ${href}`,
      );
    const { width, height } = readImageSize(file);
    const url =
      options.assets.urlPrefix +
      relative(directory, file).split(sep).map(encodeURIComponent).join('/');
    images.push({ source: file, url });
    return { url, width, height };
  }

  function imageHtml(token: Tokens.Image): string {
    const alt = token.text.trim();
    if (!alt)
      throw new Error(`Image needs descriptive alt text: ${token.href}`);
    const { url, width, height } = resolveImage(token.href);
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
  }

  const math: TokenizerAndRendererExtension[] = [
    {
      name: 'mathBlock',
      level: 'block',
      start: (src) => /^\$\$/m.exec(src)?.index,
      tokenizer(src) {
        const match = /^\$\$[ \t]*\n([\s\S]+?)\n[ \t]*\$\$[ \t]*(?:\n+|$)/.exec(
          src,
        );
        if (match?.[1])
          return { type: 'mathBlock', raw: match[0], text: match[1].trim() };
        return undefined;
      },
      renderer: (token) =>
        `${slot('math', formulas.push({ tex: String(token['text']), display: true }) - 1)}\n`,
    },
    {
      name: 'mathInline',
      level: 'inline',
      start: (src) => {
        const index = src.indexOf('$');
        return index >= 0 ? index : undefined;
      },
      tokenizer(src) {
        const match = /^\$(?![\s$])((?:\\.|[^\\$\n])+?)(?<!\s)\$(?![\d$])/.exec(
          src,
        );
        if (match?.[1])
          return { type: 'mathInline', raw: match[0], text: match[1] };
        return undefined;
      },
      renderer: (token) =>
        slot(
          'math',
          formulas.push({ tex: String(token['text']), display: false }) - 1,
        ),
    },
  ];

  const parser = new Marked({ gfm: true });
  parser.use(
    markedFootnote({
      description: t.footnotes,
      backRefLabel: t.backToReference,
    }),
  );
  parser.use({
    extensions: math,
    walkTokens(token: Token) {
      if (token.type !== 'heading') return;
      const heading = token as Tokens.Heading;
      const match = explicitId.exec(heading.text);
      const last = heading.tokens.at(-1);
      if (!match?.[1] || last?.type !== 'text') return;
      explicitIds.set(heading, match[1]);
      heading.text = heading.text.replace(explicitId, '');
      (last as Tokens.Text).text = (last as Tokens.Text).text.replace(
        explicitId,
        '',
      );
      (last as Tokens.Text).raw = (last as Tokens.Text).raw.replace(
        explicitId,
        '',
      );
    },
    renderer: {
      heading(token) {
        const level = Math.max(2, token.depth);
        const inner = this.parser.parseInline(token.tokens);
        const text = plainText(inner).trim();
        const id = assignId(text, explicitIds.get(token));
        headings.push({ id, text, level });
        return `<h${level} id="${id}">${inner}</h${level}>\n`;
      },
      code(token) {
        const { language, title } = parseInfo(token.lang ?? '');
        return `${slot('code', codeBlocks.push({ language, title, text: token.text }) - 1)}\n`;
      },
      paragraph(token) {
        const content = token.tokens.filter(
          (item) => !(item.type === 'text' && !item.raw.trim()),
        );
        const [only] = content;
        if (content.length === 1 && only?.type === 'image') {
          const image = only as Tokens.Image;
          const caption = image.title
            ? `<figcaption>${escapeHtml(image.title)}</figcaption>`
            : '';
          return `<figure>${imageHtml(image)}${caption}</figure>\n`;
        }
        return `<p>${this.parser.parseInline(token.tokens)}</p>\n`;
      },
      image(token) {
        return imageHtml(token);
      },
      table(token) {
        const align = (index: number) => {
          const value = token.align[index];
          return value ? ` class="align-${value}"` : '';
        };
        const head = token.header
          .map(
            (cell, index) =>
              `<th scope="col"${align(index)}>${this.parser.parseInline(cell.tokens)}</th>`,
          )
          .join('');
        const rows = token.rows
          .map(
            (row) =>
              `<tr>${row.map((cell, index) => `<td${align(index)}>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`,
          )
          .join('');
        return `<div class="table-scroll" role="region" tabindex="0" aria-label="${escapeHtml(t.tableLabel)}"><table><thead><tr>${head}</tr></thead>${rows ? `<tbody>${rows}</tbody>` : ''}</table></div>\n`;
      },
      blockquote(token) {
        const [first, ...rest] = token.tokens;
        const match =
          first?.type === 'paragraph'
            ? /^\[!(NOTE|TIP|WARNING)\][ \t]*(?:\n|$)/.exec(
                (first as Tokens.Paragraph).text,
              )
            : null;
        if (!match?.[1] || first?.type !== 'paragraph')
          return `<blockquote>\n${this.parser.parse(token.tokens)}</blockquote>\n`;
        const kind = match[1].toLowerCase() as 'note' | 'tip' | 'warning';
        const title = {
          note: t.calloutNote,
          tip: t.calloutTip,
          warning: t.calloutWarning,
        }[kind];
        const remainder = (first as Tokens.Paragraph).text.slice(
          match[0].length,
        );
        const lead = remainder.trim()
          ? `<p>${this.parser.parseInline(Lexer.lexInline(remainder, this.parser.options))}</p>\n`
          : '';
        return `<aside class="callout callout-${kind}" role="note" aria-label="${escapeHtml(title)}"><p class="callout-title"><span class="callout-icon" aria-hidden="true"></span>${escapeHtml(title)}</p>${lead}${this.parser.parse(rest)}</aside>\n`;
      },
    },
  });

  const raw = parser.parse(markdown, { async: false });
  const generatedImages = new Set(images.map((image) => image.url));
  const headingIds = new Set(headings.map((heading) => heading.id));
  const keepId = (tagName: string, attribs: sanitizeHtml.Attributes) => {
    const id = attribs['id'];
    const heading =
      /^h[2-6]$/.test(tagName) && id !== undefined && headingIds.has(id);
    if (id !== undefined && !heading && !footnoteId.test(id))
      delete attribs['id'];
    return { tagName, attribs };
  };
  const authored = sanitizeHtml(raw, {
    allowedTags: [
      'p',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'strong',
      'em',
      'del',
      's',
      'blockquote',
      'code',
      'pre',
      'hr',
      'br',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'figure',
      'figcaption',
      'img',
      'sup',
      'sub',
      'kbd',
      'mark',
      'section',
      'div',
      'span',
      'aside',
    ],
    allowedAttributes: {
      a: [
        'href',
        'title',
        'id',
        'aria-describedby',
        'aria-label',
        'data-footnote-ref',
        'data-footnote-backref',
      ],
      h2: ['id', 'class'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      th: ['scope', 'class'],
      td: ['class'],
      ol: ['start'],
      li: ['id'],
      section: ['class', 'data-footnotes'],
      div: ['class', 'role', 'tabindex', 'aria-label'],
      aside: ['class', 'role', 'aria-label'],
      p: ['class'],
      span: ['class', 'aria-hidden'],
    },
    allowedClasses: {
      h2: ['sr-only'],
      th: alignClasses,
      td: alignClasses,
      section: ['footnotes'],
      div: ['table-scroll'],
      aside: ['callout', 'callout-note', 'callout-tip', 'callout-warning'],
      p: ['callout-title'],
      span: ['callout-icon'],
    },
    transformTags: {
      h2: keepId,
      h3: keepId,
      h4: keepId,
      h5: keepId,
      h6: keepId,
      a: keepId,
      li: keepId,
    },
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && !generatedImages.has(frame.attribs['src'] ?? ''),
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
  });

  const slots = new RegExp(`%%(code|math)-${nonce}-(\\d+)%%`, 'g');
  const prose = plainText(authored.replace(slots, ' '));
  const html = authored.replace(
    slots,
    (_match, kind: string, index: string) => {
      if (kind === 'code') {
        const block = codeBlocks[Number(index)];
        return block ? codeBlockHtml(block, t.codeBlock) : '';
      }
      const formula = formulas[Number(index)];
      if (!formula) return '';
      const rendered = renderMath(formula.tex, formula.display, {
        error: t.mathError,
      });
      return formula.display
        ? `<div class="math-block" role="region" tabindex="0" aria-label="${escapeHtml(t.mathLabel)}">${rendered}</div>`
        : rendered;
    },
  );
  return {
    html,
    headings,
    text: plainText(html),
    minutes: estimateReadingMinutes({
      prose,
      codeLines: codeBlocks.reduce(
        (sum, block) => sum + block.text.split('\n').length,
        0,
      ),
      formulas: formulas.length,
    }),
    images,
    hasMath: formulas.length > 0,
  };
}

function codeBlockHtml(
  block: { language: string; title: string | null; text: string },
  codeLabel: string,
): string {
  const highlighted =
    block.language !== '' &&
    block.language !== 'text' &&
    isHighlightable(block.language);
  const label = block.title ?? (block.language || 'text').toUpperCase();
  const body = highlighted
    ? highlightCode(block.text, block.language)
    : escapeHtml(block.text);
  const language = highlighted
    ? ` data-language="${escapeHtml(block.language)}"`
    : '';
  return `<div class="code-block"><div class="code-toolbar" data-pagefind-ignore="all"><span class="code-label" data-entity="file">${escapeHtml(label)}</span></div><pre tabindex="0" role="region" aria-label="${escapeHtml(`${codeLabel} · ${label}`)}"><code${language}>${body}</code></pre></div>`;
}
