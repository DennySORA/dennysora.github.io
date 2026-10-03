/** Citations and escaped contract text are not automatically loaded assets. */
export function hasRawAsset(source: string, extension: string): boolean {
  if (extension !== '.html')
    return source.includes('raw.githubusercontent.com');
  return (
    /<(?:img|script|iframe|source|video|audio|embed|object|link)\b[^>]*\b(?:src|srcset|data|href)\s*=\s*["'][^"']*raw\.githubusercontent\.com/i.test(
      source,
    ) ||
    /(?:url\s*\(|@import\s+)["'\s]*https?:\/\/raw\.githubusercontent\.com/i.test(
      source,
    )
  );
}
