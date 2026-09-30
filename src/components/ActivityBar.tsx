import type { Ref } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { contactEmail, githubUrl, papersUrl } from '../lib/site.ts';
import { areaState } from '../lib/workspace.ts';
import { Icon, type IconName } from './Icon.tsx';

type Item = {
  href: string;
  icon: IconName;
  label: string;
  current?: 'page' | 'true' | undefined;
};

/** Icon-only quick links; every one has a visible tooltip and an accessible name. */
export function ActivityBar({
  locale,
  route,
  explorerId,
  explorerExpanded,
  explorerLabel,
  explorerToggleRef,
  onToggleExplorer,
}: {
  locale: Locale;
  route: RouteDescriptor;
  explorerId: string;
  explorerExpanded: boolean;
  explorerLabel: string;
  explorerToggleRef: Ref<HTMLButtonElement>;
  onToggleExplorer: () => void;
}) {
  const t = dictionaries[locale];
  const top: Item[] = [
    {
      href: `/${locale}/`,
      icon: 'files',
      label: `README.md — ${t.navAbout}`,
      current: areaState(route, 'home'),
    },
    {
      href: `/${locale}/blog/#search`,
      icon: 'search',
      label: t.searchArticles,
    },
    {
      href: `/${locale}/blog/`,
      icon: 'book',
      label: t.navLibrary,
      current: areaState(route, 'library'),
    },
    {
      href: `/${locale}/projects/`,
      icon: 'package',
      label: t.navProjects,
      current: areaState(route, 'projects'),
    },
    {
      href: papersUrl,
      icon: 'newspaper',
      label: `${t.navPapers}（${t.newTab}）`,
    },
  ];
  const bottom: Item[] = [
    { href: githubUrl, icon: 'github', label: `GitHub（${t.newTab}）` },
    { href: `mailto:${contactEmail}`, icon: 'mail', label: t.email },
  ];
  const render = (items: Item[]) =>
    items.map((item) => (
      <li key={item.href}>
        <a
          href={item.href}
          aria-label={item.label}
          title={item.label}
          aria-current={item.current}
        >
          <Icon name={item.icon} size={22} />
        </a>
      </li>
    ));
  return (
    <nav className="activitybar" aria-label={t.activityBar}>
      <ul>
        <li className="desktop-explorer-toggle requires-js">
          <button
            ref={explorerToggleRef}
            type="button"
            aria-controls={explorerId}
            aria-expanded={explorerExpanded}
            aria-label={explorerLabel}
            title={explorerLabel}
            onClick={onToggleExplorer}
          >
            <Icon name="menu" size={22} />
          </button>
        </li>
        {render(top)}
      </ul>
      <ul>{render(bottom)}</ul>
    </nav>
  );
}
