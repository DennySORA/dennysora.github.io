import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
import { htmlLang, type Locale } from '../../i18n/index.ts';
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
              <a
                href={`/${locale}/note/network/${id}/`}
                hrefLang={htmlLang[locale]}
              >
                <Icon name="markdown" size={18} />
                <span lang={htmlLang[locale]}>
                  {networkNotes[id].title[locale]}
                </span>
              </a>
            </h2>
            <p className="network-note-file" aria-hidden="true">
              {id}.md
            </p>
            <p lang={htmlLang[locale]}>
              {networkNotes[id].description[locale]}
            </p>
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
