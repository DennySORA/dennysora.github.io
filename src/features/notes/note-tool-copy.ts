import type { Locale } from '../../i18n/index.ts';

const zhNetwork = {
  unknown: '未知',
  invalidTitle: '輸入需要有效的非負整數',
  invalidReason:
    '規則示例接受 0–10,000；此為互動工具輸入範圍，不是產品任務上限。',
  drain: (n: number) => `局部 drain：${n} 個工作`,
  drainReason:
    '本機已達壓力限制。停止積極增開，對該瓶頸域降壓；不可將來源誤記為不送資料。',
  resync: '保持並重新同步',
  resyncReason: '缺少新鮮回報，不把未知速度當成 0，不將未知資源當餘裕。',
  settle: '保持：等待穩定窗口',
  settleReason:
    '不要連續擾動造成震盪，也不要在資料還不足時判斷剛加入工作好壞。',
  noWaiters: '來源不足，不能保證吃滿',
  noWaitersReason:
    '沒有合格等待工作。維持探索和觀察，不以無關流量或更多空連線填滿頻寬。',
  rotate: (n: number) => `挑戰式輪替：${n} 個`,
  rotateReason:
    '前次擴張無新增效益。保留高收益 incumbent，回滾／比較候選；每輪幅度只是可調起點。',
  trial: (n: number) => `建議新增試跑：${n} 個`,
  trialReason:
    '有可探索餘裕，不受固定下載數限制。實際逐筆核發 FD／RAM／I/O／網路額度，仍不能超額。',
  hold: '保持正式 pool，保留探索與公平機會',
  holdReason: '用小比例新來源挑戰、服務欠額與稀缺片段救援，不整池重新排隊。',
  scenarios: {
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
  } as Record<string, string>,
  unknownScenario: '未知情境',
  catalogCount: (n: number, total: number) =>
    `顯示 ${n} / ${total} 筆候選；全部未探測，安全意圖未知。`,
  exported: '已產生筆記匯出；未寫入任何服務。',
  sectionCount: (n: number, total: number) =>
    `${n} / ${total} 個章節；僅在本文搜尋。`,
};

