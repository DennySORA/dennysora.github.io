import { test, expect } from '@playwright/test';
import { dictionaries } from '../../src/i18n/index.ts';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { hasRawAsset } from '../../src/lib/asset-policy.ts';
import { origin } from './helpers.ts';

test('every production route is complete, dark-first and self-hosted HTML', async ({
  request,
}) => {
  for (const path of publishedPaths()) {
    const response = await request.get(path === '/' ? path : path + '/');
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain('<h1');
    expect(html, path).toContain('rel="canonical"');
    expect(html, path).toMatch(/<html[^>]*data-theme="dark"/);
    expect(html, path).toContain('<meta name="color-scheme" content="dark"/>');
    expect(html, path).not.toContain('googleapis.com');
    expect(hasRawAsset(html, '.html'), path).toBe(false);
  }
});

test('the title bar uses the real same-origin logo and keeps a usable brand link if it fails', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/');
  const logo = page.locator('.tabline .brand-mark');
  await expect(logo).toHaveAttribute('src', '/assets/logo.png');
  expect(
    await logo.evaluate((image: HTMLImageElement) => ({
      natural: [image.naturalWidth, image.naturalHeight],
      fit: getComputedStyle(image).objectFit,
      filter: getComputedStyle(image).filter,
      height: image.getBoundingClientRect().height,
    })),
  ).toEqual({
    natural: [720, 392],
    fit: 'contain',
    filter: 'none',
    height: 30,
  });
  const brand = page.getByRole('link', { name: 'DennySORA 首頁' }).first();
  await expect(brand).toHaveAttribute('href', '/zh-hant/');
  await page.route('**/assets/logo.png', (route) => route.abort());
  await page.reload();
  await expect(page.locator('.tabline .brand-name')).toHaveText('DennySORA');
  await expect(page.locator('.tabline .brand-name')).toBeVisible();
  await brand.click();
  await expect(page).toHaveURL('/zh-hant/');
  // The README shows the same figure large, sharp at 1x and 2x, unfiltered.
  await page.unroute('**/assets/logo.png');
  const hero = page.locator('.readme-logo img');
  await expect(hero).toBeInViewport();
  expect(
    await hero.evaluate((image: HTMLImageElement) => ({
      source: new URL(image.currentSrc).pathname,
      set: image.getAttribute('srcset'),
      loaded: image.complete && image.naturalWidth > 0,
      filter: getComputedStyle(image).filter,
    })),
  ).toEqual({
    source: '/assets/logo-hero.webp',
    set: '/assets/logo-hero.webp 1x, /assets/logo-hero@2x.webp 2x',
    loaded: true,
    filter: 'none',
  });
});

test('first visits are dark even when the OS prefers light, with or without JavaScript', async ({
  browser,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      colorScheme: 'light',
      javaScriptEnabled,
    });
    const page = await context.newPage();
    for (const path of [
      '/en/about/',
      '/en/blog/engineering-principles/',
      '/does-not-exist/',
    ]) {
      await page.goto(origin + path);
      expect(
        await page.evaluate(() => ({
          background: getComputedStyle(document.body).backgroundColor,
          scheme: getComputedStyle(document.documentElement).colorScheme,
          theme: document.documentElement.dataset['theme'],
        })),
        `${path} js=${javaScriptEnabled}`,
      ).toEqual({
        background: 'rgb(12, 17, 24)',
        scheme: 'dark',
        theme: 'dark',
      });
    }
    await context.close();
  }
});

