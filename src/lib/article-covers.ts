/** Only the current page's public, localized cover data crosses the loader boundary. */
export type ArticleCoverData = {
  id: string;
  src: string;
  smallSrc: string;
  socialSrc: string;
  width: number;
  height: number;
  alt: string;
};
