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
}: {
  locale: Locale;
  route: RouteDescriptor;
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
      <ul>{render(top)}</ul>
      <ul>{render(bottom)}</ul>
    </nav>
  );
}
