import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
import type { Locale } from '../../i18n/index.ts';
import { noteCopy } from '../../lib/notes-copy.ts';

export function Notes({
  locale,
  medical,
}: {
  locale: Locale;
  medical: boolean;
}) {
  const t = noteCopy[locale];
  return (
    <div className="container profile-layout notes-directory">
      <MdHeading level={1}>{medical ? t.medical : t.notes}</MdHeading>
      <p className="ln page-intro">{t.intro}</p>
      {medical ? (
        <section className="ln note-card">
          <img
            src="/assets/illustrations/medical-notes.webp"
            width={1200}
            height={593}
            alt=""
            decoding="async"
          />
          <h2>
            <a href="/zh-hant/note/medical/analgesics/" hrefLang="zh-Hant">
              <Icon name="book" /> {t.article}
            </a>
          </h2>
          <p>{t.available}</p>
        </section>
      ) : (
        <ul className="ln">
          <li>
            <a className="note-folder" href={`/${locale}/note/medical/`}>
              <Icon name="capsule" size={28} />
              <span>{t.medical}</span>
              <Icon name="arrow" />
            </a>
          </li>
        </ul>
      )}
      <EndOfBuffer />
    </div>
  );
}
