// Study notes kept as reviewed static fragments in the study-note format (the
// Japanese series, lower-back care, landscape photography). Where each one is
// filed lives in note-tree.ts; localized copy stays in note-collections.server.ts
// and reaches the browser only as loader data for the current language.

export const collectionNoteIds = [
  'japanese-structure',
  'japanese-conjugation',
  'japanese-clauses',
  'japanese-reasons',
  'japanese-expressions',
  'japanese-vocabulary',
  'japanese-review',
  'lumbar-spine-care',
  'landscape-photography',
] as const;
export type CollectionNoteId = (typeof collectionNoteIds)[number];
