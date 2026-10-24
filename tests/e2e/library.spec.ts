import { test, expect } from '@playwright/test';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { origin } from './helpers.ts';

for (const locale of locales) {
  test(`${locale} blog has a useful empty state and no migrated links`, async ({
    page,
  }) => {
    const t = dictionaries[locale];
    await page.goto(`/${locale}/blog/?topic=ai&tag=video-generation`);
    await expect(page.locator('.article-row')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: t.noPostsTitle }),
    ).toBeVisible();
    await expect(page.locator('.empty-state a')).toHaveAttribute(
      'href',
      `/${locale}/note/`,
    );
    await expect(
      page.locator('a[href*="paper.dennysora.me"], a[href*="video-console"]'),
    ).toHaveCount(0);
    await expect(page.locator('.active-conditions')).toHaveCount(0);
  });
}

test('the site header still opens global search from the README', async ({
  page,
}) => {
  await page.goto('/en/');
  await page.locator('.tabline-search').click();
  await expect(page).toHaveURL('/en/search/#search');
  await expect(page.getByRole('searchbox')).toBeVisible();
});

test('empty blog stays useful without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/en/blog/`);
    await expect(
      page.getByRole('heading', { name: dictionaries.en.noPostsTitle }),
    ).toBeVisible();
    await page.locator('.empty-state a').click();
    await expect(page).toHaveURL(`${origin}/en/note/`);
  } finally {
    await context.close();
  }
});

test('feeds contain no removed articles and former media pages return 404', async ({
  request,
}) => {
  for (const locale of locales) {
    const xml = await (await request.get(`/${locale}/rss.xml`)).text();
    expect(xml).not.toContain('<item>');
    for (const path of [
      'ai',
      'research',
      'papers',
      'blog/video-console',
      'blog/trilingual-model-research',
    ])
      expect((await request.get(`/${locale}/${path}/`)).status()).toBe(404);
  }
});
