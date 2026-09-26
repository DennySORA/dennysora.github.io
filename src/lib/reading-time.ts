const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const word = /[\p{L}\p{N}][\p{L}\p{N}'’._-]*/gu;

export type ReadingInput = {
  /** Visible prose, excluding code blocks and formulas. */
  prose: string;
  codeLines: number;
  formulas: number;
};

// Language-aware estimate shown as “about N minutes”; it is deliberately coarse.
// CJK text is counted by character, Latin text by word, and code or formulas add
// their own reading cost instead of being measured as prose.
export function estimateReadingMinutes({
  prose,
  codeLines,
  formulas,
}: ReadingInput): number {
  const characters = prose.match(cjk)?.length ?? 0;
  const words = prose.replace(cjk, ' ').match(word)?.length ?? 0;
  const minutes =
    characters / 450 + words / 220 + codeLines / 40 + formulas * 0.3;
  return Math.max(1, Math.round(minutes));
}
