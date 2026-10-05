import { dictionaries, type Locale } from '../i18n/index.ts';
import { escapeHtml } from './html.ts';
import type { LocalizedText } from './schema.ts';

type Tag = { id: string; label: LocalizedText };

/** Add real taxonomy links to a reviewed static note without changing its anchors. */
export function addNoteTags(
  html: string,
  tagIds: readonly string[],
  taxonomy: readonly Tag[],
  locale: Locale = 'zh-hant',
): string {
  if (!tagIds.length) throw new Error('A note needs at least one tag');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html))
    throw new Error('Missing note title for tags');
  const links = tagIds
    .map((id) => {
      const tag = taxonomy.find((item) => item.id === id);
      if (!tag) throw new Error(`Unknown note tag: ${id}`);
      return `<li><a class="tag-link" href="/${locale}/search/?tag=${encodeURIComponent(id)}" data-content-tag="${escapeHtml(id)}">${escapeHtml(tag.label[locale])}</a></li>`;
    })
    .join('');
  const tags = `<ul class="ln tag-links content-tags" aria-label="${escapeHtml(dictionaries[locale].tags)}">${links}</ul>`;
  return html.replace(
    /(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,
    (title) => `${title}\n${tags}`,
  );
}
