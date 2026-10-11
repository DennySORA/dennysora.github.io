import { useEffect, useRef } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { enhanceCollectionNote } from './collection-note-tools.ts';
import { htmlLang, type Locale } from '../../i18n/index.ts';

/** A reviewed static fragment; local tools only toggle or recompute what it already shows. */
export function CollectionNote({
  html,
  locale,
}: {
  html: string;
  locale: Locale;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () =>
      root.current ? enhanceCollectionNote(root.current, locale) : undefined,
    [html, locale],
  );
  return (
    <div className="study-note buffer">
      <article
        ref={root}
        lang={htmlLang[locale]}
        aria-labelledby="note-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
