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
    await expect(medical).toHaveAccessibleName(/^展開資料夾: 健康與醫學/);
    await expect(current).toBeHidden();
    await expect(
      explorer.getByRole('link', { name: /腦與中樞神經腫瘤/ }),
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
  // Hidden descendants are skipped: focus moves on to the next entry, the
  // papers link (the projects folder is the first entry of the tree).
  await page.keyboard.press('Tab');
  await expect(explorer.locator('a[data-kind="external"]')).toBeFocused();
  await note.click();
  await expect(current).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});

test('folders start closed except the path to the current page, again after each navigation', async ({
  page,
}) => {
  await page.goto(brainPath);
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  const explorer = page.locator('.sidebar .explorer');
  const open = async () =>
    (
      await explorer
        .locator('.tree-folder-toggle[aria-expanded="true"]')
        .evaluateAll((buttons) =>
          buttons.map(
            (button) =>
              button.parentElement?.querySelector('a')?.getAttribute('href') ??
              '',
          ),
        )
    ).sort();
  expect(await open()).toEqual([
    '/zh-hant/note/',
    '/zh-hant/note/medical/',
    '/zh-hant/note/medical/pathology/',
  ]);
  await expect(explorer.locator(`a[href="${brainPath}"]`)).toBeVisible();
  await expect(explorer.locator('a[href$="/drugs/analgesics/"]')).toBeHidden();
  // A folder opened by hand closes again when another page becomes current.
  await folderToggle(explorer, '/zh-hant/blog/').click();
  await page.locator('.tab[data-area="projects"]').click();
  await expect(page).toHaveURL('/zh-hant/projects/');
  await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
  expect(await open()).toEqual(['/zh-hant/projects/']);
  await expect(explorer.locator(`a[href="${brainPath}"]`)).toBeHidden();
});

for (const locale of ['zh-hant', 'en', 'ja']) {
  test(`${locale} names show in full in the page's language`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    const explorer = page.locator('.sidebar .explorer');
    // Open every folder, level by level.
    for (let level = 0; level < 4; level++) {
      const closed = explorer.locator(
        '.tree-folder-toggle[aria-expanded="false"]:visible',
      );
      for (let count = await closed.count(); count > 0; count--)
        await closed.first().click();
    }
    const names = await explorer.locator('.tree-name').evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.textContent ?? '',
        clipped: element.scrollWidth > element.clientWidth,
      })),
    );
    expect(names.length).toBeGreaterThan(30);
    expect(names.filter(({ clipped }) => clipped)).toEqual([]);
    expect(names.filter(({ name }) => name.endsWith('.md'))).toEqual([]);
  });
}

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
  // Off the current path, drugs starts closed; opening it survives its parent.
  await expect(drugs).toHaveAttribute('aria-expanded', 'false');
  await expect(analgesics).toBeHidden();
  await drugs.click();
  await medical.click();
  await medical.click();
  await expect(drugs).toHaveAttribute('aria-expanded', 'true');
  await expect(analgesics).toBeVisible();
  await expect(current).toBeVisible();
  await page.locator('.desktop-explorer-toggle button').click();
  await page.locator('.desktop-explorer-toggle button').click();
  await expect(drugs).toHaveAttribute('aria-expanded', 'true');
  await expect(analgesics).toBeVisible();
  // Two rapid toggle events finish in the starting state.
  await drugs.dblclick();
  await expect(drugs).toHaveAttribute('aria-expanded', 'true');
  await drugs.click();
  await expect(analgesics).toBeHidden();
  const blog = folderToggle(explorer, '/zh-hant/blog/');
  await expect(explorer.locator('.tree-empty')).toBeHidden();
  await blog.click();
  await expect(explorer.locator('.tree-empty')).toBeVisible();
  await blog.click();
  await expect(explorer.locator('.tree-empty')).toBeHidden();
});

