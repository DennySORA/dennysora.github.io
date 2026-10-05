import { expect, test } from '@playwright/test';
import { locales } from '../../src/i18n/index.ts';
import { searchCopy } from '../../src/features/search/search-copy.ts';
import {
  medicalNoteIds,
  medicalNotePath,
  medicalNotes,
} from '../../src/lib/medical-notes.ts';
import { networkNoteIds, networkNotes } from '../../src/lib/network-notes.ts';
import { origin } from './helpers.ts';

const notes = [
  ...medicalNoteIds.map((id) => ({
    path: medicalNotePath(id),
    tags: medicalNotes[id].tagIds,
  })),
  ...networkNoteIds.map((id) => ({
    path: `/zh-hant/note/network/${id}/`,
    tags: networkNotes[id].tagIds,
  })),
];

test('every note has accessible static header tags without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const note of notes) {
      await page.goto(`${origin}${note.path}`);
      const tags = page.locator('h1 + .content-tags');
      await expect(tags).toBeVisible();
      await expect(tags).toHaveAttribute('aria-label', '標籤');
      await expect(tags.getByRole('link')).toHaveCount(note.tags.length);
      for (const id of note.tags)
        await expect(
          tags.locator(`[data-content-tag="${id}"]`),
        ).toHaveAttribute('href', `/zh-hant/search/?tag=${id}`);
    }
  } finally {
    await context.close();
  }
});

test('a header tag opens exact global results and Back returns to the note', async ({
  page,
}) => {
  await page.goto('/zh-hant/note/network/p2p-downloader/');
  await page.locator('.content-tags [data-content-tag="p2p"]').click();
  await expect(page).toHaveURL('/zh-hant/search/?tag=p2p');
  await expect(page.locator('.site-search-results li')).toHaveCount(2);
  await expect(page.getByLabel('標籤', { exact: true })).toHaveValue('p2p');
  await page.goBack();
  await expect(page.locator('h1 + .content-tags')).toBeVisible();
  await page.goForward();
  await expect(page.getByLabel('標籤', { exact: true })).toHaveValue('p2p');
  await expect(page.locator('.site-search-results li')).toHaveCount(2);
});

for (const locale of locales) {
  test(`${locale} tag filters stay localized and combine with query, type, clear and history`, async ({
    page,
  }) => {
    const t = searchCopy[locale];
    await page.goto(`/${locale}/search/?tag=medicine`);
    await expect(page.locator('.site-search-results li')).toHaveCount(2);
    const tags = page.getByLabel(t.tagFilter, { exact: true });
    await expect(tags).toHaveValue('medicine');
    await expect(tags.locator('option[value="medicine"]')).toHaveText(
      { 'zh-hant': '醫學', en: 'Medicine', ja: '医学' }[locale],
    );
    await page.getByRole('searchbox').fill('glioma');
    await page.getByRole('button', { name: t.submit, exact: true }).click();
    await expect(page.locator('.site-search-results li')).toHaveCount(1);
    await expect(tags).toHaveValue('medicine');
    await page.getByLabel(t.filter, { exact: true }).selectOption('article');
    await page.getByRole('button', { name: t.submit, exact: true }).click();
    await expect(
      page.getByRole('heading', { name: t.empty, exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(page.locator('.site-search-results li')).toHaveCount(1);
    await page.getByRole('button', { name: t.clear, exact: true }).click();
    await expect(tags).toHaveValue('');
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await page.goto(`/${locale}/search/?tag=missing-tag`);
    await expect(
      page.getByRole('heading', { name: t.empty, exact: true }),
    ).toBeVisible();
    await expect(tags).toHaveValue('missing-tag');
  });
}

test('tag links search articles and notes together without unrelated pages', async ({
  page,
}) => {
  const tag = {
    id: 'architecture',
    label: { 'zh-hant': '架構設計', en: 'Architecture', ja: 'アーキテクチャ' },
    aliases: ['system design'],
  };
  await page.route('**/site-search.json', (route) =>
    route.fulfill({
      json: [
        {
          id: '/blog/example/',
          locale: 'en',
          kind: 'article',
          href: '/en/blog/example/',
          title: 'Example article',
          summary: 'Article summary',
          text: 'Body',
          tags: [tag],
        },
        {
          id: '/note/network/p2p-downloader/',
          locale: 'zh-hant',
          kind: 'note',
          href: '/zh-hant/note/network/p2p-downloader/',
          title: 'Example note',
          summary: 'Note summary',
          text: 'Body',
          tags: [tag],
        },
        {
          id: '/',
          locale: 'en',
          kind: 'page',
          href: '/en/',
          title: 'Home',
          summary: 'Home',
          text: 'Architecture',
          tags: [],
        },
      ],
    }),
  );
  await page.goto('/en/search/?tag=architecture');
  await expect(page.locator('.site-search-results li')).toHaveCount(2);
  await expect(page.locator('.site-search-results')).toContainText(
    'Example article',
  );
  await expect(page.locator('.site-search-results')).toContainText(
    'Example note',
  );
  await expect(page.locator('.site-search-results')).not.toContainText('Home');
});
