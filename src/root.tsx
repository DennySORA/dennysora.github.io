import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useMatches,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import { StrictMode } from 'react';
import { htmlLang, isLocale } from './i18n/index.ts';
import './styles/site.css';

// Without JavaScript, interactive-only controls hide and their static alternatives show.
const noScriptStyles =
  '<style>.requires-js{display:none!important}.no-js-only{display:block!important}</style>';

export default function Root() {
  // The page's own data decides the language, so a shared 404 hydrates unchanged.
  const data = useMatches().at(-1)?.loaderData as
    { locale?: string } | undefined;
  const candidate = data?.locale;
  const locale = isLocale(candidate) ? candidate : 'zh-hant';
  return (
    // Dark is the product default and is present in the first HTML response.
    <html lang={htmlLang[locale]} data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0B1020" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="icon" href="/assets/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <Meta />
        <Links />
        <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
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
    <html lang="en" data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <title>{`${notFound ? 'Page not found' : 'Unable to open this page'} — DennySORA`}</title>
        <Links />
      </head>
      <body>
        <main className="container page-error">
          <p className="eyebrow">DennySORA · {notFound ? '404' : 'Error'}</p>
          <h1>
            {notFound
              ? 'This page could not be found.'
              : 'This page could not be loaded.'}
          </h1>
          <p>
            <a href="/zh-hant/">繁體中文</a> · <a href="/en/">English</a> ·{' '}
            <a href="/ja/">日本語</a>
          </p>
        </main>
      </body>
    </html>
  );
}
