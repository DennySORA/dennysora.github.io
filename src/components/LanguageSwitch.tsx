import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import {
  dictionaries,
  htmlLang,
  localeNames,
  type Locale,
} from '../i18n/index.ts';
import { Icon } from './Icon.tsx';
import { useHydrated } from './useHydrated.ts';

export type LanguageLink = { locale: Locale; href: string | null };

function useSearchSuffix(preserve: boolean): string {
  const hydrated = useHydrated();
  const { search } = useLocation();
  // Filters use language-neutral ids, so the Library keeps them across languages.
  return hydrated && preserve ? search : '';
}

export function LanguageList({
  locale,
  links,
  preserveSearch = false,
  className,
}: {
  locale: Locale;
  links: LanguageLink[];
  preserveSearch?: boolean;
  className: string;
}) {
  const t = dictionaries[locale];
  const suffix = useSearchSuffix(preserveSearch);
  return (
    <ul className={className} aria-label={t.language}>
      {links.map(({ locale: target, href }) => (
        <li key={target}>
          {href ? (
            <a
              href={href + suffix}
              hrefLang={htmlLang[target]}
              lang={htmlLang[target]}
              aria-current={target === locale ? 'true' : undefined}
            >
              {localeNames[target]}
            </a>
          ) : (
            <span className="language-unavailable">
              <span lang={htmlLang[target]}>{localeNames[target]}</span>
              <span className="sr-only">（{t.unavailableTranslation}）</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Compact desktop menu built on native details, so it also works without JavaScript. */
export function LanguageMenu({
  locale,
  links,
  preserveSearch,
}: {
  locale: Locale;
  links: LanguageLink[];
  preserveSearch: boolean;
}) {
  const t = dictionaries[locale];
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const element = menu.current;
    if (!element) return;
    function close(event: Event) {
      if (!element?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        element.open = false;
        element.querySelector('summary')?.focus();
        return;
      }
      if (event.target instanceof Node && !element.contains(event.target))
        element.open = false;
    }
    document.addEventListener('keydown', close);
    document.addEventListener('click', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('click', close);
    };
  }, []);
  return (
    <details className="language-menu" ref={menu}>
      <summary>
        <Icon name="globe" size={18} />
        <span className="sr-only">{t.language}：</span>
        <span>{localeNames[locale]}</span>
      </summary>
      <LanguageList
        locale={locale}
        links={links}
        preserveSearch={preserveSearch}
        className="language-menu-list"
      />
    </details>
  );
}
