import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { ViewData } from '../../app/page.tsx';
import {
  ArticleListItem,
  taxonomyMaps,
  type TaxonomyMaps,
} from '../../components/ArticleListItem.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { useHydrated } from '../../components/useHydrated.ts';
import { dictionaries, localeNames, type Locale } from '../../i18n/index.ts';
import type { PostSummary } from '../../lib/content.server.ts';
import { parseExcerpt } from '../../lib/excerpt.ts';
import {
  effectiveSort,
  emptyLibraryState,
  matchesFilters,
  paginate,
  pagefindFilters,
  parseLibraryState,
  serializeLibraryState,
  toggleTag,
  type LibraryState,
} from '../../lib/library-query.ts';
import { searchArticles, type SearchHit } from '../../lib/pagefind-client.ts';
import { pageIds } from '../../lib/page-ids.ts';
import { parseRoute } from '../../lib/route-manifest.ts';
import { matchSearch } from '../../lib/search.ts';

type LibraryView = Extract<ViewData, { kind: 'library' }>;
type SearchStatus = 'idle' | 'loading' | 'ready' | 'partial';
type Result = {
  post: PostSummary;
  excerpt: string | null;
  sections: SearchHit['sections'];
};

const inputDelay = 220;

function Excerpt({ html }: { html: string }) {
  return (
    <>
      {parseExcerpt(html).map((part, index) =>
        part.mark ? (
          <mark key={index}>{part.text}</mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function Library({
  view,
  locale,
}: {
  view: LibraryView;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const maps = useMemo(() => taxonomyMaps(view.taxonomy), [view.taxonomy]);
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  const known = useMemo(
    () => ({
      topics: view.available.topics,
      types: view.available.types,
      tags: view.available.tags,
    }),
    [view.available],
  );
  // The prerendered page shows the unfiltered list; URL state applies after hydration.
  const state = hydrated ? parseLibraryState(params, known) : emptyLibraryState;
  const query = state.q.trim();
  const sort = effectiveSort(state);

  // The field shows the URL's query unless the reader is editing it.
  const [draft, setDraft] = useState<string | null>(null);
  const inputValue = draft ?? state.q;
  const composing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Back and Forward restore the URL's query, so an unsent edit is dropped.
    const reset = () => setDraft(null);
    window.addEventListener('popstate', reset);
    return () => {
      window.removeEventListener('popstate', reset);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (hydrated && window.location.hash === `#${pageIds.search}`)
      input.current?.focus();
  }, [hydrated]);

  function navigate(next: LibraryState, replace: boolean) {
    void setParams(serializeLibraryState(next), {
      replace,
      preventScrollReset: true,
    });
  }
  // Typing replaces history; choosing a filter pushes it so Back restores the list.
  function commitQuery(value: string, immediate = false) {
    clearTimeout(timer.current);
    const apply = () => navigate({ ...state, q: value, page: 1 }, true);
    if (immediate) apply();
    else timer.current = setTimeout(apply, inputDelay);
  }
  function update(next: Partial<LibraryState>) {
    navigate({ ...state, ...next, page: next.page ?? 1 }, false);
  }
  function clearAll() {
    clearTimeout(timer.current);
    setDraft(null);
    navigate(emptyLibraryState, false);
  }
  function removeCondition(key: string) {
    if (key === 'q') {
      clearTimeout(timer.current);
      setDraft(null);
      update({ q: '' });
    } else if (key === 'topic') update({ topic: null });
    else if (key === 'type') update({ type: null });
    else navigate(toggleTag(state, key.slice('tag:'.length)), false);
  }

  const candidates = view.posts.filter((post) => matchesFilters(post, state));

  // Status derives from the latest answer for the current request; an older
  // request's answer is ignored once its effect has been cleaned up.
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{
    key: string;
    hits: SearchHit[] | null;
  } | null>(null);
  const { topic, type } = state;
  const tagKey = state.tags.join('|');
  const searchKey = JSON.stringify([query, topic, type, tagKey, sort, attempt]);
  useEffect(() => {
    if (!query) return;
    let active = true;
    const filters = pagefindFilters({
      ...emptyLibraryState,
      topic,
      type,
      tags: tagKey ? tagKey.split('|') : [],
    });
    searchArticles(query, filters, sort).then(
      (hits) => {
        if (active) setResponse({ key: searchKey, hits });
      },
      () => {
        if (active) setResponse({ key: searchKey, hits: null });
      },
    );
    return () => {
      active = false;
    };
  }, [searchKey, query, topic, type, tagKey, sort]);
  const status: SearchStatus = !query
    ? 'idle'
    : response?.key !== searchKey
      ? 'loading'
      : response.hits
        ? 'ready'
        : 'partial';
  // While a new answer loads, the previous one stays visible.
  const hits = response?.hits ?? null;

  const results = ((): Result[] => {
    const plain = (post: PostSummary): Result => ({
      post,
      excerpt: null,
      sections: [],
    });
    if (!query) return candidates.map(plain);
    if (!hits)
      return candidates
        .filter((post) =>
          matchSearch(
            {
              id: post.id,
              title: post.title,
              text: post.summary,
              tags: post.tagIds.map((tag) => maps.tags.get(tag) ?? tag),
            },
            query,
            locale,
          ),
        )
        .map(plain);
    const bySlug = new Map(candidates.map((post) => [post.slug, post]));
    return hits.flatMap((hit) => {
      const route = parseRoute(
        new URL(hit.url, 'https://dennysora.me').pathname,
      );
      const post =
        route?.kind === 'article' && route.locale === locale
          ? bySlug.get(route.slug)
          : undefined;
      return post
        ? [{ post, excerpt: hit.excerpt, sections: hit.sections }]
        : [];
    });
  })();
  const page = paginate(results, state.page);

  // Each active condition shows its value and can be removed on its own.
  const conditions: { key: string; name: string; label: string }[] = [
    ...(query
      ? [{ key: 'q', name: query, label: t.queryCondition(query) }]
      : []),
    ...(state.topic
      ? [{ key: 'topic', name: maps.topics.get(state.topic) ?? state.topic }]
      : []),
    ...(state.type
      ? [{ key: 'type', name: maps.types.get(state.type) ?? state.type }]
      : []),
    ...state.tags.map((tag) => ({
      key: `tag:${tag}`,
      name: maps.tags.get(tag) ?? tag,
    })),
  ].map((condition) => ({ label: condition.name, ...condition }));

  return (
    <div className="container library-layout">
      <PageHead eyebrow={t.libraryEyebrow} title={t.libraryTitle}>
        <p className="page-intro">{t.libraryIntro}</p>
      </PageHead>

      <div className="search-block requires-js" id={pageIds.search}>
        <form
          role="search"
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            commitQuery(inputValue, true);
          }}
        >
          <label className="sr-only" htmlFor={pageIds.searchInput}>
            {t.searchLabel}
          </label>
          <div className="search-field">
            <Icon name="search" />
            <input
              ref={input}
              id={pageIds.searchInput}
              type="search"
              value={inputValue}
              maxLength={160}
              autoComplete="off"
              placeholder={t.searchPlaceholder}
              aria-describedby="search-scope"
              onChange={(event) => {
                setDraft(event.target.value);
                if (!composing.current) commitQuery(event.target.value);
              }}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={(event) => {
                composing.current = false;
                commitQuery(event.currentTarget.value);
              }}
            />
            {inputValue ? (
              <button
                type="button"
                className="icon-button"
                aria-label={t.clearSearch}
                onClick={() => {
                  setDraft(null);
                  commitQuery('', true);
                  input.current?.focus();
                }}
              >
                <Icon name="close" />
              </button>
            ) : null}
          </div>
          <p className="search-scope fine" id="search-scope">
            {t.searchScope(localeNames[locale])}
          </p>
        </form>

        <FilterRow
          label={t.topicFilter}
          allLabel={t.allFilter}
          options={view.available.topics.map((id) => ({
            id,
            label: maps.topics.get(id) ?? id,
          }))}
          selected={state.topic}
          onSelect={(topic) => update({ topic })}
        />
        {view.available.types.length > 1 ? (
          <FilterRow
            label={t.typeFilter}
            allLabel={t.allFilter}
            options={view.available.types.map((id) => ({
              id,
              label: maps.types.get(id) ?? id,
            }))}
            selected={state.type}
            onSelect={(type) => update({ type })}
          />
        ) : null}
        <div
          className="filter-row tag-filter"
          role="group"
          aria-label={`${t.tagFilter}（${t.tagFilterHint}）`}
        >
          <span className="filter-label" aria-hidden="true">
            {t.tagFilter}
          </span>
          {view.available.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-toggle"
              aria-pressed={state.tags.includes(tag)}
              onClick={() => navigate(toggleTag(state, tag), false)}
            >
              <span className="tag-toggle-mark" aria-hidden="true">
                {state.tags.includes(tag) ? '✓' : '#'}
              </span>
              {maps.tags.get(tag) ?? tag}
            </button>
          ))}
        </div>
      </div>

      <div className="no-js-only nojs-notice">
        <p>{t.noJsSearch}</p>
        <p>
          <span>{t.browseByTopic}：</span>
          {view.available.topics.map((id) => (
            <a key={id} href={`/${locale}/blog/topics/${id}/`}>
              {maps.topics.get(id)}
            </a>
          ))}
          <a href={`/${locale}/blog/tags/`}>{t.allTags}</a>
        </p>
      </div>

      {status === 'partial' ? (
        <div className="notice requires-js" data-status="warning" role="status">
          <Icon name="alert" size={18} />
          <p>{t.partialNotice}</p>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => setAttempt((n) => n + 1)}
          >
            <Icon name="retry" size={18} />
            {t.retry}
          </button>
        </div>
      ) : null}

      <div className="results-head">
        <p role="status" aria-live="polite" className="result-count">
          {status === 'loading' ? t.searching : t.articleCount(results.length)}
          {state.tags.length > 1 ? ` · ${t.anyTagSelected}` : null}
        </p>
        {query ? (
          <div
            className="sort-toggle requires-js"
            role="group"
            aria-label={t.sortLabel}
          >
            {(['relevance', 'latest'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={sort === mode}
                onClick={() => update({ sort: mode })}
              >
                {mode === 'relevance' ? t.sortRelevance : t.sortLatest}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {conditions.length ? (
        <ul
          className="active-conditions requires-js"
          aria-label={t.activeConditions}
        >
          {conditions.map((condition) => (
            <li key={condition.key}>
              <button
                type="button"
                onClick={() => removeCondition(condition.key)}
                aria-label={t.removeCondition(condition.name)}
              >
                {condition.label}
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
          {conditions.length > 1 ? (
            <li>
              <button type="button" className="clear-all" onClick={clearAll}>
                {t.clearAll}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="article-list" aria-busy={status === 'loading'}>
        {page.items.map(({ post, excerpt, sections }) => (
          <ArticleListItem
            key={post.id}
            post={post}
            locale={locale}
            maps={maps}
            excerpt={excerpt ? <Excerpt html={excerpt} /> : undefined}
            extra={<Sections sections={sections} label={t.matchedSection} />}
          />
        ))}
      </div>

      {results.length === 0 && status !== 'loading' ? (
        <div className="empty-state">
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyText}</p>
          <button
            type="button"
            className="button button-quiet"
            onClick={clearAll}
          >
            {t.clearAll}
          </button>
        </div>
      ) : null}

      {page.totalPages > 1 ? (
        <Pager
          page={page.page}
          total={page.totalPages}
          locale={locale}
          onPage={(value) => update({ page: value })}
        />
      ) : null}

      <aside className="quiet-note" aria-labelledby="library-papers-title">
        <div>
          <h2 id="library-papers-title">{t.papersNoteTitle}</h2>
          <p>{t.papersNoteText}</p>
        </div>
        <a className="text-action" href={`/${locale}/papers/`}>
          {t.goToPapers}
          <Icon name="arrow" size={18} />
        </a>
      </aside>
    </div>
  );
}

function FilterRow({
  label,
  allLabel,
  options,
  selected,
  onSelect,
}: {
  label: string;
  allLabel: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="filter-row" role="group" aria-label={label}>
      <span className="filter-label" aria-hidden="true">
        {label}
      </span>
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selected === option.id}
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Sections({
  sections,
  label,
}: {
  sections: SearchHit['sections'];
  label: string;
}) {
  if (!sections.length) return null;
  return (
    <ul className="matched-sections" aria-label={label}>
      {sections.map((section) => (
        <li key={section.url}>
          <a href={section.url}>{section.title}</a>
          <p>
            <Excerpt html={section.excerpt} />
          </p>
        </li>
      ))}
    </ul>
  );
}

function Pager({
  page,
  total,
  locale,
  onPage,
}: {
  page: number;
  total: number;
  locale: Locale;
  onPage: (page: number) => void;
}) {
  const t = dictionaries[locale];
  return (
    <nav className="pager" aria-label={t.pagination}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        {t.previousPage}
      </button>
      <span>{t.pageStatus(page, total)}</span>
      <button
        type="button"
        disabled={page >= total}
        onClick={() => onPage(page + 1)}
      >
        {t.nextPage}
      </button>
    </nav>
  );
}

export type { TaxonomyMaps };
