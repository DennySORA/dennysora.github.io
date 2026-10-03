import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
import {
  dictionaries,
  htmlLang,
  locales,
  type Locale,
} from '../../i18n/index.ts';

/** One static 404 serves every language, so the other languages are offered too. */
export function NotFound({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <div className="container profile-layout not-found">
      <p className="ln eyebrow diagnostic">
        <span className="vim-error">
          <Icon name="circle-x" size={14} />
          E404
        </span>
      </p>
      <MdHeading level={1}>{t.notFoundTitle}</MdHeading>
      <p className="ln page-intro">{t.notFoundText}</p>
      <img
        className="not-found-art"
        src="/assets/illustrations/not-found-v1.webp"
        width={360}
        height={123}
        alt=""
        decoding="async"
      />
      <div className="ln action-row">
        <a className="button button-primary" href={`/${locale}/`}>
          <Icon name="home" size={18} />
          {t.returnHome}
        </a>
        <a className="button button-quiet" href={`/${locale}/blog/`}>
          <Icon name="folder" size={18} />
          {t.navLibrary}
        </a>
      </div>
      <ul className="other-languages">
        {locales
          .filter((item) => item !== locale)
          .map((item) => (
            <li className="ln" key={item} lang={htmlLang[item]}>
              <Icon name="globe" size={14} />
              <span>{dictionaries[item].notFoundTitle}</span>{' '}
              <a href={`/${item}/`}>{dictionaries[item].returnHome}</a>
            </li>
          ))}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
