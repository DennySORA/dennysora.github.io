import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import {
  Collection,
  type CollectionFile,
} from '../../components/Collection.tsx';
import { Icon, type IconName } from '../../components/Icon.tsx';
import { htmlLang, type Locale } from '../../i18n/index.ts';
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
import type {
  CollectionEntry,
  CollectionNoteId,
  NoteCategoryId,
  NoteCollectionId,
} from '../../lib/note-collections.ts';

export type NotesView =
  | { collection: 'all' }
  | { collection: 'medical'; category?: MedicalCategory }
  | { collection: 'hardware'; category?: HardwareCategory }
  | { collection: NoteCollectionId; category?: NoteCategoryId };

// Art and icons stay with the view; titles and intros arrive as loader data.
const collectionArt: Record<NoteCollectionId, string> = {
  japan: '/assets/illustrations/collection-japan-v1.webp',
  health: '/assets/illustrations/collection-health-v1.webp',
  other: '/assets/illustrations/collection-other-v1.webp',
};
const collectionIcon: Record<NoteCollectionId, IconName> = {
  japan: 'torii',
  health: 'heart-pulse',
  other: 'camera',
};

type NoteFile = Omit<CollectionFile, 'lang'>;
const noteFile = (file: NoteFile, locale: Locale): CollectionFile => ({
  ...file,
  lang: htmlLang[locale],
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
        href: medicalNotePath(id, locale),
        name: `${id}.md`,
        title: medicalNotes[id].title[locale],
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
      href: hardwareNotePath(id, locale),
      name: `${id}.md`,
      title: hardwareNotes[id].title[locale],
    })),
  };
}

/** A loader-provided collection in the same shape as Medicine and Hardware. */
function fromEntry(entry: CollectionEntry): Grouped {
  return {
    root: entry.id,
    icon: collectionIcon[entry.id],
    art: collectionArt[entry.id],
    title: entry.title,
    intro: entry.intro,
    available: entry.available,
    categories: entry.categories.map(({ id, title, intro }) => ({
      id,
      title,
      intro,
    })),
    notes: [
      ...entry.categories.flatMap((category) =>
        category.notes.map((note) => ({
          category: category.id,
          href: note.href,
          name: `${note.id}.md`,
          title: note.title,
        })),
      ),
      ...entry.notes.map((note) => ({
        category: entry.id,
        href: note.href,
        name: `${note.id}.md`,
        title: note.title,
      })),
    ],
  };
}

/** A flat collection lists its notes directly, as the Networks folder does. */
function FlatCollection({
  locale,
  entry,
  summaries,
}: {
  locale: Locale;
  entry: CollectionEntry;
  summaries: readonly { id: CollectionNoteId; description: string }[];
}) {
  return (
    <div className="container profile-layout notes-directory">
      <header className="page-head has-art">
        <div className="page-head-text">
          <MdHeading level={1} icon={collectionIcon[entry.id]}>
            {entry.title}
          </MdHeading>
          <p className="ln page-intro">{entry.intro}</p>
        </div>
        <img
          className="page-art"
          src={collectionArt[entry.id]}
          width={88}
          height={88}
          alt=""
          decoding="async"
        />
      </header>
      <ul className="network-note-list">
        {entry.notes.map((note) => (
          <li key={note.id}>
            <h2 className="ln">
              <a href={note.href} hrefLang={htmlLang[locale]}>
                <Icon name="markdown" size={18} />
                <span lang={htmlLang[locale]}>{note.title}</span>
              </a>
            </h2>
            <p className="network-note-file" aria-hidden="true">
              {note.id}.md
            </p>
            <p lang={htmlLang[locale]}>
              {summaries.find(({ id }) => id === note.id)?.description}
            </p>
            <small>
              <Icon name="globe" size={14} />
              {entry.available}
            </small>
          </li>
        ))}
      </ul>
      <EndOfBuffer />
    </div>
  );
}

export function Notes({
  locale,
  view,
  collections,
  summaries = [],
}: {
  locale: Locale;
  view: NotesView;
  /** The newer collections in this page's language, from the loader. */
  collections: readonly CollectionEntry[];
  summaries?: readonly { id: CollectionNoteId; description: string }[];
}) {
  const t = noteCopy[locale];
  if (view.collection !== 'all') {
    const entry = collections.find(({ id }) => id === view.collection);
    if (entry && entry.categories.length === 0)
      return (
        <FlatCollection locale={locale} entry={entry} summaries={summaries} />
      );
    const group =
      view.collection === 'medical' || view.collection === 'hardware'
        ? grouped(locale, view.collection)
        : entry
          ? fromEntry(entry)
          : null;
    if (!group) throw new Error(`Missing note collection ${view.collection}`);
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
                files={files.map((file) => noteFile(file, locale))}
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
            noteFile(
              {
                href: `/${locale}/note/network/${id}/`,
                name: `${id}.md`,
                title: networkNotes[id].title[locale],
              },
              locale,
            ),
          )}
          available={network.available}
        />
        {[
          ...(['medical', 'hardware'] as const).map((collection) =>
            grouped(locale, collection),
          ),
          ...collections.map(fromEntry),
        ].map((group) => {
          const collection = group.root;
          return (
            <Collection
              key={collection}
              art={group.art}
              href={`/${locale}/note/${group.root}/`}
              title={group.title}
              count={t.count(group.notes.length)}
              intro={group.intro}
              files={group.notes.map((file) => noteFile(file, locale))}
              available={group.available}
            />
          );
        })}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
