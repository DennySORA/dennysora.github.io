import type { ViewData } from '../../app/page.tsx';
import {
  ArticleListItem,
  taxonomyMaps,
} from '../../components/ArticleListItem.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

type TermView = Extract<ViewData, { kind: 'topic' | 'tag' }>;
type TagsView = Extract<ViewData, { kind: 'tags' }>;

/** Static, crawlable Topic and Tag pages that work without JavaScript. */
export function TaxonomyPage({
  view,
  locale,
}: {
  view: TermView;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const maps = taxonomyMaps(view.taxonomy);
  return (
    <div className="container library-layout">
      <a className="backlink" href={`/${locale}/blog/`}>
        <Icon name="arrow-left" size={18} />
        {t.backToLibrary}
      </a>
      <PageHead
        eyebrow={view.kind === 'topic' ? t.topicEyebrow : t.tagEyebrow}
        title={view.term.label}
      >
        {view.term.description ? (
          <p className="page-intro">{view.term.description}</p>
        ) : null}
      </PageHead>
      <div className="results-head">
        <p className="result-count">{t.articleCount(view.posts.length)}</p>
        <a className="text-action" href={`/${locale}/blog/tags/`}>
          {t.allTags}
          <Icon name="arrow" size={18} />
        </a>
      </div>
      <div className="article-list">
        {view.posts.map((post) => (
          <ArticleListItem
            key={post.id}
            post={post}
            locale={locale}
            maps={maps}
          />
        ))}
      </div>
    </div>
  );
}

export function TagIndex({ view, locale }: { view: TagsView; locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <div className="container library-layout">
      <a className="backlink" href={`/${locale}/blog/`}>
        <Icon name="arrow-left" size={18} />
        {t.backToLibrary}
      </a>
      <PageHead eyebrow={t.libraryTitle} title={t.tagsTitle}>
        <p className="page-intro">{t.tagsIntro}</p>
      </PageHead>
      <ul className="tag-index">
        {view.tags.map((tag) => (
          <li key={tag.id}>
            <a className="tag-link" href={`/${locale}/blog/tags/${tag.id}/`}>
              {tag.label}
            </a>
            <span className="fine">{t.articleCount(tag.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
