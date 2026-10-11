import { expect, test } from '@playwright/test';
import { trackExternalRequests } from './helpers.ts';

test('translated diagram labels stay inside their SVG viewports', async ({
  page,
}, testInfo) => {
  const failures: { path: string; labels: (string | undefined)[] }[] = [];
  for (const locale of ['en', 'ja']) {
    for (const path of [
      'note/network/p2p-downloader',
      'note/hardware/computer/140mm-case-fans',
      'projects/tools/dgxtop',
    ]) {
      await page.goto(`/${locale}/${path}/`);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page
        .locator('main svg text')
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const text = node.getBoundingClientRect();
            const svg = node.closest('svg')?.getBoundingClientRect();
            if (!svg || !text.width || !text.height) return [];
            return text.left < svg.left - 1 || text.right > svg.right + 1
              ? [node.textContent?.trim()]
              : [];
          }),
        );
      const collisions = await page.locator('main svg').evaluateAll((svgs) =>
        svgs.flatMap((svg) => {
          const texts = [...svg.querySelectorAll('text')]
            .map((node) => ({ node, box: node.getBoundingClientRect() }))
            .filter(({ box }) => box.width && box.height);
          return texts.flatMap((a, i) =>
            texts
              .slice(i + 1)
              .flatMap((b) =>
                Math.min(a.box.right, b.box.right) -
                  Math.max(a.box.left, b.box.left) >
                  2 &&
                Math.min(a.box.bottom, b.box.bottom) -
                  Math.max(a.box.top, b.box.top) >
                  2
                  ? [
                      `${a.node.textContent?.trim()} / ${b.node.textContent?.trim()}`,
                    ]
                  : [],
              ),
          );
        }),
      );
      const boxOverflow = await page
        // Network flow rectangles are label containers; chart buckets are not.
        .locator('main .network-note svg text')
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const text = node as SVGTextElement;
            const matrix = text.getScreenCTM();
            if (!matrix || !text.x.baseVal.length || !text.y.baseVal.length)
              return [];
            const x = text.x.baseVal.getItem(0).value;
            const y = text.y.baseVal.getItem(0).value;
            const anchor = new DOMPoint(x, y).matrixTransform(matrix);
            const box = text.getBoundingClientRect();
            const owner = [
              ...(text.closest('svg')?.querySelectorAll('rect') ?? []),
            ]
              .map((rect) => rect.getBoundingClientRect())
              .filter(
                (rect) =>
                  anchor.x > rect.left &&
                  anchor.x < rect.right &&
                  anchor.y > rect.top &&
                  anchor.y < rect.bottom,
              )
              .sort((a, b) => a.width * a.height - b.width * b.height)[0];
            return owner &&
              (box.left < owner.left - 1 || box.right > owner.right + 1)
              ? [`Box overflow: ${text.textContent?.trim()}`]
              : [];
          }),
        );
      overflow.push(...collisions);
      overflow.push(...boxOverflow);
      if (overflow.length)
        failures.push({ path: `${locale}/${path}`, labels: overflow });
      const diagram = page
        .locator('main figure')
        .filter({ has: page.locator('svg text') })
        .first();
      await diagram.screenshot({
        path: testInfo.outputPath(
          `${locale}-${path.split('/').at(-1)}-diagram.png`,
        ),
      });
    }
  }
  expect(failures).toEqual([]);
});

for (const locale of ['en', 'ja'] as const) {
  test(`${locale} note tools, language switching and complete bodies stay localized`, async ({
    page,
    browser,
  }, testInfo) => {
    const external = trackExternalRequests(page);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${locale}/note/network/p2p-downloader/`);
    await page.screenshot({
      path: testInfo.outputPath(`${locale}-downloader-1440.png`),
    });
    await expect(page.locator('#pool-result')).toContainText(
      locale === 'en' ? 'Suggested new trials: 2' : '試行の追加候補：2',
    );
    await page.locator('#population').fill('-1');
    await expect(page.locator('#pool-result')).toContainText(
      locale === 'en' ? 'Enter valid' : '整数を入力',
    );
    await page.locator('#population').fill('5');
    await page.locator('#fresh').uncheck();
    await expect(page.locator('#pool-result')).toContainText(
      locale === 'en' ? 'resynchronize' : '再同期',
    );
    await page.locator('#scenario').selectOption('qbt');
    await expect(page.locator('#connection-result')).toContainText(
      locale === 'en'
        ? 'do not substitute an IP ban'
        : 'IP ban に置き換えてはいけません',
    );
    await page.locator('#catalog-query').fill('no-such-model');
    await expect(page.locator('#catalog-count')).toContainText(
      locale === 'en' ? 'Showing 0 / 134' : '候補 0 / 134',
    );
    const download = page.waitForEvent('download');
    await page.locator('#export-notes').click();
    expect((await download).suggestedFilename()).toBe(
      'P2P_v2_3_review_notes.json',
    );
    await expect(page.locator('#notes-status')).toContainText(
      locale === 'en' ? 'Notes export created' : 'エクスポートを作成',
    );

    await page.goto(`/${locale}/note/network/p2p-privacy/`);
    await page.screenshot({
      path: testInfo.outputPath(`${locale}-privacy-1440.png`),
    });
    await expect(page.locator('#ppv-out')).toHaveText('8.26%');
    await page.locator('#candidate-n').selectOption('1000');
    await expect(page.locator('#ppv-out')).toHaveText('98.90%');

    await page.goto(`/${locale}/note/hardware/computer/140mm-case-fans/`);
    await page.screenshot({
      path: testInfo.outputPath(`${locale}-fans-1440.png`),
    });
    await expect(page.locator('#hw-wp-result')).toContainText('40.1 CFM');
    await page.locator('#hw-catalog-query').fill('no-such-model');
    await expect(page.locator('#hw-catalog-count')).toContainText(
      locale === 'en' ? 'no matches' : '該当するモデルがありません',
    );
    await page.locator('#hw-fan-count').fill('3');
    await expect(page.locator('#hw-qty-result')).toContainText(
      'Tsukumo ¥4,347',
    );
    await page.locator('#hw-fan-count').fill('0');
    await expect(page.locator('#hw-qty-result')).toContainText(
      locale === 'en' ? 'Enter a whole number' : '整数で入力',
    );
    await page.locator('#hw-catalog-reset').click();

    for (const path of [
      'medical/drugs/analgesics',
      'medical/pathology/brain-cns-tumors',
    ]) {
      await page.goto(`/${locale}/note/${path}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('#sources')).toBeAttached();
    }
    await page.locator('.header-language summary').click();
    const other = locale === 'en' ? 'ja' : 'en';
    await page
      .locator('.header-language')
      .getByRole('link', {
        name: other === 'ja' ? '日本語' : 'English',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${other}/note/medical/pathology/brain-cns-tumors/$`),
    );
    expect(errors).toEqual([]);
    expect(external).toEqual([]);

    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const staticPage = await context.newPage();
      await staticPage.goto(
        `http://127.0.0.1:4174/${locale}/note/medical/drugs/analgesics/`,
      );
      await expect(staticPage.locator('#medical-title')).toBeVisible();
      await expect(staticPage.locator('#sources')).toBeAttached();
      for (const [width, height] of [
        [320, 900],
        [390, 844],
        [768, 1024],
        [1280, 800],
        [1440, 900],
        [1920, 1080],
      ]) {
        await staticPage.setViewportSize({ width: width!, height: height! });
        expect(
          await staticPage.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await staticPage.screenshot({
          path: testInfo.outputPath(`${locale}-analgesics-${width}.png`),
        });
      }
    } finally {
      await context.close();
    }
  });
}