export const networkToolCopy: Record<Locale, typeof zhNetwork> = {
  'zh-hant': zhNetwork,
  en: {
    unknown: 'Unknown',
    invalidTitle: 'Enter valid non-negative integers',
    invalidReason:
      'This rule example accepts 0–10,000. This is the input range of the interactive tool, not a product task limit.',
    drain: (n) => `Local drain: ${n} tasks`,
    drainReason:
      'The host has reached its pressure limit. Stop aggressive expansion and relieve the bottleneck domain; do not mislabel sources as refusing to send data.',
    resync: 'Hold and resynchronize',
    resyncReason:
      'Fresh reports are missing. Do not treat unknown speed as 0 or unknown resources as spare capacity.',
    settle: 'Hold: wait for the settling window',
    settleReason:
      'Avoid repeated disturbances that cause oscillation, and do not judge newly added tasks before enough data is available.',
    noWaiters: 'Insufficient sources; full utilization is not guaranteed',
    noWaitersReason:
      'No eligible tasks are waiting. Continue discovery and observation; do not fill bandwidth with unrelated traffic or more empty connections.',
    rotate: (n) => `Challenger rotation: ${n}`,
    rotateReason:
      'The previous expansion added no benefit. Keep productive incumbents and roll back or compare candidates; each round’s size is only a tunable starting point.',
    trial: (n) => `Suggested new trials: ${n}`,
    trialReason:
      'There is headroom for exploration, without a fixed download-count limit. Grant FD, RAM, I/O and network budgets individually; oversubscription is still prohibited.',
    hold: 'Keep the production pool, with room for exploration and fairness',
    holdReason:
      'Use a small share for new-source challenges, service deficits and rare-piece rescue; do not requeue the entire pool.',
    scenarios: {
      snub: 'Close this connection and temporarily avoid the source, only after service eligibility is established, requests time out and local or shared network failures are excluded. Record TTL and evidence by realm + content + source; do not automatically ban the entire IP.',
      queue:
        'Wait remotely without recording a malicious strike. Keep valuable queue tickets and release other useless resources; begin eligible zero-progress timing only when service eligibility is established.',
      choke:
        'choked: the peer has not yet allowed transfer. This is a normal BT protocol state. Cost and policy may justify releasing the connection, but missing payload does not establish malice.',
      disk: 'Relieve local I/O pressure first. Missing data may mean the host has stopped receiving. Pause the source-fault timer, reduce new grants for that device and keep serving tasks on other disks.',
      tracker:
        'Use protocol-health rules, not payload thresholds. Trackers and eD2k servers provide information, not file payloads; check valid replies, latency and useful-source yield.',
      missing:
        'Unknown is not zero traffic. Disable speculative blocking and aggressive expansion; rebuild the snapshot and run sequence first. Monitoring interruptions must not be recorded as source failures.',
      good: 'Keep the useful connection. Progress in unique bytes resets eligible idle timing. Continue checking actual integrity, cost and policy; high speed does not waive safety rules.',
      corrupt:
        'Isolate the verification unit first, rather than blocking all sources. A failed multi-source piece does not yet provide attribution. Exclude local faults and use verifiable single-source or native attribution; pending verification is not an error.',
      malformed:
        'Close the precise connection and apply time-limited quarantine. Preserve confirmed protocol-violation evidence, verify the run and connection, and select the narrowest effective scope. This still does not prove monitoring or entrapment intent.',
      qbt: 'unsupported_scope: do not substitute an IP ban. The original banPeers calls banIP. Precise closure or revocable content-source avoidance requires a separate Engine bridge implementation; it cannot be claimed as complete.',
    },
    unknownScenario: 'Unknown scenario',
    catalogCount: (n, total) =>
      `Showing ${n} / ${total} candidates; all are unprobed and their security intent is unknown.`,
    exported: 'Notes export created; nothing was written to any service.',
    sectionCount: (n, total) =>
      `${n} / ${total} sections; searching within this note only.`,
  },
  ja: {
    unknown: '不明',
    invalidTitle: '有効な 0 以上の整数を入力してください',
    invalidReason:
      'このルール例の入力範囲は 0–10,000 です。対話ツールの入力範囲であり、製品のタスク数上限ではありません。',
    drain: (n) => `局所的な drain：${n} タスク`,
    drainReason:
      'ホストが負荷の上限に達しています。積極的な拡張を止め、ボトルネックの領域の負荷を下げます。送信元がデータを送らないと誤って記録してはいけません。',
    resync: '維持して再同期',
    resyncReason:
      '新しい報告がありません。不明な速度を 0、不明な資源を余力とみなしてはいけません。',
    settle: '維持：安定化の期間を待つ',
    settleReason:
      '繰り返しの変更による振動を避け、十分なデータが集まる前に追加直後のタスクを評価しません。',
    noWaiters: '送信元が不足しており、帯域を使い切る保証はありません',
    noWaitersReason:
      '条件を満たす待機タスクがありません。探索と観測を続け、無関係な通信や空の接続で帯域を埋めません。',
    rotate: (n) => `候補との比較による入れ替え：${n} 件`,
    rotateReason:
      '前回の拡張で追加の効果がありませんでした。高効率の incumbent を維持し、直前の拡張を戻すか、候補を比較します。各回の変更幅は調整可能な初期値です。',
    trial: (n) => `試行の追加候補：${n} 件`,
    trialReason:
      '固定のダウンロード数上限に縛られない探索の余力があります。ただし FD／RAM／I/O／ネットワークの予算は個別に付与し、超過は認めません。',
    hold: '本稼働プールを維持し、探索と公平な機会を確保',
    holdReason:
      '新しい送信元の試行、サービス不足、希少ピースの救済に小さな割合を割り当て、プール全体を並べ直しません。',
    scenarios: {
      snub: 'この接続を切り、送信元を一時的に回避します。サービスの条件が成立し、要求がタイムアウトし、ローカルや共通ネットワークの障害を除外できた場合に限ります。realm＋content＋source ごとに TTL と evidence を記録し、IP 全体を自動で ban しません。',
      queue:
        '相手側の待機状態であり、悪意の strike を記録しません。有用な queue ticket を残して他の不要な資源を解放し、サービス条件が成立してから適格な無進捗時間を計測します。',
      choke:
        'choked：相手はまだ転送を許可していません。BT の正常なプロトコル状態です。コストや方針に応じて接続を解放できますが、payload がないだけで悪意と判断してはいけません。',
      disk: 'まずローカル I/O の負荷を下げます。データが来ないのはホストが受信を止めているためかもしれません。送信元の過失を測る時計を止め、その device への新規 grant を減らし、他のディスクのタスクは維持します。',
      tracker:
        'payload の閾値ではなく、プロトコルの健全性ルールを使います。Tracker／eD2k server は情報源であり、ファイルの payload は直接提供しません。有効な応答、遅延、有用な送信元の獲得を確認します。',
      missing:
        '不明は通信量ゼロではありません。推測による遮断と積極的な拡張を止め、まず snapshot／run sequence を再構築します。監視の中断を送信元の失敗として記録してはいけません。',
      good: '有効な接続を維持します。unique bytes が進めば適格な idle 計時をリセットします。実際の整合性、コスト、方針の確認を続け、高速でも安全ルールを免除しません。',
      corrupt:
        'まず検証単位を隔離し、全送信元を遮断しません。複数の送信元から得た piece の失敗だけでは原因を帰属できません。ローカルの問題を除外し、照合可能な単一送信元／ネイティブの attribution を使います。pending verification はエラーではありません。',
      malformed:
        '対象の接続だけを切り、期限付きで隔離します。確定したプロトコル違反の証拠を保存し、run／connection を照合して最も狭い有効な scope を選びます。それでも監視やおとり捜査の意図を証明することはできません。',
      qbt: 'unsupported_scope：IP ban に置き換えてはいけません。元の banPeers は banIP を呼びます。正確な切断や撤回可能な content-source avoid には別途 Engine bridge の実装が必要であり、完成済みとは主張できません。',
    },
    unknownScenario: '不明なシナリオ',
    catalogCount: (n, total) =>
      `候補 ${n} / ${total} 件を表示。すべて未探査で、安全上の意図は不明です。`,
    exported:
      'ノートのエクスポートを作成しました。サービスへの書き込みはありません。',
    sectionCount: (n, total) =>
      `${n} / ${total} 節。このノート内のみを検索します。`,
  },
};

