import { enhanceContentTabs } from '../src/lib/content-tabs.ts';

const root = document.querySelector<HTMLElement>('.article-sections');
if (root) {
  let dispose = enhanceContentTabs(root);
  window.addEventListener('pagehide', () => dispose());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) dispose = enhanceContentTabs(root);
  });
}
