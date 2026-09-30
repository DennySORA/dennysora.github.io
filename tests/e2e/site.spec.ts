import { test, expect } from '@playwright/test';
import { dictionaries } from '../../src/i18n/index.ts';
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

test('the title bar uses the real same-origin logo and keeps a usable brand link if it fails', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/');
  const logo = page.locator('.titlebar .brand-mark');
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
    height: 32,
  });
  const brand = page.getByRole('link', { name: 'DennySORA 首頁' }).first();
  await expect(brand).toHaveAttribute('href', '/zh-hant/');
  await page.route('**/assets/logo.png', (route) => route.abort());
  await page.reload();
  await expect(page.locator('.titlebar .brand-name')).toHaveText('DennySORA');
  await expect(page.locator('.titlebar .brand-name')).toBeVisible();
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
        background: 'rgb(11, 16, 32)',
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

test('the header search link and keyboard shortcuts open article search without stealing typing', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
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
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Search articles' })
    .click();
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
  await expect(page.locator('h1')).toHaveText(
    dictionaries['zh-hant'].noPostsTitle,
  );
  await expect(page.locator('.prose')).toHaveCount(0);
  await page.goto('/detail/depth/');
  await expect(page).toHaveURL('/zh-hant/#depth-h');
  await expect(page.locator('#depth-h')).toHaveAttribute('open', '');
  await expect(page.locator('#depth-h summary')).toBeInViewport();
  await page.goto('/#exp-h');
  await expect(page).toHaveURL('/zh-hant/#exp-h');
  await expect(page.locator('#experience-title')).toBeInViewport();
  // The profile moved to each language's home; old About links keep their anchor.
  await page.goto('/ja/about/#exp-h');
  await expect(page).toHaveURL('/ja/#exp-h');
  await expect(page.locator('#experience-title')).toBeInViewport();
  await page.goto('/en/about/');
  await expect(page).toHaveURL('/en/');
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
    page.getByRole('link', { name: /Go to Paper Daily/ }),
  ).toHaveAttribute('href', 'https://paper.dennysora.me/');
  await page.getByRole('link', { name: 'Read research notes' }).click();
  await expect(page).toHaveURL('/en/blog/?type=research-note');
  await expect(page.locator('.article-row')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'No posts yet' }),
  ).toBeVisible();
  await expect(page.locator('.filter-row')).toHaveCount(0);
});

test('Paper Daily is its own site: every entry links straight to it and the old page only forwards', async ({
  page,
  request,
}) => {
  const external = trackExternalRequests(page);
  await page.goto('/en/');
  for (const region of [
    page.getByRole('navigation', { name: 'Main navigation' }),
    page.getByRole('navigation', { name: 'Explorer' }),
    page.getByRole('navigation', { name: 'Quick links' }),
  ])
    await expect(
      region.getByRole('link', { name: /paper-daily|Paper Daily/ }),
    ).toHaveAttribute('href', 'https://paper.dennysora.me/');
  expect(external).toEqual([]);
  // The former in-site page is a forwarding stub, not a page of its own.
  for (const locale of ['zh-hant', 'en', 'ja']) {
    const response = await request.get(`/${locale}/papers/`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(
      '<meta http-equiv="refresh" content="0;url=https://paper.dennysora.me/">',
    );
    expect(html).toContain('noindex');
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/papers/');
  expect(sitemap).not.toContain('/about/');
});

test('no third-party requests, cookies or storage; comments never load on their own', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  for (const path of [
    '/en/',
    '/ja/',
    '/en/projects/',
    '/en/blog/engineering-principles/',
    '/en/privacy/',
  ])
    await page.goto(path);
  await page.goto('/en/blog/');
  await page.getByRole('searchbox').fill('quantization');
  await expect(page.locator('.article-row')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'No posts yet' }),
  ).toBeVisible();
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
  // Removed placeholders have no live discussions or comment embeds.
  for (const locale of ['en', 'ja']) {
    await page.goto(`/${locale}/blog/engineering-principles/`);
    await expect(page.locator('#comments, iframe')).toHaveCount(0);
  }
  await page.goto('/zh-hant/note/medical/analgesics/');
  await expect(page.locator('iframe')).toHaveCount(0);
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
    expect(parsed.links).toHaveLength(0);
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
  expect(sitemap).not.toContain('/blog/engineering-principles/');
  expect(sitemap).not.toContain('/blog/production-systems/');
  expect(sitemap).not.toContain('/blog/trilingual-model-research/');
  expect(sitemap).toContain('https://dennysora.me/ja/note/');
  expect(sitemap).toContain(
    'https://dennysora.me/zh-hant/note/medical/analgesics/',
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
  await page.goto(`${origin}/zh-hant/note/medical/analgesics/`);
  await expect(page.locator('h1')).toContainText('Loxoprofen');
  await expect(page.locator('main')).toContainText('Acetaminophen');
  await page.goto(`${origin}/en/note/medical/`);
  await expect(page.locator('h1')).toContainText('Medicine');
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
  await expect(page.locator('.sidebar-collapse')).toBeHidden();
  await page
    .locator('#desktop-explorer')
    .getByRole('link', { name: /analgesics\.md/ })
    .click();
  await expect(page).toHaveURL(`${origin}/zh-hant/note/medical/analgesics/`);
  await expect(page.locator('h1')).toContainText('Loxoprofen');
  await context.close();
});
