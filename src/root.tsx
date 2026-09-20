import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useLocation,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import { StrictMode } from 'react';
import { htmlLang, isLocale } from './i18n/index.ts';
import './styles/site.css';

export default function Root() {
  const location = useLocation();
  const segment = location.pathname.split('/')[1];
  const locale = isLocale(segment) ? segment : 'zh-hant';
  return (
    <html lang={htmlLang[locale]}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#14171c" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        <StrictMode>
          <Outlet />
        </StrictMode>
        <Scripts />
      </body>
    </html>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <html lang="en">
      <head>
        <title>
          {notFound ? 'Page not found' : 'Unable to open this page'} · DennySORA
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body>
        <main className="error-page">
          <p className="eyebrow">DennySORA / {notFound ? '404' : 'ERROR'}</p>
          <h1>
            {notFound
              ? 'This page could not be found.'
              : 'This page could not be loaded.'}
          </h1>
          <p>
            <a href="/zh-hant/">繁體中文</a> · <a href="/en/">English</a> ·{' '}
            <a href="/ja/">日本語</a>
          </p>
          <a href="/en/blog/">Browse writing →</a>
        </main>
      </body>
    </html>
  );
}
