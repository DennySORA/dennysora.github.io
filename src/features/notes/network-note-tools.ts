// Progressive enhancement only: no requests, P2P connections, storage or telemetry.
export function enhanceNetworkNote(root: HTMLElement): () => void {
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
        checked('unknown') ? '未知' : `${Math.round(u * 100)}%`,
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
        title = '輸入需要有效的非負整數';
        reason =
          '規則示例接受 0–10,000；此為互動工具輸入範圍，不是產品任務上限。';
      } else if (x >= 1) {
        title = `局部 drain：${Math.ceil(p * 0.15)} 個工作`;
        reason =
          '本機已達壓力限制。停止積極增開，對該瓶頸域降壓；不可將來源誤記為不送資料。';
      } else if (!checked('fresh')) {
        title = '保持並重新同步';
        reason = '缺少新鮮回報，不把未知速度當成 0，不將未知資源當餘裕。';
      } else if (!checked('settled')) {
        title = '保持：等待穩定窗口';
        reason =
          '不要連續擾動造成震盪，也不要在資料還不足時判斷剛加入工作好壞。';
      } else if (!w) {
        title = '來源不足，不能保證吃滿';
        reason =
          '沒有合格等待工作。維持探索和觀察，不以無關流量或更多空連線填滿頻寬。';
      } else if (checked('plateau')) {
        title = `挑戰式輪替：${Math.min(w, Math.max(1, Math.ceil(p * 0.05)))} 個`;
        reason =
          '前次擴張無新增效益。保留高收益 incumbent，回滾／比較候選；每輪幅度只是可調起點。';
      } else if ((checked('unknown') || u < 0.9) && x < 0.7) {
        title = `建議新增試跑：${Math.min(w, Math.max(1, Math.ceil(p * 0.25)))} 個`;
        reason =
          '有可探索餘裕，不受固定下載數限制。實際逐筆核發 FD／RAM／I/O／網路額度，仍不能超額。';
      } else {
        title = '保持正式 pool，保留探索與公平機會';
        reason = '用小比例新來源挑戰、服務欠額與稀缺片段救援，不整池重新排隊。';
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
    const scenarios: Record<string, string> = {
      snub: '斷此連線＋暫時避開來源。只在服務資格成立、請求逾時且已排除本機／共同網路故障後成立。以 realm＋content＋source 記錄 TTL 與 evidence；不自動全 IP ban。',
      queue:
        '遠端等待，不記惡意 strike。保留有價值的 queue ticket，釋放其他無用資源；有服務資格時再開始合格零進度計時。',
      choke:
        'choked：對方尚未允許傳輸。BT 的正常協定狀態。可以因成本與策略釋放連線，但不能把沒有 payload 判成惡意。',
      disk: '先對本機 I/O 降壓。收不到資料可能是本機停止接收。暫停來源過失時計、減少該 device 的新 grant，保留其他磁碟工作的服務。',
      tracker:
        '使用協定健康規則，不套 payload 門檻。Tracker／eD2k server 是資訊來源，不直接提供檔案 payload；應檢查合格回覆、延遲及可用來源收益。',
      missing:
        '未知不是零流量。停用猜測式封鎖與積極擴張，先重建 snapshot／run sequence，不能把監控中斷記為來源失敗。',
      good: '保留有效連線。unique bytes 有進展，重置合格 idle 計時。持續檢查實際完整性、成本及策略，不因速度快而免除安全規則。',
      corrupt:
        '先隔離驗證單位，不全體封鎖。多來源 piece 失敗尚無可歸因證據。排除本機問題，使用可核對的單來源／原生 attribution；pending verification 不等於錯誤。',
      malformed:
        '精準斷線＋有期限的隔離。保存確定的協定違規證據，核對 run／connection，選最窄有效 scope；仍不能由此證明監測／誘捕意圖。',
      qbt: 'unsupported_scope：不可偷換 IP ban。原版 banPeers 會呼叫 banIP。精準關閉或可撤銷 content-source avoid 需要另外實作 Engine bridge，不能宣稱已完成。',
    };
    const scenario = () =>
      set(
        'connection-result',
        scenarios[get<HTMLSelectElement>('scenario')?.value ?? ''] ??
          '未知情境',
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
      set(
        'catalog-count',
        `顯示 ${count} / ${rows.length} 筆候選；全部未探測，安全意圖未知。`,
      );
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
      set('notes-status', '已產生筆記匯出；未寫入任何服務。');
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
    set(
      'note-search-count',
      `${found} / ${sections.length} 個章節；僅在本文搜尋。`,
    );
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
