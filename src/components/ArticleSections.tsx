import { useEffect, useRef } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { enhanceContentTabs } from '../lib/content-tabs.ts';
import type { PostSection } from '../lib/post-sections.server.ts';
import { Icon } from './Icon.tsx';
import { Prose } from './Prose.tsx';

export function ArticleSections({
  sections,
  locale,
}: {
  sections: readonly PostSection[];
  locale: Locale;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return enhanceContentTabs(root.current);
    return undefined;
  }, [sections, locale]);
  const label = dictionaries[locale].toc;
  return (
    <div className="article-sections" ref={root}>
      <nav className="sn-tabs" aria-label={label} data-pagefind-ignore="all">
        <div className="sn-tablist" data-tabs="">
          {sections.map((section) => (
            <a
              key={section.id}
              id={`${section.id}-tab`}
              href={`#${section.id}`}
            >
              <Icon name={section.icon} size={16} className="sn-icon" />
              <span>{section.label}</span>
            </a>
          ))}
        </div>
      </nav>
      {sections.map((section) => (
        <section className="sn-tabpanel" id={section.id} key={section.id}>
          <Prose html={section.html} locale={locale} />
        </section>
      ))}
    </div>
  );
}
