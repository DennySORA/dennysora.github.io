// Progressive enhancement only: no requests, storage or telemetry. Every
// number comes from the note's own static markup, which already shows the
// default result when JavaScript is unavailable.

type Point = [q: number, p: number];

const yen = (value: number) => `¥${Math.round(value).toLocaleString('en-US')}`;

/** Fan curve × square-law system curve, both in CFM and mmH₂O. */
export function operatingPoint(points: Point[], dropAt40: number): Point {
  const k = dropAt40 / 40 ** 2;
  const curve = points.map(([q, p]): Point => [q, Math.max(0, p)]);
  for (let i = 1; i < curve.length; i++) {
    const [q1, p1] = curve[i - 1] as Point;
    const [q2, p2] = curve[i] as Point;
    if (p1 - k * q1 * q1 >= 0 && p2 - k * q2 * q2 <= 0) {
      let lo = q1;
      let hi = q2;
      for (let step = 0; step < 50; step++) {
        const mid = (lo + hi) / 2;
        const fan = p1 + ((p2 - p1) * (mid - q1)) / (q2 - q1);
        if (fan - k * mid * mid > 0) lo = mid;
        else hi = mid;
      }
      return [lo, k * lo * lo];
    }
  }
  return curve[curve.length - 1] ?? [0, 0];
}

/** P14 Pro PST and NF-A14x25 G2 totals for n fans at the recorded offers. */
export function quantityCost(
  n: number,
  offer: {
    bic: number;
    tsukumo: number;
    shipping: number;
    freeFrom: number;
    g2Single: number;
    g2Pair: number;
  },
) {
  const tsukumoGoods = offer.tsukumo * n;
  return {
    bic: offer.bic * n,
    tsukumo:
      tsukumoGoods + (tsukumoGoods < offer.freeFrom ? offer.shipping : 0),
    g2: Math.floor(n / 2) * offer.g2Pair + (n % 2) * offer.g2Single,
  };
}

