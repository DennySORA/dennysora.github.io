import { dictionaries, type Locale } from '../i18n/index.ts';

/**
 * The published logo is an illustrated mark with no wordmark, so the text name
 * sits beside it. The image is shown unmodified: natural ratio, object-fit:
 * contain, no crop, recolour or filter. If it fails to load, the name and the
 * home link remain.
 */
export function BrandLogo({
  placement,
  locale,
}: {
  placement: 'header' | 'footer';
  locale: Locale;
}) {
  const header = placement === 'header';
  return (
    <a
      className={`brand brand-${placement}`}
      href={`/${locale}/`}
      aria-label={dictionaries[locale].brandHome}
    >
      <img
        className="brand-mark"
        src="/assets/logo.png"
        alt=""
        width={720}
        height={392}
        decoding="async"
        loading={header ? 'eager' : 'lazy'}
        fetchPriority={header ? 'high' : 'auto'}
      />
      <span className="brand-name">DennySORA</span>
    </a>
  );
}
