export const contentTabsChange = 'content-tabs-change';

/** A static contents row becomes tabs after hydration; cleanup restores it. */
export function enhanceContentTabs(
  root: HTMLElement,
  beforeReveal?: (target: HTMLElement) => void,
): () => void {
  const abort = new AbortController();
  const { signal } = abort;
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.sn-tabpanel'));
  const tabs = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('[data-tabs] a[href^="#"]'),
  );
  const media = Array.from(
    root.querySelectorAll<HTMLMediaElement>('video, audio'),
  );
  const panelOf = (tab: HTMLAnchorElement) =>
    panels.find((panel) => `#${panel.id}` === tab.hash);
  const snapshots = new Map<Element, Map<string, string | null>>();
  const change = (element: Element, name: string, value: string) => {
    let attributes = snapshots.get(element);
    if (!attributes) {
      attributes = new Map();
      snapshots.set(element, attributes);
    }
    if (!attributes.has(name)) attributes.set(name, element.getAttribute(name));
    element.setAttribute(name, value);
  };
  const hidden = new Map(panels.map((panel) => [panel, panel.hidden]));
  const showTab = (index: number) => {
    tabs.forEach((tab, at) => {
      change(tab, 'aria-selected', String(at === index));
      change(tab, 'tabindex', at === index ? '0' : '-1');
      const panel = panelOf(tab);
      if (!panel) return;
      if (!panel.hidden && at !== index)
        for (const item of media) if (panel.contains(item)) item.pause();
      panel.hidden = at !== index;
    });
    root.dispatchEvent(new Event(contentTabsChange, { bubbles: true }));
  };
  const openTab = (index: number, focus: boolean) => {
    const tab = tabs[index];
    if (!tab) return;
    showTab(index);
    if (focus) tab.focus();
    history.replaceState(history.state, '', tab.hash);
    const panel = panelOf(tab);
    if (panel && panel.getBoundingClientRect().top < 0)
      panel.scrollIntoView({ block: 'start' });
  };
  const list = tabs[0]?.parentElement;
  if (list) {
    change(list, 'role', 'tablist');
    const label = list.closest('nav')?.getAttribute('aria-label');
    if (label) change(list, 'aria-label', label);
  }
  tabs.forEach((tab, index) => {
    const panel = panelOf(tab);
    change(tab, 'role', 'tab');
    if (panel) {
      change(tab, 'aria-controls', panel.id);
      change(panel, 'role', 'tabpanel');
      change(panel, 'aria-labelledby', tab.id);
      change(panel, 'tabindex', '0');
    }
    tab.addEventListener(
      'click',
      (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        openTab(index, false);
      },
      { signal },
    );
    tab.addEventListener(
      'keydown',
      (event) => {
        const next = {
          ArrowRight: index + 1,
          ArrowLeft: index - 1,
          Home: 0,
          End: tabs.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        openTab((next + tabs.length) % tabs.length, true);
      },
      { signal },
    );
  });

  const hashTarget = () => {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return undefined;
    }
    return Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(
      (node) => node.id === id,
    );
  };
  const tabIndexFor = (target: HTMLElement | undefined) => {
    const panel = target?.closest<HTMLElement>('.sn-tabpanel');
    return panel ? tabs.findIndex((tab) => panelOf(tab) === panel) : -1;
  };
  const openHash = () => {
    const target = hashTarget();
    if (!target) return;
    const index = tabIndexFor(target);
    if (index >= 0) showTab(index);
    beforeReveal?.(target);
    let node: HTMLElement | null = target;
    while (node && node !== root) {
      if (node instanceof HTMLDetailsElement) node.open = true;
      node = node.parentElement;
    }
    target.scrollIntoView({ block: 'start' });
  };
  if (tabs.length) showTab(Math.max(0, tabIndexFor(hashTarget())));
  window.addEventListener('hashchange', openHash, { signal });
  if (location.hash) openHash();
  return () => {
    abort.abort();
    for (const item of media) item.pause();
    for (const [panel, wasHidden] of hidden) panel.hidden = wasHidden;
    for (const [element, attributes] of snapshots)
      for (const [name, value] of attributes) {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      }
  };
}
