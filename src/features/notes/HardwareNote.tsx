import { useEffect, useRef } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { enhanceHardwareNote } from './hardware-note-tools.ts';
import { htmlLang, type Locale } from '../../i18n/index.ts';

/** A reviewed static fragment; the local tools only recompute what it already shows. */
export function HardwareNote({
  html,
  locale,
}: {
  html: string;
  locale: Locale;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () =>
      root.current ? enhanceHardwareNote(root.current, locale) : undefined,
    [html, locale],
  );
  return (
    <div className="hardware-note buffer">
      <article
        ref={root}
        lang={htmlLang[locale]}
        aria-labelledby="hardware-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
