import { useSyncExternalStore } from 'react';
import { dictionaries, htmlLang, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { siteRepositoryUrl } from '../lib/site.ts';
import { filePath } from '../lib/workspace.ts';
import { Icon } from './Icon.tsx';

// Vim-style status line. Everything it shows is true of the page: the mode
// follows text focus, the position follows the scroll, the branch is the one
// this site is built from.

function subscribeFocus(update: () => void) {
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', update);
  return () => {
    document.removeEventListener('focusin', update);
    document.removeEventListener('focusout', update);
  };
}
function editorMode(): 'NORMAL' | 'INSERT' {
  const element = document.activeElement;
  return element instanceof HTMLElement &&
    (element.matches(
      'input:not([type=checkbox], [type=radio], [type=button], [type=submit]), textarea',
    ) ||
      element.isContentEditable)
    ? 'INSERT'
    : 'NORMAL';
}

function subscribeScroll(update: () => void) {
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}
/** Vim's ruler position: All, Top, Bot or a percentage through the buffer. */
function scrollPosition(): string {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 'All';
  if (window.scrollY <= 0) return 'Top';
  if (window.scrollY >= max - 1) return 'Bot';
  return `${Math.round((window.scrollY / max) * 100)}%`;
}

export function StatusBar({
  locale,
  route,
}: {
  locale: Locale;
  route: RouteDescriptor;
}) {
  const t = dictionaries[locale];
  const mode = useSyncExternalStore(subscribeFocus, editorMode, () => 'NORMAL');
  const position = useSyncExternalStore(
    subscribeScroll,
    scrollPosition,
    () => 'Top',
  );
  return (
    <nav className="statusbar" aria-label={t.siteSource}>
      <span className="status-mode" data-mode={mode} aria-hidden="true">
        {mode}
      </span>
      <a
        className="status-item"
        href={siteRepositoryUrl}
        aria-label={t.siteSource}
      >
        <Icon name="branch" size={14} />
        main
      </a>
      <span className="status-item status-file" aria-hidden="true">
        {filePath(route)}
      </span>
      <span className="status-spacer" />
      <span className="status-item status-optional" aria-hidden="true">
        {htmlLang[locale]}
      </span>
      <span className="status-item status-optional" aria-hidden="true">
        UTF-8
      </span>
      <span className="status-item status-optional" aria-hidden="true">
        Markdown
      </span>
      <span className="status-item status-position" aria-hidden="true">
        {position}
      </span>
    </nav>
  );
}