for (const locale of ['zh-hant', 'en', 'ja']) {
  test(`${locale} folder names still navigate and language switching leaves controls usable`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    const explorer = page.locator('.sidebar .explorer');
    await folderToggle(explorer, `/${locale}/note/`).click();
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
  await folderToggle(dialog, '/en/note/').click();
  const medical = folderToggle(dialog, '/en/note/medical/');
  await medical.click();
  await expect(medical).toHaveAttribute('aria-expanded', 'true');
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

test('every level indents two cells with entries under their folder icon, as neo-tree draws it', async ({
  browser,
}) => {
  const notePath = '/zh-hant/note/software/network/p2p/p2p-downloader/';
  const pathToNote = [
    '/zh-hant/note/',
    '/zh-hant/note/software/',
    '/zh-hant/note/software/network/',
    '/zh-hant/note/software/network/p2p/',
    notePath,
  ];
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      const page = await context.newPage();
      await page.goto(notePath);
      if (javaScriptEnabled)
        await expect(page.locator('html')).toHaveAttribute(
          'data-keys',
          'ready',
        );
      const explorer = page.locator('.sidebar .explorer');
      const cell = await explorer.evaluate((element) =>
        parseFloat(getComputedStyle(element).getPropertyValue('--tree-cell')),
      );
      expect(cell).toBeGreaterThanOrEqual(6);
      for (const [index, href] of pathToNote.entries()) {
        const row = await explorer
          .locator(`a.tree-link[href="${href}"]`)
          .evaluate((link) => {
            const edge = link
              .closest('.explorer')!
              .getBoundingClientRect().left;
            const icon = [...link.querySelectorAll('.tree-icon')].find(
              (svg) => svg.getBoundingClientRect().width > 0,
            )!;
            const toggle = link.parentElement!.querySelector(
              ':scope > .tree-folder-toggle',
            );
            const box = toggle?.getBoundingClientRect();
            return {
              expander:
                link.querySelector('.tree-expander')!.getBoundingClientRect()
                  .left - edge,
              icon: icon.getBoundingClientRect().left - edge,
              toggle: box?.width ? box.left + box.width / 2 - edge : null,
            };
          });
        // Level n: expander or marker in cell 2n-1, icon in cell 2n+1, so each
        // entry's expander sits under its folder's icon.
        const level = index + 1;
        expect(row.expander, href).toBeCloseTo((2 * level - 1) * cell, 0);
        expect(row.icon, href).toBeCloseTo((2 * level + 1) * cell, 0);
        if (javaScriptEnabled && href !== notePath)
          expect(row.toggle, href).toBeCloseTo((2 * level - 0.5) * cell, 0);
      }
      // The folder's last note closes with └ (two strokes), the others show │.
      const strokes = (href: string) =>
        explorer
          .locator(`a.tree-link[href="${href}"] .tree-expander`)
          .evaluate(
            (expander) =>
              getComputedStyle(expander).backgroundImage.split('gradient(')
                .length - 1,
          );
      expect(await strokes(notePath)).toBe(1);
      expect(
        await strokes('/zh-hant/note/software/network/p2p/p2p-privacy/'),
      ).toBe(2);
      // Software has folders after it, so its cell continues │ down its
      // entries; Networks is the last in Software, so its cell stays empty.
      const guide = (href: string) =>
        explorer
          .locator('li', { has: page.locator(`a.tree-link[href="${href}"]`) })
          .last()
          .evaluate((item) => {
            const list = item.querySelector(':scope > .tree-children')!;
            const line = getComputedStyle(list, '::before');
            return line.content === 'none' ? null : parseFloat(line.left);
          });
      expect(await guide('/zh-hant/note/software/')).toBeCloseTo(
        3 * cell + Math.floor(cell / 2),
        0,
      );
      expect(await guide('/zh-hant/note/software/network/')).toBeNull();
    } finally {
      await context.close();
    }
  }
});

test('a row wider than the Explorer scrolls the tree sideways instead of cutting the name', async ({
  page,
}) => {
  const notePath = '/en/note/software/network/p2p/p2p-downloader/';
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(notePath);
    await expect(page.locator('html')).toHaveAttribute('data-keys', 'ready');
    const drawer = width < 1100;
    if (drawer)
      await page
        .getByRole('button', { name: 'Open explorer', exact: true })
        .click();
    const explorer = drawer
      ? page.getByRole('dialog', { name: 'Explorer' }).locator('.explorer')
      : page.locator('.sidebar .explorer');
    // Today's names fit, so nothing scrolls until a row is wider.
    expect(
      await explorer.evaluate((tree) => tree.scrollWidth - tree.clientWidth),
    ).toBeLessThanOrEqual(0);
    await explorer
      .locator(`a.tree-link[href="${notePath}"] .tree-name`)
      .evaluate((name) => {
        name.textContent =
          'P2P downloader: core architecture and connection governance';
      });
    const end = await explorer.evaluate((tree, href) => {
      tree.scrollLeft = tree.scrollWidth;
      const name = tree.querySelector(
        `a.tree-link[href="${href}"] .tree-name`,
      )!;
      const rows = [...tree.querySelectorAll<HTMLElement>('.tree-link')].filter(
        (row) => row.offsetParent,
      );
      return {
        scrollLeft: tree.scrollLeft,
        clipped: name.scrollWidth > name.clientWidth,
        nameEnd: name.getBoundingClientRect().right,
        visibleEnd: tree.getBoundingClientRect().left + tree.clientWidth,
        rowWidths: new Set(rows.map((row) => row.offsetWidth)).size,
      };
    }, notePath);
    expect(end.scrollLeft).toBeGreaterThan(0);
    expect(end.clipped).toBe(false);
    expect(end.nameEnd).toBeLessThanOrEqual(end.visibleEnd);
    // Every row is as wide as the longest, so a highlight runs the whole line.
    expect(end.rowWidths).toBe(1);
    // Only the tree scrolls: not the page, the sidebar title or the drawer.
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    if (drawer)
      expect(
        await page
          .locator('dialog[open]')
          .evaluate((dialog) => dialog.scrollWidth - dialog.clientWidth),
      ).toBe(0);
    else
      expect(
        await page
          .locator('.sidebar-head')
          .evaluate((head) => head.getBoundingClientRect().left),
      ).toBe(0);
  }
});
