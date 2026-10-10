import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Explorer } from '../../src/components/Explorer.tsx';
import { ProjectPage } from '../../src/features/projects/ProjectPage.tsx';
import { Projects } from '../../src/features/projects/Projects.tsx';
import {
  dgxtopCopy,
  sectionIds,
  shotFiles,
} from '../../src/features/projects/dgxtop/copy.tsx';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import {
  loadTaxonomy,
  publishedPaths,
  validateContent,
} from '../../src/lib/content.server.ts';
import { readImageSize } from '../../src/lib/image-size.server.ts';
import {
  projectEdition,
  projectEditionsLabel,
  projectPagePath,
  projectPages,
  projectsCopy,
} from '../../src/lib/project-pages.ts';
import {
  navSection,
  parseRoute,
  routePath,
} from '../../src/lib/route-manifest.ts';
import { crumbs, fileKind, filePath } from '../../src/lib/workspace.ts';

function load(path: string) {
  return loader({
    params: { '*': path.replace(/^\//, '') },
  } as unknown as LoaderFunctionArgs);
}

function status(path: string): number {
  try {
    load(path);
    return 200;
  } catch (error) {
    return error instanceof Response ? error.status : -1;
  }
}

describe('projects routes', () => {
  it('parses and prints the projects folders in every locale', () => {
    for (const locale of locales) {
      for (const route of [
        { kind: 'projects', locale },
        { kind: 'project-category', locale, category: 'tools' },
      ] as const) {
        expect(parseRoute(routePath(route))).toEqual(route);
        expect(navSection(route)).toBe('projects');
        expect(fileKind(route)).toBe('folder');
      }
    }
  });

  it('publishes a project page only in the languages it was written in', () => {
    expect(projectPages.dgxtop.editions).toEqual(['zh-hant', 'en']);
    for (const locale of ['zh-hant', 'en'] as const) {
      const route = { kind: 'project', locale, projectId: 'dgxtop' } as const;
      expect(routePath(route)).toBe(`/${locale}/projects/tools/dgxtop/`);
      expect(parseRoute(routePath(route))).toEqual(route);
      expect(publishedPaths()).toContain(`/${locale}/projects/tools/dgxtop`);
      expect(filePath(route)).toBe('projects/tools/dgxtop.md');
    }
    expect(parseRoute('/ja/projects/tools/dgxtop/')).toBeNull();
    expect(publishedPaths()).not.toContain('/ja/projects/tools/dgxtop');
  });

  it('answers unknown, misplaced and removed project paths with a real 404', () => {
    for (const path of [
      '/ja/projects/tools/dgxtop/',
      '/en/projects/dgxtop/',
      '/en/projects/apps/',
      '/en/projects/tools/unknown/',
      '/en/projects/tools/dgxtop/extra/',
      '/zh-hant/projects/Tools/',
    ])
      expect(status(path), path).toBe(404);
  });

  it('names real breadcrumbs for the page, its folder and the directory', () => {
    expect(
      crumbs({ kind: 'project', locale: 'en', projectId: 'dgxtop' }),
    ).toEqual([
      { label: 'dennysora', href: '/en/' },
      { label: 'projects', href: '/en/projects/' },
      { label: 'tools', href: '/en/projects/tools/' },
      { label: 'dgxtop.md', href: '/en/projects/tools/dgxtop/' },
    ]);
  });
});

describe('project editions and links', () => {
  it('sends each reader to their edition, else English', () => {
    expect(projectEdition('dgxtop', 'zh-hant')).toBe('zh-hant');
    expect(projectEdition('dgxtop', 'en')).toBe('en');
    expect(projectEdition('dgxtop', 'ja')).toBe('en');
    expect(projectPagePath('dgxtop', 'ja')).toBe('/en/projects/tools/dgxtop/');
  });

  it('states a missing translation instead of inventing one', () => {
    expect(projectEditionsLabel('dgxtop', 'en')).toBe('繁體中文 · English');
    expect(projectEditionsLabel('dgxtop', 'ja')).toBe(
      `繁體中文 · English · ${dictionaries.ja.unavailableTranslation}`,
    );
  });

  it('links language switching only to published editions', () => {
    const data = load('/en/projects/tools/dgxtop/');
    expect(data.languageLinks).toEqual([
      { locale: 'zh-hant', href: '/zh-hant/projects/tools/dgxtop/' },
      { locale: 'en', href: '/en/projects/tools/dgxtop/' },
      { locale: 'ja', href: null },
    ]);
    expect(data.indexable).toBe(true);
    expect(data.title).toBe(`${projectPages.dgxtop.title.en} — DennySORA`);
    expect(data.description).toBe(projectPages.dgxtop.description.en);
  });

  it('validates project tags against the taxonomy', () => {
    const ids = loadTaxonomy().tags.map((tag) => tag.id);
    for (const id of projectPages.dgxtop.tagIds) expect(ids).toContain(id);
    expect(() => validateContent()).not.toThrow();
  });
});

describe('project folders and explorer', () => {
  for (const locale of locales) {
    it(`${locale} lists dgxtop under Tools with its real edition`, () => {
      const html = renderToStaticMarkup(createElement(Projects, { locale }));
      expect(html).toContain('/assets/illustrations/collection-tools-v1.webp');
      expect(html).toContain(`href="/${locale}/projects/tools/"`);
      expect(html).toContain(`href="${projectPagePath('dgxtop', locale)}"`);
      expect(html).toContain('dgxtop.md');
      expect(html).toContain(projectsCopy[locale].count(1));
      const explorer = renderToStaticMarkup(
        createElement(Explorer, {
          locale,
          route: { kind: 'projects', locale },
          files: { posts: [] },
        }),
      );
      expect(explorer).toContain(`href="/${locale}/projects/"`);
      expect(explorer).toContain(`href="${projectPagePath('dgxtop', locale)}"`);
    });
  }
  it('titles a file in the language its page is written in', () => {
    const html = renderToStaticMarkup(
      createElement(Projects, { locale: 'ja', category: 'tools' }),
    );
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain(
      `<span class="collection-file-title" lang="en">${projectPages.dgxtop.title.en}</span>`,
    );
  });
});

describe('dgxtop page', () => {
  for (const locale of ['zh-hant', 'en'] as const) {
    it(`${locale} renders every section, diagram, screenshot and tag`, () => {
      const data = load(`/${locale}/projects/tools/dgxtop/`);
      if (data.view.kind !== 'project') throw new Error('Expected a project');
      const html = renderToStaticMarkup(
        createElement(ProjectPage, { view: data.view, locale }),
      );
      const t = dgxtopCopy[locale];
      for (const id of sectionIds) {
        expect(html).toContain(`id="${id}"`);
        expect(html).toContain(`href="#${id}"`);
      }
      for (const id of [
        'architecture',
        'runtime',
        'arbitration',
        'history',
        'actions',
        'overload',
        'crates',
      ])
        expect(html).toContain(`aria-labelledby="dg-${id}-title"`);
      for (const file of shotFiles) {
        expect(html).toContain(`src="/assets/projects/dgxtop/${file}"`);
        expect(html).toContain(t.shots[file].caption);
      }
      // Only the screenshot already in view on load is fetched eagerly.
      expect(html.match(/loading="eager"/g)).toHaveLength(1);
      for (const id of projectPages.dgxtop.tagIds)
        expect(html).toContain(
          `href="/${locale}/search/?tag=${id}" data-content-tag="${id}"`,
        );
      expect(html).toContain('class="end-of-buffer"');
      // Diagrams draw with token classes only, never literal colours.
      expect(html).not.toMatch(/(?:fill|stroke)="#|style="/);
    });
  }

  it('ships every listed screenshot at the size its page declares', () => {
    for (const shot of projectPages.dgxtop.shots) {
      const size = readImageSize(`assets/projects/dgxtop/${shot.file}`);
      expect(size, shot.file).toEqual({
        width: shot.width,
        height: shot.height,
      });
    }
    expect(projectPages.dgxtop.shots.map((shot) => shot.file)).toEqual([
      ...shotFiles,
    ]);
  });
});
