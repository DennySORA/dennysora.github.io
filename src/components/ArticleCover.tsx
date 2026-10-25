import type { ArticleCoverData } from '../lib/article-covers.ts';

/** Same-origin, no-JavaScript artwork; the body and all translated headings stay intact. */
export function ArticleCover({ cover }: { cover: ArticleCoverData | null }) {
  if (!cover) return null;
  return (
    <div className="article-cover" data-pagefind-ignore="all">
      <img
        src={cover.src}
        srcSet={`${cover.smallSrc} 640w, ${cover.src} 1200w`}
        sizes="(min-width: 1440px) 1000px, (min-width: 1100px) calc(100vw - 360px), calc(100vw - 48px)"
        width={cover.width}
        height={cover.height}
        alt={cover.alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
