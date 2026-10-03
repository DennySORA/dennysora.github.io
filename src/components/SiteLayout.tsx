import { useEffect, useState, type ReactNode } from 'react';
import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { preferredLocale } from '../lib/preferred-locale.ts';
import { legacyDestinations } from '../lib/legacy-anchors.ts';
import { pageIds } from '../lib/page-ids.ts';
import { Explorer } from './Explorer.tsx';
import { Icon } from './Icon.tsx';
import { StatusLine } from './StatusLine.tsx';
import { TabLine } from './TabLine.tsx';
import { WinBar } from './WinBar.tsx';

const explorerId = 'desktop-explorer';

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  );
}

/**
 * A Neovim-style workbench: tabline, neo-tree explorer, a window with its
 * winbar and the page, then the status line and command line. The document
 * itself scrolls; the chrome is sticky, so links, find-in-page and history
 * behave as on any page. See docs/DESIGN.md.
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
  const explorerLabel = explorerExpanded
    ? t.explorerCollapse
    : t.explorerExpand;
  function toggleExplorer() {
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
      const input =
        route.kind === 'search'
          ? document.getElementById(pageIds.searchInput)
          : null;
      if (input) input.focus();
      else window.location.assign(`/${locale}/search/#search`);
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
        <TabLine
          locale={locale}
          route={route}
          files={workspace}
          languageLinks={languageLinks}
          explorer={{
            id: explorerId,
            expanded: explorerExpanded,
            label: explorerLabel,
            onToggle: toggleExplorer,
          }}
        />
        <div
          id={explorerId}
          className="sidebar-column"
          hidden={!explorerExpanded}
        >
          <nav className="sidebar" aria-label={t.menuTitle}>
            <p className="sidebar-head" aria-hidden="true">
              <Icon name="files" size={14} />
              {t.menuTitle}
            </p>
            <Explorer locale={locale} route={route} files={workspace} />
          </nav>
        </div>
        <div className="editor">
          <WinBar locale={locale} route={route} />
          <main id={pageIds.main} tabIndex={-1}>
            {children}
          </main>
        </div>
        <StatusLine locale={locale} route={route} />
      </div>
    </>
  );
}
