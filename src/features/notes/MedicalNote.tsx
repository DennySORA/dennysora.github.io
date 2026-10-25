import { EndOfBuffer } from '../../components/Buffer.tsx';
import { ArticleCover } from '../../components/ArticleCover.tsx';
import type { ArticleCoverData } from '../../lib/article-covers.ts';
import { htmlLang, type Locale } from '../../i18n/index.ts';

/** A reviewed, build-time HTML fragment; never accepts visitor-supplied HTML. */
export function MedicalNote({
  html,
  locale,
  cover,
}: {
  html: string;
  locale: Locale;
  cover: ArticleCoverData | null;
}) {
  return (
    <div className="medical-note buffer">
      <ArticleCover cover={cover} />
      <article
        lang={htmlLang[locale]}
        aria-labelledby="medical-title"
        data-pagefind-ignore="all"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
