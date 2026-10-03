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
      <header className="page-head has-art">
        <div className="page-head-text">
          <MdHeading level={1} icon="network">
            {t.title}
          </MdHeading>
          <p className="ln page-intro">{t.intro}</p>
        </div>
        <img
          className="page-art"
          src="/assets/illustrations/collection-network-v1.webp"
          width={88}
          height={88}
          alt=""
          decoding="async"
        />
      </header>
      <ul className="network-note-list">
        {networkNoteIds.map((id) => (
          <li key={id}>
            <h2 className="ln">
              <a href={`/zh-hant/note/network/${id}/`} hrefLang="zh-Hant">
                <Icon name="markdown" size={18} />
                <span lang="zh-Hant">{networkNotes[id].title}</span>
              </a>
            </h2>
            <p className="network-note-file" aria-hidden="true">
              {id}.md
            </p>
            <p lang="zh-Hant">{networkNotes[id].description}</p>
            <small>
              <Icon name="globe" size={14} />
              {t.available}
            </small>
          </li>
        ))}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
