import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import {
  Collection,
  type CollectionFile,
} from '../../components/Collection.tsx';
import { Icon } from '../../components/Icon.tsx';
import { htmlLang, type Locale } from '../../i18n/index.ts';
import { noteCopy } from '../../lib/notes-copy.ts';
import {
  findTreeFolder,
  noteFolders,
  treeNotes,
  type NoteFolderId,
  type NoteTreeFolder,
  type NoteTreeNote,
} from '../../lib/note-tree.ts';

const noteFiles = (
  notes: readonly NoteTreeNote[],
  locale: Locale,
): CollectionFile[] =>
  notes.map((note) => ({
    href: note.href,
    name: `${note.id}.md`,
    title: note.title,
    lang: htmlLang[locale],
  }));

/** A folder as a card: its art, name, how many notes it holds and their files. */
function FolderCard({
  folder,
  locale,
}: {
  folder: NoteTreeFolder;
  locale: Locale;
}) {
  const notes = treeNotes(folder);
  return (
    <Collection
      art={noteFolders[folder.id].art}
      href={folder.href}
      title={folder.title}
      count={noteCopy[locale].count(notes.length)}
      intro={folder.intro}
      files={noteFiles(notes, locale)}
    />
  );
}

/** Notes filed directly in a folder, each with its summary. */
function NoteList({
  notes,
  locale,
}: {
  notes: readonly NoteTreeNote[];
  locale: Locale;
}) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <h2 className="ln">
            <a href={note.href} hrefLang={htmlLang[locale]}>
              <Icon name="markdown" size={18} />
              <span lang={htmlLang[locale]}>{note.title}</span>
            </a>
          </h2>
          <p className="note-list-file" aria-hidden="true">
            {note.id}.md
          </p>
          <p lang={htmlLang[locale]}>{note.description}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The note/ directory and its folders. A folder page shows a card for each
 * subfolder, then the notes filed directly in it.
 */
export function Notes({
  locale,
  folder,
  tree,
}: {
  locale: Locale;
  /** The open folder, or null for note/ itself. */
  folder: NoteFolderId | null;
  /** The note tree in the page's language, from the loader. */
  tree: readonly NoteTreeFolder[];
}) {
  const t = noteCopy[locale];
  if (!folder)
    return (
      <div className="container profile-layout notes-directory">
        <MdHeading level={1} icon="notebook">
          {t.notes}
        </MdHeading>
        <p className="ln page-intro">{t.intro}</p>
        <ul className="ln collections">
          {tree.map((top) => (
            <FolderCard key={top.id} folder={top} locale={locale} />
          ))}
        </ul>
        <EndOfBuffer />
      </div>
    );
  const open = findTreeFolder(tree, folder);
  if (!open) throw new Error(`Missing note folder ${folder}`);
  return (
    <div className="container profile-layout notes-directory">
      <header className="page-head has-art">
        <div className="page-head-text">
          <MdHeading level={1} icon={noteFolders[folder].icon}>
            {open.title}
          </MdHeading>
          <p className="ln page-intro">{open.intro}</p>
        </div>
        <img
          className="page-art"
          src={noteFolders[folder].art}
          width={88}
          height={88}
          alt=""
          decoding="async"
        />
      </header>
      {open.folders.length ? (
        <ul className="ln collections">
          {open.folders.map((inner) => (
            <FolderCard key={inner.id} folder={inner} locale={locale} />
          ))}
        </ul>
      ) : null}
      {open.notes.length ? (
        <NoteList notes={open.notes} locale={locale} />
      ) : null}
      <EndOfBuffer />
    </div>
  );
}
