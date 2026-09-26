import { decodeEntities } from './html.ts';

export type ExcerptPart = { text: string; mark: boolean };

// Search excerpts arrive as escaped text with <mark> around hits. Only that exact
// structure is honoured; anything else stays literal text rendered by React.
export function parseExcerpt(html: string): ExcerptPart[] {
  const parts: ExcerptPart[] = [];
  let mark = false;
  for (const piece of html.split(/(<mark>|<\/mark>)/)) {
    if (piece === '<mark>') mark = true;
    else if (piece === '</mark>') mark = false;
    else if (piece) parts.push({ text: decodeEntities(piece), mark });
  }
  return parts;
}
