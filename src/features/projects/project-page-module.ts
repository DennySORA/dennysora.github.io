import type { ProjectPage } from './ProjectPage.tsx';

type ProjectPageModule = { ProjectPage: typeof ProjectPage };

let pending: Promise<ProjectPageModule> | null = null;

/**
 * Project pages carry long bilingual copy and diagrams, so their code is its
 * own chunk, fetched only on their URLs. Prerendering awaits this first, so
 * the static HTML holds the whole page, readable without JavaScript.
 */
export function loadProjectPageModule(): Promise<ProjectPageModule> {
  if (!pending) {
    const promise = import('./ProjectPage.tsx').then((module) => {
      // React's use() reads a settled promise synchronously from these fields,
      // so once loaded the page never suspends again.
      void Object.assign(promise, { status: 'fulfilled', value: module });
      return module;
    });
    pending = promise;
  }
  return pending;
}
