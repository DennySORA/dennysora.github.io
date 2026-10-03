import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
import type { Locale } from '../../i18n/index.ts';
import {
  networkCopy,
  networkNoteIds,
  networkNotes,
} from '../../lib/network-notes.ts';

export function NetworkNotes({ locale }: { locale: Locale }) {
  const t = networkCopy[locale];
  return (
    <div className="container profile-layout notes-directory">
      <MdHeading level={1}>{t.title}</MdHeading>
      <p className="ln page-intro">{t.intro}</p>
      <ul className="network-note-list ln">
        {networkNoteIds.map((id) => (
          <li key={id}>
            <h2>
              <a href={`/zh-hant/note/network/${id}/`} hrefLang="zh-Hant">
                <Icon name="book" />{' '}
                <span lang="zh-Hant">{networkNotes[id].title}</span>
              </a>
            </h2>
            <p lang="zh-Hant">{networkNotes[id].description}</p>
            <small>{t.available}</small>
          </li>
        ))}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
