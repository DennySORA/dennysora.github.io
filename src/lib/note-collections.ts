// Reviewed static study-note fragments: health, photography and computer cooling.
// Their folders live in note-tree.ts; localized copy stays in
// note-collections.server.ts and reaches the browser as current-language loader data.

export const collectionNoteIds = [
  'lumbar-spine-care',
  'landscape-photography',
  'fan-system-matching',
] as const;
export type CollectionNoteId = (typeof collectionNoteIds)[number];
