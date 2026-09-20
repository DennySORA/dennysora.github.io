import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, extname, resolve, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { publishedPaths, siteUrl } from '../src/lib/content.server.ts';

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
  if (extname(file) !== '.html') continue;
  const html = readFileSync(file, 'utf8');
  if (!/<html lang="(?:zh-Hant|en|ja)"/.test(html))
    failures.push(`Missing language: ${name}`);
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
