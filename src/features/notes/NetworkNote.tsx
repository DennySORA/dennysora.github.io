import { useEffect, useRef } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { ArticleCover } from '../../components/ArticleCover.tsx';
import type { ArticleCoverData } from '../../lib/article-covers.ts';
import { enhanceNetworkNote } from './network-note-tools.ts';
import { htmlLang, type Locale } from '../../i18n/index.ts';

/** Repository-reviewed static content, enhanced only by our bounded local tools. */
export function NetworkNote({
  html,
  locale,
  cover,
}: {
  html: string;
  locale: Locale;
  cover: ArticleCoverData | null;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () => (root.current ? enhanceNetworkNote(root.current, locale) : undefined),
    [html, locale],
  );
  return (
    <div className="network-note buffer">
      <ArticleCover cover={cover} />
      <article
        ref={root}
        lang={htmlLang[locale]}
        aria-labelledby="network-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
