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
      <p className="eyebrow">404</p>
      <h1>{t.notFoundTitle}</h1>
      <p className="page-intro">{t.notFoundText}</p>
      <div className="action-row">
        <a className="button button-primary" href={`/${locale}/`}>
          {t.returnHome}
          <Icon name="arrow" size={18} />
        </a>
        <a className="button button-quiet" href={`/${locale}/blog/`}>
          {t.navLibrary}
        </a>
      </div>
      <ul className="other-languages">
        {locales
          .filter((item) => item !== locale)
          .map((item) => (
            <li key={item} lang={htmlLang[item]}>
              <span>{dictionaries[item].notFoundTitle}</span>{' '}
              <a href={`/${item}/`}>{dictionaries[item].returnHome}</a>
            </li>
          ))}
      </ul>
    </div>
  );
}
