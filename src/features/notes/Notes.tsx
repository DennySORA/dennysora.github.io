import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import {
  Collection,
  type CollectionFile,
} from '../../components/Collection.tsx';
import type { IconName } from '../../components/Icon.tsx';
import type { Locale } from '../../i18n/index.ts';
import {
  networkCopy,
  networkNoteIds,
  networkNotes,
} from '../../lib/network-notes.ts';
import {
  medicalCategories,
  medicalCategoryCopy,
  medicalNoteIds,
  medicalNotes,
  medicalNotePath,
  type MedicalCategory,
} from '../../lib/medical-notes.ts';
import {
  hardwareCategories,
  hardwareCategoryCopy,
  hardwareCopy,
  hardwareNoteIds,
  hardwareNotes,
  hardwareNotePath,
  type HardwareCategory,
} from '../../lib/hardware-notes.ts';
import { noteCopy } from '../../lib/notes-copy.ts';

export type NotesView =
  | { collection: 'all' }
  | { collection: 'medical'; category?: MedicalCategory }
  | { collection: 'hardware'; category?: HardwareCategory };

// Notes are written in Traditional Chinese; every file is titled in it.
type NoteFile = Omit<CollectionFile, 'lang'>;
const noteFile = (file: NoteFile): CollectionFile => ({
  ...file,
  lang: 'zh-Hant',
});

/** A collection split into category folders, each listing its own notes. */
type Grouped = {
  root: string;
  icon: IconName;
  art: string;
  title: string;
  intro: string;
  available: string;
  categories: readonly { id: string; title: string; intro: string }[];
  notes: readonly (NoteFile & { category: string })[];
};

function grouped(locale: Locale, collection: 'medical' | 'hardware'): Grouped {
  if (collection === 'medical') {
    const t = noteCopy[locale];
    return {
      root: 'medical',
      icon: 'capsule',
      art: '/assets/illustrations/collection-medicine-v1.webp',
      title: t.medical,
      intro: t.medicalIntro,
      available: t.available,
      categories: medicalCategories.map((id) => ({
        id,
        ...medicalCategoryCopy[locale][id],
      })),
      notes: medicalNoteIds.map((id) => ({
        category: medicalNotes[id].category,
        href: medicalNotePath(id),
        name: `${id}.md`,
        title: medicalNotes[id].title['zh-hant'],
      })),
    };
  }
  const t = hardwareCopy[locale];
  return {
    root: 'hardware',
    icon: 'cpu',
    art: '/assets/illustrations/collection-hardware-v1.webp',
    title: t.title,
    intro: t.intro,
    available: t.available,
    categories: hardwareCategories.map((id) => ({
      id,
      ...hardwareCategoryCopy[locale][id],
    })),
    notes: hardwareNoteIds.map((id) => ({
      category: hardwareNotes[id].category,
      href: hardwareNotePath(id),
      name: `${id}.md`,
      title: hardwareNotes[id].title['zh-hant'],
    })),
  };
}

export function Notes({ locale, view }: { locale: Locale; view: NotesView }) {
  const t = noteCopy[locale];
  if (view.collection !== 'all') {
    const group = grouped(locale, view.collection);
    const category = group.categories.find(({ id }) => id === view.category);
    return (
      <div className="container profile-layout notes-directory">
        <MdHeading level={1} icon={group.icon}>
          {category ? category.title : group.title}
        </MdHeading>
        <p className="ln page-intro">
          {category ? category.intro : group.intro}
        </p>
        <ul className="ln collections">
          {(category ? [category] : group.categories).map((folder) => {
            const files = group.notes.filter(
              (note) => note.category === folder.id,
            );
            return (
              <Collection
                key={folder.id}
                art={group.art}
                href={`/${locale}/note/${group.root}/${folder.id}/`}
                title={folder.title}
                count={t.count(files.length)}
                intro={folder.intro}
                files={files.map(noteFile)}
                available={group.available}
              />
            );
          })}
        </ul>
        <EndOfBuffer />
      </div>
    );
  }
  const network = networkCopy[locale];
  return (
    <div className="container profile-layout notes-directory">
      <MdHeading level={1} icon="notebook">
        {t.notes}
      </MdHeading>
      <p className="ln page-intro">{t.intro}</p>
      <ul className="ln collections">
        <Collection
          art="/assets/illustrations/collection-network-v1.webp"
          href={`/${locale}/note/network/`}
          title={network.title}
          count={t.count(networkNoteIds.length)}
          intro={network.intro}
          files={networkNoteIds.map((id) =>
            noteFile({
              href: `/zh-hant/note/network/${id}/`,
              name: `${id}.md`,
              title: networkNotes[id].title,
            }),
          )}
          available={network.available}
        />
        {(['medical', 'hardware'] as const).map((collection) => {
          const group = grouped(locale, collection);
          return (
            <Collection
              key={collection}
              art={group.art}
              href={`/${locale}/note/${group.root}/`}
              title={group.title}
              count={t.count(group.notes.length)}
              intro={group.intro}
              files={group.notes.map(noteFile)}
              available={group.available}
            />
          );
        })}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
