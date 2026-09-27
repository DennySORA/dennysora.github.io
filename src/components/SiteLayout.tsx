import { useEffect, type ReactNode } from 'react';
import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { legacyDestinations } from '../lib/legacy-anchors.ts';
import { pageIds } from '../lib/page-ids.ts';
import { ActivityBar } from './ActivityBar.tsx';
import { EditorHead } from './EditorHead.tsx';
import { Explorer } from './Explorer.tsx';
import { SiteFooter } from './SiteFooter.tsx';
import { StatusBar } from './StatusBar.tsx';
import { TitleBar } from './TitleBar.tsx';

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
  useEffect(() => {
    // Old single-page anchors such as /#exp-h continue to their new home.
    const legacy = legacyDestinations[window.location.hash.slice(1)];
    if (route.kind === 'root' && legacy) window.location.replace(legacy);
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
      <div className="workbench">
        <TitleBar
          locale={locale}
          route={route}
          files={workspace}
          languageLinks={languageLinks}
        />
        <div className="activity-column">
          <ActivityBar locale={locale} route={route} />
        </div>
        <div className="sidebar-column">
          <nav className="sidebar" aria-label={t.menuTitle}>
            <p className="sidebar-title" aria-hidden="true">
              {t.menuTitle}
            </p>
            <Explorer locale={locale} route={route} files={workspace} />
          </nav>
        </div>
        <div className="editor">
          <EditorHead locale={locale} route={route} />
          <main id={pageIds.main} tabIndex={-1}>
            {children}
          </main>
          <SiteFooter
            locale={locale}
            languageLinks={languageLinks}
            preserveSearch={route.kind === 'library'}
          />
        </div>
        <StatusBar locale={locale} route={route} />
      </div>
    </>
  );
}
