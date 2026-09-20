import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

function plainText(value: string) {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };
  return value.replace(
    /&(amp|lt|gt|quot|apos|nbsp);/g,
    (match, key: string) => entities[key] ?? match,
  );
}

export type Heading = { id: string; text: string; level: number };
export function renderMarkdown(
  markdown: string,
  aliases: Readonly<Record<string, string>> = {},
) {
  if (Buffer.byteLength(markdown) > 500_000)
    throw new Error('Markdown exceeds size limit');
  const headings: Heading[] = [];
  const parser = new Marked({ gfm: true });
  parser.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = plainText(
          sanitizeHtml(this.parser.parseInline(tokens), {
            allowedTags: [],
            allowedAttributes: {},
          }),
        );
        const alias = aliases[text];
        const id =
          alias &&
          /^[a-z][a-z0-9-]*$/.test(alias) &&
          !headings.some((heading) => heading.id === alias)
            ? alias
            : `section-${headings.length + 1}`;
        headings.push({ id, text, level: depth });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`;
      },
    },
  });
  const raw = parser.parse(markdown, { async: false });
  const html = sanitizeHtml(raw, {
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
      'del',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
      code: ['class'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['https', 'mailto'],
    allowProtocolRelative: false,
  });
  const text = plainText(
    sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  );
  return {
    html,
    headings,
    text,
    minutes: Math.max(1, Math.ceil(text.length / 650)),
  };
}
