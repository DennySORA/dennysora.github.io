import { useEffect, useState } from 'react';
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
      let current = ids[0] ?? null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= activationOffset)
          current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
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
  const [ids] = useState(() => entries.map((entry) => entry.id));
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
