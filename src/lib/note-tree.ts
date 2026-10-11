import type { IconName } from '../components/Icon.tsx';
import type { Locale } from '../i18n/index.ts';
import { hardwareNoteIds, type HardwareNoteId } from './hardware-notes.ts';
import { medicalNoteIds, type MedicalNoteId } from './medical-notes.ts';
import { networkNoteIds, type NetworkNoteId } from './network-notes.ts';
import {
  collectionNoteIds,
  type CollectionNoteId,
} from './note-collections.ts';

// The note/ tree: every folder in display order, named by its URL segment, and
// the folder that holds each note. Routes, the Explorer, folder pages and
// breadcrumbs all derive from it, so regrouping notes is a change here.
export const noteFolderIds = [
  'software',
  'network',
  'p2p',
  'medical',
  'drugs',
  'pathology',
  'daily-care',
  'hardware',
  'computer',
  'japan',
  'japanese',
  'other',
] as const;
export type NoteFolderId = (typeof noteFolderIds)[number];

const art = (name: string) =>
  `/assets/illustrations/collection-${name}-v1.webp`;

export const noteFolders = {
  software: { parent: null, icon: 'file-code', art: art('network') },
  network: { parent: 'software', icon: 'network', art: art('network') },
  p2p: { parent: 'network', icon: 'network', art: art('network') },
  medical: { parent: null, icon: 'capsule', art: art('medicine') },
  drugs: { parent: 'medical', icon: 'capsule', art: art('medicine') },
  pathology: { parent: 'medical', icon: 'capsule', art: art('medicine') },
  'daily-care': { parent: 'medical', icon: 'heart-pulse', art: art('health') },
  hardware: { parent: null, icon: 'cpu', art: art('hardware') },
  computer: { parent: 'hardware', icon: 'cpu', art: art('hardware') },
  japan: { parent: null, icon: 'torii', art: art('japan') },
  japanese: { parent: 'japan', icon: 'torii', art: art('japan') },
  other: { parent: null, icon: 'camera', art: art('other') },
} as const satisfies Record<
  NoteFolderId,
  { parent: NoteFolderId | null; icon: IconName; art: string }
>;

export type NoteId =
  NetworkNoteId | MedicalNoteId | HardwareNoteId | CollectionNoteId;
export type NoteKind =
  'network-note' | 'medical-note' | 'hardware-note' | 'collection-note';

/** Every note in display order; IDs are unique across the whole tree. */
export const noteIds: readonly NoteId[] = [
  ...networkNoteIds,
  ...medicalNoteIds,
  ...hardwareNoteIds,
  ...collectionNoteIds,
];

/** The folder that holds each note. */
export const noteFolderOf = {
  'p2p-downloader': 'p2p',
  'p2p-privacy': 'p2p',
  analgesics: 'drugs',
  'brain-cns-tumors': 'pathology',
  '140mm-case-fans': 'computer',
  'japanese-structure': 'japanese',
  'japanese-conjugation': 'japanese',
  'japanese-clauses': 'japanese',
  'japanese-reasons': 'japanese',
  'japanese-expressions': 'japanese',
  'japanese-vocabulary': 'japanese',
  'japanese-review': 'japanese',
  'lumbar-spine-care': 'daily-care',
  'landscape-photography': 'other',
} as const satisfies Record<NoteId, NoteFolderId>;

/** Which page renders a note: each kind has its own reviewed fragment format. */
export function noteKind(id: NoteId): NoteKind {
  const has = (ids: readonly string[]) => ids.includes(id);
  if (has(networkNoteIds)) return 'network-note';
  if (has(medicalNoteIds)) return 'medical-note';
  if (has(hardwareNoteIds)) return 'hardware-note';
  return 'collection-note';
}

/** The folders from the top of note/ down to this one. */
export function folderTrail(folder: NoteFolderId): NoteFolderId[] {
  const trail: NoteFolderId[] = [];
  for (let at: NoteFolderId | null = folder; at; at = noteFolders[at].parent)
    trail.unshift(at);
  return trail;
}

export function folderPath(folder: NoteFolderId, locale: Locale): string {
  return `/${locale}/note/${folderTrail(folder).join('/')}/`;
}

export function notePath(id: NoteId, locale: Locale = 'zh-hant'): string {
  return `${folderPath(noteFolderOf[id], locale)}${id}/`;
}

/** Direct subfolders; `null` asks for the top-level folders. */
export function subfolders(parent: NoteFolderId | null): NoteFolderId[] {
  return noteFolderIds.filter((id) => noteFolders[id].parent === parent);
}

/** Notes filed directly in a folder. */
export function notesIn(folder: NoteFolderId): NoteId[] {
  return noteIds.filter((id) => noteFolderOf[id] === folder);
}

/** Notes anywhere below a folder. */
export function notesUnder(folder: NoteFolderId): NoteId[] {
  return noteIds.filter((id) => folderTrail(noteFolderOf[id]).includes(folder));
}

/** The folder or note at note/<segments>/, or null when there is none. */
export function resolveNotePath(
  segments: readonly string[],
): { folder: NoteFolderId } | { noteId: NoteId } | null {
  let parent: NoteFolderId | null = null;
  for (const [index, segment] of segments.entries()) {
    const folder: NoteFolderId | undefined = subfolders(parent).find(
      (id) => id === segment,
    );
    if (folder) {
      parent = folder;
      continue;
    }
    // Only the last segment can name a note, filed in the folder reached so far.
    const noteId =
      index === segments.length - 1 && parent
        ? notesIn(parent).find((id) => id === segment)
        : undefined;
    return noteId ? { noteId } : null;
  }
  return parent ? { folder: parent } : null;
}

/** A note as the Explorer and folder pages list it, in the page's language. */
export type NoteTreeNote = {
  id: NoteId;
  href: string;
  /** Short name for the Explorer; fits the sidebar in full. */
  name: string;
  title: string;
  description: string;
};

/** A folder with its subfolders and notes, in the page's language. */
export type NoteTreeFolder = {
  id: NoteFolderId;
  href: string;
  title: string;
  intro: string;
  folders: NoteTreeFolder[];
  notes: NoteTreeNote[];
};

/** Every note below a folder of the localized tree, in tree order. */
export function treeNotes(folder: NoteTreeFolder): NoteTreeNote[] {
  return [...folder.folders.flatMap(treeNotes), ...folder.notes];
}

/** A folder anywhere in the localized tree. */
export function findTreeFolder(
  folders: readonly NoteTreeFolder[],
  id: NoteFolderId,
): NoteTreeFolder | undefined {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const inner = findTreeFolder(folder.folders, id);
    if (inner) return inner;
  }
  return undefined;
}
