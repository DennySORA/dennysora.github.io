import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { origin, trackExternalRequests } from './helpers.ts';

const base = '/zh-hant/note/network/';
test('network notes retain native navigation, source-only editions and safe local tools', async ({
  page,
}) => {
  const external = trackExternalRequests(page);
  await page.goto(base);
  await page
    .getByRole('link', { name: /P2P Downloader v2.3/ })
    .last()
    .click();
  await expect(page).toHaveURL(/p2p-downloader\/$/);
  await expect(page.locator('#network-title')).toContainText('核心架構');
  await page.locator('.toc-inline summary').click();
  await page.locator('#note-section-search').fill('SQLite');
  await expect(page.locator('#note-search-count')).not.toHaveText(/^0 /);
  await page.locator('#note-section-search').fill('thisdoesnotmatchanysection');
  await expect(page.locator('#note-search-count')).toHaveText(/^0 /);
  await page.locator('#note-section-search').fill('');
  await expect(page.locator('#pool-result')).toContainText('新增試跑：2');
  await page.locator('#fresh').uncheck();
  await expect(page.locator('#pool-result')).toContainText('重新同步');
  await page.locator('#fresh').check();
  await page.locator('#pressure').focus();
  await page.locator('#pressure').press('End');
  await expect(page.locator('#pool-result')).toContainText('drain');
  await page.locator('#scenario').selectOption('qbt');
  await expect(page.locator('#connection-result')).toContainText(
    'unsupported_scope',
  );
  await page.locator('#catalog-query').fill('doesnotexist');
  await expect(page.locator('#catalog-count')).toContainText('0 / 134');
  await page.locator('#catalog-query').fill('');
  await expect(page.locator('#catalog-body tr:visible')).toHaveCount(134);
  await page.locator('#notes').fill('離線審核');
  const download = page.waitForEvent('download');
  await page.locator('#export-notes').click();
  expect((await download).suggestedFilename()).toBe(
    'P2P_v2_3_review_notes.json',
  );
  await expect(page.locator('a[hreflang="en"][rel="alternate"]')).toHaveCount(
    0,
  );
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});

test('privacy math, archive hash navigation and repeat navigation remain usable', async ({
  page,
}) => {
  await page.goto(base + 'p2p-privacy/');
  await expect(page.locator('#ppv-out')).toHaveText('8.26%');
  await page.locator('#candidate-n').selectOption('1000');
  await expect(page.locator('#ppv-out')).toHaveText('98.90%');
  await page.locator('#tpr').focus();
  await page.locator('#tpr').press('Home');
  await expect(page.locator('#tp-out')).toHaveText('0.01');
  await page.goto(base + 'p2p-privacy/#original-63');
  await expect(page.locator('#original-63')).toHaveAttribute('open', '');
  await page.locator('#original-63 summary').click();
  await expect(page.locator('#original-63')).not.toHaveAttribute('open', '');
  await page.locator('#original-63 summary').click();
  await expect(page.locator('#original-63')).toHaveAttribute('open', '');
  await page.goto(base + 'p2p-downloader/');
  await page.goBack();
  await expect(page.locator('#network-title')).toContainText('P2P 匿名性');
});

for (const id of ['p2p-downloader', 'p2p-privacy'])
  test(`${id} is accessible and fits the existing viewport matrix`, async ({
    page,
  }) => {
    await page.goto(base + id + '/');
    for (const width of [320, 390, 768, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

test('both complete source archives remain available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: origin,
  });
  const page = await context.newPage();
  await page.goto(base + 'p2p-downloader/');
  await expect(page.locator('.network-note noscript')).toContainText('全文');
  await expect(page.locator('#catalog-body tr')).toHaveCount(134);
  await page.locator('#attachment-19 summary').click();
  await expect(page.locator('#attachment-19 pre')).toBeVisible();
  await page.goto(base + 'p2p-privacy/');
  await page.locator('#original-63 summary').click();
  await expect(page.locator('#original-63 pre')).toBeVisible();
  await expect(page.locator('#ppv-out')).toHaveText('8.26%');
  await context.close();
});
