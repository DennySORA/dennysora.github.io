import { test, expect } from '@playwright/test';
import { contrastOf } from './helpers.ts';

test('the home README answers who, what and where to look first on desktop and phone', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/zh-hant/');
    // The heading marker and line numbers are decoration, not part of the name.
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'DennySORA',
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await expect(
      page.getByRole('img', { name: /DennySORA 標誌/ }),
    ).toBeInViewport();
    await expect(page.getByText('後端、雲端與 AI 系統工程')).toBeInViewport();
    await expect(
      page.getByText('我關注軟體與 AI 系統如何從概念走向'),
    ).toBeInViewport();
    await expect(
      page.getByRole('link', { name: /閱讀部落格/ }),
    ).toHaveAttribute('href', '/zh-hant/blog/');
  }
  // Structured sections, not one long Markdown article with a full contents tree.
  await expect(page.locator('.prose, .toc-aside, .toc-inline')).toHaveCount(0);
  const names = await page
    .getByRole('heading', { level: 2 })
    .evaluateAll((headings) =>
      headings.map((heading) =>
        (heading.textContent ?? '').replace(/^#+\s*/, ''),
      ),
    );
  expect(names).toEqual(['我主要在做什麼', '一路走來']);
  // Numbers share one gutter column: every numbered line is unpositioned and
  // measured from the same buffer, however deeply it is nested.
  const gutters = await page.locator('main .ln').evaluateAll((lines) => ({
    count: lines.length,
    positioned: lines.filter(
      (line) => getComputedStyle(line).position !== 'static',
    ).length,
    parents: new Set(
      lines.map((line) => (line as HTMLElement).offsetParent?.className),
    ).size,
  }));
  // The shortened résumé keeps all of its numbered lines; the start menu adds
  // four (blog, notes, search, Paper Daily) in place of the single call to action.
  expect(gutters.count).toBe(59);
  expect(gutters.positioned).toBe(0);
  expect(gutters.parents).toBe(1);
});

test('work history reads without expanding, and details open from the keyboard', async ({
  page,
}) => {
  await page.goto('/en/');
  const entry = page.locator('.timeline-entry').nth(1);
  await expect(entry).toContainText('Senior Cloud Engineer');
  await expect(entry.locator('.timeline-highlights li')).toHaveCount(3);
  const details = entry.locator('details');
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(
    details.getByText(
      'Implemented Agent-to-Agent (A2A) communication to coordinate remote agents.',
    ),
  ).toBeVisible();
  await page.keyboard.press('Space');
  await expect(details).not.toHaveAttribute('open');
  await expect(page.locator('.timeline-entry').first()).toContainText(
    'Education · current status',
  );
});

test('the explorer drawer traps focus, closes with Escape and restores focus and scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/');
  const trigger = page.getByRole('button', { name: 'エクスプローラーを開く' });
  const dialog = page.getByRole('dialog', { name: 'エクスプローラー' });
  const overflow = () =>
    page.evaluate(() => document.documentElement.style.overflow);
  await trigger.click();
  await expect(dialog).toBeVisible();
  expect(await overflow()).toBe('hidden');
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await overflow()).toBe('');
  for (let round = 0; round < 3; round++) {
    await trigger.click();
    await page.keyboard.press('Escape');
    expect(await overflow()).toBe('');
    await expect(trigger).toBeFocused();
  }
  await trigger.click();
  // The drawer lists the real workspace and the published medical note.
  await expect(
    dialog.getByRole('link', { name: /README\.md/ }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    dialog.getByRole('link', { name: /analgesics\.md/ }),
  ).toHaveAttribute('href', '/zh-hant/note/medical/analgesics/');
  await expect(
    dialog.locator('a[href*="/blog/"][href$="-principles/"]'),
  ).toHaveCount(0);
  await dialog.getByRole('link', { name: /^blog/ }).click();
  await expect(page).toHaveURL('/ja/blog/');
  await page.goBack();
  await expect(page).toHaveURL('/ja/');
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await overflow()).toBe('');
});

