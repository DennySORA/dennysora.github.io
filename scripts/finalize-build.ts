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
  listPosts,
  loadArticle,
  loadPosts,
  publishedPaths,
  siteUrl,
} from '../src/lib/content.server.ts';
import { dictionaries, locales, htmlLang } from '../src/i18n/index.ts';
import migration from '../data/migration/manifest.json' with { type: 'json' };
import { legacyDestinations } from '../src/lib/legacy-anchors.ts';
import { topicNames } from '../src/lib/publication.ts';

const output = join(process.cwd(), 'build/client');
const escape = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char] ?? char,
  );
function write(path: string, body: string) {
  const file = join(output, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}
for (const file of ['avatar.png', 'favicon.png', 'apple-touch-icon.png'])
  cpSync(join('assets', file), join(output, 'assets', file));
cpSync('CNAME', join(output, 'CNAME'));
write('.nojekyll', '');
write(
  'robots.txt',
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
for (const locale of locales) {
  const posts = listPosts(locale);
  const entries = posts.map((post) => ({
    id: post.id,
    title: post.title,
    text: loadArticle(locale, post.slug)?.body?.text ?? '',
    tags: post.topics.map((topic) => topicNames[topic][locale]),
  }));
  write(`search/${locale}.json`, JSON.stringify({ locale, entries }));
  write(
    `${locale}/rss.xml`,
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DennySORA — ${escape(dictionaries[locale].blog)}</title><link>${siteUrl}/${locale}/blog/</link><description>${escape(dictionaries[locale].blogIntro)}</description><language>${htmlLang[locale]}</language>${posts.map((post) => `<item><title>${escape(post.title)}</title><link>${siteUrl}/${locale}/blog/${post.slug}/</link><guid isPermaLink="true">${siteUrl}/${locale}/blog/${post.slug}/</guid><description>${escape(post.summary)}</description><pubDate>${new Date(post.publishedAt + 'T00:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`,
  );
}
const routes = publishedPaths().filter((path) => path !== '/404');
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((path) => `<url><loc>${siteUrl}${path === '/' ? '/' : path + '/'}</loc></url>`).join('')}</urlset>`,
);
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
for (const [old, target] of Object.entries(aliases)) {
  write(
    `${old}/index.html`,
    `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>頁面已搬移 · DennySORA</title><link rel="canonical" href="${siteUrl}${target}"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="2;url=${target}"></head><body style="font:18px/1.8 system-ui;background:#14171c;color:#e8edf4;padding:3rem"><h1>這份內容有了新地址。</h1><p>This page has moved. このページは移動しました。</p><a style="color:#92bafa" href="${target}" data-destination>繼續閱讀 / Continue / 続きを読む →</a><script src="/bridge.js"></script></body></html>`,
  );
}
const missing = migration.legacyBlog.missingSlugs;
for (const slug of missing) {
  for (const prefix of ['blog', ...locales.map((locale) => `${locale}/blog`)]) {
    const locale =
      locales.find((locale) => prefix.startsWith(locale)) ?? 'zh-hant';
    const t = dictionaries[locale];
    write(
      `${prefix}/${slug}/index.html`,
      `<!doctype html><html lang="${htmlLang[locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(t.unavailable)} · DennySORA</title><meta name="robots" content="noindex,follow"></head><body style="font:17px/1.9 system-ui;background:#14171c;color:#e8edf4;max-width:700px;margin:10vh auto;padding:24px"><p>DennySORA / ${escape(t.status)}</p><h1>${escape(t.unavailable)}</h1><p>${escape(t.unavailableText)}</p><a style="color:#92bafa" href="/${locale}/blog/">${escape(t.allPosts)} →</a></body></html>`,
    );
  }
}
const notFound = join(output, '404/index.html');
if (!existsSync(notFound)) throw new Error('Prerendered 404 missing');
write('404.html', readFileSync(notFound, 'utf8'));
const spa = join(output, '__spa-fallback.html');
if (existsSync(spa)) rmSync(spa);
write(
  'content-manifest.json',
  JSON.stringify({
    routes,
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
  `Finalized ${routes.length} published routes, locale search/RSS, sitemap, and explicit legacy bridges.`,
);
