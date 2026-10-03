import { useEffect, useRef } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import {
  areas,
  areaState,
  crumbs,
  type Area,
  type AreaKey,
} from '../lib/workspace.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { Icon, type IconName } from './Icon.tsx';

const areaIcons: Record<AreaKey, IconName> = {
  home: 'markdown',
  library: 'folder',
  notes: 'folder',
  papers: 'newspaper',
};

/**
 * Editor tabs are the main navigation: one per area, plus an italic preview
 * tab for the page open inside an area, as a code editor shows a preview.
 */
export function EditorHead({
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
  const preview = landing ? null : path[path.length - 1];
  const previewAfter: AreaKey | null = [
    'article',
    'topic',
    'tags',
    'tag',
  ].includes(route.kind)
    ? 'library'
    : ['medical', 'medical-note', 'network', 'network-note'].includes(
          route.kind,
        )
      ? 'notes'
      : null;
  const tabs = useRef<HTMLUListElement>(null);
  // Keep the active tab in view when the tab row scrolls on narrow screens.
  useEffect(() => {
    const list = tabs.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (list && active && list.scrollWidth > list.clientWidth)
      list.scrollLeft = Math.max(0, active.offsetLeft - 16);
  }, [route]);

  const previewTab = preview ? (
    <li key="preview">
      <span className="tab tab-preview" aria-current="page">
        <Icon name="markdown" size={16} />
        <span className="tab-name">{preview.label}</span>
      </span>
    </li>
  ) : null;
  const tab = (area: Area) => (
    <li key={area.key}>
      <a
        className="tab"
        href={area.href}
        aria-current={areaState(route, area.key)}
        data-area={area.key}
      >
        <Icon name={areaIcons[area.key]} size={16} />
        <span className="tab-name">{area.file}</span>
        <span className="sr-only"> — {labels[area.key]}</span>
        {area.external ? <Icon name="external" size={13} /> : null}
      </a>
    </li>
  );
  return (
    <div className="editor-head">
      <nav className="tabs" aria-label={t.mainNav}>
        <ul ref={tabs}>
          {areas(locale).flatMap((area) =>
            area.key === previewAfter ? [tab(area), previewTab] : [tab(area)],
          )}
          {preview && !previewAfter ? previewTab : null}
        </ul>
      </nav>
      <nav className="breadcrumbs" aria-label={t.breadcrumb}>
        <ol>
          {path.map((crumb, index) => {
            const last = index === path.length - 1;
            return (
              <li key={`${index}-${crumb.label}`}>
                {crumb.href && !last ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
