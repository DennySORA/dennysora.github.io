import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, extname, resolve, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import {
  isIndexable,
  publishedPaths,
  publishedRoutes,
  siteUrl,
} from '../src/lib/content.server.ts';
import { locales } from '../src/i18n/index.ts';
import { routePath } from '../src/lib/route-manifest.ts';
import brand from '../data/brand-assets.json' with { type: 'json' };

const root = resolve('build/client');
const failures: string[] = [];
function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}
const files = walk(root);
for (const file of files) {
  const name = relative(root, file);
  if (
    /(^|\/)(\.env[^/]*|\.git|\.serena|node_modules|docs|content|AGENTS\.md|PROJECT_AGENT\.md)(\/|$)|\.(sqlite|db|map|zip|pem|key)$/.test(
      name,
    )
  )
    failures.push(`Forbidden artifact: ${name}`);
  if (
    /\.(?:html|js|css|xml|json)$/.test(name) &&
    readFileSync(file, 'utf8').includes('raw.githubusercontent.com')
  )
    failures.push(`Hot-linked GitHub raw asset in ${name}`);
  if (extname(file) !== '.html') continue;
  const html = readFileSync(file, 'utf8');
  if (!/<html lang="(?:zh-Hant|en|ja)"/.test(html))
    failures.push(`Missing language: ${name}`);
  // Dark is present in the first HTML response, before any script runs.
  if (!/<html[^>]* data-theme="dark"/.test(html))
    failures.push(`Missing dark root: ${name}`);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const raw = match[1];
    if (!raw || raw.startsWith('mailto:') || raw.startsWith('data:')) continue;
    const url = new URL(raw.replaceAll('&amp;', '&'), siteUrl + '/' + name);
    if (url.origin !== siteUrl) continue;
    const local = join(root, decodeURIComponent(url.pathname));
    if (!existsSync(local) && !existsSync(join(local, 'index.html')))
      failures.push(`Broken link in ${name}: ${url.pathname}`);
  }
}
for (const path of publishedPaths()) {
  const file = join(root, path, 'index.html');
  if (!existsSync(file)) {
    failures.push(`Missing HTML ${path}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<h1[ >]/.test(html)) failures.push(`Empty prerender ${path}`);
  if (!/rel="canonical"/.test(html)) failures.push(`Missing canonical ${path}`);
}
// Published brand assets must be byte-identical to the recorded repository sources.
for (const asset of brand.assets) {
  const built = join(root, asset.path);
  if (!asset.published) {
    if (existsSync(built))
      failures.push(`Unpublished brand master shipped: ${asset.path}`);
    continue;
  }
  if (!existsSync(built)) {
    failures.push(`Missing brand asset: ${asset.path}`);
    continue;
  }
  const bytes = readFileSync(built);
  const blob = createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
  if (blob !== asset.gitBlob || bytes.length !== asset.bytes)
    failures.push(
      `Brand asset differs from its recorded source: ${asset.path}`,
    );
}
const header = readFileSync(join(root, 'en/index.html'), 'utf8');
if (!header.includes('src="/assets/logo.png"'))
  failures.push('Header does not use the same-origin logo');

// The search bundle exists for every language and only for the final pages.
const entryFile = join(root, 'pagefind/pagefind-entry.json');
if (!existsSync(entryFile)) failures.push('Search index missing');
else {
  const entry = JSON.parse(readFileSync(entryFile, 'utf8')) as {
    languages: Record<string, unknown>;
  };
  for (const locale of locales)
    if (!entry.languages[locale])
      failures.push(`Search index missing language ${locale}`);
}

// Sitemap and robots directives agree with the route manifest.
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
for (const route of publishedRoutes()) {
  const listed = sitemap.includes(`<loc>${siteUrl}${routePath(route)}</loc>`);
  const file = join(root, routePath(route), 'index.html');
  const noindex =
    existsSync(file) &&
    /<meta name="robots" content="noindex/.test(readFileSync(file, 'utf8'));
  if (isIndexable(route) !== listed)
    failures.push(`Sitemap mismatch for ${routePath(route)}`);
  if (route.kind !== 'root' && isIndexable(route) === noindex)
    failures.push(`Robots mismatch for ${routePath(route)}`);
}

// Bound the actual module dependency graph loaded by a basic page, not the entire site's chunks.
const home = readFileSync(join(root, 'en/index.html'), 'utf8');
const initial = new Set(
  [...home.matchAll(/(?:href|src)="(\/assets\/[^" ]+\.js)"/g)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value)),
);
const scripts = [...initial];
for (const path of scripts) {
  const source = readFileSync(join(root, path), 'utf8');
  for (const match of source.matchAll(
    /(?:from|import)\s*["']\.\/([^"']+\.js)["']/g,
  )) {
    const item = '/assets/' + match[1];
    if (!initial.has(item)) {
      initial.add(item);
      scripts.push(item);
    }
  }
}
const size = [...initial].reduce(
  (sum, path) => sum + gzipSync(readFileSync(join(root, path))).length,
  0,
);
if (size > 150 * 1024) failures.push(`Initial JS gzip ${size} exceeds 150 KiB`);
if (failures.length) throw new Error(failures.join('\n'));
console.log(
  `Artifact checked: ${files.length} files, all local links and prerendered pages valid; initial JS gzip ${(size / 1024).toFixed(1)} KiB.`,
);
