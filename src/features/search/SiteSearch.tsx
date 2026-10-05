import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHead } from '../../components/PageHead.tsx';
import { Icon, type IconName } from '../../components/Icon.tsx';
import { useHydrated } from '../../components/useHydrated.ts';
import { htmlLang, localeNames, type Locale } from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';
import {
  parseSearchIndex,
  parseSiteSearch,
  searchExcerpt,
  searchKinds,
  searchSite,
  siteSearchTags,
  type SiteSearchDocument,
} from '../../lib/site-search.ts';
import { searchCopy } from './search-copy.ts';

const kindIcons: Record<SiteSearchDocument['kind'], IconName> = {
  article: 'markdown',
  note: 'notebook',
  page: 'file',
};

export function SiteSearch({ locale }: { locale: Locale }) {
  const t = searchCopy[locale];
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  const state = parseSiteSearch(hydrated ? params : new URLSearchParams());
  const input = useRef<HTMLInputElement>(null);
  const kindSelect = useRef<HTMLSelectElement>(null);
  const tagSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (input.current) input.current.value = state.q;
    if (kindSelect.current) kindSelect.current.value = state.kind;
    if (tagSelect.current) tagSelect.current.value = state.tag;
  }, [state.q, state.kind, state.tag]);
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{
    attempt: number;
    documents: SiteSearchDocument[] | null;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/site-search.json', { signal: controller.signal })
      .then((result) => {
        if (!result.ok) throw new Error('Search index unavailable');
        return result.json() as Promise<unknown>;
      })
      .then((value) => {
        const documents = parseSearchIndex(value);
        if (!controller.signal.aborted) setResponse({ attempt, documents });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResponse({ attempt, documents: null });
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    if (hydrated && window.location.hash === `#${pageIds.search}`)
      input.current?.focus();
  }, [hydrated]);
  const loading = response?.attempt !== attempt;
  const failed = !loading && response?.documents === null;
  const results = response?.documents
    ? searchSite(response.documents, state.q, state.kind, locale, state.tag)
    : [];
  const tags = siteSearchTags(response?.documents ?? [], locale);
  const unknownTag = state.tag && !tags.some((tag) => tag.id === state.tag);
  const clear = () => {
    void setParams({}, { preventScrollReset: true });
    input.current?.focus();
  };
  return (
    <div className="container site-search">
      <PageHead
        eyebrow="SEARCH"
        title={t.title}
        art={{
          src: '/assets/illustrations/search-telescope-v1.webp',
          width: 112,
          height: 112,
        }}
      >
        <p className="ln page-intro">{t.intro}</p>
      </PageHead>
      <div id={pageIds.search} className="search-block requires-js">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            const next = new URLSearchParams();
            const queryValue = values.get('q');
            const kindValue = values.get('kind');
            const tagValue = values.get('tag');
            const q =
              typeof queryValue === 'string'
                ? queryValue.slice(0, 160).trim()
                : '';
            const kind = typeof kindValue === 'string' ? kindValue : 'all';
            if (q) next.set('q', q);
            if (kind !== 'all') next.set('kind', kind);
            if (typeof tagValue === 'string' && tagValue)
              next.set('tag', tagValue);
            void setParams(next, { preventScrollReset: true });
          }}
        >
          <label className="sr-only" htmlFor={pageIds.searchInput}>
            {t.title}
          </label>
          <div className="ln search-field telescope-prompt">
            <Icon name="prompt" />
            <input
              ref={input}
              id={pageIds.searchInput}
              name="q"
              type="search"
              defaultValue={state.q}
              maxLength={160}
              placeholder={t.placeholder}
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing && event.key === 'Enter')
                  event.preventDefault();
              }}
            />
          </div>
          <div className="site-search-controls">
            <label htmlFor="site-search-kind">
              <Icon name="list" size={16} />
              {t.filter}
            </label>
            <select
              ref={kindSelect}
              id="site-search-kind"
              name="kind"
              defaultValue={state.kind}
            >
              {searchKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {t[kind]}
                </option>
              ))}
            </select>
            <label htmlFor="site-search-tag">
              <Icon name="tag" size={16} />
              {t.tagFilter}
            </label>
            <select
              key={`${attempt}:${loading}`}
              ref={tagSelect}
              id="site-search-tag"
              name="tag"
              defaultValue={state.tag}
            >
              <option value="">{t.allTags}</option>
              {unknownTag ? (
                <option value={state.tag}>{state.tag}</option>
              ) : null}
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.label[locale]}
                </option>
              ))}
            </select>
            <button type="submit" className="button button-primary">
              <Icon name="search" size={16} />
              {t.submit}
            </button>
            {state.q || state.kind !== 'all' || state.tag ? (
              <button
                type="button"
                className="button button-quiet"
                onClick={clear}
              >
                <Icon name="close" size={16} />
                {t.clear}
              </button>
            ) : null}
          </div>
        </form>
        <p className="search-scope">{t.browse}</p>
        <p role="status" aria-live="polite" className="result-count">
          {loading ? t.loading : failed ? t.error : t.count(results.length)}
        </p>
        {failed ? (
          <button
            className="button"
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <Icon name="retry" size={16} />
            {t.retry}
          </button>
        ) : null}
        <section
          className="telescope-results"
          aria-label={t.title}
          aria-busy={loading}
        >
          {!loading && !failed && results.length === 0 ? (
            <div className="empty-state">
              <Icon name="search" size={28} />
              <h2>{t.empty}</h2>
              <p>{t.emptyHint}</p>
              <button
                type="button"
                className="button button-quiet"
                onClick={clear}
              >
                <Icon name="close" size={16} />
                {t.clear}
              </button>
            </div>
          ) : null}
          <ul className="site-search-results">
            {!loading && !failed
              ? results.map((result) => (
                  <li key={result.id}>
                    <p className="site-search-meta">
                      <Icon name={kindIcons[result.kind]} size={14} />
                      {t[result.kind]} ·{' '}
                      <span lang={htmlLang[result.locale]}>
                        {localeNames[result.locale]}
                      </span>
                    </p>
                    <h2>
                      <a href={result.href} lang={htmlLang[result.locale]}>
                        {result.title}
                      </a>
                    </h2>
                    <p lang={htmlLang[result.locale]}>
                      {searchExcerpt(result, state.q)}
                    </p>
                    {result.locale !== locale ? (
                      <p className="site-search-language">{t.fallback}</p>
                    ) : null}
                    <small className="site-search-path">{result.href}</small>
                  </li>
                ))
              : null}
          </ul>
        </section>
      </div>
      {/* Shown by the head's noscript style, like the blog's no-JS notice. */}
      <p className="no-js-only nojs-notice">{t.noJs}</p>
      <nav className="site-search-browse" aria-label={t.title}>
        <a href={`/${locale}/`}>
          <Icon name="markdown" size={16} />
          {t.home}
        </a>
        <a href={`/${locale}/blog/`}>
          <Icon name="folder" size={16} />
          {t.blog}
        </a>
        <a href={`/${locale}/note/`}>
          <Icon name="notebook" size={16} />
          {t.notes}
        </a>
      </nav>
    </div>
  );
}
