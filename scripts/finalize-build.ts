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
import migration from '../data/migration/manifest.json' with { type: 'json' };
import brand from '../data/brand-assets.json' with { type: 'json' };
import { legacyDestinations } from '../src/lib/legacy-anchors.ts';

const output = join(process.cwd(), 'build/client');
function write(path: string, body: string) {
  const file = join(output, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}

// Brand assets ship unchanged and same-origin; the 3 MB master stays in the repository.
for (const asset of brand.assets.filter((item) => item.published))
  cpSync(asset.path, join(output, asset.path));
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
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map((route) => `<url><loc>${siteUrl}${routePath(route)}</loc></url>`).join('')}</urlset>`,
);

// Static notice pages share the product's dark palette; they are not prerendered by React.
function noticePage(lang: string, title: string, body: string, head = '') {
  return `<!doctype html><html lang="${lang}" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#0B1020"><title>${escapeHtml(title)} · DennySORA</title><meta name="robots" content="noindex,follow">${head}<style>:root{color-scheme:dark}body{margin:0;background:#0B1020;color:#E6EDF7;font:18px/1.8 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"PingFang TC","Hiragino Sans","Noto Sans CJK TC",sans-serif}main{max-width:720px;margin:12vh auto;padding:0 20px}p{color:#B8C5D8}.eyebrow{color:#94A3B8;font-size:14px}a{color:#82AAFF;text-underline-offset:4px}a:focus-visible{outline:3px solid #67D8EF;outline-offset:4px}</style></head><body><main>${body}</main></body></html>`;
}

// Known old paths get explicit bridges, never a catch-all SPA redirect.
const aliases: Record<string, string> = {
  detail: '/zh-hant/about/',
  'detail/about': '/zh-hant/about/',
  'detail/production': '/zh-hant/blog/production-systems/',
  'detail/research': '/zh-hant/blog/trilingual-model-research/',
  'detail/depth': '/zh-hant/about/#depth-h',
  blog: '/zh-hant/blog/',
};
write(
  'bridge.js',
  `const link=document.querySelector('[data-destination]');if(link){const anchors=${JSON.stringify(legacyDestinations)};const old=location.hash.slice(1);const target=new URL(anchors[old]??link.getAttribute('href'),location.origin);if(target.origin===location.origin)location.replace(target.href);}`,
);
for (const [old, target] of Object.entries(aliases))
  write(
    `${old}/index.html`,
    noticePage(
      'zh-Hant',
      '頁面已搬移',
      `<p class="eyebrow">DennySORA</p><h1>這份內容有了新地址。</h1><p lang="en">This page has moved.</p><p lang="ja">このページは移動しました。</p><a href="${target}" data-destination>繼續閱讀 / Continue / 続きを読む →</a><script src="/bridge.js"></script>`,
      `<link rel="canonical" href="${siteUrl}${target}"><meta http-equiv="refresh" content="2;url=${target}">`,
    ),
  );
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
