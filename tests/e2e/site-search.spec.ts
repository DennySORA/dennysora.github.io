import { test, expect } from '@playwright/test';
import { medicalNoteIds } from '../../src/lib/medical-notes.ts';
import { networkNoteIds } from '../../src/lib/network-notes.ts';
import { hardwareNoteIds } from '../../src/lib/hardware-notes.ts';
import { collectionNoteIds } from '../../src/lib/note-collections.ts';
import { locales } from '../../src/i18n/index.ts';
import { searchCopy } from '../../src/features/search/search-copy.ts';
import { origin } from './helpers.ts';

for (const locale of locales) {
  test(`${locale} global search finds real notes and opens the selected language edition`, async ({
    page,
  }) => {
    const t = searchCopy[locale];
    await page.goto(`/${locale}/`);
    await page.locator('.tabline-search').click();
    await expect(page).toHaveURL(`/${locale}/search/#search`);
    const input = page.getByRole('searchbox', { name: t.title });
    await expect(input).toBeFocused();
    await input.fill('DAITA');
    await input.press('Enter');
    await expect(input).toBeFocused();
    const result = page.locator('.site-search-results li').filter({
      has: page.locator(
        `a[href="/${locale}/note/software/network/p2p/p2p-privacy/"]`,
      ),
    });
    await expect(result).toBeVisible();
    await expect(result.locator('a')).toHaveAttribute(
      'href',
      `/${locale}/note/software/network/p2p/p2p-privacy/`,
    );
    await expect(result.locator('.site-search-meta')).toContainText(t.note);
    await expect(result).not.toContainText(t.fallback);
    await result.locator('a').click();
    await expect(page.locator('#network-title')).toBeVisible();
  });
}

test('search filters, empty states, Back and language switching preserve meaningful URL state', async ({
  page,
}) => {
  await page.goto('/en/search/?q=P2P&kind=note');
  await expect(page.locator('.site-search-results li')).toHaveCount(2);
  const input = page.getByRole('searchbox');
  await expect(input).toHaveValue('P2P');
  await page.getByLabel('Content type').selectOption('article');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No matching results' }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.locator('.site-search-results li')).toHaveCount(2);
  await expect(page.getByLabel('Content type')).toHaveValue('note');
  await page.locator('.header-language summary').click();
  await expect(
    page.locator('.header-language').getByRole('link', { name: '日本語' }),
  ).toHaveAttribute('href', '/ja/search/?q=P2P&kind=note');
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.locator('.site-search-results li')).not.toHaveCount(0);
});

test('search loading failure is retryable without losing the query', async ({
  page,
}) => {
  let first = true;
  await page.route('**/site-search.json', async (route) => {
    if (first) {
      first = false;
      await route.fulfill({ status: 503, body: '' });
    } else await route.continue();
  });
  await page.goto('/en/search/?q=Ibuprofen');
  await expect(page.getByRole('status')).toContainText('could not be loaded');
  await page.getByRole('button', { name: 'Try again' }).click();
  // Folder pages that list the note match too; the note's own result is the target.
  await expect(
    page.locator('.site-search-results li').filter({
      has: page.locator('a[href="/en/note/medical/drugs/analgesics/"]'),
    }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveValue('Ibuprofen');
});

test('search has useful no-JavaScript navigation and an index with note body content', async ({
  browser,
  request,
}) => {
  const response = await request.get('/site-search.json');
  expect(response.status()).toBe(200);
  const index = (await response.json()) as {
    href: string;
    kind: string;
    text: string;
  }[];
  expect(index.filter((entry) => entry.kind === 'note')).toHaveLength(
    (medicalNoteIds.length +
      networkNoteIds.length +
      hardwareNoteIds.length +
      collectionNoteIds.length) *
      locales.length,
  );
  expect(
    index.find((entry) => entry.href.endsWith('/p2p-privacy/'))?.text,
  ).toContain('DAITA');
  expect(index.some((entry) => /\/privacy\//.test(entry.href))).toBe(false);
  expect(
    index
      .filter((entry) => entry.kind === 'article')
      .map((entry) => entry.href)
      .sort(),
  ).toEqual([]);
  // A project page is indexed in each language it was written in, and only those.
  expect(
    index
      .filter((entry) => entry.href.endsWith('/projects/tools/dgxtop/'))
      .map((entry) => entry.href)
      .sort(),
  ).toEqual([
    '/en/projects/tools/dgxtop/',
    '/ja/projects/tools/dgxtop/',
    '/zh-hant/projects/tools/dgxtop/',
  ]);
  expect(
    index.find((entry) => entry.href === '/en/projects/tools/dgxtop/')?.text,
  ).toContain('one-command rollback');
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/en/search/`);
    await expect(page.getByRole('searchbox')).toBeHidden();
    await expect(
      page.getByText('Search needs JavaScript.', { exact: false }),
    ).toBeVisible();
    await expect(
      page.locator('.site-search-browse').getByRole('link', { name: 'Notes' }),
    ).toHaveAttribute('href', '/en/note/');
  } finally {
    await context.close();
  }
});

test('static search pages and full-text note index are served from the production artifact', async ({
  request,
}) => {
  const { searchSite } = await import('../../src/lib/site-search.ts');
  const response = await request.get('/site-search.json');
  expect(response.status()).toBe(200);
  const documents = (await response.json()) as Parameters<typeof searchSite>[0];
  expect(
    searchSite(documents, 'ngosang', 'note', 'en').map((item) => item.href),
  ).toContain('/en/note/software/network/p2p/p2p-downloader/');
  for (const locale of locales) {
    const page = await request.get(`/${locale}/search/`);
    expect(page.status()).toBe(200);
    const html = await page.text();
    expect(html).toContain(searchCopy[locale].title);
    expect(html).toContain('noindex, follow');
    expect(html).toContain(`href="/${locale}/search/#search"`);
  }
});
