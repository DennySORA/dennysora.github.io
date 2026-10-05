import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { renderMarkdown } from '../../src/lib/markdown.server.ts';

const medicalPath = '/zh-hant/note/medical/drugs/analgesics/';

test('medical notes keep all sections, sources and educational warnings', async ({
  page,
}) => {
  await page.goto(medicalPath);
  await expect(page.locator('h1')).toContainText('止痛藥指南');
  await expect(page.locator('.medical-note h2')).toHaveCount(14);
  await expect(page.locator('.medical-note')).toContainText('不是個人處方');
  await expect(page.locator('.medical-note')).toContainText('N-acetylcysteine');
  await expect(page.locator('.medical-note a[href*="pmda.go.jp"]')).toHaveCount(
    3,
  );
  await expect(page.locator('.medical-note script')).toHaveCount(0);
  await page.locator('.medical-note a[href="#sources"]').click();
  await expect(page.locator('#sources')).toBeInViewport();
  await expect(page).toHaveURL(/#sources$/);
});

test('medical reference details work repeatedly with keyboard and without JavaScript', async ({
  browser,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4174' + medicalPath);
    const details = page.locator('.medical-note details').first();
    await details.locator('summary').focus();
    for (let round = 0; round < 3; round++) {
      await page.keyboard.press('Enter');
      await expect(details).toHaveAttribute('open', '');
      await page.keyboard.press('Space');
      await expect(details).not.toHaveAttribute('open');
    }
    await expect(page.locator('.medical-note details')).toHaveCount(10);
    await context.close();
  }
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
      await page.goto('/en/');
      await page.locator('.readme').evaluate((element) => {
        element.setAttribute('class', 'prose');
      });
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
      ).toBe('rgb(204, 175, 255)');
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
