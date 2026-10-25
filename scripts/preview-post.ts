import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build, createServer } from 'vite';
import { locales } from '../src/i18n/index.ts';
import { loadPosts, renderPost } from '../src/lib/content.server.ts';
import { escapeHtml } from '../src/lib/html.ts';
import { safeId } from '../src/lib/schema.ts';

// A separate, portable review artifact. Never writes into build/client or
// changes publication state. The regular build streams only registered remote videos.
const id = safeId.parse(process.argv[2]);
const post = loadPosts().find((item) => item.id === id);
if (
  !post ||
  locales.some((locale) => post.locales[locale]?.publication !== 'draft')
)
  throw new Error('Preview requires all three editions to be drafts');
const rendered = locales.map((locale) => ({
  locale,
  body: renderPost(id, locale, { mode: 'draft-preview' }),
}));
let articleSections:
  | typeof import('../src/components/ArticleSections.tsx').ArticleSections
  | undefined;
if (rendered.some(({ body }) => body.sections)) {
  // Transform the same React component used by the site without opening a listener.
  const compiler = await createServer({
    configFile: false,
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });
  try {
    const component = (await compiler.ssrLoadModule(
      '/src/components/ArticleSections.tsx',
    )) as typeof import('../src/components/ArticleSections.tsx');
    articleSections = component.ArticleSections;
  } finally {
    await compiler.close();
  }
}
const hasDemos = rendered.some(({ body }) =>
  /class="(?:privacy|translation)-guide"/.test(body.html),
);
const compiled = resolve('build/client/assets');
const styles = readdirSync(compiled).filter((file) => file.endsWith('.css'));
if (styles.length === 0) throw new Error('Run pnpm build before previewing');
const parent = resolve('.draft-preview');
mkdirSync(parent, { recursive: true });
const output = mkdtempSync(join(parent, `${id}-`));
if (articleSections) {
  const bundled = await build({
    configFile: false,
    publicDir: false,
    logLevel: 'error',
    build: {
      write: false,
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: resolve('scripts/preview-post-tabs.ts'),
        name: 'PostPreviewTabs',
        formats: ['iife'],
      },
    },
  });
  const chunks = (Array.isArray(bundled) ? bundled : [bundled])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  const chunk = chunks[0];
  if (chunks.length !== 1 || !chunk)
    throw new Error('Preview tabs must compile into one local script');
  writeFileSync(join(output, 'preview-tabs.js'), chunk.code);
}
if (hasDemos) {
  const bundled = await build({
    configFile: false,
    publicDir: false,
    logLevel: 'error',
    build: {
      write: false,
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: resolve('scripts/preview-post-demos.ts'),
        name: 'PostPreviewDemos',
        formats: ['iife'],
      },
    },
  });
  const chunks = (Array.isArray(bundled) ? bundled : [bundled])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  const chunk = chunks[0];
  if (chunks.length !== 1 || !chunk)
    throw new Error('Preview demos must compile into one local script');
  writeFileSync(join(output, 'preview-demos.js'), chunk.code);
}
const copy = (source: string, destination: string) => {
  if (!lstatSync(source).isFile())
    throw new Error(`Not a regular file: ${source}`);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
};
let css = '';
for (const style of styles) {
  const source = join(compiled, style);
  if (!lstatSync(source).isFile())
    throw new Error('Stylesheet must be a regular file');
  css +=
    readFileSync(source, 'utf8').replaceAll('/assets/', './assets/') + '\n';
}
for (const font of readdirSync(compiled).filter((file) =>
  /\.woff2?$/.test(file),
))
  copy(join(compiled, font), join(output, 'assets', font));
writeFileSync(join(output, 'site.css'), css);
const labels = {
  'zh-hant': {
    draft: '文章草稿 · 本機預覽',
    note: '尚未發布。此頁供稿件與翻譯審閱，不代表正式網站導覽已驗收。',
    video: '影片是本機審閱素材；正式發布前須依網站規則遷移到媒體託管。',
    nav: '文章語言',
  },
  en: {
    draft: 'Article draft · Local preview',
    note: 'Not published. This page is for manuscript and translation review, not acceptance of the live website navigation.',
    video:
      'Videos are local review assets and must move to the approved media host before publication.',
    nav: 'Article language',
  },
  ja: {
    draft: '記事の下書き · ローカルプレビュー',
    note: '未公開です。原稿と翻訳を確認するためのページであり、本番サイトのナビゲーション検証ではありません。',
    video:
      '動画はローカル確認用です。公開前にサイトの規則に従ってメディア配信先へ移行してください。',
    nav: '記事の言語',
  },
};
for (const { locale, body } of rendered) {
  const edition = post.locales[locale]!;
  const t = labels[locale];
  const content =
    body.sections && articleSections
      ? renderToStaticMarkup(
          createElement(articleSections, { sections: body.sections, locale }),
        )
      : `<div class="prose">${body.html}</div>`;
  for (const asset of [
    ...body.images,
    ...body.subtitles,
    ...body.previewVideos,
  ]) {
    if (!asset.url.startsWith(`/content-assets/posts/${id}/`))
      throw new Error('Preview asset URL escaped its article');
    copy(asset.source, join(output, decodeURIComponent(asset.url.slice(1))));
  }
  const html = `<!doctype html>
<html lang="${locale === 'zh-hant' ? 'zh-Hant' : locale}" data-theme="dark">
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(edition.title)}</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="./site.css">
<style>:root{--header-height:0px}body{margin:0;display:block}main{position:relative;width:100%;min-width:0;max-width:1080px;margin:auto;padding:32px 24px 80px;padding-left:calc(var(--line-gutter) + var(--gutter))}header{margin-bottom:36px}h1{font-size:clamp(28px,4vw,44px);line-height:1.3;margin:20px 0;overflow-wrap:anywhere}.preview-languages{display:flex;gap:20px;flex-wrap:wrap}aside{padding:16px;border:1px solid var(--color-border-subtle);margin:24px 0}.prose figure video{max-width:100%;height:auto}img{max-width:100%}</style>
${articleSections ? '<script src="./preview-tabs.js" defer></script>' : ''}
${hasDemos ? '<script src="./preview-demos.js" defer></script>' : ''}
<main><header><p>${escapeHtml(t.draft)}</p>
<nav class="preview-languages" aria-label="${escapeHtml(t.nav)}"><a href="./zh-hant.html" lang="zh-Hant">繁體中文</a><a href="./en.html" lang="en">English</a><a href="./ja.html" lang="ja">日本語</a></nav>
<h1 id="article-title">${escapeHtml(edition.title)}</h1><p>${escapeHtml(edition.summary)}</p>
<aside>${escapeHtml(t.note)}${body.previewVideos.length ? ` ${escapeHtml(t.video)}` : ''}</aside></header>
<article>${content.replaceAll('="/content-assets/', '="./content-assets/')}</article></main></html>`;
  writeFileSync(join(output, `${locale}.html`), html);
}
copy(join(output, 'zh-hant.html'), join(output, 'index.html'));
console.log(output);
