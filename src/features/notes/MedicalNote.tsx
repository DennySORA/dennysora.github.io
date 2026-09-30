import { EndOfBuffer } from '../../components/Buffer.tsx';
import { dictionaries, localeNames, type Locale } from '../../i18n/index.ts';

/** A reviewed, build-time HTML fragment; never accepts visitor-supplied HTML. */
export function MedicalNote({
  html,
  locale,
}: {
  html: string;
  locale: Locale;
}) {
  return (
    <div className="medical-note buffer">
      <img
        className="medical-cover"
        src="/assets/illustrations/medical-notes.webp"
        width={1200}
        height={593}
        alt=""
        decoding="async"
      />
      {locale !== 'zh-hant' ? (
        <p className="ln medical-translation" data-pagefind-ignore="all">
          {localeNames['zh-hant']} ·{' '}
          {dictionaries[locale].unavailableTranslation}
        </p>
      ) : null}
      <article
        lang="zh-Hant"
        aria-labelledby="medical-title"
        data-pagefind-ignore="all"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
