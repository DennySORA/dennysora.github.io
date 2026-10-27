import { describe, expect, it } from 'vitest';
import { areaState, areas, crumbs, filePath } from '../../src/lib/workspace.ts';

describe('workspace chrome', () => {
  it('names every page as a real file or folder', () => {
    expect(filePath({ kind: 'home', locale: 'en' })).toBe('README.md');
    expect(filePath({ kind: 'library', locale: 'en' })).toBe('blog/');
    expect(
      filePath({ kind: 'article', locale: 'ja', slug: 'production-systems' }),
    ).toBe('blog/production-systems.md');
    expect(filePath({ kind: 'tag', locale: 'en', tagId: 'architecture' })).toBe(
      'blog/tags/architecture/',
    );
    expect(filePath({ kind: 'not-found' })).toBe('404');
  });
  it('links each breadcrumb segment that has a page, and only those', () => {
    expect(
      crumbs({ kind: 'topic', locale: 'zh-hant', topicId: 'engineering' }),
    ).toEqual([
      { label: 'dennysora', href: '/zh-hant/' },
      { label: 'blog', href: '/zh-hant/blog/' },
      { label: 'topics', href: null },
      { label: 'engineering', href: '/zh-hant/blog/topics/engineering/' },
    ]);
    expect(crumbs({ kind: 'root' })[0]).toEqual({
      label: 'dennysora',
      href: '/zh-hant/',
    });
  });
  it('keeps only the retained areas in the workspace', () => {
    expect(
      areas('ja', { posts: [{ slug: 'example', title: 'Example' }] }).map(
        (area) => area.href,
      ),
    ).toEqual([
      '/ja/',
      '/ja/blog/',
      '/ja/thoughts/',
      '/ja/note/',
      '/ja/projects/',
    ]);
  });
  it('marks landing pages as the page and inner pages as inside their area', () => {
    expect(areaState({ kind: 'home', locale: 'en' }, 'home')).toBe('page');
    expect(areaState({ kind: 'root' }, 'home')).toBe('page');
    expect(
      areaState({ kind: 'article', locale: 'en', slug: 'x' }, 'library'),
    ).toBe('true');
    expect(
      areaState({ kind: 'article', locale: 'en', slug: 'x' }, 'home'),
    ).toBeUndefined();
    expect(
      areaState(
        {
          kind: 'collection-note',
          locale: 'en',
          noteId: 'landscape-photography',
        },
        'notes',
      ),
    ).toBe('true');
  });
});
