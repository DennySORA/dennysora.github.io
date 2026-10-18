import { useEffect, useMemo, useState } from 'react';
import { contentTabsChange } from '../lib/content-tabs.ts';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { Heading } from '../lib/markdown.server.ts';

export const tocMinimum = 4;
const activationOffset = 120;

export function tocEntries(headings: readonly Heading[]) {
  return headings.filter((heading) => heading.level <= 3);
}

/** Tracks the section being read. It never writes the URL; only clicks change the hash. */
function useActiveHeading(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const visible = ids.flatMap((id) => {
        const element = document.getElementById(id);
        return element && !element.closest('[hidden]') ? [element] : [];
      });
      let current = visible[0]?.id ?? null;
      for (const element of visible)
        if (element.getBoundingClientRect().top <= activationOffset)
          current = element.id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener(contentTabsChange, schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener(contentTabsChange, schedule);
    };
  }, [ids]);
  return active;
}

function TocList({
  entries,
  active,
}: {
  entries: Heading[];
  active: string | null;
}) {
  return (
    <ol>
      {entries.map((heading) => (
        <li
          key={heading.id}
          className={heading.level === 3 ? 'toc-child' : undefined}
        >
          <a
            href={`#${heading.id}`}
            aria-current={active === heading.id ? 'location' : undefined}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function TableOfContents({
  headings,
  locale,
}: {
  headings: readonly Heading[];
  locale: Locale;
}) {
  const entries = tocEntries(headings);
  const ids = useMemo(
    () => tocEntries(headings).map((entry) => entry.id),
    [headings],
  );
  const active = useActiveHeading(ids);
  const t = dictionaries[locale];
  return (
    <aside className="toc-aside" aria-labelledby="toc-aside-title">
      <nav aria-labelledby="toc-aside-title">
        <p id="toc-aside-title" className="toc-title">
          {t.toc}
        </p>
        <TocList entries={entries} active={active} />
      </nav>
    </aside>
  );
}

/** Collapsed contents for narrow layouts, placed after the article header. */
export function InlineTableOfContents({
  headings,
  locale,
}: {
  headings: readonly Heading[];
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <details className="toc-inline">
      <summary>{t.toc}</summary>
      <nav aria-label={t.toc}>
        <TocList entries={tocEntries(headings)} active={null} />
      </nav>
    </details>
  );
}
