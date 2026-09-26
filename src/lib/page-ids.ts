// Element ids owned by page chrome. Article headings must never reuse them.
export const pageIds = {
  main: 'main',
  searchInput: 'search-input',
  search: 'search',
  comments: 'comments',
  commentsTitle: 'comments-title',
  related: 'related',
  toc: 'toc',
  contact: 'contact',
  experience: 'experience',
  articleTitle: 'article-title',
} as const;

export const reservedIds: ReadonlySet<string> = new Set([
  ...Object.values(pageIds),
  'top',
  'content',
  'footnote-label',
]);
