import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { trackExternalRequests } from './helpers.ts';

const page = '/en/projects/tools/dgxtop/';

test('the projects buffer leads through Tools to dgxtop and its other edition', async ({
  page: tab,
}) => {
  const external = trackExternalRequests(tab);
  await tab.goto('/en/');
  await tab
    .locator('.buffers')
    .getByRole('link', { name: /projects/ })
    .click();
  await expect(tab).toHaveURL(/\/en\/projects\/$/);
  await expect(tab.locator('.buffers [aria-current="page"]')).toContainText(
    'projects',
  );
  await tab
    .locator('main')
    .getByRole('link', { name: 'Tools', exact: true })
    .click();
  await expect(tab).toHaveURL(/\/en\/projects\/tools\/$/);
  await tab
    .locator('main')
    .getByRole('link', { name: /dgxtop\.md/ })
    .click();
  await expect(tab).toHaveURL(new RegExp(`${page}$`));
  await expect(tab.locator('h1')).toContainText('never shows a fake zero');
  await expect(tab.locator('.cmdline')).toContainText(
    'projects/tools/dgxtop.md',
  );
  await expect(tab.locator('main figure.dg')).toHaveCount(7);
  await expect(tab.locator('main .project-shot img')).toHaveCount(7);
  // Every screenshot decodes once it has been scrolled into view.
  for (const image of await tab.locator('main .project-shot img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(1800);
  }
  await tab
    .locator('.project-sections')
    .getByRole('link', { name: 'Exact history' })
    .click();
  await expect(tab).toHaveURL(/#history$/);
  await expect(tab.locator('#history')).toBeInViewport();

  await tab.locator('.header-language summary').click();
  await tab
    .getByRole('link', { name: '繁體中文', exact: true })
    .first()
    .click();
  await expect(tab).toHaveURL(/\/zh-hant\/projects\/tools\/dgxtop\/$/);
  await expect(tab.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await expect(tab.locator('#architecture')).toContainText('六個元件');
  expect(external).toEqual([]);
  expect(await tab.context().cookies()).toEqual([]);
  expect(
    await tab.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});

test('Japanese readers get the folders and an honest pointer to the English edition', async ({
  page: tab,
  request,
}) => {
  expect((await request.get('/ja/projects/tools/dgxtop/')).status()).toBe(404);
  expect((await request.get('/en/projects/dgxtop/')).status()).toBe(404);
  await tab.goto('/ja/projects/tools/');
  const file = tab.locator('main .collection-files a');
  await expect(file).toHaveAttribute('href', page);
  await expect(file).toHaveAttribute('hreflang', 'en');
  await expect(tab.locator('main .collection-meta')).toContainText(
    'この言語の版はまだありません',
  );
});

test('the dgxtop page is accessible, fits every width and reads without JavaScript', async ({
  page: tab,
  browser,
}, testInfo) => {
  await tab.goto(page);
  for (const [width, height] of [
    [320, 900],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ]) {
    await tab.setViewportSize({ width: width!, height: height! });
    expect(
      await tab.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await tab.screenshot({ path: testInfo.outputPath(`dgxtop-${width}.png`) });
  }
  for (const path of [
    page,
    '/zh-hant/projects/tools/dgxtop/',
    '/ja/projects/',
  ]) {
    await tab.goto(path);
    const results = await new AxeBuilder({ page: tab })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }

  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticTab = await context.newPage();
  await staticTab.goto(page);
  await expect(staticTab.locator('h1')).toBeVisible();
  await expect(staticTab.locator('#tradeoffs')).toBeAttached();
  await expect(staticTab.locator('main figure.dg')).toHaveCount(7);
  await expect(staticTab.locator('main template, main [hidden]')).toHaveCount(
    0,
  );
  await staticTab
    .locator('.project-sections')
    .getByRole('link', { name: 'Trade-offs' })
    .click();
  await expect(staticTab).toHaveURL(/#tradeoffs$/);
  await expect(staticTab.locator('#tradeoffs')).toBeInViewport();
  await context.close();
});
