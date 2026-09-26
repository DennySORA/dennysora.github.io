import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { renderMarkdown } from '../../src/lib/markdown.server.ts';

test('the table of contents follows reading without rewriting history', async ({
  page,
}) => {
  await page.goto('/en/blog/engineering-principles/');
  const toc = page.locator('.toc-aside');
  await expect(toc).toBeVisible();
  await expect(toc.locator('a[aria-current="location"]')).toHaveText(
    'Engineering Principles',
  );
  const before = await page.evaluate(() => history.length);
  await page.locator('#section-5').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 200);
  await expect(toc.locator('a[aria-current="location"]')).not.toHaveText(
    'Engineering Principles',
  );
  expect(await page.evaluate(() => [history.length, location.hash])).toEqual([
    before,
    '',
  ]);
  await toc.getByRole('link', { name: 'How I Work' }).click();
  await expect(page).toHaveURL(/#how-h$/);
  const heading = page.locator('#how-h');
  await expect(heading).toBeInViewport();
  // The sticky header never covers the target heading.
  const top = await heading.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  const header = await page
    .locator('.site-header')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(header);
});

test('short screens get a collapsed contents list before the text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/blog/engineering-principles/');
  const inline = page.locator('.toc-inline');
  await expect(inline).toBeVisible();
  await expect(inline).not.toHaveAttribute('open');
  await expect(page.locator('.toc-aside')).toBeHidden();
  await expect(page.locator('.prose h2').first()).toBeInViewport();
});

test('code copying reports what really happened, and the text stays selectable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/blog/engineering-principles/');
  const first = page.locator('.code-block').first();
  await expect(first.locator('.code-label')).toHaveText('TEXT');
  await first.getByRole('button', { name: 'Copy' }).click();
  await expect(first.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'LLM API',
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
  });
  const second = page.locator('.code-block').nth(1);
  await second.getByRole('button', { name: 'Copy' }).click();
  await expect(
    second.getByRole('button', { name: 'Copy failed — select manually' }),
  ).toBeVisible();
  await expect(second.getByRole('button', { name: 'Copied' })).toHaveCount(0);
  expect(
    await page
      .locator('.prose')
      .evaluate((element) => getComputedStyle(element).userSelect),
  ).not.toBe('none');
});

test('print keeps the article and drops navigation, tools and discussion', async ({
  page,
}) => {
  await page.goto('/zh-hant/blog/trilingual-model-research/');
  await page.emulateMedia({ media: 'print' });
  for (const selector of [
    '.site-header',
    '.site-footer',
    '.toc-aside',
    '.comments',
    '.related',
    '.backlink',
  ])
    await expect(page.locator(selector), selector).toBeHidden();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.prose')).toBeVisible();
  await expect(page.locator('.source-note')).toBeVisible();
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe('rgb(255, 255, 255)');
});

test('the renderer’s figures, formulas, code, tables and notes render in the reading layout', async ({
  page,
}) => {
  const directory = mkdtempSync(join(tmpdir(), 'renderer-fixture-'));
  try {
    mkdirSync(join(directory, 'images'));
    copyFileSync('assets/favicon.png', join(directory, 'images/figure.png'));
    // Test-only corpus: rendered here, never published as an article.
    const { html } = renderMarkdown(
      [
        '## Fixture {#fixture}',
        '',
        'Inline math $E = mc^2$, a footnote[^1] and `inline code` in one paragraph.',
        '',
        '![Cache layers from API to GPU](./images/figure.png "A captioned figure")',
        '',
        '```rust title="src/main.rs"',
        'fn main() { let answer: u32 = 42; println!("{answer}"); } // a deliberately long line that must scroll inside its own box rather than the page',
        '```',
        '',
        '$$',
        '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} \\quad \\text{and a deliberately long display formula} \\quad \\int_0^1 x^2\\,dx = \\frac{1}{3}',
        '$$',
        '',
        '| Metric | Before | After | Note |',
        '| :-- | --: | --: | :-- |',
        '| latency (ms) | 120 | 80 | measured on a long table cell that should scroll horizontally |',
        '',
        '> [!NOTE]',
        '> A note callout.',
        '',
        '[^1]: The footnote text.',
      ].join('\n'),
      {
        locale: 'en',
        assets: { directory, urlPrefix: '/content-assets/fixture/' },
      },
    );
    await page.route('**/content-assets/fixture/**', (route) =>
      route.fulfill({ path: 'assets/favicon.png' }),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/blog/engineering-principles/');
      await page.addStyleTag({ path: 'node_modules/katex/dist/katex.min.css' });
      await page.locator('.prose').evaluate((element, markup) => {
        element.innerHTML = markup;
      }, html);
      const image = page.locator('.prose figure img');
      await expect(image).toHaveAttribute(
        'alt',
        'Cache layers from API to GPU',
      );
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBeGreaterThan(0);
      await expect(page.locator('.prose figcaption')).toHaveText(
        'A captioned figure',
      );
      await expect(page.locator('.prose .katex math')).toHaveCount(2);
      expect(
        await page
          .locator('.tok-keyword')
          .first()
          .evaluate((element) => getComputedStyle(element).color),
      ).toBe('rgb(192, 153, 255)');
      await expect(page.locator('.prose th[scope="col"]')).toHaveCount(4);
      await expect(page.locator('.prose .footnotes li')).toHaveCount(1);
      await expect(
        page.locator('.prose .callout-note .callout-title'),
      ).toHaveText('Note');
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
        `page overflow at ${width}`,
      ).toBe(true);
      await page
        .locator('.prose')
        .screenshot({ path: test.info().outputPath(`renderer-${width}.png`) });
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
