import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

function folderToggle(explorer: Locator, href: string) {
  return explorer
    .locator('.tree-folder-row')
    .filter({ has: explorer.page().locator(`a[href="${href}"]`) })
    .getByRole('button');
}

const brainPath = '/zh-hant/note/medical/pathology/brain-cns-tumors/';
const medicalPath = '/zh-hant/note/medical/';

test('folder arrows hide descendants repeatedly without navigating or losing focus', async ({
  page,
}) => {
  await page.goto(brainPath);
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  const explorer = page.locator('.sidebar .explorer');
  const note = folderToggle(explorer, '/zh-hant/note/');
  const medical = folderToggle(explorer, medicalPath);
  const current = explorer.locator(`a[href="${brainPath}"]`);
  await expect(current).toHaveAttribute('aria-current', 'page');
  for (const key of ['Enter', 'Space', 'Enter']) {
    await medical.press(key);
    await expect(medical).toHaveAttribute('aria-expanded', 'false');
    await expect(medical).toHaveAccessibleName('展開資料夾: 醫學');
    await expect(current).toBeHidden();
    await expect(
      explorer.getByRole('link', { name: /brain-cns-tumors.md/ }),
    ).toHaveCount(0);
    await expect(medical).toBeFocused();
    await expect(page).toHaveURL(brainPath);
    await medical.press(key);
    await expect(medical).toHaveAttribute('aria-expanded', 'true');
    await expect(current).toBeVisible();
    await expect(medical).toBeFocused();
  }
  // A parent must hide every level, including other nested folder controls.
  await note.click();
  await expect(medical).toBeHidden();
  await expect(current).toBeHidden();
  await note.press('Tab');
  await expect(explorer.locator('a[href="/zh-hant/note/"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(explorer.locator('a[data-kind="external"]')).toBeFocused();
  await note.click();
  await expect(current).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});

test('nested folders keep independent state through parent and whole-explorer toggles', async ({
  page,
}) => {
  await page.goto(brainPath);
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  const explorer = page.locator('.sidebar .explorer');
  const medical = folderToggle(explorer, medicalPath);
  const drugs = folderToggle(explorer, `${medicalPath}drugs/`);
  const analgesics = explorer.locator('a[href$="/drugs/analgesics/"]');
  const current = explorer.locator(`a[href="${brainPath}"]`);
  await drugs.click();
  await medical.click();
  await medical.click();
  await expect(drugs).toHaveAttribute('aria-expanded', 'false');
  await expect(analgesics).toBeHidden();
  await expect(current).toBeVisible();
  await page.locator('.desktop-explorer-toggle button').click();
  await page.locator('.desktop-explorer-toggle button').click();
  await expect(drugs).toHaveAttribute('aria-expanded', 'false');
  await expect(analgesics).toBeHidden();
  // Two rapid toggle events finish in the starting state.
  await drugs.dblclick();
  await expect(drugs).toHaveAttribute('aria-expanded', 'false');
  await drugs.click();
  await expect(analgesics).toBeVisible();
  const blog = folderToggle(explorer, '/zh-hant/blog/');
  await blog.click();
  await expect(explorer.locator('.tree-empty')).toBeHidden();
  await blog.click();
  await expect(explorer.locator('.tree-empty')).toBeVisible();
});

for (const locale of ['zh-hant', 'en', 'ja']) {
  test(`${locale} folder names still navigate and language switching leaves controls usable`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    const explorer = page.locator('.sidebar .explorer');
    await folderToggle(explorer, `/${locale}/note/medical/`).click();
    await explorer.locator(`a[href="/${locale}/note/medical/"]`).click();
    await expect(page).toHaveURL(`/${locale}/note/medical/`);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    await expect(
      folderToggle(explorer, `/${locale}/note/medical/`),
    ).toHaveAttribute('aria-expanded', 'true');
    const target = locale === 'en' ? 'ja' : 'en';
    await page.locator('.language-menu > summary').click();
    await page
      .locator(`.language-menu a[href="/${target}/note/medical/"]`)
      .click();
    await expect(page).toHaveURL(`/${target}/note/medical/`);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    const toggle = folderToggle(explorer, `/${target}/note/medical/`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.goBack();
    await expect(page).toHaveURL(`/${locale}/note/medical/`);
    await expect(explorer.locator('a[aria-current="page"]')).toHaveAttribute(
      'href',
      `/${locale}/note/medical/`,
    );
  });
}

test('drawer disclosure stays open and collapsed descendants pass accessibility checks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  const opener = page.getByRole('button', {
    name: 'Open explorer',
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Explorer', exact: true });
  const medical = folderToggle(dialog, '/en/note/medical/');
  await medical.click();
  await expect(dialog).toBeVisible();
  await expect(medical).toBeFocused();
  await expect(dialog.locator(`a[href="${brainPath}"]`)).toBeHidden();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('without JavaScript all descendants and category links remain available', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(brainPath);
    const explorer = page.locator('.sidebar .explorer');
    await expect(explorer.locator('.tree-folder-toggle:visible')).toHaveCount(
      0,
    );
    await expect(explorer.locator(`a[href="${brainPath}"]`)).toBeVisible();
    await explorer.locator(`a[href="${medicalPath}"]`).click();
    await expect(page).toHaveURL(medicalPath);
    await expect(
      explorer.locator('a[href$="/drugs/analgesics/"]'),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