test('language switching keeps the note directory, metadata and a direct reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/zh-hant/note/');
  await expect(page.locator('h1')).toContainText('筆記');
  await page.locator('.header-language summary').click();
  await page
    .getByRole('link', { name: 'English', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL('/en/note/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('h1')).toContainText('Notes');
  await page.locator('.header-language summary').click();
  await page.getByRole('link', { name: '日本語', exact: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://dennysora.me/ja/note/',
  );
  expect(errors).toEqual([]);
});

test('the header search link and keyboard shortcuts open global search without stealing typing', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  await page.keyboard.press('/');
  await expect(page).toHaveURL('/en/search/#search');
  const input = page.getByRole('searchbox', { name: 'Search the site' });
  await expect(input).toBeFocused();
  await input.press('/');
  await expect(input).toHaveValue('/');
  await input.fill('');
  await page.locator('h1').click();
  await page.keyboard.press('Control+k');
  await expect(input).toBeFocused();
  await page.goto('/en/note/');
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Search the site' })
    .click();
  await expect(page).toHaveURL('/en/search/#search');
});

test('404 stays a real 404, removed articles are explicit and legacy paths keep working', async ({
  page,
  request,
}) => {
  for (const path of [
    '/does-not-exist/',
    '/en/blog/tags/unknown/',
    '/zh-hant/blog/topics/',
    '/en/blog/tags/llm/extra/',
    '/en/research/notes/',
  ])
    expect((await request.get(path)).status(), path).toBe(404);
  const missing = await page.goto('/en/missing-page/');
  expect(missing?.status()).toBe(404);
  // One static 404 serves every language: 繁中 first, then English and Japanese.
  await expect(page.locator('h1')).toContainText('這條路徑沒有對應的頁面');
  await expect(
    page.getByText('This path doesn’t lead to a page.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to the home page' }),
  ).toHaveAttribute('href', '/en/');
  await page.goto('/blog/tech-leadership-value-driven-discussion/');
  await expect(page.locator('h1')).toContainText('原始文章');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  await page.goto('/detail/production/');
  await expect(page).toHaveURL('/zh-hant/blog/production-systems/');
  await page.goto('/detail/depth/#how-h');
  await expect(page).toHaveURL('/zh-hant/blog/engineering-principles/#how-h');
  await expect(page.locator('h1')).toHaveText(
    dictionaries['zh-hant'].noPostsTitle,
  );
  await expect(page.locator('.prose')).toHaveCount(0);
  await page.goto('/detail/depth/');
  await expect(page).toHaveURL('/zh-hant/#competencies-title');
  await expect(page.locator('#competencies-title')).toBeInViewport();
  await page.goto('/#exp-h');
  await expect(page).toHaveURL('/en/#exp-h');
  await expect(page.locator('#experience-title')).toBeInViewport();
  // The profile moved to each language's home; old About links keep their anchor.
  await page.goto('/ja/about/#exp-h');
  await expect(page).toHaveURL('/ja/#exp-h');
  await expect(page.locator('#experience-title')).toBeInViewport();
  await page.goto('/en/about/');
  await expect(page).toHaveURL('/en/');
});

test('migrated AI and video pages have no links or forwarding stubs', async ({
  page,
  request,
}) => {
  await page.goto('/en/');
  await expect(
    page.locator('a[href*="/ai/"], a[href*="/research/"], a[href*="/papers/"]'),
  ).toHaveCount(0);
  for (const locale of ['zh-hant', 'en', 'ja'])
    for (const path of [
      'ai',
      'research',
      'papers',
      'blog/video-console',
      'blog/trilingual-model-research',
    ])
      expect((await request.get(`/${locale}/${path}/`)).status()).toBe(404);
});

test('comments start automatically near the section without loading a real third party in the test', async ({
  page,
}) => {
  let scriptRequests = 0;
  await page.route('https://giscus.app/client.js', async (route) => {
    scriptRequests++;
    await route.fulfill({
      contentType: 'application/javascript',
      body: '/* isolated transport fixture */',
    });
  });
  await page.goto('/zh-hant/note/medical/drugs/analgesics/');
  await expect(page.locator('#comments')).toHaveCount(1);
  await expect(page.locator('#comments button')).toHaveCount(0);
  expect(scriptRequests).toBe(0);
  await page.locator('#comments').scrollIntoViewIfNeeded();
  await expect.poll(() => scriptRequests).toBe(1);
  await expect(page.locator('.giscus-frame-host script')).toHaveAttribute(
    'data-lang',
    'zh-TW',
  );
  for (const locale of ['en', 'ja']) {
    await page.goto(`/${locale}/blog/engineering-principles/`);
    await expect(page.locator('#comments, iframe')).toHaveCount(0);
  }
});

