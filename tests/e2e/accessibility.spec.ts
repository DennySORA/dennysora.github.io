import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function violations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(tags).analyze();
  return result.violations.map((violation) => ({
    id: violation.id,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      summary: node.failureSummary,
    })),
  }));
}

for (const path of [
  '/zh-hant/',
  '/en/',
  '/ja/',
  '/en/blog/',
  '/en/note/',
  '/ja/note/medical/',
  '/zh-hant/note/medical/drugs/analgesics/',
  '/en/blog/tags/',
  '/zh-hant/research/',
  '/en/missing-page/',
])
  test(`accessible content: ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });

test('accessible states: open details, language menu, typing, empty library, collapsed Explorer and explorer drawer', async ({
  page,
}) => {
  await page.goto('/en/');
  for (const summary of await page.locator('main details > summary').all())
    await summary.click();
  await page.locator('.language-menu > summary').click();
  expect(await violations(page)).toEqual([]);
  await page.goto('/zh-hant/blog/?topic=ai&tag=llm&tag=quantization');
  await expect(page.locator('.article-row')).toHaveCount(0);
  await expect(page.locator('.filter-row')).toHaveCount(0);
  expect(await violations(page)).toEqual([]);
  await page.getByRole('searchbox').fill('zzzznomatch');
  await expect(
    page.getByRole('heading', { name: '目前還沒有文章' }),
  ).toBeVisible();
  // The status line is in INSERT mode while the search field has focus.
  await expect(page.locator('.status-mode')).toHaveText('INSERT');
  expect(await violations(page)).toEqual([]);
  await page.locator('.desktop-explorer-toggle button').click();
  await expect(page.locator('#desktop-explorer')).toBeHidden();
  expect(await violations(page)).toEqual([]);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Open explorer' }).click();
  await expect(page.getByRole('dialog', { name: 'Explorer' })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});
