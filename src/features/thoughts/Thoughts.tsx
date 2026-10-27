import { pageIds } from '../../lib/page-ids.ts';
import { dictionaries, formatDate, type Locale } from '../../i18n/index.ts';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { CopyButton } from '../../components/CopyButton.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { Prose } from '../../components/Prose.tsx';
import {
  InlineTableOfContents,
  TableOfContents,
  tocEntries,
  tocMinimum,
} from '../../components/TableOfContents.tsx';
import { routePath } from '../../lib/route-manifest.ts';
import { siteUrl } from '../../lib/site.ts';
import type {
  ThoughtArticle,
  ThoughtSummary,
} from '../../lib/thoughts.server.ts';

export function Thoughts({
  thoughts,
  locale,
}: {
  thoughts: ThoughtSummary[];
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <div className="container library-layout">
      <PageHead eyebrow={t.thoughtsEyebrow} title={t.navThoughts} icon="pen">
        <p className="ln page-intro">{t.thoughtsIntro}</p>
      </PageHead>
      {thoughts.length ? (
        <div className="article-list">
          {thoughts.map((thought) => (
            <article className="ln article-row" key={thought.slug}>
              <h2 className="article-row-title">
                <a
                  href={routePath({
                    kind: 'thought',
                    locale,
                    slug: thought.slug,
                  })}
                >
                  {thought.title}
                </a>
              </h2>
              <p className="article-row-summary">{thought.summary}</p>
              <p className="article-row-meta">
                <Icon name="clock" size={14} />
                <time dateTime={thought.publishedAt}>
                  {formatDate(thought.publishedAt, locale)}
                </time>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="pen" size={28} />
          <h2 className="ln">{t.thoughtsEmptyTitle}</h2>
          <p>{t.thoughtsEmptyText}</p>
        </div>
      )}
      <EndOfBuffer />
    </div>
  );
}

export function Thought({
  thought,
  locale,
}: {
  thought: ThoughtArticle;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const { body, cover } = thought;
  const showToc = tocEntries(body.headings).length >= tocMinimum;
  return (
    <div className="reader">
      <div className={`reader-shell${showToc ? ' has-toc' : ''}`}>
        <div className="reader-grid">
          <div className="reader-main">
            <a className="backlink" href={`/${locale}/thoughts/`}>
              <Icon name="arrow-left" size={18} />
              {t.backToThoughts}
            </a>
            <article
              className="reader-article"
              aria-labelledby={pageIds.articleTitle}
            >
              {cover ? (
                <div className="article-cover">
                  <img
                    src={cover.src}
                    width={cover.width}
                    height={cover.height}
                    alt={cover.alt}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              ) : null}
              <header className="reader-header">
                <p className="ln eyebrow entity-kind">
                  <Icon name="pen" size={16} />
                  {t.navThoughts}
                </p>
                <h1 id={pageIds.articleTitle} className="ln article-title">
                  {thought.title}
                </h1>
                <p className="ln article-lede">{thought.summary}</p>
                <p className="ln article-byline">
                  <span>
                    <Icon name="clock" size={14} />
                    <span className="sr-only">{t.published} </span>
                    <time dateTime={thought.publishedAt}>
                      {formatDate(thought.publishedAt, locale)}
                    </time>
                  </span>
                  {thought.updatedAt !== thought.publishedAt ? (
                    <span>
                      {t.updated}{' '}
                      <time dateTime={thought.updatedAt}>
                        {formatDate(thought.updatedAt, locale)}
                      </time>
                    </span>
                  ) : null}
                  <span>
                    <Icon name="book" size={14} />
                    {t.readingTime(body.minutes)}
                  </span>
                </p>
                <div className="reader-tools requires-js">
                  <CopyButton
                    value={`${siteUrl}${routePath({ kind: 'thought', locale, slug: thought.slug })}`}
                    label={t.copyLink}
                    success={t.linkCopied}
                    failure={t.copyLinkFailed}
                    variant="text"
                    icon="link"
                  />
                </div>
                {showToc ? (
                  <InlineTableOfContents
                    headings={body.headings}
                    locale={locale}
                  />
                ) : null}
              </header>
              <Prose html={body.html} locale={locale} />
            </article>
            <EndOfBuffer />
          </div>
          {showToc ? (
            <TableOfContents headings={body.headings} locale={locale} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
