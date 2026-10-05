import { useEffect, useRef, type KeyboardEvent } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { contactEmail, githubUrl } from '../lib/site.ts';
import {
  areas,
  areaState,
  crumbs,
  fileKind,
  type Area,
  type AreaKey,
  type WorkspaceFiles,
} from '../lib/workspace.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { Explorer } from './Explorer.tsx';
import { fileIcons } from './file-icons.ts';
import { Icon, type IconName } from './Icon.tsx';
import {
  LanguageList,
  LanguageMenu,
  type LanguageLink,
} from './LanguageSwitch.tsx';

export type ExplorerToggle = {
  id: string;
  expanded: boolean;
  label: string;
  onToggle: () => void;
};

const areaIcons: Record<AreaKey, IconName> = {
  home: 'markdown',
  library: 'folder',
  notes: 'folder',
  papers: 'newspaper',
};

function unlockScroll() {
  document.documentElement.style.overflow = '';
}

/**
 * Buffers, as a Neovim bufferline shows them: one per area, plus the page
 * open inside an area right after it. Every buffer is a real link.
 */
function Buffers({
  locale,
  route,
}: {
  locale: Locale;
  route: RouteDescriptor;
}) {
  const t = dictionaries[locale];
  const path = crumbs(route);
  const labels: Record<AreaKey, string> = {
    home: t.navAbout,
    library: t.navLibrary,
    notes: noteCopy[locale].notes,
    papers: `${t.navPapers}（${t.newTab}）`,
  };
  const landing = ['root', 'home', 'library', 'notes'].includes(route.kind);
  const current = landing ? null : path[path.length - 1];
  const after: AreaKey | null = ['article', 'topic', 'tags', 'tag'].includes(
    route.kind,
  )
    ? 'library'
    : [
          'medical',
          'medical-category',
          'medical-note',
          'network',
          'network-note',
        ].includes(route.kind)
      ? 'notes'
      : null;
  const list = useRef<HTMLUListElement>(null);
  // Keep the open buffer in view when the row scrolls on narrow screens.
  useEffect(() => {
    const row = list.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (row && active && row.scrollWidth > row.clientWidth)
      row.scrollLeft = Math.max(0, active.offsetLeft - 16);
  }, [route]);

  const currentTab = current ? (
    <li key="current">
      <span
        className="tab tab-preview"
        aria-current="page"
        data-kind={fileKind(route)}
      >
        <Icon name={fileIcons[fileKind(route)]} size={16} />
        <span className="tab-name">{current.label}</span>
      </span>
    </li>
  ) : null;
  const tab = (area: Area) => {
    const state = areaState(route, area.key);
    const folder = area.key === 'library' || area.key === 'notes';
    return (
      <li key={area.key}>
        <a
          className="tab"
          href={area.href}
          aria-current={state}
          data-area={area.key}
        >
          <Icon
            name={folder && state ? 'folder-open' : areaIcons[area.key]}
            size={16}
          />
          <span className="tab-name">{area.file}</span>
          <span className="sr-only"> — {labels[area.key]}</span>
          {area.external ? <Icon name="arrow-up-right" size={13} /> : null}
        </a>
      </li>
    );
  };
  return (
    <nav className="buffers" aria-label={t.mainNav}>
      <ul ref={list}>
        {areas(locale).flatMap((area) =>
          area.key === after ? [tab(area), currentTab] : [tab(area)],
        )}
        {current && !after ? currentTab : null}
      </ul>
    </nav>
  );
}

function QuickLinks({
  locale,
  className,
}: {
  locale: Locale;
  className: string;
}) {
  const t = dictionaries[locale];
  return (
    <nav className={className} aria-label={t.quickLinks}>
      <ul>
        <li>
          <a
            href={githubUrl}
            title="GitHub"
            aria-label={`GitHub（${t.newTab}）`}
          >
            <Icon name="github" size={18} />
            <span className="quick-link-text">GitHub</span>
          </a>
        </li>
        <li>
          <a
            href={`mailto:${contactEmail}`}
            title={t.email}
            aria-label={t.email}
          >
            <Icon name="mail" size={18} />
            <span className="quick-link-text">{t.email}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}

/**
 * The tabline: over the explorer, its toggle and the brand; then the buffers;
 * then search, quick links and language. Below the desktop width the explorer
 * opens as a dialog from here.
 */
export function TabLine({
  locale,
  route,
  files,
  languageLinks,
  explorer,
}: {
  locale: Locale;
  route: RouteDescriptor;
  files: WorkspaceFiles;
  languageLinks: LanguageLink[];
  explorer: ExplorerToggle;
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
    <header className="tabline">
      <div className="tabline-offset">
        <span className="desktop-explorer-toggle requires-js">
          <button
            type="button"
            className="icon-button"
            aria-controls={explorer.id}
            aria-expanded={explorer.expanded}
            aria-label={explorer.label}
            title={explorer.label}
            onClick={explorer.onToggle}
          >
            <Icon name="sidebar" size={18} />
          </button>
        </span>
        <BrandLogo placement="header" locale={locale} />
      </div>
      <Buffers locale={locale} route={route} />
      <div className="tabline-tools">
        <a className="tabline-search" href={`/${locale}/search/#search`}>
          <Icon name="search" size={15} />
          <span className="tabline-search-text">{t.searchSite}</span>
          <kbd aria-hidden="true">/</kbd>
        </a>
        <QuickLinks locale={locale} className="quick-links" />
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
          title={t.openMenu}
          onClick={openMenu}
        >
          <Icon name="sidebar" />
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
          <h2 id="menu-dialog-title">
            <Icon name="folder-open" size={16} />
            {t.menuTitle}
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label={t.closeMenu}
            title={t.closeMenu}
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
        <p className="menu-dialog-label">
          <Icon name="globe" size={14} />
          {t.language}
        </p>
        <LanguageList
          locale={locale}
          links={languageLinks}
          preserveSearch={preserveSearch}
          className="menu-dialog-languages"
        />
        <QuickLinks locale={locale} className="menu-dialog-links" />
      </dialog>
    </header>
  );
}
