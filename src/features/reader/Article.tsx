import type { ViewData } from '../../app/page.tsx';
import { taxonomyMaps } from '../../components/ArticleListItem.tsx';
import { CopyButton } from '../../components/CopyButton.tsx';
import { Icon } from '../../components/Icon.tsx';
import { Prose } from '../../components/Prose.tsx';
import {
  InlineTableOfContents,
  TableOfContents,
  tocEntries,
  tocMinimum,
} from '../../components/TableOfContents.tsx';
import {
  dictionaries,
  formatCompactDate,
  formatDate,
  type Locale,
} from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';
import { siteUrl } from '../../lib/site.ts';
import { Comments } from '../comments/Comments.tsx';

type ArticleView = Extract<ViewData, { kind: 'article' }>;

export function Article({
  view,
  locale,
}: {
  view: ArticleView;
  locale: Locale;
}) {
  const { article, related, comments, author, aliases } = view;
  const { post, edition, body } = article;
  const t = dictionaries[locale];
  const maps = taxonomyMaps(view.taxonomy);
  // Short notes skip the side contents; long ones get it from four sections up.
  const showToc = tocEntries(body.headings).length >= tocMinimum;
  const topic = post.topics[0];
  return (
    <div className="reader">
      <div className={`reader-shell${showToc ? ' has-toc' : ''}`}>
        <a className="backlink" href={`/${locale}/blog/`}>
          <Icon name="arrow-left" size={18} />
          {t.backToLibrary}
        </a>
        <div className="reader-grid">
          <div className="reader-main">
            {/* Only the header and the text form the search record for this article. */}
            <article
              className="reader-article"
              data-pagefind-body=""
              data-pagefind-sort={`date:${post.publishedAt}`}
              aria-labelledby={pageIds.articleTitle}
            >
              <header className="reader-header">
                <p className="eyebrow entity-kind">
                  {topic ? (
                    <span data-pagefind-filter={`topic:${topic}`}>
                      {maps.topics.get(topic)}
                    </span>
                  ) : null}
                  {topic ? ' · ' : null}
                  <span data-pagefind-filter={`type:${post.contentType}`}>
                    {maps.types.get(post.contentType)}
                  </span>
                </p>
                <h1 id={pageIds.articleTitle} className="article-title">
                  {edition.title}
                </h1>
                <p className="article-lede">{edition.summary}</p>
                <p className="article-byline" data-pagefind-ignore="index">
                  <span>{post.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <span className="sr-only">{t.published} </span>
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt, locale)}
                    </time>
                  </span>
                  {post.updatedAt !== post.publishedAt ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t.updated}{' '}
                        <time dateTime={post.updatedAt}>
                          {formatDate(post.updatedAt, locale)}
                        </time>
                      </span>
                    </>
                  ) : null}
                  <span aria-hidden="true">·</span>
                  <span>{t.readingTime(body.minutes)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {edition.translationState === 'original'
                      ? t.translationOriginal
                      : t.translationInherited}
                  </span>
                </p>
                {post.tagIds.length ? (
                  <ul className="tag-links" aria-label={t.tags}>
                    {post.tagIds.map((id) => (
                      <li key={id}>
                        <a
                          className="tag-link"
                          href={`/${locale}/blog/tags/${id}/`}
                          data-pagefind-filter={`tag:${id}`}
                          data-search-aliases={(aliases[id] ?? []).join(' ')}
                          data-pagefind-index-attrs="data-search-aliases"
                        >
                          {maps.tags.get(id) ?? id}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div
                  className="reader-tools requires-js"
                  data-pagefind-ignore="all"
                >
                  <CopyButton
                    value={`${siteUrl}/${locale}/blog/${post.slug}/`}
                    label={t.copyLink}
                    success={t.linkCopied}
                    failure={t.copyLinkFailed}
                    variant="text"
                    icon="link"
                  />
                </div>
                {showToc ? (
                  <div data-pagefind-ignore="all">
                    <InlineTableOfContents
                      headings={body.headings}
                      locale={locale}
                    />
                  </div>
                ) : null}
              </header>
              <Prose html={body.html} locale={locale} />
            </article>

            <aside className="source-note" aria-labelledby="source-title">
              <h2 id="source-title" className="source-title">
                {t.provenanceTitle}
              </h2>
              {post.source.kind === 'profile-adaptation' ? (
                <p>{t.adapted}</p>
              ) : null}
              <a href={post.source.url}>
                {t.viewSource}
                <Icon name="external" size={15} />
                <span className="sr-only">（{t.newTab}）</span>
              </a>
            </aside>

            <aside className="author-mini" aria-label={t.aboutAuthor}>
              <img
                src="/assets/avatar.png"
                alt=""
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="author-name">
                  {author.name}{' '}
                  <span lang="zh-Hant">· {author.publicName}</span>
                </p>
                <p>{t.authorNote}</p>
                <a className="text-action" href={`/${locale}/about/`}>
                  {t.aboutAuthor}
                  <Icon name="arrow" size={18} />
                </a>
              </div>
            </aside>

            <Comments view={comments} locale={locale} />

            {related.length ? (
              <section className="related" aria-labelledby="related-title">
                <h2 id="related-title">{t.relatedTitle}</h2>
                <ul className="related-list">
                  {related.map((item) => (
                    <li key={item.id}>
                      <a href={`/${locale}/blog/${item.slug}/`}>{item.title}</a>
                      <span className="fine">
                        {maps.types.get(item.contentType)} ·{' '}
                        {formatCompactDate(item.publishedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          {showToc ? (
            <TableOfContents headings={body.headings} locale={locale} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