export function enhanceHardwareNote(root: HTMLElement): () => void {
  const abort = new AbortController();
  const { signal } = abort;
  const get = <T extends HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`);
  const set = (id: string, text: string) => {
    const el = get(id);
    if (el) el.textContent = text;
  };
  const listen = (id: string, event: string, callback: () => void) =>
    get(id)?.addEventListener(event, callback, { signal });

  // Catalog: filter each model's table row and its detail fold together;
  // hidden items keep their content.
  const rows = Array.from(
    root.querySelectorAll<HTMLTableRowElement>('#hw-catalog tbody tr'),
  ).map((row) => ({
    row,
    fold: get<HTMLDetailsElement>(row.id.replace(/^model-/, 'spec-')),
  }));
  const filter = () => {
    const q =
      get<HTMLInputElement>('hw-catalog-query')
        ?.value.trim()
        .toLocaleLowerCase() ?? '';
    const thickness = get<HTMLSelectElement>('hw-catalog-thickness')?.value;
    const evidence = get<HTMLSelectElement>('hw-catalog-evidence')?.value;
    let shown = 0;
    for (const { row, fold } of rows) {
      const mm = Number(row.dataset['thickness']);
      const text = `${row.textContent ?? ''} ${row.dataset['search'] ?? ''} ${fold?.textContent ?? ''}`;
      const visible =
        (thickness === 'le25'
          ? mm <= 25
          : thickness === 'le27'
            ? mm <= 27
            : thickness === 'thick'
              ? mm >= 28
              : true) &&
        (evidence !== 'lab' || row.dataset['lab'] === 'true') &&
        text.toLocaleLowerCase().includes(q);
      row.hidden = !visible;
      if (fold) fold.hidden = !visible;
      if (visible) shown++;
    }
    set(
      'hw-catalog-count',
      shown
        ? `顯示 ${shown} / ${rows.length} 款。`
        : `顯示 0 / ${rows.length} 款：沒有符合的型號，請放寬條件或重設。`,
    );
  };
  const resetCatalog = () => {
    const query = get<HTMLInputElement>('hw-catalog-query');
    const thickness = get<HTMLSelectElement>('hw-catalog-thickness');
    const evidence = get<HTMLSelectElement>('hw-catalog-evidence');
    if (query) query.value = '';
    if (thickness) thickness.value = 'all';
    if (evidence) evidence.value = 'all';
    filter();
  };
  if (rows.length) {
    listen('hw-catalog-query', 'input', filter);
    listen('hw-catalog-thickness', 'change', filter);
    listen('hw-catalog-evidence', 'change', filter);
    listen('hw-catalog-reset', 'click', resetCatalog);
    filter();
  }

  // Operating point: redraw the assumed system curve and the intersection.
  const chart = root.querySelector<SVGSVGElement>('#hw-wp-chart');
  const slider = get<HTMLInputElement>('hw-resistance');
  if (chart && slider) {
    const n = (key: string) => Number(chart.dataset[key]);
    const [x0, x1, yBase, yTop, qMax, pMax] = [
      n('x0'),
      n('x1'),
      n('y0'),
      n('y1'),
      n('qmax'),
      n('pmax'),
    ];
    const points = (chart.dataset['points'] ?? '')
      .split(';')
      .map((pair) => pair.split(',').map(Number) as Point)
      .filter(([q, p]) => Number.isFinite(q) && Number.isFinite(p));
    const x = (q: number) => x0 + (q / qMax) * (x1 - x0);
    const y = (p: number) => yBase - (p / pMax) * (yBase - yTop);
    const draw = () => {
      const drop = Number(slider.value);
      const k = drop / 40 ** 2;
      const path: string[] = [];
      for (let q = 0; q <= qMax; q += 0.5) {
        const p = k * q * q;
        if (p > pMax) break;
        path.push(
          `${path.length ? 'L' : 'M'}${x(q).toFixed(1)} ${y(p).toFixed(1)}`,
        );
      }
      root
        .querySelector<SVGPathElement>('#hw-wp-system')
        ?.setAttribute('d', path.join(''));
      const [q, p] = operatingPoint(points, drop);
      const dot = root.querySelector<SVGCircleElement>('#hw-wp-point');
      dot?.setAttribute('cx', x(q).toFixed(1));
      dot?.setAttribute('cy', y(p).toFixed(1));
      set('hw-resistance-value', `${drop.toFixed(2)} mmH₂O`);
      set(
        'hw-wp-result',
        `假設 40 CFM 時壓降 ${drop.toFixed(2)} mmH₂O：工作點約 ${q.toFixed(1)} CFM、${p.toFixed(2)} mmH₂O。`,
      );
    };
    listen('hw-resistance', 'input', draw);
    draw();
  }

  // Quantity: price arithmetic over the recorded offers only.
  const tool = get<HTMLElement>('hw-qty');
  if (tool) {
    const offer = {
      bic: Number(tool.dataset['bic']),
      tsukumo: Number(tool.dataset['tsukumo']),
      shipping: Number(tool.dataset['shipping']),
      freeFrom: Number(tool.dataset['freeFrom']),
      g2Single: Number(tool.dataset['g2Single']),
      g2Pair: Number(tool.dataset['g2Pair']),
    };
    const quote = () => {
      const count = Number(get<HTMLInputElement>('hw-fan-count')?.value);
      if (!Number.isInteger(count) || count < 1 || count > 20) {
        set('hw-qty-result', '請輸入 1–20 的整數顆數。');
        return;
      }
      const cost = quantityCost(count, offer);
      set(
        'hw-qty-result',
        `P14 Pro PST ${count} 顆：Bic ${yen(cost.bic)}；Tsukumo ${yen(cost.tsukumo)}（含運），${cost.bic <= cost.tsukumo ? 'Bic' : 'Tsukumo'} 較便宜。NF-A14x25 G2 棕色 ${count} 顆：${yen(cost.g2)}。`,
      );
    };
    listen('hw-fan-count', 'input', quote);
    quote();
  }

  // A link into a folded detail or a filtered-out row opens and shows it.
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
    if (el.closest<HTMLElement>('tr, details')?.hidden) resetCatalog();
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
