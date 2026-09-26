import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('build/client');
const port = Number(process.env['PORT'] ?? 4173);
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.data': 'text/x-script; charset=utf-8',
};
const server = createServer((request, response) => {
  void (async () => {
    let pathname: string;
    try {
      pathname = decodeURIComponent(
        new URL(request.url ?? '/', 'http://127.0.0.1').pathname,
      );
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, {
            Location:
              pathname +
              '/' +
              new URL(request.url ?? '/', 'http://127.0.0.1').search,
          });
          response.end();
          return;
        }
        file = resolve(file, 'index.html');
      }
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(
        await readFile(resolve(root, '404.html')).catch(() =>
          Buffer.from('Not found'),
        ),
      );
    }
  })().catch(() => {
    response.writeHead(500);
    response.end('Unable to serve file');
  });
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Static production preview: http://127.0.0.1:${port}`),
);
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  process.on(signal, () => {
    server.close();
    server.closeAllConnections();
  });
