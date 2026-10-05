import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  cpSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import {
  isIndexable,
  listPosts,
  loadPosts,
  publishedRoutes,
  renderPost,
  siteUrl,
} from '../src/lib/content.server.ts';
import { dictionaries, locales, htmlLang } from '../src/i18n/index.ts';
import { escapeHtml } from '../src/lib/html.ts';
import { routePath } from '../src/lib/route-manifest.ts';
import { papersUrl } from '../src/lib/site.ts';
import migration from '../data/migration/manifest.json' with { type: 'json' };
import brand from '../data/brand-assets.json' with { type: 'json' };
import { legacyDestinations } from '../src/lib/legacy-anchors.ts';

import { buildSiteSearch } from '../src/lib/site-search.server.ts';

const output = join(process.cwd(), 'build/client');
function write(path: string, body: string) {
  const file = join(output, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}

// Brand assets ship unchanged and same-origin; the 3 MB master stays in the repository.
for (const asset of brand.assets.filter((item) => item.published))
  cpSync(asset.path, join(output, asset.path));
cpSync('assets/illustrations', join(output, 'assets/illustrations'), {
  recursive: true,
});
cpSync('CNAME', join(output, 'CNAME'));
write('.nojekyll', '');
write(
  'robots.txt',
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

// Article images and formula styles are copied only when published content uses them.
let usesMath = false;
for (const post of loadPosts())
  for (const locale of post.editions) {
    const rendered = renderPost(post.id, locale);
    usesMath ||= rendered.hasMath;
    for (const image of rendered.images)
      cpSync(image.source, join(output, decodeURIComponent(image.url)));
  }
if (usesMath) {
  const katex = join('node_modules', 'katex', 'dist');
  cpSync(
    join(katex, 'katex.min.css'),
    join(output, 'assets/katex/katex.min.css'),
  );
  cpSync(join(katex, 'fonts'), join(output, 'assets/katex/fonts'), {
    recursive: true,
  });
}

for (const locale of locales) {
  const t = dictionaries[locale];
  const items = listPosts(locale)
    .map((post) => {
      const link = `${siteUrl}/${locale}/blog/${post.slug}/`;
      return `<item><title>${escapeHtml(post.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><description>${escapeHtml(post.summary)}</description><pubDate>${new Date(post.publishedAt + 'T00:00:00Z').toUTCString()}</pubDate></item>`;
    })
    .join('');
  write(
    `${locale}/rss.xml`,
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DennySORA — ${escapeHtml(t.libraryTitle)}</title><link>${siteUrl}/${locale}/blog/</link><description>${escapeHtml(t.libraryIntro)}</description><language>${htmlLang[locale]}</language>${items}</channel></rss>`,
  );
}

const routes = publishedRoutes();
const indexable = routes.filter(isIndexable);
write('site-search.json', JSON.stringify(buildSiteSearch(output, routes)));
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map((route) => `<url><loc>${siteUrl}${routePath(route)}</loc></url>`).join('')}</urlset>`,
);

// Static notice pages share the product's dark palette; they are not prerendered by React.
function noticePage(lang: string, title: string, body: string, head = '') {
  return `<!doctype html><html lang="${lang}" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#080C12"><title>${escapeHtml(title)} · DennySORA</title><meta name="robots" content="noindex,follow">${head}<style>:root{color-scheme:dark}body{margin:0;background:#0C1118;color:#E6EDF5;font:18px/1.8 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"PingFang TC","Hiragino Sans","Noto Sans CJK TC",sans-serif}main{max-width:720px;margin:12vh auto;padding:0 20px}p{color:#B8C5D6}.eyebrow{color:#A0B0C5;font:13px/1.6 ui-monospace,"SF Mono",Menlo,Consolas,monospace}a{color:#96C3FF;text-underline-offset:4px}a:focus-visible{outline:2px solid #B2D5FF;outline-offset:2px}</style></head><body><main>${body}</main></body></html>`;
}

// Known old paths get explicit bridges, never a catch-all SPA redirect.
const aliases: Record<string, string> = {
  detail: '/zh-hant/',
  'detail/about': '/zh-hant/',
  'detail/production': '/zh-hant/blog/production-systems/',
  'detail/research': '/zh-hant/blog/trilingual-model-research/',
  'detail/depth': '/zh-hant/#competencies-title',
  blog: '/zh-hant/blog/',
};
// A bridge marked data-keep-hash carries its own fragment (the About page moved
// to the locale home); the others resolve the former single-page anchors.
write(
  'bridge.js',
  `const link=document.querySelector('[data-destination]');if(link){const anchors=${JSON.stringify(legacyDestinations)};const old=location.hash.slice(1);const base=link.getAttribute('href');const target=new URL(link.hasAttribute('data-keep-hash')?base+location.hash:anchors[old]??base,location.origin);if(target.origin===location.origin)location.replace(target.href);}`,
);
function movedPage(target: string, keepHash = false) {
  return noticePage(
    'zh-Hant',
    '頁面已搬移',
    `<p class="eyebrow">DennySORA</p><h1>這份內容有了新地址。</h1><p lang="en">This page has moved.</p><p lang="ja">このページは移動しました。</p><a href="${target}" data-destination${keepHash ? ' data-keep-hash' : ''}>繼續閱讀 / Continue / 続きを読む →</a><script src="/bridge.js"></script>`,
    `<link rel="canonical" href="${siteUrl}${target}"><meta http-equiv="refresh" content="2;url=${target}">`,
  );
}
for (const [old, target] of Object.entries(aliases))
  write(`${old}/index.html`, movedPage(target));
// Keep the complete source note and all old anchors for readers without scripts.
// The early classic script redirects before the deferred application hydrates.
const analgesicsTarget = '/zh-hant/note/medical/drugs/analgesics/';
const analgesicsFallback = readFileSync(
  join(output, analgesicsTarget, 'index.html'),
  'utf8',
)
  .replace('</head>', '<meta name="robots" content="noindex,follow"></head>')
  .replace(
    /(<body\b[^>]*>)/,
    `$1<a href="${analgesicsTarget}" data-destination data-keep-hash hidden>繼續閱讀</a><script src="/bridge.js"></script>`,
  );
write('zh-hant/note/medical/analgesics/index.html', analgesicsFallback);
for (const locale of locales) {
  // The profile is the locale home now; old About links keep their section anchor.
  write(`${locale}/about/index.html`, movedPage(`/${locale}/`, true));
  // Paper Daily is its own site; the former in-site page only forwards to it.
  const t = dictionaries[locale];
  write(
    `${locale}/papers/index.html`,
    noticePage(
      htmlLang[locale],
      t.navPapers,
      `<p class="eyebrow">DennySORA</p><h1>${escapeHtml(t.navPapers)}</h1><a href="${papersUrl}">${escapeHtml(papersUrl)} →</a>`,
      `<meta http-equiv="refresh" content="0;url=${papersUrl}">`,
    ),
  );
}
for (const slug of migration.legacyBlog.missingSlugs)
  for (const prefix of ['blog', ...locales.map((locale) => `${locale}/blog`)]) {
    const locale = locales.find((item) => prefix.startsWith(item)) ?? 'zh-hant';
    const t = dictionaries[locale];
    write(
      `${prefix}/${slug}/index.html`,
      noticePage(
        htmlLang[locale],
        t.legacyMissingTitle,
        `<p class="eyebrow">DennySORA · ${escapeHtml(t.legacyStatus)}</p><h1>${escapeHtml(t.legacyMissingTitle)}</h1><p>${escapeHtml(t.legacyMissingText)}</p><a href="/${locale}/blog/">${escapeHtml(t.allArticles)} →</a>`,
      ),
    );
  }

// Former profile adaptations are unpublished; keep their URLs as honest notices.
for (const post of loadPosts().filter((post) => post.editions.length === 0))
  for (const locale of locales) {
    const copy = {
      'zh-hant': ['原先的示範內容已移除。', '回到部落格'],
      en: [
        'The previous placeholder content has been removed.',
        'Back to the blog',
      ],
      ja: ['以前のサンプル内容は削除されました。', 'ブログに戻る'],
    }[locale];
    write(
      `${locale}/blog/${post.slug}/index.html`,
      noticePage(
        htmlLang[locale],
        dictionaries[locale].noPostsTitle,
        `<h1>${escapeHtml(dictionaries[locale].noPostsTitle)}</h1><p>${copy[0]}</p><a href="/${locale}/blog/">${copy[1]}</a>`,
      ),
    );
  }

const notFound = join(output, '404/index.html');
if (!existsSync(notFound)) throw new Error('Prerendered 404 missing');
write('404.html', readFileSync(notFound, 'utf8'));
const spa = join(output, '__spa-fallback.html');
if (existsSync(spa)) rmSync(spa);
write(
  'content-manifest.json',
  JSON.stringify({
    routes: routes.map(routePath),
    indexable: indexable.map(routePath),
    posts: loadPosts()
      .filter((post) => post.editions.length > 0)
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        locales: post.editions,
      })),
  }),
);
console.log(
  `Finalized ${routes.length} routes (${indexable.length} in sitemap), RSS per locale, brand assets${usesMath ? ', formula styles' : ''} and explicit legacy bridges.`,
);
