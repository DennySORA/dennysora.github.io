import type { Locale } from '../i18n/index.ts';

// Collections added after Medicine, Networks and Hardware share one contract:
// a collection holds category folders or, when it is flat, its notes directly.
// Localized copy stays in note-collections.server.ts and reaches the browser
// only as loader data for the current language, never in the page bundle.

export const noteCollectionIds = ['japan', 'health', 'other'] as const;
export type NoteCollectionId = (typeof noteCollectionIds)[number];
export const noteCategoryIds = ['japanese', 'photography'] as const;
export type NoteCategoryId = (typeof noteCategoryIds)[number];

export const noteCollections = {
  japan: { categories: ['japanese'] },
  health: { categories: [] },
  other: { categories: ['photography'] },
} as const satisfies Record<
  NoteCollectionId,
  { categories: readonly NoteCategoryId[] }
>;

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

export const collectionNotes = {
  'japanese-structure': { collection: 'japan', category: 'japanese' },
  'japanese-conjugation': { collection: 'japan', category: 'japanese' },
  'japanese-clauses': { collection: 'japan', category: 'japanese' },
  'japanese-reasons': { collection: 'japan', category: 'japanese' },
  'japanese-expressions': { collection: 'japan', category: 'japanese' },
  'japanese-vocabulary': { collection: 'japan', category: 'japanese' },
  'japanese-review': { collection: 'japan', category: 'japanese' },
  'lumbar-spine-care': { collection: 'health', category: null },
  'landscape-photography': { collection: 'other', category: 'photography' },
} as const satisfies Record<
  CollectionNoteId,
  { collection: NoteCollectionId; category: NoteCategoryId | null }
>;

export function isNoteCollection(value: string): value is NoteCollectionId {
  return noteCollectionIds.some((id) => id === value);
}

/** A category belongs to exactly one collection. */
export function hasCategory(
  collection: NoteCollectionId,
  category: string,
): category is NoteCategoryId {
  return noteCollections[collection].categories.some((id) => id === category);
}

/** The note filed at this collection (and category, when it has one). */
export function findCollectionNote(
  collection: NoteCollectionId,
  category: NoteCategoryId | null,
  id: string,
): CollectionNoteId | null {
  return (
    collectionNoteIds.find(
      (note) =>
        note === id &&
        collectionNotes[note].collection === collection &&
        collectionNotes[note].category === category,
    ) ?? null
  );
}

export function collectionPath(
  collection: NoteCollectionId,
  locale: Locale,
): string {
  return `/${locale}/note/${collection}/`;
}

export function categoryPath(
  collection: NoteCollectionId,
  category: NoteCategoryId,
  locale: Locale,
): string {
  return `/${locale}/note/${collection}/${category}/`;
}

export function collectionNotePath(
  id: CollectionNoteId,
  locale: Locale = 'zh-hant',
): string {
  const { collection, category } = collectionNotes[id];
  return category
    ? `${categoryPath(collection, category, locale)}${id}/`
    : `${collectionPath(collection, locale)}${id}/`;
}

/** A note as the explorer and directories list it, in the reader's language. */
export type CollectionNoteLink = {
  id: CollectionNoteId;
  href: string;
  title: string;
};
export type CollectionCategoryEntry = {
  id: NoteCategoryId;
  href: string;
  title: string;
  intro: string;
  notes: CollectionNoteLink[];
};
/** One collection of the workspace tree; flat collections have no categories. */
export type CollectionEntry = {
  id: NoteCollectionId;
  href: string;
  title: string;
  intro: string;
  available: string;
  categories: CollectionCategoryEntry[];
  notes: CollectionNoteLink[];
};
