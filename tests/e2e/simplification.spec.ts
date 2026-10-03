import { expect, test } from '@playwright/test';
import { locales } from '../../src/i18n/index.ts';
import { origin } from './helpers.ts';

for (const locale of locales)
  test(`${locale} keeps the concise résumé and removes the requested pages and callout`, async ({
    page,
    request,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('.front-matter > div').nth(0)).toHaveText(
      'name李汶道',
    );
    await expect(page.locator('.front-matter > div').nth(1)).toHaveText(
      'aliasDennySORA',
    );
    await expect(
      page.locator('#competencies-title, #experience-title'),
    ).toHaveCount(2);
    await expect(
      page.locator(
        '#works-title, #exploring, #beyond, #record, #contact, .md-comments',
      ),
    ).toHaveCount(0);
    await expect(
      page.locator('a[href*="/projects/"], a[href*="/privacy/"]'),
    ).toHaveCount(0);
    // The tabline lists the areas as buffers; the open one is current, and
    // Paper Daily is marked as leaving the site.
    const buffers = page.locator('.buffers');
    await expect(buffers.locator('.tab-name')).toHaveText([
      'README.md',
      'blog',
      'note',
      'paper-daily',
    ]);
    await expect(buffers.locator(`a[href="/${locale}/"]`)).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      buffers.locator('a[href="https://paper.dennysora.me/"] svg'),
    ).toHaveCount(2);
    await expect(page.locator('img[src*="navigation-icons"]')).toHaveCount(0);
    for (const path of ['projects/', 'projects/dgxtop/', 'privacy/'])
      expect((await request.get(`/${locale}/${path}`)).status()).toBe(404);
    await page.goto(`/${locale}/blog/`);
    await expect(
      page.locator('#library-papers-title, .quiet-note'),
    ).toHaveCount(0);
    expect(
      (await request.get('/zh-hant/note/network/p2p-privacy/')).status(),
    ).toBe(200);
  });

for (const [language, locale] of [
  ['zh-TW', 'zh-hant'],
  ['ja-JP', 'ja'],
  ['en-US', 'en'],
  ['fr-FR', 'en'],
] as const)
  test(`root follows ${language}, while explicit language and manual switching stay authoritative`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: language });
    try {
      const page = await context.newPage();
      await page.goto(origin + '/?from=direct');
      await expect(page).toHaveURL(origin + `/${locale}/?from=direct`);
      await page.goto(origin + '/ja/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
      await page.locator('.header-language summary').click();
      await page
        .getByRole('link', { name: 'English', exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(origin + '/en/');
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(await context.cookies()).toEqual([]);
      expect(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
      ).toBe(0);
    } finally {
      await context.close();
    }
  });

test('ordered browser preferences and no-JavaScript fallback retain usable navigation', async ({
  browser,
}) => {
  const context = await browser.newContext();
  try {
    await context.addInitScript(() =>
      Object.defineProperty(navigator, 'languages', {
        value: ['fr-FR', 'ja-JP', 'en-US'],
      }),
    );
    const page = await context.newPage();
    await page.goto(origin + '/#exp-h');
    await expect(page).toHaveURL(origin + '/ja/#exp-h');
    await expect(page.locator('#experience-title')).toBeInViewport();
  } finally {
    await context.close();
  }
  const noJs = await browser.newContext({
    locale: 'ja-JP',
    javaScriptEnabled: false,
  });
  try {
    const page = await noJs.newPage();
    await page.goto(origin + '/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
    await expect(page.locator('#readme-title')).toBeVisible();
    await page.locator('.header-language summary').click();
    await page
      .getByRole('link', { name: '日本語', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(origin + '/ja/');
  } finally {
    await noJs.close();
  }
});

for (const [width, height] of [
  [1280, 800],
  [1440, 900],
  [1920, 1080],
])
  test(`collapsed Explorer centers retained content at ${width}px and expansion restores it`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width!, height: height! });
    for (const path of [
      '/zh-hant/',
      '/en/blog/',
      '/zh-hant/note/network/p2p-privacy/',
    ]) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
      const metrics = () =>
        page
          .locator('main > .buffer, main > .container')
          .evaluate((element) => {
            const content = element.getBoundingClientRect();
            const editor = element.closest('.editor')!.getBoundingClientRect();
            return {
              left: content.left,
              right: content.right,
              center: (content.left + content.right) / 2,
              editorCenter: (editor.left + editor.right) / 2,
            };
          });
      const expanded = await metrics();
      for (let repeat = 0; repeat < 2; repeat++) {
        await page.locator('.desktop-explorer-toggle button').click();
        await expect(page.locator('#desktop-explorer')).toBeHidden();
        const collapsed = await metrics();
        expect(
          Math.abs(collapsed.center - collapsed.editorCenter),
        ).toBeLessThanOrEqual(1);
        await page.locator('.desktop-explorer-toggle button').click();
        await expect(page.locator('#desktop-explorer')).toBeVisible();
        const restored = await metrics();
        expect(restored.left).toBeCloseTo(expanded.left, 0);
        expect(restored.right).toBeCloseTo(expanded.right, 0);
      }
    }
  });
