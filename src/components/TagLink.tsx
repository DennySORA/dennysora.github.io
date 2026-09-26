import type { Locale } from '../i18n/index.ts';

/** Tags on articles are plain links to their static tag page. */
export function TagLinks({
  tagIds,
  labels,
  locale,
  label,
}: {
  tagIds: readonly string[];
  labels: ReadonlyMap<string, string>;
  locale: Locale;
  label: string;
}) {
  if (tagIds.length === 0) return null;
  return (
    <ul className="tag-links" aria-label={label}>
      {tagIds.map((id) => (
        <li key={id}>
          <a className="tag-link" href={`/${locale}/blog/tags/${id}/`}>
            {labels.get(id) ?? id}
          </a>
        </li>
      ))}
    </ul>
  );
}
