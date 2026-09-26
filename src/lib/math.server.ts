import katex from 'katex';
import sanitizeHtml from 'sanitize-html';
import { escapeHtml } from './html.ts';

const maxSource = 2000;
const length = /^-?(?:\d+|\d*\.\d+)(?:em|ex|px|pt|%)?$/;
const colour = /^(?:#[0-9a-f]{3,8}|[a-z]+)$/i;
const lengthStyles = Object.fromEntries(
  [
    'height',
    'width',
    'min-width',
    'max-width',
    'vertical-align',
    'top',
    'bottom',
    'left',
    'right',
    'margin-left',
    'margin-right',
    'margin-top',
    'margin-bottom',
    'padding-left',
    'padding-right',
    'border-bottom-width',
    'border-top-width',
    'border-right-width',
    'border-left-width',
  ].map((property) => [property, [length]]),
);
const mathTags = [
  'math',
  'semantics',
  'annotation',
  'mrow',
  'mi',
  'mo',
  'mn',
  'ms',
  'mtext',
  'mspace',
  'msup',
  'msub',
  'msubsup',
  'mfrac',
  'msqrt',
  'mroot',
  'mover',
  'munder',
  'munderover',
  'mtable',
  'mtr',
  'mtd',
  'mstyle',
  'mpadded',
  'mphantom',
  'menclose',
];
// Generator output gets its own bounded allowlist: KaTeX's MathML, layout spans and
// the stretchy-glyph SVG paths it draws. No links, images, event handlers or URLs.
const policy: sanitizeHtml.IOptions = {
  allowedTags: ['span', 'svg', 'path', 'line', ...mathTags],
  allowedAttributes: {
    span: ['class', 'style', 'aria-hidden'],
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
    mstyle: ['mathcolor', 'scriptlevel', 'displaystyle', 'mathsize'],
    mo: [
      'stretchy',
      'fence',
      'separator',
      'lspace',
      'rspace',
      'minsize',
      'maxsize',
      'movablelimits',
      'accent',
    ],
    mi: ['mathvariant'],
    mn: ['mathvariant'],
    mtext: ['mathvariant'],
    mspace: ['width', 'height', 'depth', 'linebreak'],
    mpadded: ['width', 'height', 'depth', 'lspace', 'voffset'],
    menclose: ['notation'],
    mtable: [
      'columnalign',
      'rowspacing',
      'columnspacing',
      'columnlines',
      'rowlines',
      'frame',
      'framespacing',
      'width',
      'displaystyle',
    ],
    mtd: ['columnalign'],
    mover: ['accent'],
    munder: ['accentunder'],
    mfrac: ['linethickness'],
    svg: [
      'xmlns',
      'width',
      'height',
      'viewBox',
      'preserveAspectRatio',
      'style',
    ],
    path: ['d'],
    line: ['x1', 'x2', 'y1', 'y2', 'stroke-width'],
  },
  allowedStyles: {
    span: { ...lengthStyles, color: [colour], 'border-color': [colour] },
    svg: { width: [length], height: [length], 'min-width': [length] },
  },
  allowedSchemes: [],
  allowedSchemesAppliedToAttributes: ['href', 'src', 'xlink:href'],
  parser: { lowerCaseAttributeNames: false },
};

export type MathLabels = { error: string };
export function renderMath(
  tex: string,
  display: boolean,
  labels: MathLabels,
): string {
  const failure = () => {
    const source = `<code>${escapeHtml(tex)}</code>`;
    const note = `<span class="math-error-note">${escapeHtml(labels.error)}</span>`;
    return display
      ? `<div class="math-error" role="note">${source}${note}</div>`
      : `<span class="math-error" role="note">${source} ${note}</span>`;
  };
  if (tex.length > maxSource) return failure();
  let html: string;
  try {
    html = katex.renderToString(tex, {
      displayMode: display,
      output: 'htmlAndMathml',
      throwOnError: true,
      trust: false,
      strict: 'ignore',
      maxSize: 10,
      maxExpand: 500,
    });
  } catch {
    // Never surface the exception text as markup; the escaped source is enough.
    return failure();
  }
  return sanitizeHtml(html, policy);
}
