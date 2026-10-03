import { useEffect, useRef, type KeyboardEvent } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import type { WorkspaceFiles } from '../lib/workspace.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { Explorer } from './Explorer.tsx';
import { Icon } from './Icon.tsx';
import {
  LanguageList,
  LanguageMenu,
  type LanguageLink,
} from './LanguageSwitch.tsx';

function unlockScroll() {
  document.documentElement.style.overflow = '';
}

/**
 * The window title bar: brand, a command-center search entry and the
 * language menu. Below the desktop width the explorer opens as a dialog.
 */
export function TitleBar({
  locale,
  route,
  files,
  languageLinks,
}: {
  locale: Locale;
  route: RouteDescriptor;
  files: WorkspaceFiles;
  languageLinks: LanguageLink[];
}) {
  const t = dictionaries[locale];
  const preserveSearch = route.kind === 'library' || route.kind === 'search';
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
    <header className="titlebar">
      <BrandLogo placement="header" locale={locale} />
      <a className="command-center" href={`/${locale}/search/#search`}>
        <Icon name="search" size={15} />
        <span className="command-text">{t.searchSite}</span>
        <kbd aria-hidden="true">/</kbd>
      </a>
      <div className="titlebar-tools">
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
          <Icon name="files" />
        </button>
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
        <nav aria-label={t.menuTitle}>
          <Explorer
            locale={locale}
            route={route}
            files={files}
            onNavigate={closeMenu}
          />
        </nav>
        <p className="menu-dialog-label">{t.language}</p>
        <LanguageList
          locale={locale}
          links={languageLinks}
          preserveSearch={preserveSearch}
          className="menu-dialog-languages"
        />
      </dialog>
    </header>
  );
}
