import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { Icon } from '../components/Icon.tsx';
import {
  PostCard,
  Prose,
  SectionHeading,
  Toc,
} from '../components/Content.tsx';
import { discussionUrl, topicNames } from '../lib/publication.ts';
export function Article({ data }: { data: PageData }) {
  const { article, locale, posts } = data;
  if (!article) return null;
  const t = dictionaries[locale];
  const topic = article.post.topics[0] ?? 'engineering';
  const discussion = discussionUrl(
    article.post.discussionNumber,
    data.comments.repository,
  );
  return (
    <>
      <a className="back-link" href={`/${locale}/blog/`}>
        <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} size={15} />
        {t.back}
      </a>
      <header className="article-header">
        <div className="article-meta">
          <span className={`topic topic-${topic}`}>
            {topicNames[topic][locale]}
          </span>
          <span>
            {article.edition.translationState === 'original'
              ? t.original
              : t.inherited}
          </span>
        </div>
        <h1>{article.edition.title}</h1>
        <p className="article-summary">{article.edition.summary}</p>
        <div className="article-byline">
          <img src="/assets/avatar.png" alt="" width="30" height="30" />
          <span>{article.post.author}</span>
          <span>·</span>
          <time dateTime={article.post.publishedAt}>
            {article.post.publishedAt}
          </time>
          <span>·</span>
          <span>
            {article.body.minutes} {t.minutes}
          </span>
        </div>
      </header>
      <div className="reading-layout">
        <div>
          <Prose html={article.body.html} locale={locale} />
          <aside className="provenance">
            <h2>{t.provenance}</h2>
            <p>{t.adapted}</p>
            <a href={article.post.source.url}>
              {t.source}
              <Icon name="external" size={13} />
            </a>
          </aside>
          <section className="discussion">
            <Icon name="github" size={25} />
            <h2>{t.discussion}</h2>
            <p>{t.discussionText}</p>
            {discussion ? (
              <a className="button secondary" href={discussion}>
                {t.discuss}
                <Icon name="external" size={16} />
              </a>
            ) : (
              <>
                <p className="discussion-unavailable">
                  {t.discussionUnavailable}
                </p>
                <a className="text-link" href="https://github.com/DennySORA">
                  {t.github}
                  <Icon name="external" size={14} />
                </a>
              </>
            )}
          </section>
        </div>
        <Toc headings={article.body.headings} locale={locale} />
      </div>
      <section className="home-section">
        <SectionHeading number="↳" title={t.related} />
        <div className="blog-grid">
          {posts
            .filter((post) => post.id !== article.post.id)
            .slice(0, 2)
            .map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
        </div>
      </section>
    </>
  );
}
