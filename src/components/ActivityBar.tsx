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
  caption: string;
  sprite?: number;
  current?: 'page' | 'true' | undefined;
};

/** Named quick links expose their destination without requiring a hover. */
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
  const captions = {
    'zh-hant': {
      home: '自我介紹',
      search: '搜尋',
      blog: '部落格',
      notes: '筆記',
      papers: '論文日報',
      mail: '電子郵件',
      explorer: '總管',
    },
    en: {
      home: 'About',
      search: 'Search',
      blog: 'Blog',
      notes: 'Notes',
      papers: 'Paper Daily',
      mail: 'Email',
      explorer: 'Explorer',
    },
    ja: {
      home: '自己紹介',
      search: '検索',
      blog: 'ブログ',
      notes: 'ノート',
      papers: '論文デイリー',
      mail: 'メール',
      explorer: 'エクスプローラー',
    },
  }[locale];
  const top: Item[] = [
    {
      href: `/${locale}/`,
      icon: 'files',
      label: `README.md — ${t.navAbout}`,
      caption: captions.home,
      sprite: 0,
      current: areaState(route, 'home'),
    },
    {
      href: `/${locale}/blog/#search`,
      icon: 'search',
      label: t.searchArticles,
      caption: captions.search,
      sprite: 1,
    },
    {
      href: `/${locale}/blog/`,
      icon: 'book',
      label: t.navLibrary,
      caption: captions.blog,
      sprite: 2,
      current: areaState(route, 'library'),
    },
    {
      href: `/${locale}/note/`,
      icon: 'folder',
      label: captions.notes,
      caption: captions.notes,
      sprite: 3,
      current: areaState(route, 'notes'),
    },
    {
      href: papersUrl,
      icon: 'newspaper',
      label: `${t.navPapers}（${t.newTab}）`,
      caption: captions.papers,
      sprite: 4,
    },
  ];
  const bottom: Item[] = [
    {
      href: githubUrl,
      icon: 'github',
      label: `GitHub（${t.newTab}）`,
      caption: 'GitHub',
    },
    {
      href: `mailto:${contactEmail}`,
      icon: 'mail',
      label: captions.mail,
      caption: captions.mail,
    },
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
          {item.sprite === undefined ? (
            <Icon name={item.icon} size={22} />
          ) : (
            <span
              className="activity-art"
              data-sprite={item.sprite}
              aria-hidden="true"
            />
          )}
          <span className="activity-label" aria-hidden="true">
            {item.caption}
          </span>
          {item.href === papersUrl ? (
            <span className="activity-external" aria-hidden="true">
              ↗
            </span>
          ) : null}
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
            <span className="activity-label" aria-hidden="true">
              {captions.explorer}
            </span>
          </button>
        </li>
        {render(top)}
      </ul>
      <ul>{render(bottom)}</ul>
    </nav>
  );
}
