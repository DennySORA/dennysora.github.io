import type { Locale } from '../../i18n/index.ts';
import { networkToolCopy } from './note-tool-copy.ts';

// Progressive enhancement only: no requests, P2P connections, storage or telemetry.
export function enhanceNetworkNote(
  root: HTMLElement,
  locale: Locale = 'zh-hant',
): () => void {
  const t = networkToolCopy[locale];
  const abort = new AbortController();
  const signal = abort.signal;
  const get = <T extends HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`);
  const number = (id: string) => Number(get<HTMLInputElement>(id)?.value);
  const checked = (id: string) => get<HTMLInputElement>(id)?.checked === true;
  const set = (id: string, text: string) => {
    const el = get(id);
    if (el) el.textContent = text;
  };
  const listen = (id: string, event: string, callback: () => void) =>
    get(id)?.addEventListener(event, callback, { signal });
  if (get('population')) {
    const pool = () => {
      const p = number('population'),
        w = number('waiters'),
        u = number('utilization') / 100,
        x = number('pressure') / 100;
      set(
        'util-value',
        checked('unknown') ? t.unknown : `${Math.round(u * 100)}%`,
      );
      set('pressure-value', x.toFixed(2));
      let title: string;
      let reason: string;
      if (
        !Number.isInteger(p) ||
        p < 0 ||
        p > 10000 ||
        !Number.isInteger(w) ||
        w < 0 ||
        w > 10000
      ) {
        title = t.invalidTitle;
        reason = t.invalidReason;
      } else if (x >= 1) {
        title = t.drain(Math.ceil(p * 0.15));
        reason = t.drainReason;
      } else if (!checked('fresh')) {
        title = t.resync;
        reason = t.resyncReason;
      } else if (!checked('settled')) {
        title = t.settle;
        reason = t.settleReason;
      } else if (!w) {
        title = t.noWaiters;
        reason = t.noWaitersReason;
      } else if (checked('plateau')) {
        title = t.rotate(Math.min(w, Math.max(1, Math.ceil(p * 0.05))));
        reason = t.rotateReason;
      } else if ((checked('unknown') || u < 0.9) && x < 0.7) {
        title = t.trial(Math.min(w, Math.max(1, Math.ceil(p * 0.25))));
        reason = t.trialReason;
      } else {
        title = t.hold;
        reason = t.holdReason;
      }
      const box = get('pool-result');
      if (box) {
        const strong = document.createElement('strong'),
          pnode = document.createElement('p');
        strong.textContent = title;
        pnode.textContent = reason;
        box.replaceChildren(strong, pnode);
      }
    };
    for (const id of [
      'population',
      'waiters',
      'utilization',
      'pressure',
      'fresh',
      'settled',
      'unknown',
      'plateau',
    ])
      listen(id, 'input', pool);
    pool();
    const scenario = () =>
      set(
        'connection-result',
        t.scenarios[get<HTMLSelectElement>('scenario')?.value ?? ''] ??
          t.unknownScenario,
      );
    listen('scenario', 'change', scenario);
    scenario();
    const rows = Array.from(
      root.querySelectorAll<HTMLTableRowElement>('#catalog-body tr'),
    );
    const filter = () => {
      const kind = get<HTMLSelectElement>('catalog-kind')?.value;
      const q =
        get<HTMLInputElement>('catalog-query')
          ?.value.trim()
          .toLocaleLowerCase() ?? '';
      let count = 0;
      for (const row of rows) {
        const visible =
          (kind === 'all' ||
            row.dataset['catalogKind'] === kind ||
            (kind === 'manual' && row.dataset['catalogManual'] === 'true')) &&
          (row.textContent ?? '').toLocaleLowerCase().includes(q);
        row.hidden = !visible;
        if (visible) count++;
      }
      set('catalog-count', t.catalogCount(count, rows.length));
    };
    listen('catalog-kind', 'change', filter);
    listen('catalog-query', 'input', filter);
    filter();
    listen('export-notes', 'click', () => {
      const data = {
        schema_version: '2.3-review',
        document: 'P2P Downloader v2.3',
        notes: get<HTMLTextAreaElement>('notes')?.value ?? '',
        exported_at: new Date().toISOString(),
        product_actions_executed: false,
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'P2P_v2_3_review_notes.json';
      a.click();
      URL.revokeObjectURL(url);
      set('notes-status', t.exported);
    });
  }
  if (get('candidate-n')) {
    const calc = () => {
      const n = number('candidate-n'),
        f = number('fpr'),
        t = number('tpr') / 100,
        fp = (n - 1) * f;
      set('tpr-value', `${Math.round(t * 100)}%`);
      set(
        'fp-out',
        fp.toLocaleString('en-US', {
          minimumFractionDigits: fp < 0.01 ? 4 : 2,
          maximumFractionDigits: fp < 0.01 ? 4 : 2,
        }),
      );
      set('tp-out', t.toFixed(2));
      set('ppv-out', `${((100 * t) / (t + fp)).toFixed(2)}%`);
    };
    for (const id of ['candidate-n', 'fpr', 'tpr']) listen(id, 'input', calc);
    calc();
  }
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('.toc-inline nav a'),
  );
  const sections = links.map((link) => {
    const heading = root.querySelector<HTMLElement>(link.hash);
    let text = heading?.textContent ?? '';
    let sibling = heading?.nextElementSibling;
    if (heading?.closest('.p2p-chapter')) {
      text = heading.closest('.p2p-chapter')?.textContent ?? text;
    } else {
      while (sibling && sibling.tagName !== 'H2') {
        text += sibling.textContent ?? '';
        sibling = sibling.nextElementSibling;
      }
    }
    return { link, text: text.toLocaleLowerCase() };
  });
  const search = () => {
    const query =
      get<HTMLInputElement>('note-section-search')
        ?.value.trim()
        .toLocaleLowerCase() ?? '';
    let found = 0;
    for (const { link, text } of sections) {
      const visible = text.includes(query);
      if (link.parentElement) link.parentElement.hidden = !visible;
      if (visible) found++;
    }
    set('note-search-count', t.sectionCount(found, sections.length));
  };
  listen('note-section-search', 'input', search);
  search();
  const openHash = () => {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const el = Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(
      (node) => node.id === id,
    );
    if (!el) return;
    let node: HTMLElement | null = el;
    while (node && node !== root) {
      if (node instanceof HTMLDetailsElement) node.open = true;
      node = node.parentElement;
    }
    el.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', openHash, { signal });
  if (location.hash) openHash();
  return () => abort.abort();
}
