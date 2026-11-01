import { use, useEffect, useRef } from 'react';
import { loadFanLabModule } from './fan-lab-module.ts';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { ArticleCover } from '../../components/ArticleCover.tsx';
import type { ArticleCoverData } from '../../lib/article-covers.ts';
import { enhanceCollectionNote } from './collection-note-tools.ts';
import { htmlLang, type Locale } from '../../i18n/index.ts';

function FanNoteLab({ locale }: { locale: Locale }) {
  const { FanLab } = use(loadFanLabModule());
  return <FanLab locale={locale} />;
}

/** A reviewed static fragment; local tools only toggle or recompute what it already shows. */
export function CollectionNote({
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
    () =>
      root.current ? enhanceCollectionNote(root.current, locale) : undefined,
    [html, locale],
  );
  return (
    <div className="study-note buffer">
      <ArticleCover cover={cover} />
      <article
        ref={root}
        lang={htmlLang[locale]}
        aria-labelledby="note-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {html.includes('id="fan-lab-anchor"') ? (
        <FanNoteLab locale={locale} />
      ) : null}
      <EndOfBuffer />
    </div>
  );
}
