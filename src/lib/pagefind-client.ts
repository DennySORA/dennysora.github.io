import { pageIds } from './page-ids.ts';

// Browser adapter for the Pagefind bundle written next to the static site at build time.
const bundlePath = '/pagefind/pagefind.js';

type PagefindSubResult = { title: string; url: string; excerpt: string };
type PagefindData = {
  url: string;
  excerpt: string;
  sub_results?: PagefindSubResult[];
};
type PagefindModule = {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  search: (
    term: string,
    options: {
      filters?: Record<string, unknown>;
      sort?: Record<string, string>;
    },
  ) => Promise<{
    results: { id: string; data: () => Promise<PagefindData> }[];
  } | null>;
};
export type SearchHit = {
  url: string;
  excerpt: string;
  sections: PagefindSubResult[];
};

let bundle: Promise<PagefindModule> | null = null;
let failures = 0;
function load(): Promise<PagefindModule> {
  // Browsers remember a failed module import, so a retry needs a distinct URL.
  const url = failures ? `${bundlePath}?retry=${failures}` : bundlePath;
  bundle ??= (async () => {
    const module = (await import(/* @vite-ignore */ url)) as PagefindModule;
    await module.options({ bundlePath: '/pagefind/', excerptLength: 24 });
    await module.init();
    return module;
  })().catch((error: unknown) => {
    // Forget the failed attempt so “Try again” performs a fresh request.
    bundle = null;
    failures++;
    throw error;
  });
  return bundle;
}

export async function searchArticles(
  term: string,
  filters: Record<string, unknown>,
  sort: 'relevance' | 'latest',
): Promise<SearchHit[]> {
  const pagefind = await load();
  const response = await pagefind.search(term, {
    filters,
    ...(sort === 'latest' ? { sort: { date: 'desc' } } : {}),
  });
  if (!response) return [];
  const data = await Promise.all(
    response.results.slice(0, 50).map((result) => result.data()),
  );
  return data.map((item) => ({
    url: item.url,
    excerpt: item.excerpt,
    // The title anchor is the article itself, not a section worth listing.
    sections: (item.sub_results ?? [])
      .filter((section) => {
        const hash = section.url.split('#')[1];
        return hash !== undefined && hash !== pageIds.articleTitle;
      })
      .slice(0, 2),
  }));
}
