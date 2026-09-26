import type { ReactNode } from 'react';
import type { TaxonomyLabels } from '../app/page.tsx';
import { dictionaries, formatCompactDate, type Locale } from '../i18n/index.ts';
import type { PostSummary } from '../lib/content.server.ts';
import { TagLinks } from './TagLink.tsx';

export function taxonomyMaps(taxonomy: TaxonomyLabels) {
  return {
    topics: new Map<string, string>(
      taxonomy.topics.map((item) => [item.id, item.label]),
    ),
    types: new Map<string, string>(
      taxonomy.types.map((item) => [item.id, item.label]),
    ),
    tags: new Map<string, string>(
      taxonomy.tags.map((item) => [item.id, item.label]),
    ),
  };
}
export type TaxonomyMaps = ReturnType<typeof taxonomyMaps>;

/** Editorial row: type and date, title, summary, tags, reading time. */
export function ArticleListItem({
  post,
  locale,
  maps,
  headingLevel = 2,
  excerpt,
  extra,
}: {
  post: PostSummary;
  locale: Locale;
  maps: TaxonomyMaps;
  headingLevel?: 2 | 3;
  excerpt?: ReactNode;
  extra?: ReactNode;
}) {
  const t = dictionaries[locale];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const topic = post.topics[0];
  return (
    <article className="article-row">
      <p className="article-row-meta">
        <span className="entity-kind">
          {topic ? maps.topics.get(topic) : null}
          {topic ? ' · ' : null}
          {maps.types.get(post.contentType)}
        </span>
        <time dateTime={post.publishedAt}>
          {formatCompactDate(post.publishedAt)}
        </time>
      </p>
      <Heading className="article-row-title">
        <a href={`/${locale}/blog/${post.slug}/`}>{post.title}</a>
      </Heading>
      <p className="article-row-summary">{excerpt ?? post.summary}</p>
      {extra}
      <div className="article-row-foot">
        <TagLinks
          tagIds={post.tagIds.slice(0, 4)}
          labels={maps.tags}
          locale={locale}
          label={t.tags}
        />
        <span className="article-row-time">{t.readingTime(post.minutes)}</span>
      </div>
    </article>
  );
}
