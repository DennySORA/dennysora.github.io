import { useEffect, useRef, type KeyboardEvent } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { navSection, type RouteDescriptor } from '../lib/route-manifest.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { Icon } from './Icon.tsx';
import {
  LanguageList,
  LanguageMenu,
  type LanguageLink,
} from './LanguageSwitch.tsx';

type NavKey = 'library' | 'projects' | 'about' | 'papers';

function NavItems({
  locale,
  route,
  onNavigate,
}: {
  locale: Locale;
  route: RouteDescriptor;
  onNavigate?: () => void;
}) {
  const t = dictionaries[locale];
  const active = navSection(route);
  // Section landing pages are the current page; articles and tags sit inside a section.
  const landing = ['library', 'projects', 'about', 'papers'].includes(
    route.kind,
  );
  const items: { key: NavKey; href: string; label: string }[] = [
    { key: 'library', href: `/${locale}/blog/`, label: t.navLibrary },
    { key: 'projects', href: `/${locale}/projects/`, label: t.navProjects },
    { key: 'about', href: `/${locale}/about/`, label: t.navAbout },
    { key: 'papers', href: `/${locale}/papers/`, label: t.navPapers },
  ];
  return (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={item.href}
            aria-current={
              active === item.key ? (landing ? 'page' : 'true') : undefined
            }
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
}

export function SiteHeader({
  locale,
  route,
  languageLinks,
}: {
  locale: Locale;
  route: RouteDescriptor;
  languageLinks: LanguageLink[];
}) {
  const t = dictionaries[locale];
  const preserveSearch = route.kind === 'library';
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function closeMenu() {
    if (dialog.current?.open) dialog.current.close();
    unlockScroll();
  }
  function openMenu() {
    dialog.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  useEffect(() => {
    const menu = dialog.current;
    function dismiss() {
      if (menu?.open) menu.close();
      unlockScroll();
    }
    // A page restored from the back/forward cache must not keep a stale overlay.
    function restore(event: PageTransitionEvent) {
      if (event.persisted) dismiss();
    }
    window.addEventListener('pageshow', restore);
    window.addEventListener('popstate', dismiss);
    return () => {
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('popstate', dismiss);
      unlockScroll();
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandLogo placement="header" locale={locale} />
        <nav className="primary-nav" aria-label={t.mainNav}>
          <NavItems locale={locale} route={route} />
        </nav>
        <div className="header-tools">
          <a
            className="icon-button"
            href={`/${locale}/blog/#search`}
            aria-label={t.searchArticles}
          >
            <Icon name="search" />
          </a>
          <div className="header-language">
            <LanguageMenu
              locale={locale}
              links={languageLinks}
              preserveSearch={preserveSearch}
            />
          </div>
          <button
            ref={trigger}
            type="button"
            className="icon-button menu-button requires-js"
            aria-haspopup="dialog"
            aria-label={t.openMenu}
            onClick={openMenu}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="menu-dialog"
        aria-labelledby="menu-dialog-title"
        onKeyDown={containFocus}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          unlockScroll();
          trigger.current?.focus();
        }}
      >
        <div className="menu-dialog-head">
          <h2 id="menu-dialog-title">{t.menuTitle}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label={t.closeMenu}
            onClick={closeMenu}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="menu-dialog-nav" aria-label={t.mainNav}>
          <NavItems locale={locale} route={route} onNavigate={closeMenu} />
        </nav>
        <p className="menu-dialog-label">{t.language}</p>
        <LanguageList
          locale={locale}
          links={languageLinks}
          preserveSearch={preserveSearch}
          className="menu-dialog-languages"
        />
      </dialog>
      <noscript>
        <nav className="nojs-nav" aria-label={t.mainNav}>
          <NavItems locale={locale} route={route} />
        </nav>
      </noscript>
    </header>
  );
}
