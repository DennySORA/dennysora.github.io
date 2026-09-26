import { useEffect, type ReactNode } from 'react';
import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { legacyDestinations } from '../lib/legacy-anchors.ts';
import { pageIds } from '../lib/page-ids.ts';
import { SiteFooter } from './SiteFooter.tsx';
import { SiteHeader } from './SiteHeader.tsx';

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  );
}

export function SiteLayout({
  data,
  children,
}: {
  data: PageData;
  children: ReactNode;
}) {
  const { locale, route, languageLinks } = data;
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
    return () => document.removeEventListener('keydown', shortcut);
  }, [locale, route.kind]);
  return (
    <>
      <a className="skip-link" href={`#${pageIds.main}`}>
        {t.skip}
      </a>
      <SiteHeader locale={locale} route={route} languageLinks={languageLinks} />
      <main id={pageIds.main} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter
        locale={locale}
        languageLinks={languageLinks}
        preserveSearch={route.kind === 'library'}
      />
    </>
  );
}
