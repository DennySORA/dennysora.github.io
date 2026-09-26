import { test, expect, type Page } from '@playwright/test';
import { origin } from './helpers.ts';

const rows = (page: Page) => page.locator('.article-row');

test('topics, types and tags combine as AND across dimensions and OR within tags', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/');
  await expect(rows(page)).toHaveCount(3);
  const topics = page.getByRole('group', { name: '主題' });
  const tags = page.getByRole('group', { name: /^標籤/ });
  await topics.getByRole('button', { name: 'AI 與 LLM' }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(page).toHaveURL(/\?topic=ai$/);
  await topics.getByRole('button', { name: '全部' }).click();
  await tags.getByRole('button', { name: '量化', exact: true }).click();
  await tags.getByRole('button', { name: 'Agent', exact: true }).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(
    page.getByRole('status').filter({ hasText: '符合任一所選標籤' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?tag=quantization&tag=agent$/);
  // Selection is shown by more than colour.
  const pressed = tags.getByRole('button', { name: 'Agent', exact: true });
  await expect(pressed).toHaveAttribute('aria-pressed', 'true');
  expect(
    await pressed.evaluate((button) => getComputedStyle(button).boxShadow),
  ).not.toBe('none');
  await expect(pressed.locator('.tag-toggle-mark')).toHaveText('✓');
  await page
    .getByRole('group', { name: '類型' })
    .getByRole('button', { name: '實作紀錄' })
    .click();
  await expect(rows(page)).toHaveCount(1);
  await page.reload();
  await expect(rows(page)).toHaveCount(1);
  await expect(pressed).toHaveAttribute('aria-pressed', 'true');
  await page.goBack();
  await expect(page).toHaveURL(/\?tag=quantization&tag=agent$/);
  await expect(rows(page)).toHaveCount(2);
  await page.getByRole('button', { name: '移除「量化」' }).click();
  await expect(page).toHaveURL(/\?tag=agent$/);
  await expect(rows(page)).toHaveCount(1);
});

test('full-text search ranks and highlights hits in the current language only', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/');
  const input = page.getByRole('searchbox', { name: '搜尋文章' });
  await expect(page.getByText('搜尋已發布的繁體中文文章')).toBeVisible();
  await input.fill('量化');
  await expect(page).toHaveURL(/\?q=%E9%87%8F%E5%8C%96$/);
  await expect(rows(page)).toHaveCount(1);
  await expect(
    rows(page)
      .first()
      .getByRole('link', { name: '從零訓練三語模型：研究與實驗紀錄' }),
  ).toBeVisible();
  await expect(rows(page).first().locator('mark').first()).toHaveText('量化');
  await expect(
    rows(page).first().locator('.matched-sections a').first(),
  ).toHaveAttribute('href', /#/);
  // Controlled aliases let an English term find the Chinese edition.
  await input.fill('quantization');
  await expect(rows(page)).toHaveCount(2);
  const sort = page.getByRole('group', { name: '排序' });
  await expect(sort.getByRole('button', { name: '相關性' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await sort.getByRole('button', { name: '最新' }).click();
  await expect(page).toHaveURL(/sort=latest/);
  await input.fill('zzzznomatch');
  await expect(
    page.getByRole('heading', { name: '沒有符合這些條件的文章' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '移除「zzzznomatch」' }).click();
  await expect(input).toHaveValue('');
  await expect(rows(page)).toHaveCount(3);
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
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText('trilingual');
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
  await expect(rows(page)).toHaveCount(1);
});

test('a failed index says it searches titles and summaries only, then recovers', async ({
  page,
}) => {
  await page.route('**/pagefind/**', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.goto('/en/blog/');
  const input = page.getByRole('searchbox');
  await input.fill('trilingual');
  const notice = page.getByText('only titles and summaries are searched');
  await expect(notice).toBeVisible();
  await expect(rows(page)).toHaveCount(1);
  await input.fill('SentencePiece');
  await expect(
    page.getByRole('heading', { name: 'No articles match these conditions' }),
  ).toBeVisible();
  await page.unroute('**/pagefind/**');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(notice).toHaveCount(0);
  await expect(rows(page)).toHaveCount(1);
});

test('language links keep language-neutral filters and the query', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/?tag=llm&q=model');
  await expect(
    page.locator('.footer-languages').getByRole('link', { name: 'English' }),
  ).toHaveAttribute('href', '/en/blog/?tag=llm&q=model');
  await page.goto('/en/blog/engineering-principles/');
  await expect(
    page.locator('.footer-languages').getByRole('link', { name: '日本語' }),
  ).toHaveAttribute('href', '/ja/blog/engineering-principles/');
});

test('topic and tag pages, and the library itself, work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${origin}/en/blog/`);
  await expect(page.getByRole('searchbox')).toBeHidden();
  await expect(
    page.getByText('Full-text search needs JavaScript'),
  ).toBeVisible();
  await expect(rows(page)).toHaveCount(3);
  await page
    .locator('.nojs-notice')
    .getByRole('link', { name: 'AI & LLMs' })
    .click();
  await expect(page).toHaveURL('/en/blog/topics/ai/');
  await expect(rows(page)).toHaveCount(1);
  await page.getByRole('link', { name: 'All tags' }).click();
  await expect(page).toHaveURL('/en/blog/tags/');
  await page.getByRole('link', { name: 'LLM', exact: true }).click();
  await expect(page).toHaveURL('/en/blog/tags/llm/');
  await expect(rows(page)).toHaveCount(2);
  await rows(page)
    .filter({ hasText: 'trilingual' })
    .getByRole('link', { name: 'Quantization' })
    .click();
  await expect(page).toHaveURL('/en/blog/tags/quantization/');
  await context.close();
});
