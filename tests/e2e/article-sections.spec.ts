import { expect, test } from '@playwright/test';
import { locales } from '../../src/i18n/index.ts';
import { origin, trackExternalRequests } from './helpers.ts';

const sections = ['overview', 'studio', 'equipment', 'records', 'comparison'];
const labels = {
  'zh-hant': [
    '總覽',
    'Studio 操作',
    '設備與流程',
    '紀錄與推理',
    '工具比較與限制',
  ],
  en: [
    'Overview',
    'Studio workflow',
    'Devices & pipelines',
    'Records & inference',
    'Tools & limitations',
  ],
  ja: [
    '概要',
    'Studio の操作',
    '機材と処理の流れ',
    '記録と推論',
    'ツール比較と制約',
  ],
};
const headings = [
  'showcase',
  'project-map',
  'workspace',
  'styles',
  'workflow',
  'editing',
  'components',
  'records',
  'inference',
  'advanced',
  'comparison',
  'timing',
  'uses',
];

for (const locale of locales) {
  test(`${locale} article exposes five localized sections and real language editions`, async ({
    page,
  }) => {
    const external = trackExternalRequests(page);
    await page.goto(`/${locale}/blog/video-console/`);
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveText(labels[locale]);
    await expect(page.locator('.article-sections h2')).toHaveCount(13);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    for (const [index, id] of sections.entries()) {
      await tabs.nth(index).click();
      await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(index)).toHaveAttribute(
        'aria-controls',
        `article-tab-${id}`,
      );
      await expect(page.locator(`#article-tab-${id}`)).toBeVisible();
      await expect(page.getByRole('tabpanel')).toHaveCount(1);
      await expect(page).toHaveURL(new RegExp(`#article-tab-${id}$`));
    }
    await page.locator('.header-language summary').click();
    for (const target of locales)
      await expect(
        page.locator(
          `.header-language a[hreflang="${target === 'zh-hant' ? 'zh-Hant' : target}"]`,
        ),
      ).toHaveAttribute('href', `/${target}/blog/video-console/`);
    expect(external).toEqual([]);
  });
}

test('article tabs support arrow keys, wrapping, Home and End and pause hidden media', async ({
  page,
}) => {
  await page.goto('/en/blog/video-console/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(5);
  const video = page.locator('#article-tab-overview video').first();
  // This observes the pause request; it does not claim actual media playback.
  await video.evaluate((element: HTMLVideoElement) => {
    element.pause = () => {
      element.dataset['pauseObserved'] = 'true';
    };
  });
  await tabs.first().focus();
  for (const [key, index] of [
    ['ArrowLeft', 4],
    ['Home', 0],
    ['ArrowRight', 1],
    ['End', 4],
    ['ArrowLeft', 3],
  ] as const) {
    await page.keyboard.press(key);
    await expect(tabs.nth(index)).toBeFocused();
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(`#article-tab-${sections[index]}`)).toBeVisible();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
  }
  await expect(video).toHaveAttribute('data-pause-observed', 'true');
});

test('heading deep links survive reload and the contents menu reveals a hidden section', async ({
  page,
}) => {
  await page.goto('/en/blog/video-console/#inference');
  const records = page.getByRole('tab', {
    name: 'Records & inference',
    exact: true,
  });
  await expect(records).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#inference')).toBeVisible();
  await page.reload();
  await expect(records).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#inference')).toBeInViewport();
  await expect(page.locator('.toc-aside a[href="#uses"]')).not.toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.locator('.toc-aside a[href="#workspace"]').click();
  await expect(
    page.getByRole('tab', { name: 'Studio workflow', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#workspace')).toBeInViewport();
  await expect(page).toHaveURL('/en/blog/video-console/#workspace');
  await page.locator('.header-language summary').click();
  await page
    .locator('.header-language')
    .getByRole('link', { name: '日本語', exact: true })
    .click();
  await expect(page).toHaveURL('/ja/blog/video-console/');
  await expect(page.getByRole('tab').first()).toHaveText('概要');
});

test('all three article editions expose the full text and anchor links without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const locale of locales) {
      await page.goto(`${origin}/${locale}/blog/video-console/`);
      await expect(page.locator('.article-sections .sn-tablist a')).toHaveText(
        labels[locale],
      );
      await expect(page.getByRole('tab')).toHaveCount(0);
      for (const id of sections)
        await expect(page.locator(`#article-tab-${id}`)).toBeVisible();
      for (const id of headings)
        await expect(page.locator(`h2#${id}`)).toBeVisible();
      await page
        .locator('.article-sections a[href="#article-tab-records"]')
        .click();
      await expect(page).toHaveURL(new RegExp(`#article-tab-records$`));
      await expect(page.locator('#records')).toBeInViewport();
    }
  } finally {
    await context.close();
  }
});