test('normal screens use the semantic colour roles', async ({ page }) => {
  const colour = (selector: string, property = 'color') =>
    page
      .locator(selector)
      .first()
      .evaluate(
        (element, name) => getComputedStyle(element).getPropertyValue(name),
        property,
      );
  await page.goto('/zh-hant/');
  // The start menu: action-family icons on readable labels.
  expect(await colour('.dash-item > .icon')).toBe('rgb(150, 195, 255)');
  expect(await colour('.dash-label')).toBe('rgb(230, 237, 245)');
  // Front matter reads as YAML: keys in the entity colour, values as strings.
  expect(await colour('.front-matter dt')).toBe('rgb(204, 175, 255)');
  expect(await colour('.front-matter dd')).toBe('rgb(131, 216, 207)');
  expect(await colour('.md-heading .md-mark')).toBe('rgb(133, 147, 168)');
  // NORMAL mode is the blue action family with dark ink.
  expect(await colour('.status-mode', 'background-color')).toBe(
    'rgb(138, 184, 245)',
  );
  expect(await colour('.status-mode')).toBe('rgb(8, 17, 30)');
  expect(await colour('.capability-evidence a')).toBe('rgb(150, 195, 255)');
  expect(await colour('.capability .label')).toBe('rgb(204, 175, 255)');
  expect(await colour('.capability-evidence .resource-link .icon')).toBe(
    'rgb(131, 216, 207)',
  );
  await page.goto('/zh-hant/note/medical/');
  // Folders carry the folder colour; files the file colour.
  expect(await colour('.tab[data-area="notes"] > .icon')).toBe(
    'rgb(145, 198, 255)',
  );
  expect(await colour('.tree-link[data-kind="markdown"] > .tree-icon')).toBe(
    'rgb(131, 216, 207)',
  );
  // The open buffer is lit with the accent marker; its area stays marked.
  expect(await colour('.tab[aria-current="page"]')).toBe('rgb(230, 237, 245)');
  expect(await colour('.tab[aria-current="page"]', 'box-shadow')).toContain(
    'rgb(138, 184, 245)',
  );
  expect(await colour('.tab[aria-current="true"]')).toBe('rgb(184, 197, 214)');
  expect(
    await colour(
      '.sidebar .tree-link[aria-current="page"]',
      'background-color',
    ),
  ).toBe('rgb(35, 61, 89)');
});

test('status colours appear only for real states, and nothing is dimmed with opacity or filters', async ({
  page,
}) => {
  for (const path of [
    '/zh-hant/',
    '/en/',
    '/zh-hant/blog/',
    '/zh-hant/note/medical/analgesics/',
  ]) {
    await page.goto(path);
    const offenders = await page.evaluate(() => {
      const status = [
        'rgb(155, 210, 172)',
        'rgb(237, 202, 139)',
        'rgb(255, 168, 161)',
      ];
      return [...document.querySelectorAll('body *')]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden')
            return false;
          return (
            (status.includes(style.color) &&
              // The medical risk label and its inherited icon are real warnings.
              !element.closest('.medical-disclaimer > b')) ||
            status.includes(style.backgroundColor) ||
            Number(style.opacity) < 1 ||
            style.filter !== 'none'
          );
        })
        .map((element) => `${element.tagName}.${element.className}`);
    });
    expect(offenders, path).toEqual([]);
  }
});

test('text and controls keep contrast in normal, hover, focus and selected states', async ({
  page,
}) => {
  // Measure settled states rather than mid-transition colours.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh-hant/blog/');
  const checks: [string, number][] = [
    ['.empty-state p', 4.5],
    ['.search-scope', 4.5],
    ['.empty-state h2', 4.5],
    ['.desktop-explorer-toggle button', 4.5],
    ['.tree-empty', 4.5],
    ['.language-menu > summary', 4.5],
    ['.tab[aria-current="page"]', 4.5],
    ['.tab:not([aria-current])', 4.5],
    ['.sidebar .tree-link[aria-current="page"]', 4.5],
    ['.sidebar .tree-note', 4.5],
    ['.breadcrumbs a', 4.5],
    ['.status-item', 4.5],
    ['.status-mode', 4.5],
    ['.status-position', 4.5],
    ['.cmdline', 4.5],
    ['.tabline-search-text', 4.5],
    ['.winbar [aria-current]', 4.5],
  ];
  for (const [selector, minimum] of checks)
    expect(
      await contrastOf(page.locator(selector).first()),
      selector,
    ).toBeGreaterThanOrEqual(minimum);
  const toggle = page.locator('.desktop-explorer-toggle button');
  await toggle.hover();
  expect(
    await contrastOf(toggle),
    'explorer toggle hover',
  ).toBeGreaterThanOrEqual(4.5);
  await toggle.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(
    await contrastOf(toggle, 'outline-color'),
    'focus ring',
  ).toBeGreaterThanOrEqual(3);
  const tab = page.locator('.tab:not([aria-current])').first();
  await tab.hover();
  expect(await contrastOf(tab), 'tab hover').toBeGreaterThanOrEqual(4.5);
  const file = page.locator('.sidebar .tree-link:not([aria-current])').first();
  await file.hover();
  expect(await contrastOf(file), 'explorer hover').toBeGreaterThanOrEqual(4.5);
  // The one primary action on the empty blog keeps dark ink on its hover fill.
  const primary = page.locator('.empty-state .button-primary');
  await primary.hover();
  // Reduced motion still runs a 0.01 ms transition; wait for its first frame.
  await expect(primary).toHaveCSS('background-color', 'rgb(162, 203, 255)');
  expect(await contrastOf(primary), 'primary hover').toBeGreaterThanOrEqual(
    4.5,
  );
  const menu = page.locator('.dash-item').first();
  await page.goto('/zh-hant/');
  await menu.hover();
  expect(await contrastOf(menu), 'start menu hover').toBeGreaterThanOrEqual(
    4.5,
  );
});

