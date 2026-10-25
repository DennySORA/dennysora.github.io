import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { trackExternalRequests } from './helpers.ts';

const photo = '/zh-hant/note/other/landscape-photography/';
const lumbar = '/zh-hant/note/medical/daily-care/lumbar-spine-care/';

test('Health & medicine and Other folders lead to their notes', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto('/zh-hant/note/');
  const main = page.locator('main');
  await page.goto('/zh-hant/note/medical/');
  await main.getByRole('link', { name: '日常照顧', exact: true }).click();
  await expect(page).toHaveURL(/\/note\/medical\/daily-care\/$/);
  await main.getByRole('link', { name: /腰椎保護/ }).click();
  await expect(page).toHaveURL(new RegExp(`${lumbar}$`));
  await expect(page.locator('#triage')).toBeVisible();

  await page.goto('/zh-hant/note/other/');
  // Other holds the photography note directly, without a subfolder.
  await main.getByRole('link', { name: /風景攝影/ }).click();
  await expect(page).toHaveURL(new RegExp(`${photo}$`));
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});

test('photo guides toggle and the local calculators recompute', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto(photo);
  const article = page.locator('.study-note article');
  const toggle = page.locator('button[data-guides="guides-gorge"]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#guides-gorge')).toBeHidden();
  await page.locator('#pg-thirds').uncheck();
  await expect(article).toHaveAttribute('data-hide-thirds', '');
  await expect(page.locator('#guides-bend .sn-thirds')).toBeHidden();
  await expect(page.locator('#guides-bend .sn-marks')).toBeVisible();
  await page.locator('#pg-guides-reset').click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#guides-gorge')).toBeVisible();
  await expect(article).not.toHaveAttribute('data-hide-thirds');

  await expect(page.locator('#pg-hyper')).toHaveText('2.42 m');
  await expect(page.locator('#pg-near')).toHaveText('約 1.21 m');
  await page.locator('#pg-focal').selectOption('50');
  await expect(page.locator('#pg-hyper')).toHaveText('10.47 m');
  await expect(page.locator('#pg-near')).toHaveText('約 5.23 m');
  await expect(page.locator('#pg-nd-time')).toHaveText('17.07 s');
  await page.locator('#pg-stops').selectOption('15');
  await expect(page.locator('#pg-nd-time')).toHaveText('9.10 min');
  await expect(page.locator('#pg-nd-factor')).toHaveText('×32,768');

  const revise = await page.locator('[data-grade="revise"]').count();
  await page.locator('#pg-archive-filter').check();
  await expect(page.locator('.sn-archive > li:visible')).toHaveCount(revise);
  await expect(page.locator('#pg-archive-count')).toHaveText(
    `顯示 ${revise}／31 張`,
  );
  // A link to a filtered photo brings it back.
  await page.goto(photo + '#shot-01');
  await expect(page.locator('#shot-01')).toBeVisible();
  expect(external).toEqual([]);
});

test('the photography tools stay localized', async ({ page }) => {
  await page.goto('/en/note/other/landscape-photography/');
  await expect(page.locator('#pg-near')).toHaveText('about 1.21 m');
  await page.locator('#pg-archive-filter').check();
  await expect(page.locator('#pg-archive-count')).toContainText('of 31');
});

test('the new notes are accessible, fit every width and read without JavaScript', async ({
  page,
  browser,
}, testInfo) => {
  for (const path of [photo, lumbar]) {
    await page.goto(path);
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
        `${path} at ${width}`,
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: testInfo.outputPath(`${path.split('/').at(-2)}.png`),
    });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
  for (const path of [
    '/en/note/hardware/',
    '/ja/note/medical/daily-care/',
    '/en/note/other/',
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }

  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(photo);
  await expect(staticPage.locator('#note-title')).toBeVisible();
  await expect(staticPage.locator('#guides-gorge')).toBeVisible();
  await expect(staticPage.locator('#pg-hyper')).toHaveText('2.42 m');
  await expect(staticPage.locator('#pg-focal')).toBeHidden();
  await expect(
    staticPage.locator('button[data-guides="guides-gorge"]'),
  ).toBeHidden();
  await expect(staticPage.locator('.sn-archive > li')).toHaveCount(31);
  await context.close();
});
