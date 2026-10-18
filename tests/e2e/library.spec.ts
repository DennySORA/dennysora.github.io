import { test, expect, type Page } from '@playwright/test';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { origin } from './helpers.ts';

const rows = (page: Page) => page.locator('.article-row');

for (const locale of locales) {
  test(`${locale} blog lists the published article and populated filters`, async ({
    page,
  }) => {
    const t = dictionaries[locale];
    await page.goto(`/${locale}/blog/`);
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).locator('.article-row-title a')).toHaveAttribute(
      'href',
      `/${locale}/blog/video-console/`,
    );
    await expect(rows(page)).toContainText('Video Console');
    await expect(
      page.getByRole('status').filter({ hasText: t.articleCount(1) }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: t.topicFilter, exact: true }),
    ).toBeVisible();
    await expect(page.locator('.tag-filter')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: t.noPostsTitle }),
    ).toHaveCount(0);
    await expect(page.getByRole('heading', { name: t.emptyTitle })).toHaveCount(
      0,
    );
    await expect(page.locator('.nojs-notice')).toBeHidden();
  });
}

test('article search loads the real index, combines filters, and clears a miss', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/pagefind/')) requests.push(request.url());
  });
  await page.goto('/en/blog/');
  const input = page.getByRole('searchbox', { name: 'Search articles' });
  await input.fill('Video Console');
  await expect(page).toHaveURL(/\?q=Video\+Console$/);
  await expect(page.locator('.article-list')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: dictionaries.en.articleCount(1) }),
  ).toBeVisible();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator('.notice')).toHaveCount(0);
  await page
    .getByRole('group', { name: dictionaries.en.topicFilter, exact: true })
    .getByRole('button', { name: 'AI & LLMs', exact: true })
    .click();
  const tag = page.locator('.tag-filter').getByRole('button');
  await tag.click();
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/topic=ai&tag=video-generation$/);
  await expect(rows(page)).toHaveCount(1);
  await expect(page.locator('.article-list')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await input.fill('zzzznomatch');
  await expect(
    page.getByRole('heading', { name: dictionaries.en.emptyTitle }),
  ).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.locator('.sort-toggle')).toBeVisible();
  await expect(page.locator('.active-conditions')).toBeVisible();
  await page
    .locator('.empty-state')
    .getByRole('button', { name: dictionaries.en.clearAll })
    .click();
  await expect(input).toHaveValue('');
  await expect(page).toHaveURL('/en/blog/');
  await expect(rows(page)).toHaveCount(1);
  await expect(page.locator('.active-conditions')).toHaveCount(0);
});

test('the README start menu opens global search', async ({ page }) => {
  await page.goto('/en/');
  await page
    .locator('.dashboard')
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

test('the article list and taxonomy navigation remain readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/en/blog/`);
    await expect(page.getByRole('searchbox')).toBeHidden();
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).locator('.article-row-title a')).toHaveAttribute(
      'href',
      '/en/blog/video-console/',
    );
    await expect(page.locator('.nojs-notice')).toBeVisible();
    await page.locator('.nojs-notice a[href="/en/blog/topics/ai/"]').click();
    await expect(rows(page)).toHaveCount(1);
  } finally {
    await context.close();
  }
});

test('feeds and search publish only the article while old examples remain noindex bridges', async ({
  request,
}) => {
  for (const locale of locales) {
    const feed = await request.get(`/${locale}/rss.xml`);
    expect(feed.status()).toBe(200);
    const xml = await feed.text();
    expect(xml.match(/<item>/g)).toHaveLength(1);
    expect(xml).toContain(`https://dennysora.me/${locale}/blog/video-console/`);
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
  const entry = await request.get('/pagefind/pagefind-entry.json');
  expect(entry.status()).toBe(200);
  const index = (await entry.json()) as {
    languages: Record<string, { page_count: number }>;
  };
  expect(Object.keys(index.languages).sort()).toEqual([...locales].sort());
  for (const locale of locales)
    expect(index.languages[locale]?.page_count).toBe(1);
});