test('the workbench names the open file and links every area, with Paper Daily outside', async ({
  page,
}) => {
  await page.goto('/zh-hant/note/medical/analgesics/');
  const tabs = page.locator('.buffers');
  await expect(tabs.getByRole('link')).toHaveText([
    /README\.md/,
    /blog/,
    /note/,
    /paper-daily/,
  ]);
  await expect(tabs.getByRole('link', { name: /paper-daily/ })).toHaveAttribute(
    'href',
    'https://paper.dennysora.me/',
  );
  await expect(tabs.getByRole('link', { name: /note/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.locator('.tab-preview')).toHaveText('analgesics.md');
  await expect(page.locator('.breadcrumbs').getByRole('link')).toHaveText([
    'dennysora',
    'note',
    'medical',
  ]);
  await expect(page.locator('.status-file')).toHaveText(
    'note/medical/analgesics.md',
  );
  await expect(page.locator('.status-mode')).toHaveText('NORMAL');
  await expect(page.locator('.status-position')).toHaveText('Top');
  await page.mouse.wheel(0, 100_000);
  await expect(page.locator('.status-position')).toHaveText('Bot');
  // Unpublished placeholder articles must not reappear as recent files.
  await page.goto('/en/');
  await expect(page.locator('.file-list a')).toHaveCount(0);
  await expect(page.locator('#recent-title')).toHaveCount(0);
});

for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920])
  test(`no page-level horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
    for (const path of [
      '/zh-hant/',
      '/ja/',
      '/ja/blog/',
      '/en/note/',
      '/ja/note/medical/',
      '/zh-hant/note/medical/analgesics/',
      '/zh-hant/blog/tags/',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
        path,
      ).toBe(true);
      expect(
        await page
          .locator('img:not([loading="lazy"])')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
        path,
      ).toBe(true);
    }
  });

test('desktop Explorer repeatedly collapses and expands from keyboard controls without losing focus', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  const toggle = page.locator('.desktop-explorer-toggle button');
  const sidebar = page.locator('#desktop-explorer');
  await expect(toggle).toHaveAttribute('aria-controls', 'desktop-explorer');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).toBeVisible();
  const expandedWidth = await page
    .locator('.editor')
    .evaluate((element) => element.getBoundingClientRect().width);
  await toggle.focus();
  for (const key of ['Enter', 'Space', 'Enter']) {
    await toggle.press(key);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAccessibleName('Expand Explorer');
    await expect(sidebar).toBeHidden();
    await expect(toggle).toBeFocused();
    expect(
      await page
        .locator('.editor')
        .evaluate((element) => element.getBoundingClientRect().width),
    ).toBeGreaterThan(expandedWidth);
    await toggle.press(key);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Collapse Explorer');
    await expect(sidebar).toBeVisible();
    await expect(toggle).toBeFocused();
  }
  // Collapsed state survives a trip through the phone layout.
  await toggle.press('Enter');
  await expect(sidebar).toBeHidden();
  await expect(toggle).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toBeHidden();
  await page.getByRole('button', { name: 'Open explorer' }).click();
  await expect(page.getByRole('dialog', { name: 'Explorer' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(sidebar).toBeHidden();
  await toggle.click();
  await expect(sidebar).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});

test('the shared footer is absent across the workbench', async ({ page }) => {
  for (const path of [
    '/en/',
    '/ja/blog/',
    '/zh-hant/note/medical/analgesics/',
  ]) {
    await page.goto(path);
    await expect(page.locator('.site-footer')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    await expect(page.locator('.statusbar')).toBeVisible();
  }
});
