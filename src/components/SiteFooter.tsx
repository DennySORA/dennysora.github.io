import { dictionaries, type Locale } from '../i18n/index.ts';
import { contactEmail, githubUrl } from '../lib/site.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { Icon } from './Icon.tsx';
import { LanguageList, type LanguageLink } from './LanguageSwitch.tsx';

export function SiteFooter({
  locale,
  languageLinks,
  preserveSearch,
}: {
  locale: Locale;
  languageLinks: LanguageLink[];
  preserveSearch: boolean;
}) {
  const t = dictionaries[locale];
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <BrandLogo placement="footer" locale={locale} />
          <p>{t.footerTagline}</p>
        </div>
        <nav className="footer-links" aria-label={t.footerLinks}>
          <ul>
            <li>
              <a href={githubUrl}>
                <Icon name="github" size={18} />
                {t.github}
                <span className="sr-only">（{t.newTab}）</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contactEmail}`}>
                <Icon name="mail" size={18} />
                {t.email}
              </a>
            </li>
            <li>
              <a href={`/${locale}/rss.xml`}>
                <Icon name="rss" size={18} />
                {t.rss}
              </a>
            </li>
            <li>
              <a href={`/${locale}/papers/`}>{t.navPapers}</a>
            </li>
            <li>
              <a href={`/${locale}/privacy/`}>{t.privacy}</a>
            </li>
          </ul>
        </nav>
        <LanguageList
          locale={locale}
          links={languageLinks}
          preserveSearch={preserveSearch}
          className="footer-languages"
        />
        <p className="footer-meta">© 2026 DennySORA · 李汶道</p>
      </div>
    </footer>
  );
}
