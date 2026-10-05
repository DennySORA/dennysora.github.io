import type { Locale } from '../i18n/index.ts';

/** Plain links keep tags readable without JavaScript; headers search the whole site. */
export function TagLinks({
  tagIds,
  labels,
  locale,
  label,
  siteSearch = false,
  aliases = {},
}: {
  tagIds: readonly string[];
  labels: ReadonlyMap<string, string>;
  locale: Locale;
  label: string;
  siteSearch?: boolean;
  aliases?: Readonly<Record<string, readonly string[]>>;
}) {
  if (tagIds.length === 0) return null;
  return (
    <ul
      className={siteSearch ? 'ln tag-links content-tags' : 'tag-links'}
      aria-label={label}
    >
      {tagIds.map((id) => (
        <li key={id}>
          <a
            className="tag-link"
            href={
              siteSearch
                ? `/${locale}/search/?tag=${encodeURIComponent(id)}`
                : `/${locale}/blog/tags/${id}/`
            }
            data-content-tag={siteSearch ? id : undefined}
            data-pagefind-filter={siteSearch ? `tag:${id}` : undefined}
            data-search-aliases={
              siteSearch ? (aliases[id] ?? []).join(' ') : undefined
            }
            data-pagefind-index-attrs={
              siteSearch ? 'data-search-aliases' : undefined
            }
          >
            {labels.get(id) ?? id}
          </a>
        </li>
      ))}
    </ul>
  );
}
