// Reviewed static study-note fragments: lower-back care and landscape photography.
// Their folders live in note-tree.ts; localized copy stays in
// note-collections.server.ts and reaches the browser as current-language loader data.

export const collectionNoteIds = [
  'lumbar-spine-care',
  'landscape-photography',
] as const;
export type CollectionNoteId = (typeof collectionNoteIds)[number];
