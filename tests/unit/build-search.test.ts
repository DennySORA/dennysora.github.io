import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const counts: Record<string, number> = {};
  const languages: Record<string, { page_count: number }> = {};
  return {
    counts,
    languages,
    rmSync: vi.fn(),
    createIndex: vi.fn(),
    close: vi.fn(),
    addDirectory: vi.fn(),
    writeFiles: vi.fn(),
  };
});

vi.mock('node:fs', () => ({
  rmSync: mocks.rmSync,
  readFileSync: () => JSON.stringify({ languages: mocks.languages }),
}));
vi.mock('pagefind', () => ({
  createIndex: mocks.createIndex,
  close: mocks.close,
}));
vi.mock('../../src/lib/content.server.ts', () => ({
  listPosts: (locale: string) =>
    Array.from({ length: mocks.counts[locale] ?? 0 }, () => ({})),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.counts = {};
  mocks.languages = {};
  mocks.createIndex.mockResolvedValue({
    index: { addDirectory: mocks.addDirectory, writeFiles: mocks.writeFiles },
    errors: [],
  });
  mocks.addDirectory.mockResolvedValue({ errors: [] });
  mocks.writeFiles.mockResolvedValue({ errors: [] });
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('article search index build', () => {
  it('omits indexing and removes stale output when no articles are published', async () => {
    await import('../../scripts/build-search.ts');
    expect(mocks.createIndex).not.toHaveBeenCalled();
    expect(mocks.addDirectory).not.toHaveBeenCalled();
    expect(mocks.rmSync).toHaveBeenCalledWith(
      expect.stringMatching(/\/build\/client\/pagefind$/),
      { recursive: true, force: true },
    );
  });

  it('allows a missing index language when that locale has no published editions', async () => {
    mocks.counts = { en: 1 };
    mocks.languages = { en: { page_count: 1 } };
    await import('../../scripts/build-search.ts');
    expect(mocks.addDirectory).toHaveBeenCalledOnce();
    expect(mocks.writeFiles).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
    expect(mocks.rmSync).not.toHaveBeenCalled();
  });

  it('rejects an index containing unrelated pages', async () => {
    mocks.counts = { en: 1 };
    mocks.languages = { en: { page_count: 2 } };
    await expect(import('../../scripts/build-search.ts')).rejects.toThrow(
      'Search index for en has 2 pages; expected 1',
    );
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
