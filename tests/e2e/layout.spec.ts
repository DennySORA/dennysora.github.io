import { test, expect } from '@playwright/test';
import { contrastOf } from './helpers.ts';

test('About answers who, what and where to look first on desktop and phone', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/zh-hant/about/');
    await expect(
      page.getByRole('heading', { level: 1, name: /DennySORA/ }),
    ).toBeInViewport();
    await expect(page.getByText('後端、雲端與 AI 系統工程')).toBeInViewport();
    await expect(
      page.getByText('我關注軟體與 AI 系統如何從概念走向'),
    ).toBeInViewport();
    await expect(
      page.getByRole('link', { name: '看看我的專案' }),
    ).toBeInViewport();
  }
  // Structured sections, not one long Markdown article with a full contents tree.
  await expect(page.locator('.prose, .toc-aside, .toc-inline')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    '我主要在做什麼',
    '用作品認識我',
    '一路走來',
    '還在探索的問題',
    '工程之外',
    '完整紀錄',
    '從一個具體的問題開始交流。',
  ]);
});

test('work history reads without expanding, and details open from the keyboard', async ({
  page,
}) => {
  await page.goto('/en/about/');
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

test('the mobile menu traps focus, closes with Escape and restores focus and scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/');
  const trigger = page.getByRole('button', { name: 'ナビゲーションを開く' });
  const dialog = page.getByRole('dialog', { name: 'ナビゲーション' });
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
  await dialog.getByRole('link', { name: '記事と研究' }).click();
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
  await page.goto('/zh-hant/about/');
  expect(await colour('.about-hero .button-primary', 'background-color')).toBe(
    'rgb(103, 216, 239)',
  );
  expect(await colour('.about-hero .button-primary')).toBe('rgb(11, 16, 32)');
  expect(await colour('.capability-evidence a')).toBe('rgb(130, 170, 255)');
  expect(await colour('.focus-note-title')).toBe('rgb(192, 153, 255)');
  expect(await colour('.capability .label')).toBe('rgb(192, 153, 255)');
  expect(await colour('.capability-evidence .resource-link .icon')).toBe(
    'rgb(93, 217, 193)',
  );
  await page.goto('/zh-hant/blog/engineering-principles/');
  expect(await colour('.code-label')).toBe('rgb(93, 217, 193)');
  expect(await colour('.reader-header .eyebrow')).toBe('rgb(192, 153, 255)');
  expect(await colour('.site-header a[aria-current]')).toBe(
    'rgb(130, 170, 255)',
  );
  expect(await colour('.site-header a[aria-current]', 'box-shadow')).toContain(
    'rgb(103, 216, 239)',
  );
});

test('status colours appear only for real states, and nothing is dimmed with opacity or filters', async ({
  page,
}) => {
  for (const path of [
    '/zh-hant/',
    '/zh-hant/about/',
    '/zh-hant/blog/',
    '/zh-hant/blog/engineering-principles/',
    '/zh-hant/projects/',
    '/zh-hant/papers/',
  ]) {
    await page.goto(path);
    const offenders = await page.evaluate(() => {
      const status = [
        'rgb(123, 216, 143)',
        'rgb(243, 201, 105)',
        'rgb(255, 122, 144)',
      ];
      return [...document.querySelectorAll('body *')]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden')
            return false;
          return (
            status.includes(style.color) ||
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
    ['.page-intro', 4.5],
    ['.search-scope', 4.5],
    ['.filter-row button[aria-pressed="true"]', 4.5],
    ['.filter-row button[aria-pressed="false"]', 4.5],
    ['.article-row-meta .entity-kind', 4.5],
    ['.article-row-meta time', 4.5],
    ['.tag-link', 4.5],
    ['.site-header a[aria-current]', 4.5],
    ['.primary-nav a:not([aria-current])', 4.5],
  ];
  for (const [selector, minimum] of checks)
    expect(
      await contrastOf(page.locator(selector).first()),
      selector,
    ).toBeGreaterThanOrEqual(minimum);
  const tag = page.locator('.tag-link').first();
  await tag.hover();
  expect(await contrastOf(tag), 'tag hover').toBeGreaterThanOrEqual(4.5);
  const topic = page.locator('.filter-row button').nth(1);
  await topic.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(
    await contrastOf(topic, 'outline-color'),
    'focus ring',
  ).toBeGreaterThanOrEqual(3);
  await page.goto('/zh-hant/about/');
  const primary = page.locator('.about-hero .button-primary');
  await primary.hover();
  expect(await contrastOf(primary), 'primary hover').toBeGreaterThanOrEqual(
    4.5,
  );
  expect(
    await primary.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe('rgb(145, 228, 245)');
});

test('projects name their real destinations and never show an icon without a link', async ({
  page,
}) => {
  await page.goto('/en/projects/');
  const repositories = await page
    .locator('.project-row')
    .evaluateAll((rows) =>
      rows.map(
        (row) => row.querySelector<HTMLAnchorElement>('a.resource-link')?.href,
      ),
    );
  expect(repositories).toEqual([
    'https://github.com/DennySORA/dgxtop',
    'https://github.com/DennySORA/httpulse',
    'https://github.com/trendmicro/adk-agui-middleware',
  ]);
  await expect(
    page.getByRole('link', { name: 'Read the case study' }),
  ).toHaveCount(0);
  await expect(page.locator('#project-adk-agui-middleware')).toContainText(
    'not a personally owned project',
  );
  expect(
    await page
      .locator('main svg path[d^="M14 4h6v6"]')
      .evaluateAll((icons) => icons.every((icon) => icon.closest('a'))),
  ).toBe(true);
  await page.goto('/en/projects/dgxtop/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(
    page.getByText(
      'A full case study for this project has not been published yet.',
    ),
  ).toBeVisible();
});

test('the home page leads with a concrete position and two entry points', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Building and writing about backend, cloud and AI systems',
  );
  await expect(
    page.getByRole('link', { name: 'Read writing & research' }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: 'View projects' }).first(),
  ).toBeInViewport();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Featured',
    'Latest writing',
    'Selected work',
    'About DennySORA',
    'Paper Daily',
  ]);
  await expect(page.locator('.article-row')).toHaveCount(3);
});

for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920])
  test(`no page-level horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
    for (const path of [
      '/zh-hant/',
      '/zh-hant/about/',
      '/ja/about/',
      '/en/projects/',
      '/ja/blog/',
      '/ja/blog/trilingual-model-research/',
      '/en/papers/',
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