test('feeds, sitemap and published alternates agree with real pages', async ({
  page,
  request,
}) => {
  await page.goto('/en/note/');
  for (const locale of ['zh-hant', 'en', 'ja']) {
    const response = await request.get(`/${locale}/rss.xml`);
    expect(response.status()).toBe(200);
    const parsed = await page.evaluate(
      (value) => {
        const document = new DOMParser().parseFromString(
          value,
          'application/xml',
        );
        return {
          errors: document.querySelectorAll('parsererror').length,
          links: Array.from(document.querySelectorAll('item > link')).map(
            (node) => node.textContent ?? '',
          ),
        };
      },
      await response.text(),
    );
    expect(parsed.errors).toBe(0);
    expect(parsed.links).toEqual([]);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(
    await page.evaluate(
      (value) =>
        new DOMParser()
          .parseFromString(value, 'application/xml')
          .querySelectorAll('parsererror').length,
      sitemap,
    ),
  ).toBe(0);
  expect(sitemap).not.toContain('llm-context-window-three-tiers');
  expect(sitemap).not.toContain('/research/');
  expect(sitemap).toContain('https://dennysora.me/en/projects/tools/dgxtop/');
  expect(sitemap).toContain(
    'https://dennysora.me/zh-hant/projects/tools/dgxtop/',
  );
  expect(sitemap).toContain('https://dennysora.me/ja/projects/tools/dgxtop/');
  expect(sitemap).not.toContain('/projects/dgxtop/');
  expect(sitemap).not.toContain('/privacy/');
  for (const locale of ['zh-hant', 'en', 'ja'])
    expect(sitemap).not.toContain(
      `https://dennysora.me/${locale}/blog/video-console/`,
    );
  expect(sitemap).not.toContain('/blog/engineering-principles/');
  expect(sitemap).not.toContain('/blog/production-systems/');
  expect(sitemap).not.toContain('/blog/trilingual-model-research/');
  expect(sitemap).toContain('https://dennysora.me/ja/note/');
  expect(sitemap).toContain(
    'https://dennysora.me/zh-hant/note/medical/drugs/analgesics/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
  for (const link of await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    ))
    expect((await request.get(new URL(link).pathname)).status()).toBe(200);
});

test('notes, languages and phone navigation work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${origin}/zh-hant/note/medical/drugs/analgesics/`);
  await expect(page.locator('h1')).toContainText('止痛藥指南');
  await expect(page.locator('main')).toContainText('Acetaminophen');
  await page.goto(`${origin}/en/note/medical/`);
  await expect(page.locator('h1')).toContainText('Health & medicine');
  await expect(page.locator('.menu-button')).toBeHidden();
  await expect(page.locator('.reader-tools')).toBeHidden();
  // The editor tabs are plain links, so every area stays reachable without scripts.
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible();
  await page.locator('.header-language summary').click();
  await page
    .locator('.header-language')
    .getByRole('link', { name: '日本語' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page
    .getByRole('navigation', { name: 'メインナビゲーション' })
    .getByRole('link', { name: /README\.md/ })
    .click();
  await expect(page).toHaveURL(`${origin}/ja/`);
  await expect(page.locator('h1')).toContainText('DennySORA');
  await expect(page.locator('.status-mode')).toHaveText('NORMAL');
  await context.close();
});

test('desktop Explorer remains visible and usable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${origin}/en/note/`);
  await expect(page.locator('#desktop-explorer')).toBeVisible();
  await expect(page.locator('.desktop-explorer-toggle')).toBeHidden();
  await page
    .locator('#desktop-explorer')
    .getByRole('link', { name: /^Pain medicines/ })
    .click();
  await expect(page).toHaveURL(`${origin}/en/note/medical/drugs/analgesics/`);
  await expect(page.locator('h1')).toContainText('Pain medicine guide');
  await context.close();
});
