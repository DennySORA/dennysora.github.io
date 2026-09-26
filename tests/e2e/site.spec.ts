import { test, expect } from '@playwright/test';
import { publishedPaths } from '../../src/lib/content.server.ts';
import { origin, trackExternalRequests } from './helpers.ts';

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
    expect(html, path).not.toContain('raw.githubusercontent.com');
  }
});

test('the header uses the real same-origin logo and keeps a usable brand link if it fails', async ({
  page,
}) => {
  await page.goto('/zh-hant/about/');
  const logo = page.locator('.site-header .brand-mark');
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
    height: 56,
  });
  const brand = page.getByRole('link', { name: 'DennySORA 首頁' }).first();
  await expect(brand).toHaveAttribute('href', '/zh-hant/');
  await page.route('**/assets/logo.png', (route) => route.abort());
  await page.reload();
  await expect(page.locator('.site-header .brand-name')).toHaveText(
    'DennySORA',
  );
  await expect(page.locator('.site-header .brand-name')).toBeVisible();
  await brand.click();
  await expect(page).toHaveURL('/zh-hant/');
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
        background: 'rgb(11, 16, 32)',
        scheme: 'dark',
        theme: 'dark',
      });
    }
    await context.close();
  }
});

test('language switching keeps the article, metadata and a direct reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/zh-hant/blog/engineering-principles/');
  await expect(page.locator('h1')).toContainText('工程原則');
  await page
    .getByRole('link', { name: 'English', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/blog\/engineering-principles\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('h1')).toContainText('engineering principles');
  await page.getByRole('link', { name: '日本語', exact: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://dennysora.me/ja/blog/engineering-principles/',
  );
  expect(errors).toEqual([]);
});

test('the header search link and keyboard shortcuts open article search without stealing typing', async ({
  page,
}) => {
  await page.goto('/en/about/');
  await page.keyboard.press('/');
  await expect(page).toHaveURL('/en/blog/#search');
  const input = page.getByRole('searchbox', { name: 'Search articles' });
  await expect(input).toBeFocused();
  await input.press('/');
  await expect(input).toHaveValue('/');
  await input.fill('');
  await page.locator('h1').click();
  await page.keyboard.press('Control+k');
  await expect(input).toBeFocused();
  await page.goto('/en/projects/');
  await page.getByRole('link', { name: 'Search articles' }).click();
  await expect(page).toHaveURL('/en/blog/#search');
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
  await page.goto('/blog/llm-context-window-three-tiers/');
  await expect(page.locator('h1')).toContainText('原始文章');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  await page.goto('/detail/production/');
  await expect(page).toHaveURL('/zh-hant/blog/production-systems/');
  await page.goto('/detail/depth/#how-h');
  await expect(page).toHaveURL('/zh-hant/blog/engineering-principles/#how-h');
  await expect(page.locator('#how-h')).toBeInViewport();
  await page.goto('/detail/depth/');
  await expect(page).toHaveURL('/zh-hant/about/#depth-h');
  await expect(page.locator('#depth-h')).toHaveAttribute('open', '');
  await expect(page.locator('#depth-h summary')).toBeInViewport();
  await page.goto('/#exp-h');
  await expect(page).toHaveURL('/zh-hant/about/#exp-h');
  await expect(page.locator('#experience-title')).toBeInViewport();
});

test('the former research page is a no-index bridge to both destinations', async ({
  page,
}) => {
  await page.goto('/en/research/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(
    page.getByRole('link', { name: 'Go to Paper Daily' }),
  ).toHaveAttribute('href', '/en/papers/');
  await page.getByRole('link', { name: 'Read research notes' }).click();
  await expect(page).toHaveURL('/en/blog/?type=research-note');
  await expect(page.locator('.article-row')).toHaveCount(1);
  await expect(
    page
      .getByRole('group', { name: 'Type' })
      .getByRole('button', { name: 'Research note' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('Paper Daily explains the separate site and labels generated content without fetching it', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto('/en/papers/');
  const open = page.getByRole('link', { name: /Open Paper Daily/ });
  await expect(open).toHaveAttribute('href', 'https://paper.dennysora.me/');
  await expect(open).toBeInViewport();
  await expect(
    page.getByText('Automatically generated · not individually reviewed'),
  ).toHaveCount(3);
  await expect(page.getByText('Snapshot from 2026-09-17')).toBeVisible();
  expect(external).toEqual([]);
});

test('no third-party requests, cookies or storage; comments never load on their own', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  for (const path of [
    '/en/',
    '/en/about/',
    '/en/projects/',
    '/en/blog/engineering-principles/',
    '/en/papers/',
    '/en/privacy/',
  ])
    await page.goto(path);
  await page.goto('/en/blog/');
  await page.getByRole('searchbox').fill('quantization');
  await expect(page.locator('.article-row')).toHaveCount(2);
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
  // Native threads open on github.com only when followed; nothing is embedded.
  for (const [locale, name] of [
    ['en', 'Open the discussion on GitHub'],
    ['ja', 'GitHub でディスカッションを開く'],
  ] as const) {
    await page.goto(`/${locale}/blog/engineering-principles/`);
    await expect(
      page.locator('#comments').getByRole('link', { name }),
    ).toHaveAttribute(
      'href',
      'https://github.com/DennySORA/dennysora.github.io/discussions/1',
    );
  }
  await expect(page.getByRole('button', { name: 'Load comments' })).toHaveCount(
    0,
  );
  expect(external).toEqual([]);
  await page.goto('/en/privacy/');
  await expect(
    page.getByText('Comments use native GitHub Discussions'),
  ).toBeVisible();
});

test('feeds, sitemap and published alternates agree with real pages', async ({
  page,
  request,
}) => {
  await page.goto('/en/blog/engineering-principles/');
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
    expect(parsed.links).toHaveLength(3);
    for (const link of parsed.links) expect(link).toContain(`/${locale}/blog/`);
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
  expect(sitemap).not.toContain('/projects/dgxtop/');
  expect(sitemap).toContain('https://dennysora.me/ja/blog/tags/llm/');
  for (const link of await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    ))
    expect((await request.get(new URL(link).pathname)).status()).toBe(200);
});

test('articles, languages and phone navigation work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${origin}/en/blog/engineering-principles/`);
  await expect(page.locator('.prose')).toContainText('Abstractions are useful');
  await expect(page.locator('.prose pre')).not.toHaveCount(0);
  await expect(page.locator('.menu-button')).toBeHidden();
  await expect(page.locator('.reader-tools')).toBeHidden();
  const nav = page.locator('.nojs-nav');
  await expect(nav).toBeVisible();
  await page
    .locator('.footer-languages')
    .getByRole('link', { name: '日本語' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await nav.getByRole('link', { name: '自己紹介', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/ja/about/`);
  await expect(page.locator('h1')).toContainText('DennySORA');
  await context.close();
});
