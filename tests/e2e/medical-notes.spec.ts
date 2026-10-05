import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { trackExternalRequests } from './helpers.ts';

const brain = '/zh-hant/note/medical/pathology/brain-cns-tumors/';
test('medical categories, original URL and source-only guide remain navigable', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto('/zh-hant/note/medical/');
  await page
    .locator('main')
    .getByRole('link', { name: '病理', exact: true })
    .click();
  await page
    .locator('main')
    .getByRole('link', { name: /brain-cns-tumors.md/ })
    .click();
  await expect(page.locator('#medical-title')).toHaveText(
    '腦與中樞神經系統腫瘤：分類與膠質瘤入門',
  );
  await expect(page.locator('.cmdline')).toContainText(
    'note/medical/pathology/brain-cns-tumors.md',
  );
  await page
    .locator('.medical-toc')
    .getByRole('link', { name: '症狀與警訊' })
    .click();
  await expect(page).toHaveURL(/#symptoms$/);
  await expect(page.locator('a[hreflang="en"][rel="alternate"]')).toHaveCount(
    0,
  );
  await page.goto('/zh-hant/note/medical/analgesics/#mechanism');
  await expect(page).toHaveURL(/\/medical\/drugs\/analgesics\/#mechanism$/);
  await expect(page.locator('#medical-title')).toContainText('止痛藥指南');
  expect(external).toEqual([]);
});

test('brain guide is accessible, responsive and readable without JavaScript', async ({
  page,
  browser,
}, testInfo) => {
  await page.goto(brain);
  for (const [width, height] of [
    [320, 900],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`brain-${width}.png`) });
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/zh-hant/note/medical/analgesics/#mechanism');
  await expect(staticPage.locator('#mechanism')).toBeInViewport();
  await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://dennysora.me/zh-hant/note/medical/drugs/analgesics/',
  );
  await expect(staticPage.locator('meta[http-equiv="refresh"]')).toHaveCount(0);
  await staticPage.goto(brain);
  await expect(staticPage.locator('#medical-title')).toBeVisible();
  await staticPage
    .locator('.medical-toc')
    .getByRole('link', { name: '來源', exact: true })
    .click();
  await expect(staticPage).toHaveURL(/#sources$/);
  await expect(staticPage.locator('#sources')).toBeVisible();
  await context.close();
});
