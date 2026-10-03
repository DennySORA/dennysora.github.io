import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHead } from '../../components/PageHead.tsx';
import { Icon } from '../../components/Icon.tsx';
import { useHydrated } from '../../components/useHydrated.ts';
import { htmlLang, localeNames, type Locale } from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';
import {
  parseSearchIndex,
  parseSiteSearch,
  searchExcerpt,
  searchKinds,
  searchSite,
  type SiteSearchDocument,
} from '../../lib/site-search.ts';
import { searchCopy } from './search-copy.ts';

export function SiteSearch({ locale }: { locale: Locale }) {
  const t = searchCopy[locale];
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  const state = parseSiteSearch(hydrated ? params : new URLSearchParams());
  const input = useRef<HTMLInputElement>(null);
  const kindSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (input.current) input.current.value = state.q;
    if (kindSelect.current) kindSelect.current.value = state.kind;
  }, [state.q, state.kind]);
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
    ? searchSite(response.documents, state.q, state.kind, locale)
    : [];
  const clear = () => {
    void setParams({}, { preventScrollReset: true });
    input.current?.focus();
  };
  return (
    <div className="container site-search">
      <PageHead eyebrow="SEARCH" title={t.title}>
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
            const q =
              typeof queryValue === 'string'
                ? queryValue.slice(0, 160).trim()
                : '';
            const kind = typeof kindValue === 'string' ? kindValue : 'all';
            if (q) next.set('q', q);
            if (kind !== 'all') next.set('kind', kind);
            void setParams(next, { preventScrollReset: true });
          }}
        >
          <label className="sr-only" htmlFor={pageIds.searchInput}>
            {t.title}
          </label>
          <div className="ln search-field">
            <Icon name="search" />
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
            <label htmlFor="site-search-kind">{t.filter}</label>
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
            <button type="submit" className="button">
              {t.submit}
            </button>
            {state.q || state.kind !== 'all' ? (
              <button type="button" className="button" onClick={clear}>
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
            {t.retry}
          </button>
        ) : null}
        <section aria-label={t.title} aria-busy={loading}>
          {!loading && !failed && results.length === 0 ? (
            <div className="empty-state">
              <h2>{t.empty}</h2>
              <p>{t.emptyHint}</p>
              <button type="button" className="button" onClick={clear}>
                {t.clear}
              </button>
            </div>
          ) : null}
          <ul className="site-search-results">
            {!loading && !failed
              ? results.map((result) => (
                  <li key={result.id}>
                    <p className="site-search-meta">
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
      <noscript>
        <p>{t.noJs}</p>
      </noscript>
      <nav className="site-search-browse" aria-label={t.title}>
        <a href={`/${locale}/`}>{t.home}</a>
        <a href={`/${locale}/blog/`}>{t.blog}</a>
        <a href={`/${locale}/note/`}>{t.notes}</a>
      </nav>
    </div>
  );
}
