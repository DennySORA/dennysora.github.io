import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';
import { loadProjectPageModule } from './features/projects/project-page-module.ts';

// Build-time HTML rendering only. No server entry is included in the Pages artifact.
export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  // Split content resolves first, so no page is prerendered as a fallback.
  await loadProjectPageModule();
  const stream = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} />,
    {
      signal: request.signal,
      // Static pages wait for everything; outlining a large Suspense boundary
      // would hide it behind an inline script and break the no-JavaScript view.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
    },
  );
  await stream.allReady;
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(stream, { status, headers });
}
