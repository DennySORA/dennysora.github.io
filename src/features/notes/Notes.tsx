import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
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
import { noteCopy } from '../../lib/notes-copy.ts';

/** One note collection as a folder preview: what it holds, and its files. */
function Collection({
  art,
  href,
  title,
  count,
  intro,
  files,
  available,
}: {
  art: string;
  href: string;
  title: string;
  count: string;
  intro: string;
  files: { href: string; name: string; title: string }[];
  available: string;
}) {
  return (
    <li className="collection">
      <img
        className="collection-art"
        src={art}
        width={88}
        height={88}
        alt=""
        decoding="async"
      />
      <div className="collection-body">
        <h2 className="collection-title">
          <a href={href}>
            <Icon name="folder-open" size={18} />
            <span>{title}</span>
          </a>
          <span className="collection-count">{count}</span>
        </h2>
        <p className="collection-intro">{intro}</p>
        <ul className="collection-files">
          {files.map((file) => (
            <li key={file.href}>
              <a href={file.href} hrefLang="zh-Hant">
                <Icon name="markdown" size={16} />
                <span className="collection-file">{file.name}</span>
                <span className="collection-file-title" lang="zh-Hant">
                  {file.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="collection-meta">
          <Icon name="globe" size={14} />
          {available}
        </p>
      </div>
    </li>
  );
}

export function Notes({
  locale,
  medical,
  category,
}: {
  locale: Locale;
  medical: boolean;
  category?: MedicalCategory;
}) {
  const t = noteCopy[locale];
  const network = networkCopy[locale];
  return (
    <div className="container profile-layout notes-directory">
      <MdHeading level={1} icon={medical ? 'capsule' : 'notebook'}>
        {category
          ? medicalCategoryCopy[locale][category].title
          : medical
            ? t.medical
            : t.notes}
      </MdHeading>
      <p className="ln page-intro">
        {category
          ? medicalCategoryCopy[locale][category].intro
          : medical
            ? t.medicalIntro
            : t.intro}
      </p>
      {medical ? (
        <ul className="ln collections">
          {(category ? [category] : medicalCategories).map((group) => (
            <Collection
              key={group}
              art="/assets/illustrations/collection-medicine-v1.webp"
              href={`/${locale}/note/medical/${group}/`}
              title={medicalCategoryCopy[locale][group].title}
              count={t.count(
                medicalNoteIds.filter(
                  (id) => medicalNotes[id].category === group,
                ).length,
              )}
              intro={medicalCategoryCopy[locale][group].intro}
              files={medicalNoteIds
                .filter((id) => medicalNotes[id].category === group)
                .map((id) => ({
                  href: medicalNotePath(id),
                  name: `${id}.md`,
                  title: medicalNotes[id].title['zh-hant'],
                }))}
              available={t.available}
            />
          ))}
        </ul>
      ) : (
        <ul className="ln collections">
          <Collection
            art="/assets/illustrations/collection-network-v1.webp"
            href={`/${locale}/note/network/`}
            title={network.title}
            count={t.count(networkNoteIds.length)}
            intro={network.intro}
            files={networkNoteIds.map((id) => ({
              href: `/zh-hant/note/network/${id}/`,
              name: `${id}.md`,
              title: networkNotes[id].title,
            }))}
            available={network.available}
          />
          <Collection
            art="/assets/illustrations/collection-medicine-v1.webp"
            href={`/${locale}/note/medical/`}
            title={t.medical}
            count={t.count(medicalNoteIds.length)}
            intro={t.medicalIntro}
            files={medicalNoteIds.map((id) => ({
              href: medicalNotePath(id),
              name: `${id}.md`,
              title: medicalNotes[id].title['zh-hant'],
            }))}
            available={t.available}
          />
        </ul>
      )}
      <EndOfBuffer />
    </div>
  );
}
