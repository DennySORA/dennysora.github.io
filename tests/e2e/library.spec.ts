import { test, expect, type Page } from '@playwright/test';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { origin } from './helpers.ts';

const rows = (page: Page) => page.locator('.article-row');

for (const locale of locales) {
  test(`${locale} blog is genuinely empty, without example articles or filters`, async ({
    page,
  }) => {
    const t = dictionaries[locale];
    await page.goto(`/${locale}/blog/`);
    await expect(
      page.getByRole('heading', { name: t.noPostsTitle }),
    ).toBeVisible();
    await expect(page.getByText(t.noPostsText)).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
    await expect(
      page.getByRole('status').filter({ hasText: t.articleCount(0) }),
    ).toBeVisible();
    await expect(page.locator('.filter-row')).toHaveCount(0);
    await expect(page.getByRole('button', { name: t.clearAll })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: t.emptyTitle })).toHaveCount(
      0,
    );
    await expect(page.locator('.nojs-notice')).toHaveCount(0);
  });
}

test('searching an empty blog never requests an index or suggests a search failure', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/pagefind/')) requests.push(request.url());
  });
  await page.goto('/en/blog/?topic=ai&tag=llm&q=trilingual');
  const input = page.getByRole('searchbox', { name: 'Search articles' });
  await expect(input).toHaveValue('trilingual');
  await expect(
    page.getByRole('heading', { name: 'No posts yet' }),
  ).toBeVisible();
  await input.fill('SentencePiece');
  await expect(page).toHaveURL(/\?q=SentencePiece$/);
  await expect(rows(page)).toHaveCount(0);
  await expect(page.locator('.notice')).toHaveCount(0);
  await expect(page.locator('.sort-toggle')).toHaveCount(0);
  await expect(page.locator('.active-conditions')).toHaveCount(0);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page).toHaveURL('/en/blog/');
});

test('the activity search opens global search even when the blog is empty', async ({
  page,
}) => {
  await page.goto('/en/');
  await page
    .locator('.activitybar')
    .getByRole('link', { name: 'Search the site' })
    .click();
  await expect(page).toHaveURL('/en/search/#search');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'Search the site' }),
  ).toBeVisible();
});

test('typing replaces history, and a later query always wins', async ({
  page,
}) => {
  await page.goto('/en/blog/');
  const before = await page.evaluate(() => history.length);
  const input = page.getByRole('searchbox');
  await input.pressSequentially('agent', { delay: 30 });
  await input.fill('SentencePiece');
  await expect(page).toHaveURL(/\?q=SentencePiece$/);
  await expect(rows(page)).toHaveCount(0);
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test('IME composition does not search until the text is committed', async ({
  page,
}) => {
  await page.goto('/ja/blog/');
  const input = page.getByRole('searchbox', { name: '記事を検索' });
  await input.focus();
  const compose = (value: string, phase: 'start' | 'update' | 'end') =>
    input.evaluate(
      (element: HTMLInputElement, [text, step]) => {
        if (step === 'start')
          element.dispatchEvent(
            new CompositionEvent('compositionstart', { bubbles: true }),
          );
        // Use the native setter so React sees the change, as an IME would.
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set?.call(element, text);
        element.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            isComposing: step !== 'end',
          }),
        );
        if (step === 'end')
          element.dispatchEvent(
            new CompositionEvent('compositionend', {
              bubbles: true,
              data: text,
            }),
          );
      },
      [value, phase] as const,
    );
  await compose('りょうし', 'start');
  await compose('りょうしか', 'update');
  await page.waitForTimeout(600);
  expect(page.url()).not.toContain('q=');
  await compose('量子化', 'end');
  await expect(page).toHaveURL(/\?q=/);
  await expect(rows(page)).toHaveCount(0);
});

test('language links preserve the blog query in the title bar', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/?q=model');
  await page.locator('.header-language summary').click();
  await expect(
    page.locator('.header-language').getByRole('link', { name: 'English' }),
  ).toHaveAttribute('href', '/en/blog/?q=model');
});

test('the empty blog remains readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/en/blog/`);
    await expect(page.getByRole('searchbox')).toBeHidden();
    await expect(
      page.getByRole('heading', { name: 'No posts yet' }),
    ).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
    await expect(page.locator('.nojs-notice')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('feeds and old example URLs contain no published blog posts', async ({
  request,
}) => {
  for (const locale of locales) {
    const feed = await request.get(`/${locale}/rss.xml`);
    expect(feed.status()).toBe(200);
    expect(await feed.text()).not.toContain('<item>');
    for (const slug of [
      'engineering-principles',
      'production-systems',
      'trilingual-model-research',
    ]) {
      const article = await request.get(`/${locale}/blog/${slug}/`);
      expect(article.status()).toBe(200);
      const notice = await article.text();
      expect(notice).toContain('noindex');
      expect(notice).not.toContain('data-pagefind-body');
      expect(notice).toContain(dictionaries[locale].noPostsTitle);
    }
  }
  expect((await request.get('/pagefind/pagefind-entry.json')).status()).toBe(
    404,
  );
});
