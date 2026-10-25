import { expect, test } from '@playwright/test';
import { locales } from '../../src/i18n/index.ts';

const retired = [
  'japan',
  'japan/japanese',
  ...[
    'structure',
    'conjugation',
    'clauses',
    'reasons',
    'expressions',
    'vocabulary',
    'review',
  ].map((part) => `japan/japanese/japanese-${part}`),
  'hardware/computer/140mm-case-fans',
];
for (const locale of locales) {
  test(`${locale} retired notes return 404 and stay out of navigation and indexes`, async ({
    page,
    request,
  }) => {
    for (const suffix of retired) {
      const response = await request.get(`/${locale}/note/${suffix}/`);
      expect(response.status(), suffix).toBe(404);
      expect(response.headers()['location']).toBeUndefined();
      expect(await response.text()).toMatch(/name="robots" content="noindex/);
    }
    await page.goto(`/${locale}/note/`);
    await expect(page.locator('a[href*="/note/japan/"]')).toHaveCount(0);
    await expect(page.locator('a[href*="140mm-case-fans"]')).toHaveCount(0);
    await expect(
      page.locator(`main a[href="/${locale}/note/hardware/"]`),
    ).toBeVisible();
    for (const artifact of [
      '/site-search.json',
      '/sitemap.xml',
      `/${locale}/rss.xml`,
    ]) {
      const response = await request.get(artifact);
      expect(response.status()).toBe(200);
      expect(await response.text()).not.toMatch(
        /\/note\/japan(?:\/|")|140mm-case-fans/,
      );
    }
  });
}
