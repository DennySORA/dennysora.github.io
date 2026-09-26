import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { close, createIndex } from 'pagefind';
import { locales } from '../src/i18n/index.ts';
import { listPosts } from '../src/lib/content.server.ts';

// Indexes the final prerendered HTML, never an empty client shell. Only elements
// marked data-pagefind-body (article header and text) become search records.
const site = join(process.cwd(), 'build/client');
const expected = Object.fromEntries(
  locales.map((locale) => [locale, listPosts(locale).length]),
);
const total = Object.values(expected).reduce((sum, count) => sum + count, 0);

try {
  const { index, errors } = await createIndex({});
  if (!index || errors.length)
    throw new Error(`Pagefind failed to start: ${errors.join('; ')}`);
  // page_count counts every HTML file read; the per-language records are checked below.
  const indexed = await index.addDirectory({ path: site });
  if (indexed.errors.length)
    throw new Error(`Pagefind indexing failed: ${indexed.errors.join('; ')}`);
  const written = await index.writeFiles({
    outputPath: join(site, 'pagefind'),
  });
  if (written.errors.length)
    throw new Error(`Pagefind write failed: ${written.errors.join('; ')}`);
} finally {
  await close();
}

const entry = JSON.parse(
  readFileSync(join(site, 'pagefind/pagefind-entry.json'), 'utf8'),
) as {
  languages: Record<string, { page_count: number }>;
};
for (const [locale, count] of Object.entries(expected)) {
  const language = entry.languages[locale];
  if (language?.page_count !== count)
    throw new Error(
      `Search index for ${locale} has ${language?.page_count ?? 0} pages; expected ${count}`,
    );
}
const unexpected = Object.keys(entry.languages).filter(
  (language) => !(language in expected),
);
const indexedTotal = Object.values(entry.languages).reduce(
  (sum, item) => sum + item.page_count,
  0,
);
if (unexpected.length || indexedTotal !== total)
  throw new Error(
    `Search index holds ${indexedTotal} records (${unexpected.join(', ') || 'no extra languages'}); expected ${total}`,
  );
console.log(
  `Search index built: ${Object.entries(expected)
    .map(([locale, count]) => `${locale} ${count}`)
    .join(', ')} article editions.`,
);
