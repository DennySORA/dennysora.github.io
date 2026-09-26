import {
  createHighlighterCoreSync,
  type HighlighterCore,
  type ThemeRegistration,
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import diff from 'shiki/langs/diff.mjs';
import docker from 'shiki/langs/docker.mjs';
import go from 'shiki/langs/go.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import jsx from 'shiki/langs/jsx.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import python from 'shiki/langs/python.mjs';
import rust from 'shiki/langs/rust.mjs';
import sql from 'shiki/langs/sql.mjs';
import toml from 'shiki/langs/toml.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import yaml from 'shiki/langs/yaml.mjs';
import { escapeHtml } from './html.ts';

// The theme maps TextMate scopes to sentinel colours, and each sentinel becomes a
// CSS class. Markup therefore carries no inline styles: the product tokens own the
// palette on screen and the print stylesheet swaps it for ink colours.
const roles = {
  '#000001': 'tok-comment',
  '#000002': 'tok-keyword',
  '#000003': 'tok-string',
  '#000004': 'tok-constant',
  '#000005': 'tok-function',
  '#000006': 'tok-type',
  '#000007': 'tok-inserted',
  '#000008': 'tok-deleted',
} as const;
const siteTheme: ThemeRegistration = {
  name: 'dennysora-code',
  type: 'dark',
  colors: { 'editor.foreground': '#000000', 'editor.background': '#000000' },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#000001' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'entity.name.tag',
        'markup.heading',
      ],
      settings: { foreground: '#000002' },
    },
    {
      scope: ['string', 'string.regexp', 'markup.inline.raw'],
      settings: { foreground: '#000003' },
    },
    {
      scope: [
        'constant',
        'constant.numeric',
        'constant.language',
        'support.constant',
      ],
      settings: { foreground: '#000004' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call.generic',
      ],
      settings: { foreground: '#000005' },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
        'entity.other.attribute-name',
        'storage.type.primitive',
      ],
      settings: { foreground: '#000006' },
    },
    { scope: ['markup.inserted'], settings: { foreground: '#000007' } },
    { scope: ['markup.deleted'], settings: { foreground: '#000008' } },
  ],
};

const languages = [
  bash,
  css,
  diff,
  docker,
  go,
  html,
  javascript,
  json,
  jsx,
  markdown,
  python,
  rust,
  sql,
  toml,
  tsx,
  typescript,
  yaml,
];
let highlighter: HighlighterCore | null = null;
// Built lazily: pages without highlighted code never pay for the grammars.
function getHighlighter() {
  highlighter ??= createHighlighterCoreSync({
    themes: [siteTheme],
    langs: languages,
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export function isHighlightable(language: string): boolean {
  return getHighlighter().getLoadedLanguages().includes(language);
}

/** Returns escaped inner HTML for a `<code>` element. */
export function highlightCode(code: string, language: string): string {
  if (!isHighlightable(language)) return escapeHtml(code);
  const { tokens } = getHighlighter().codeToTokens(code, {
    lang: language,
    theme: siteTheme.name ?? 'dennysora-code',
  });
  return tokens
    .map((line) =>
      line
        .map(({ content, color }) => {
          const role = roles[(color ?? '').toLowerCase() as keyof typeof roles];
          const text = escapeHtml(content);
          return role ? `<span class="${role}">${text}</span>` : text;
        })
        .join(''),
    )
    .join('\n');
}
