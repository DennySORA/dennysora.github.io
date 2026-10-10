import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { trackExternalRequests } from './helpers.ts';

const note = '/zh-hant/note/hardware/computer/140mm-case-fans/';

test('hardware folders lead to the fan note and its local tools recompute', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto('/zh-hant/note/');
  await page
    .locator('main')
    .getByRole('link', { name: '硬體', exact: true })
    .click();
  await expect(page).toHaveURL(/\/note\/hardware\/$/);
  await page
    .locator('main')
    .getByRole('link', { name: '電腦', exact: true })
    .click();
  await expect(page).toHaveURL(/\/note\/hardware\/computer\/$/);
  await page
    .locator('main')
    .getByRole('link', { name: /140mm-case-fans\.md/ })
    .click();
  await expect(page.locator('#hardware-title')).toContainText('前 10 推薦');
  await expect(page.locator('.cmdline')).toContainText(
    'note/hardware/computer/140mm-case-fans.md',
  );
  await expect(page.locator('.hw-pick')).toHaveCount(10);

  await page.locator('#hw-catalog-query').fill('TOUGHFAN');
  await expect(page.locator('#hw-catalog-count')).toHaveText(
    '顯示 2 / 27 款。',
  );
  await page.locator('#hw-catalog-query').fill('');
  await page.locator('#hw-catalog-thickness').selectOption('thick');
  await expect(page.locator('#hw-catalog tbody tr:visible')).toHaveCount(7);
  await page.locator('#hw-catalog-evidence').selectOption('lab');
  await page.locator('#hw-catalog-reset').click();
  await expect(page.locator('#hw-catalog tbody tr:visible')).toHaveCount(27);

  await expect(page.locator('#hw-wp-result')).toContainText('40.1 CFM');
  await page.locator('#hw-resistance').focus();
  await page.locator('#hw-resistance').press('End');
  await expect(page.locator('#hw-resistance-value')).toHaveText('2.00 mmH₂O');
  await expect(page.locator('#hw-wp-result')).not.toContainText('40.1 CFM');

  await page.locator('#hw-fan-count').fill('3');
  await expect(page.locator('#hw-qty-result')).toContainText('Tsukumo ¥4,347');
  await page.locator('#hw-fan-count').fill('0');
  await expect(page.locator('#hw-qty-result')).toHaveText(
    '請輸入 1–20 的整數顆數。',
  );

  await page.locator('#hw-catalog-query').fill('TOUGHFAN');
  await page.goto(note + '#spec-tl140');
  await expect(page.locator('#spec-tl140')).toHaveAttribute('open', '');
  await expect(page.locator('#spec-tl140')).toBeVisible();
  await expect(page.locator('a[hreflang="en"][rel="alternate"]')).toHaveCount(
    0,
  );
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});

test('fan note is accessible, fits every width and reads without JavaScript', async ({
  page,
  browser,
}, testInfo) => {
  await page.goto(note);
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
    await page.screenshot({ path: testInfo.outputPath(`fans-${width}.png`) });
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);

  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(note);
  await expect(staticPage.locator('#hardware-title')).toBeVisible();
  await expect(staticPage.locator('#hw-catalog tbody tr')).toHaveCount(27);
  await expect(staticPage.locator('#hw-wp-result')).toContainText('40.1 CFM');
  await expect(staticPage.locator('#hw-resistance')).toBeHidden();
  await staticPage
    .locator('.hw-toc')
    .getByRole('link', { name: '27 款規格' })
    .click();
  await expect(staticPage).toHaveURL(/#catalog$/);
  await expect(staticPage.locator('#catalog')).toBeInViewport();
  await context.close();
});
