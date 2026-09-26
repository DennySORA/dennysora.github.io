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
    >
      <h2 id={pageIds.commentsTitle}>{t.commentsTitle}</h2>
      <p className="comments-intro">{t.commentsIntro}</p>
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
        <GiscusComments view={view} locale={locale} />
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
  const [state, dispatch] = useReducer(giscusReducer, { status: 'dormant' });
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const failures: Record<FailureReason, string> = {
    timeout: t.commentsFailedTimeout,
    blocked: t.commentsFailedBlocked,
    missing: t.commentsFailedMissing,
  };

  useEffect(() => {
    const container = host.current;
    // Nothing reaches giscus.app until the reader asks for comments.
    if (attempt === 0 || !container) return;
    container.replaceChildren();
    const script = document.createElement('script');
    script.src = `${giscusOrigin}/client.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    for (const [name, value] of Object.entries(
      giscusAttributes(view.config, view.number, locale),
    ))
      script.setAttribute(name, value);
    script.addEventListener('error', () => dispatch({ type: 'script-error' }));
    function receive(event: MessageEvent) {
      const frame = container?.querySelector('iframe')?.contentWindow;
      const message = parseGiscusMessage(event, frame);
      if (message) dispatch(message);
    }
    window.addEventListener('message', receive);
    const timeout = setTimeout(
      () => dispatch({ type: 'timeout' }),
      giscusTimeoutMs,
    );
    container.append(script);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('message', receive);
      container.replaceChildren();
    };
  }, [attempt, locale, view.config, view.number]);

  function load() {
    dispatch({ type: 'load' });
    setAttempt((value) => value + 1);
  }

  return (
    <div className="comments-panel" data-state={state.status}>
      {state.status === 'dormant' ? (
        <>
          <div className="action-row">
            <button
              type="button"
              className="button button-primary requires-js"
              onClick={load}
            >
              {t.commentsLoad}
            </button>
            <NativeLink
              url={view.url}
              label={t.commentsOpenGitHub}
              hint={t.newTab}
            />
          </div>
          <p className="fine">
            {t.commentsThirdParty}{' '}
            <a href={`/${locale}/privacy/`}>{t.privacyLink}</a>
          </p>
        </>
      ) : null}
      {state.status === 'loading' ? (
        <p className="comments-status" role="status">
          {t.commentsLoading}
        </p>
      ) : null}
      {state.status === 'ready' ? (
        <p className="comments-status" role="status">
          {state.locked
            ? t.commentsLocked
            : state.count === 0
              ? t.commentsEmpty
              : state.count !== null
                ? t.commentsCount(state.count)
                : null}
        </p>
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
      {state.status !== 'dormant' ? (
        <NativeLink
          url={view.url}
          label={t.commentsOpenGitHub}
          hint={t.newTab}
        />
      ) : null}
      <div
        ref={host}
        className="giscus-frame-host"
        hidden={state.status === 'dormant' || state.status === 'failed'}
      />
    </div>
  );
}
