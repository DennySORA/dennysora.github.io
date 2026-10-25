import { useEffect, useReducer, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';
import {
  giscusAttributes,
  giscusOrigin,
  giscusReducer,
  giscusTimeoutMs,
  parseGiscusMessage,
  type CommentsView,
  type FailureReason,
} from '../../lib/comments.ts';
import { pageIds } from '../../lib/page-ids.ts';
import { contactEmail, githubUrl } from '../../lib/site.ts';

export function Comments({
  view,
  locale,
}: {
  view: CommentsView;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <section
      className="comments"
      id={pageIds.comments}
      aria-labelledby={pageIds.commentsTitle}
      data-pagefind-ignore="all"
      data-site-search-ignore=""
    >
      <h2 id={pageIds.commentsTitle}>
        <Icon name="mail" size={20} />
        {t.commentsTitle}
      </h2>
      {view.kind === 'unconfigured' ? (
        <div className="comments-panel" data-state="unconfigured">
          <p className="comments-status">
            <Icon name="info" size={18} />
            {t.commentsUnconfigured}
          </p>
          <p>{t.commentsUnconfiguredText}</p>
          <div className="action-row">
            <a className="text-action resource-link" href={githubUrl}>
              {t.github}
              <Icon name="external" size={16} />
              <span className="sr-only">（{t.newTab}）</span>
            </a>
            <a className="text-action" href={`mailto:${contactEmail}`}>
              {t.email}
            </a>
          </div>
        </div>
      ) : null}
      {view.kind === 'disabled' ? (
        <div className="comments-panel" data-state="disabled">
          <p className="comments-status">
            <Icon name="info" size={18} />
            {t.commentsDisabled}
          </p>
        </div>
      ) : null}
      {view.kind === 'native' ? (
        <div className="comments-panel" data-state="native">
          <p>{t.commentsNative}</p>
          <NativeLink
            url={view.url}
            label={t.commentsOpenGitHub}
            hint={t.newTab}
          />
        </div>
      ) : null}
      {view.kind === 'giscus' ? (
        <GiscusComments
          key={`${locale}:${view.mapping.kind}:${view.mapping.term}`}
          view={view}
          locale={locale}
        />
      ) : null}
    </section>
  );
}

function NativeLink({
  url,
  label,
  hint,
}: {
  url: string;
  label: string;
  hint: string;
}) {
  return (
    <a className="text-action resource-link" href={url}>
      {label}
      <Icon name="external" size={16} />
      <span className="sr-only">（{hint}）</span>
    </a>
  );
}

function GiscusComments({
  view,
  locale,
}: {
  view: Extract<CommentsView, { kind: 'giscus' }>;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const [state, dispatch] = useReducer(giscusReducer, { status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const failures: Record<FailureReason, string> = {
    blocked: t.commentsFailedBlocked,
    missing: t.commentsFailedMissing,
    authentication: t.commentsFailedAuthentication,
    'rate-limit': t.commentsFailedRateLimit,
  };

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let active = true;
    let started = false;
    let script: HTMLScriptElement | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;
    const failed = () => {
      if (active) dispatch({ type: 'script-error' });
    };
    function receive(event: MessageEvent) {
      const frame = container?.querySelector('iframe')?.contentWindow;
      const message = parseGiscusMessage(event, frame, view.mapping);
      if (active && message) dispatch(message);
    }
    function start() {
      if (!active || started || !container) return;
      started = true;
      observer?.disconnect();
      container.replaceChildren();
      script = document.createElement('script');
      script.src = `${giscusOrigin}/client.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      for (const [name, value] of Object.entries(
        giscusAttributes(view.config, view.mapping, locale),
      ))
        script.setAttribute(name, value);
      script.addEventListener('error', failed);
      // Start the slow-network hint only when a request actually starts, not
      // while an auto-loading comment section is still below a long article.
      timeout = setTimeout(() => {
        if (active) dispatch({ type: 'timeout' });
      }, giscusTimeoutMs);
      container.append(script);
    }
    window.addEventListener('message', receive);
    if (attempt > 0 || typeof IntersectionObserver === 'undefined') start();
    else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) start();
        },
        { rootMargin: '320px' },
      );
      observer.observe(container);
    }
    return () => {
      active = false;
      observer?.disconnect();
      clearTimeout(timeout);
      script?.removeEventListener('error', failed);
      window.removeEventListener('message', receive);
      container.replaceChildren();
    };
  }, [attempt, locale, view.config, view.mapping]);

  function load() {
    dispatch({ type: 'load' });
    setAttempt((value) => value + 1);
  }

  return (
    <div className="comments-panel" data-state={state.status}>
      {state.status === 'loading' ? (
        <p className="comments-status requires-js" role="status">
          {t.commentsLoading}
        </p>
      ) : null}
      {state.status === 'slow' ? (
        <div className="notice requires-js" data-status="info" role="status">
          <Icon name="info" size={18} />
          <p>{t.commentsSlow}</p>
          <button type="button" className="button button-quiet" onClick={load}>
            <Icon name="retry" size={18} />
            {t.retry}
          </button>
        </div>
      ) : null}
      {state.status === 'failed' ? (
        <div className="notice" data-status="danger" role="alert">
          <Icon name="alert" size={18} />
          <div>
            <p className="notice-title">{t.commentsFailed}</p>
            <p>{failures[state.reason]}</p>
          </div>
          <button type="button" className="button button-quiet" onClick={load}>
            <Icon name="retry" size={18} />
            {t.retry}
          </button>
        </div>
      ) : null}
      <div key={attempt} ref={host} className="giscus-frame-host" />
    </div>
  );
}
