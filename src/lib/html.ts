const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

const named: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
};
/** Decodes the entities produced by the sanitizer and search excerpts into text. */
export function decodeEntities(value: string): string {
  return value.replace(
    /&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|([a-z]+));/gi,
    (match, decimal?: string, hex?: string, name?: string) => {
      const code = decimal ? Number(decimal) : hex ? parseInt(hex, 16) : null;
      if (code !== null)
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      return named[name?.toLowerCase() ?? ''] ?? match;
    },
  );
}
