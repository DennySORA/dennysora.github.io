import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { PostSummary } from '../lib/content.server.ts';
import { topicNames } from '../lib/publication.ts';
import { matchSearch, type SearchEntry } from '../lib/search.ts';
import { PostCard } from '../components/Content.tsx';
import { Icon } from '../components/Icon.tsx';

export function Search({
  posts,
  locale,
}: {
  posts: PostSummary[];
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const topic = params.get('topic') ?? '';
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (window.location.hash === '#search')
      document.getElementById('search-input')?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/search/${locale}.json`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Index unavailable');
        const value: unknown = await response.json();
        const { parseSearchIndex } = await import('../lib/search-index.ts');
        const result = parseSearchIndex(value, locale);
        if (!controller.signal.aborted) {
          setIndex(result);
          setError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [locale, attempt]);
  const filtered = posts.filter(
    (post) =>
      (!topic || post.topics.some((value) => value === topic)) &&
      (!query ||
        matchSearch(
          index?.find((entry) => entry.id === post.id) ?? {
            id: post.id,
            title: post.title,
            text: post.summary,
            tags: post.topics,
          },
          query,
          locale,
        )),
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    void setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <>
      <div className="search-panel" id="search">
        <label htmlFor="search-input" className="sr-only">
          {t.searchTitle}
        </label>
        <div className="search-input-wrap">
          <Icon name="search" />
          <input
            id="search-input"
            type="search"
            value={query}
            maxLength={160}
            placeholder={t.searchPlaceholder}
            onChange={(event) => update('q', event.target.value)}
          />
          <kbd>/</kbd>
        </div>
        <p className="search-hint">{t.searchHint}</p>
        <div className="filter-bar" role="group" aria-label={t.filter}>
          <button
            type="button"
            aria-pressed={!topic}
            onClick={() => update('topic', '')}
          >
            {t.all}
          </button>
          {(Object.keys(topicNames) as (keyof typeof topicNames)[]).map(
            (key) => (
              <button
                key={key}
                type="button"
                aria-pressed={topic === key}
                onClick={() => update('topic', key)}
              >
                {topicNames[key][locale]}
              </button>
            ),
          )}
        </div>
      </div>
      <noscript>
        <p className="notice">{t.noJs}</p>
      </noscript>
      {error && (
        <div className="notice" role="alert">
          {t.searchError}{' '}
          <button
            type="button"
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            {t.retry}
          </button>
        </div>
      )}
      <p className="result-count" role="status">
        {query && !index && !error
          ? t.loading
          : `${filtered.length} ${t.results}`}
      </p>
      {filtered.length ? (
        <div className="blog-grid">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h2>{t.empty}</h2>
          <p>{t.emptyHint}</p>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              void setParams({}, { replace: true });
            }}
          >
            {t.clear}
          </button>
        </div>
      )}
    </>
  );
}