const yen = (value: number) => `¥${Math.round(value).toLocaleString('en-US')}`;
const zhHardware = {
  catalogCount: (n: number, total: number) =>
    n
      ? `顯示 ${n} / ${total} 款。`
      : `顯示 0 / ${total} 款：沒有符合的型號，請放寬條件或重設。`,
  operatingPoint: (drop: string, q: string, p: string) =>
    `假設 40 CFM 時壓降 ${drop} mmH₂O：工作點約 ${q} CFM、${p} mmH₂O。`,
  invalidQuantity: '請輸入 1–20 的整數顆數。',
  quantity: (count: number, bic: number, tsukumo: number, g2: number) =>
    `P14 Pro PST ${count} 顆：Bic ${yen(bic)}；Tsukumo ${yen(tsukumo)}（含運），${bic <= tsukumo ? 'Bic' : 'Tsukumo'} 較便宜。NF-A14x25 G2 棕色 ${count} 顆：${yen(g2)}。`,
};
export const hardwareToolCopy: Record<Locale, typeof zhHardware> = {
  'zh-hant': zhHardware,
  en: {
    catalogCount: (n, total) =>
      n
        ? `Showing ${n} / ${total} models.`
        : `Showing 0 / ${total} models: no matches. Broaden the filters or reset.`,
    operatingPoint: (drop, q, p) =>
      `Assuming a pressure drop of ${drop} mmH₂O at 40 CFM: the operating point is approximately ${q} CFM at ${p} mmH₂O.`,
    invalidQuantity: 'Enter a whole number of fans from 1 to 20.',
    quantity: (count, bic, tsukumo, g2) =>
      `${count} P14 Pro PST fans: Bic ${yen(bic)}; Tsukumo ${yen(tsukumo)} including shipping; ${bic <= tsukumo ? 'Bic' : 'Tsukumo'} is cheaper. ${count} brown NF-A14x25 G2 fans: ${yen(g2)}.`,
  },
  ja: {
    catalogCount: (n, total) =>
      n
        ? `${n} / ${total} モデルを表示。`
        : `0 / ${total} モデルを表示：該当するモデルがありません。条件を広げるかリセットしてください。`,
    operatingPoint: (drop, q, p) =>
      `40 CFM での圧力損失を ${drop} mmH₂O と仮定した場合、動作点は約 ${q} CFM、${p} mmH₂O です。`,
    invalidQuantity: 'ファンの個数を 1–20 の整数で入力してください。',
    quantity: (count, bic, tsukumo, g2) =>
      `P14 Pro PST ${count} 個：Bic ${yen(bic)}、Tsukumo ${yen(tsukumo)}（送料込み）。${bic <= tsukumo ? 'Bic' : 'Tsukumo'} の方が安価です。茶色の NF-A14x25 G2 ${count} 個：${yen(g2)}。`,
  },
};

const zhCollection = {
  near: (metres: string) => `約 ${metres} m`,
  archiveCount: (shown: number, total: number) => `顯示 ${shown}／${total} 張`,
};

export const collectionToolCopy: Record<Locale, typeof zhCollection> = {
  'zh-hant': zhCollection,
  en: {
    near: (metres) => `about ${metres} m`,
    archiveCount: (shown, total) => `Showing ${shown} of ${total}`,
  },
  ja: {
    near: (metres) => `約 ${metres} m`,
    archiveCount: (shown, total) => `${total} 枚中 ${shown} 枚を表示`,
  },
};
