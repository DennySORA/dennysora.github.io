import { test, expect } from '@playwright/test';
import { publishedPaths } from '../../src/lib/content.server.ts';

test('every production route is complete HTML with working assets', async ({
  request,
}) => {
  for (const path of publishedPaths()) {
    const response = await request.get(path === '/' ? path : path + '/');
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain('<h1');
    expect(html, path).toContain('rel="canonical"');
    expect(html, path).not.toContain('googleapis.com');
  }
});
test('locale switching retains article identity, metadata and direct reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
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
test('search, URL filters, empty state and recovery', async ({ page }) => {
  await page.goto('/zh-hant/blog/');
  await page.keyboard.press('/');
  const input = page.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('量化');
  await expect(page.locator('.post-card')).toHaveCount(1);
  await expect(page).toHaveURL(/q=/);
  await input.fill('zzzznomatch');
  await expect(
    page.getByRole('heading', { name: '沒有符合的文章。' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '清除篩選' }).click();
  await expect(page.locator('.post-card')).toHaveCount(3);
  await page.getByRole('button', { name: '工程思考', exact: true }).click();
  await expect(page.locator('.post-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.post-card')).toHaveCount(1);
});
test('search index failure remains readable and retries', async ({ page }) => {
  await page.route('**/search/en.json', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.goto('/en/blog/');
  await expect(page.getByRole('alert')).toContainText('could not be loaded');
  await expect(page.locator('.post-card')).toHaveCount(3);
  await page.unroute('**/search/en.json');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('searchbox').fill('SentencePiece');
  await expect(page.locator('.post-card')).toHaveCount(1);
});
test('mobile navigation traps focus, closes with Escape and restores scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/');
  const trigger = page.getByRole('button', { name: 'メニュー', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let n = 0; n < 15; n++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.locator('body').evaluate((el) => el.style.overflow)).toBe(
    '',
  );
  for (let iteration = 0; iteration < 3; iteration++) {
    await trigger.click();
    await page.keyboard.press('Escape');
    expect(await page.locator('body').evaluate((el) => el.style.overflow)).toBe(
      '',
    );
    await expect(trigger).toBeFocused();
  }
  await trigger.click();
  await dialog.getByRole('link', { name: '記事', exact: false }).click();
  await expect(page).toHaveURL('/ja/blog/');
});
for (const width of [320, 360, 390, 768, 1280, 1440, 1920])
  test(`responsive geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
    for (const path of [
      '/zh-hant/',
      '/en/projects/',
      '/ja/blog/trilingual-model-research/',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
        path,
      ).toBe(true);
      expect(
        await page
          .locator('img')
          .evaluateAll((elements) =>
            elements.every(
              (el) =>
                el instanceof HTMLImageElement &&
                el.complete &&
                el.naturalWidth > 0,
            ),
          ),
      ).toBe(true);
    }
  });
test('full article, languages and mobile navigation work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/en/blog/engineering-principles/');
  await expect(page.locator('.prose')).toContainText('Abstractions are useful');
  await expect(page.locator('.prose pre')).not.toHaveCount(0);
  await page.getByRole('link', { name: '日本語', exact: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page
    .locator('.nojs-nav')
    .getByRole('link', { name: '自己紹介', exact: true })
    .click();
  await expect(page.locator('h1')).toContainText('エンジニアリング');
  await context.close();
});
test('404 stays a 404, deleted articles are explicit, known bridges work', async ({
  page,
  request,
}) => {
  expect((await request.get('/does-not-exist/')).status()).toBe(404);
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
  await expect(page.locator('#depth-h')).toBeInViewport();
  await page.goto('/#exp-h');
  await expect(page).toHaveURL('/zh-hant/about/#exp-h');
  await expect(page.locator('#exp-h')).toBeInViewport();
});
test('no external requests, cookies or browser storage; research is explicitly a snapshot', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4174/'))
      external.push(request.url());
  });
  await page.goto('/en/research/');
  await expect(page.getByText('2026-09-17', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Automatically generated · not individually reviewed'),
  ).toHaveCount(3);
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('code copying and reduced motion remain operable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/blog/engineering-principles/');
  await page
    .getByRole('button', { name: 'Copy code', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('button', { name: 'Copied', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'LLM API',
  );
});

test('feeds, sitemap and published alternates agree with real pages', async ({
  page,
  request,
}) => {
  await page.goto('/en/blog/engineering-principles/');
  for (const locale of ['zh-hant', 'en', 'ja']) {
    const response = await request.get(`/${locale}/rss.xml`);
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const parsed = await page.evaluate((value) => {
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
    }, xml);
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
  for (const link of await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    )) {
    expect((await request.get(new URL(link).pathname)).status()).toBe(200);
  }
});
