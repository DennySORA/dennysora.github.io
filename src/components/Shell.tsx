import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import {
  dictionaries,
  locales,
  localeNames,
  type Locale,
} from '../i18n/index.ts';
import { legacyDestinations } from '../lib/legacy-anchors.ts';
import { Icon, type IconName } from './Icon.tsx';

export type Section =
  'home' | 'about' | 'projects' | 'blog' | 'research' | 'privacy' | 'not-found';
export function Shell({
  locale,
  section,
  suffix,
  children,
  availableLocales = [...locales],
}: {
  locale: Locale;
  section: Section;
  suffix: string;
  children: ReactNode;
  availableLocales?: Locale[];
}) {
  const t = dictionaries[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function closeMenu() {
    if (!dialog.current?.open) return;
    dialog.current.close();
    document.body.style.overflow = '';
    trigger.current?.focus();
  }
  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const items = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled])',
    );
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  useEffect(() => {
    const legacy = legacyDestinations[window.location.hash.slice(1)];
    if (window.location.pathname === '/' && legacy)
      window.location.replace(legacy);
    function keyboard(event: globalThis.KeyboardEvent) {
      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !dialog.current?.open &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches('input, textarea, select') ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        const input = document.getElementById('search-input');
        if (input) input.focus();
        else window.location.assign(`/${locale}/blog/#search`);
      }
    }
    function back() {
      dialog.current?.close();
      document.body.style.overflow = '';
    }
    document.addEventListener('keydown', keyboard);
    window.addEventListener('popstate', back);
    return () => {
      document.removeEventListener('keydown', keyboard);
      window.removeEventListener('popstate', back);
      document.body.style.overflow = '';
    };
  }, [locale]);
  const links: {
    key: 'home' | 'about' | 'projects' | 'blog' | 'research';
    icon: IconName;
    file: string;
  }[] = [
    { key: 'home', icon: 'home', file: 'index' },
    { key: 'about', icon: 'user', file: 'about' },
    { key: 'blog', icon: 'file', file: 'writing' },
    { key: 'projects', icon: 'code', file: 'projects' },
    { key: 'research', icon: 'research', file: 'research' },
  ];
  const nav = (
    <nav aria-label={t.menu} className="site-nav">
      {links.map(({ key, icon, file }) => (
        <a
          key={key}
          href={`/${locale}/${key === 'home' ? '' : key + '/'}`}
          aria-current={section === key ? 'page' : undefined}
          onClick={closeMenu}
        >
          <Icon name={icon} />
          <span>{t[key]}</span>
          <span className="nav-extension">{file === 'index' ? '' : '.md'}</span>
        </a>
      ))}
    </nav>
  );
  const language = (
    <div className="language-switch" role="group" aria-label={t.language}>
      {locales.map((target) =>
        availableLocales.includes(target) ? (
          <a
            key={target}
            href={`/${target}/${suffix}`}
            hrefLang={target === 'zh-hant' ? 'zh-Hant' : target}
            aria-current={target === locale ? 'true' : undefined}
            aria-label={localeNames[target]}
          >
            {target === 'zh-hant' ? '繁中' : target === 'en' ? 'EN' : '日本語'}
          </a>
        ) : (
          <span
            key={target}
            className="unavailable-language"
            title={t.missing}
            aria-label={`${localeNames[target]} — ${t.missing}`}
          >
            {target === 'zh-hant' ? '繁中' : target === 'en' ? 'EN' : '日本語'}
          </span>
        ),
      )}
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="topbar">
        <a className="brand" href={`/${locale}/`}>
          <span className="brand-symbol">
            d<span>_</span>
          </span>
          <span>
            Denny<span className="text-primary">SORA</span>
          </span>
        </a>
        <span className="topbar-path">
          <span>~/</span> dennysora <span>/</span>{' '}
          {section === 'home' ? 'workspace' : section}
        </span>
        <div className="topbar-right">
          <a className="search-link" href={`/${locale}/blog/#search`}>
            <Icon name="search" />
            <span>{t.search}</span>
            <kbd>/</kbd>
          </a>
          {language}
          <button
            ref={trigger}
            type="button"
            className="icon-button mobile-menu"
            aria-label={t.menu}
            onClick={() => {
              dialog.current?.showModal();
              document.body.style.overflow = 'hidden';
            }}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-label">
          {t.explorer}
          <span>···</span>
        </div>
        <div className="workspace-label">
          <Icon name="chevron" size={13} />
          {t.workspace}
        </div>
        {nav}
        <div className="sidebar-section">
          <p className="micro-label">{t.elsewhere}</p>
          <a href="https://github.com/DennySORA">
            <Icon name="github" />
            GitHub
            <Icon name="external" size={12} />
          </a>
          <a href={`/${locale}/rss.xml`}>
            <Icon name="rss" />
            {t.rss}
          </a>
        </div>
        <div className="sidebar-bottom">
          <img src="/assets/avatar.png" alt="" width="34" height="34" />
          <div>
            <strong>DennySORA</strong>
            <span>{t.location}</span>
          </div>
          <a href="mailto:dennysora.main@gmail.com" aria-label={t.email}>
            <Icon name="mail" />
          </a>
        </div>
      </aside>
      <dialog
        ref={dialog}
        className="mobile-dialog"
        aria-label={t.menu}
        onKeyDown={containFocus}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          if (dialog.current?.open) return;
          document.body.style.overflow = '';
          trigger.current?.focus();
        }}
      >
        <div className="dialog-heading">
          <span>DennySORA</span>
          <button
            type="button"
            className="icon-button"
            onClick={closeMenu}
            aria-label={t.close}
          >
            <Icon name="close" />
          </button>
        </div>
        {nav}
        {language}
      </dialog>
      <noscript>
        <nav className="nojs-nav" aria-label={t.menu}>
          {links.map(({ key }) => (
            <a key={key} href={`/${locale}/${key === 'home' ? '' : key + '/'}`}>
              {t[key]}
            </a>
          ))}
        </nav>
      </noscript>
      <div className="workspace">
        <div className="document-tab">
          <Icon name={section === 'projects' ? 'code' : 'file'} size={15} />
          <span>{section === 'home' ? 'README' : section}.md</span>
          <span className="tab-dot" aria-hidden="true" />
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <span>{t.footer}</span>
          <div>
            <a href={`/${locale}/privacy/`}>{t.privacy}</a>
            <a href={`/${locale}/rss.xml`}>
              RSS <Icon name="rss" size={12} />
            </a>
            <span>© 2026 DennySORA</span>
          </div>
        </footer>
      </div>
      <div className="statusbar">
        <span>
          <Icon name="code" size={13} />
          {t.builtOn}
        </span>
        <span>
          <Icon name="globe" size={13} />
          {localeNames[locale]}
          <span className="status-encoding">UTF-8 · Markdown</span>
        </span>
      </div>
    </>
  );
}
