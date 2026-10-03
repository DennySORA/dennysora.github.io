import { useSyncExternalStore } from 'react';
import { dictionaries, htmlLang, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { siteRepositoryUrl } from '../lib/site.ts';
import { fileKind, filePath } from '../lib/workspace.ts';
import { fileIcons } from './file-icons.ts';
import { Icon } from './Icon.tsx';

// A lualine-style status line and Vim's command line. Everything shown is
// true of the page: the mode follows focus and selection, the position
// follows the scroll, and the branch is the one this site is built from.

type Mode = 'NORMAL' | 'INSERT' | 'VISUAL';

// Only fields that take typed text switch to INSERT; sliders and boxes do not.
const textEntry =
  'input:is(:not([type]), [type=text], [type=search], [type=email], [type=url], [type=tel], [type=password], [type=number]), textarea';

function subscribeMode(update: () => void) {
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', update);
  document.addEventListener('selectionchange', update);
  return () => {
    document.removeEventListener('focusin', update);
    document.removeEventListener('focusout', update);
    document.removeEventListener('selectionchange', update);
  };
}
function editorMode(): Mode {
  const element = document.activeElement;
  if (
    element instanceof HTMLElement &&
    (element.matches(textEntry) || element.isContentEditable)
  )
    return 'INSERT';
  const selection = document.getSelection();
  return selection && !selection.isCollapsed && selection.toString().trim()
    ? 'VISUAL'
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

export function StatusLine({
  locale,
  route,
}: {
  locale: Locale;
  route: RouteDescriptor;
}) {
  const t = dictionaries[locale];
  const mode = useSyncExternalStore(subscribeMode, editorMode, () => 'NORMAL');
  const position = useSyncExternalStore(
    subscribeScroll,
    scrollPosition,
    () => 'Top',
  );
  const kind = fileKind(route);
  const file = filePath(route);
  return (
    <div className="status-group" data-mode={mode}>
      <nav className="statusbar" aria-label={t.siteSource}>
        <span className="status-mode" data-mode={mode} aria-hidden="true">
          {mode}
        </span>
        <a
          className="status-item status-branch"
          href={siteRepositoryUrl}
          aria-label={t.siteSource}
        >
          <Icon name="branch" size={14} />
          main
        </a>
        <span
          className="status-item status-file"
          data-kind={kind}
          aria-hidden="true"
        >
          <Icon name={fileIcons[kind]} size={14} />
          <span className="status-file-name">{file}</span>
        </span>
        <span className="status-spacer" />
        <span className="status-item status-optional" aria-hidden="true">
          {htmlLang[locale]}
        </span>
        <span className="status-item status-optional" aria-hidden="true">
          utf-8
        </span>
        {kind === 'markdown' ? (
          <span
            className="status-item status-optional status-type"
            aria-hidden="true"
          >
            <Icon name="markdown" size={14} />
            markdown
          </span>
        ) : null}
        <span className="status-item status-position" aria-hidden="true">
          {position}
        </span>
      </nav>
      {/* Vim's command line: the mode message, or the open file's name. */}
      <p className="cmdline" aria-hidden="true">
        {mode === 'NORMAL' ? (
          <span className="cmdline-file">&quot;{file}&quot;</span>
        ) : (
          <strong className="cmdline-mode">-- {mode} --</strong>
        )}
      </p>
    </div>
  );
}
