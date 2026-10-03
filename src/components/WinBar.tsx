import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { crumbs, fileKind } from '../lib/workspace.ts';
import { fileIcons } from './file-icons.ts';
import { Icon, type IconName } from './Icon.tsx';

/** The window's winbar: the open page's path, each folder with a page linked. */
export function WinBar({
  locale,
  route,
}: {
  locale: Locale;
  route: RouteDescriptor;
}) {
  const t = dictionaries[locale];
  const path = crumbs(route);
  return (
    <nav className="winbar breadcrumbs" aria-label={t.breadcrumb}>
      <ol>
        {path.map((crumb, index) => {
          const last = index === path.length - 1;
          const icon: IconName =
            index === 0 ? 'home' : last ? fileIcons[fileKind(route)] : 'folder';
          const content = (
            <>
              <Icon name={icon} size={14} />
              {crumb.label}
            </>
          );
          return (
            <li key={`${index}-${crumb.label}`}>
              {crumb.href && !last ? (
                <a href={crumb.href}>{content}</a>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  data-kind={last ? fileKind(route) : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
