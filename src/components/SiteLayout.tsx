import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageData } from '../app/page.tsx';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { preferredLocale } from '../lib/preferred-locale.ts';
import { legacyDestinations } from '../lib/legacy-anchors.ts';
import { pageIds } from '../lib/page-ids.ts';
import { ActivityBar } from './ActivityBar.tsx';
import { EditorHead } from './EditorHead.tsx';
import { Explorer } from './Explorer.tsx';
import { Icon } from './Icon.tsx';
import { StatusBar } from './StatusBar.tsx';
import { TitleBar } from './TitleBar.tsx';

const explorerLabels: Record<Locale, { collapse: string; expand: string }> = {
  'zh-hant': { collapse: '收合檔案總管', expand: '展開檔案總管' },
  en: { collapse: 'Collapse Explorer', expand: 'Expand Explorer' },
  ja: {
    collapse: 'エクスプローラーを折りたたむ',
    expand: 'エクスプローラーを展開',
  },
};
const explorerId = 'desktop-explorer';

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  );
}

/**
 * A code-editor workbench: title bar, activity bar, explorer, editor (tabs,
 * breadcrumbs, the page) and a status line. The document itself scrolls; the
 * chrome is sticky, so links, find-in-page and history behave as on any page.
 */
export function SiteLayout({
  data,
  children,
}: {
  data: PageData;
  children: ReactNode;
}) {
  const { locale, route, languageLinks, workspace } = data;
  const t = dictionaries[locale];
  const [explorerExpanded, setExplorerExpanded] = useState(true);
  const explorerToggle = useRef<HTMLButtonElement>(null);
  const explorerLabel = explorerExpanded
    ? explorerLabels[locale].collapse
    : explorerLabels[locale].expand;
  function toggleExplorer() {
    // Keep focus on an available control when the sidebar header disappears.
    explorerToggle.current?.focus();
    setExplorerExpanded((expanded) => !expanded);
  }
  useEffect(() => {
    // Only the language-neutral entry point follows browser preferences.
    // Explicit locale URLs, including a manual switch, always keep their locale.
    if (route.kind === 'root') {
      const preferred = preferredLocale(
        navigator.languages.length ? navigator.languages : [navigator.language],
      );
      const legacy = legacyDestinations[window.location.hash.slice(1)];
      const target = legacy
        ? new URL(
            legacy.replace('/zh-hant/', `/${preferred}/`),
            window.location.origin,
          )
        : new URL(
            `/${preferred}/${window.location.hash}`,
            window.location.origin,
          );
      target.search = window.location.search;
      window.location.replace(target.href);
      return;
    }
    function shortcut(event: KeyboardEvent) {
      const command =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash =
        event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!command && !slash) return;
      // Never take keys from typing, IME composition or an open dialog.
      if (
        event.isComposing ||
        isEditable(event.target) ||
        document.querySelector('dialog[open]')
      )
        return;
      event.preventDefault();
      const input = document.getElementById(pageIds.searchInput);
      if (input) input.focus();
      else window.location.assign(`/${locale}/blog/#search`);
    }
    document.addEventListener('keydown', shortcut);
    // Marks when `/` and Ctrl/Cmd+K are live; they need the hydrated page.
    document.documentElement.dataset['keys'] = 'ready';
    return () => {
      document.removeEventListener('keydown', shortcut);
      delete document.documentElement.dataset['keys'];
    };
  }, [locale, route.kind]);
  return (
    <>
      <a className="skip-link" href={`#${pageIds.main}`}>
        {t.skip}
      </a>
      <div className="workbench" data-explorer-expanded={explorerExpanded}>
        <TitleBar
          locale={locale}
          route={route}
          files={workspace}
          languageLinks={languageLinks}
        />
        <div className="activity-column">
          <ActivityBar
            locale={locale}
            route={route}
            explorerId={explorerId}
            explorerExpanded={explorerExpanded}
            explorerLabel={explorerLabel}
            explorerToggleRef={explorerToggle}
            onToggleExplorer={toggleExplorer}
          />
        </div>
        <div
          id={explorerId}
          className="sidebar-column"
          hidden={!explorerExpanded}
        >
          <nav className="sidebar" aria-label={t.menuTitle}>
            <div className="sidebar-head">
              <p className="sidebar-title" aria-hidden="true">
                {t.menuTitle}
              </p>
              <button
                type="button"
                className="icon-button sidebar-collapse requires-js"
                aria-controls={explorerId}
                aria-expanded={explorerExpanded}
                aria-label={explorerLabels[locale].collapse}
                title={explorerLabels[locale].collapse}
                onClick={toggleExplorer}
              >
                <Icon name="arrow-left" size={16} />
              </button>
            </div>
            <Explorer locale={locale} route={route} files={workspace} />
          </nav>
        </div>
        <div className="editor">
          <EditorHead locale={locale} route={route} />
          <main id={pageIds.main} tabIndex={-1}>
            {children}
          </main>
        </div>
        <StatusBar locale={locale} route={route} />
      </div>
    </>
  );
}
