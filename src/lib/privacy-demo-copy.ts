import type { Locale } from '../i18n/index.ts';
const l = (zh: string, en: string, ja: string): Record<Locale, string> => ({
  'zh-hant': zh,
  en,
  ja,
});
export const demoLabels = {
  route: l('選擇通訊路徑', 'Choose a communication path', '通信経路を選ぶ'),
  direct: l('直接連線', 'Direct connection', '直接接続'),
  vpn: l('單跳 VPN', 'Single-hop VPN', '単一ホップ VPN'),
  multi: l(
    '同供應商多跳',
    'Multiple hops, one provider',
    '同一事業者のマルチホップ',
  ),
  device: l('你的裝置', 'Your device', '使用者のデバイス'),
  isp: l('接取 ISP', 'Access ISP', 'アクセス ISP'),
  vpnSide: l('VPN 端', 'VPN side', 'VPN 側'),
  peer: l('BitTorrent peer', 'BitTorrent peer', 'BitTorrent ピア'),
  tunnelDown: l(
    '模擬隧道中斷',
    'Simulate a tunnel outage',
    'トンネル切断をシミュレート',
  ),
  tunnelUp: l('恢復隧道', 'Restore the tunnel', 'トンネルを復旧'),
  simulationOnly: l(
    '只改變圖解狀態，不操作網路。',
    'Changes the diagram only; it does not operate the network.',
    '図の状態だけを変更し、ネットワークは操作しません。',
  ),
  traceMode: l(
    '出口側的示意資料',
    'Illustrative egress data',
    '出口側の模式データ',
  ),
  same: l(
    '同一通訊：延遲與擾動',
    'Same communication: delay and perturbation',
    '同じ通信：遅延と変動',
  ),
  other: l('另一段通訊', 'Another communication', '別の通信'),
  aggregate: l(
    '同一通訊加上其他流量',
    'Same communication plus other traffic',
    '同じ通信に他のトラフィックを追加',
  ),
  lag: l(
    '出口圖向前對齊（0–3 秒）',
    'Align egress earlier (0–3 seconds)',
    '出口のグラフを前に合わせる（0～3 秒）',
  ),
  playTrace: l('播放時間掃描', 'Play the time scan', '時間走査を再生'),
  stopTrace: l('停止時間掃描', 'Stop the time scan', '時間走査を停止'),
  noProbability: l(
    '非配對機率',
    'not a matching probability',
    '対応する確率ではない',
  ),
  undefined: l(
    '無法計算（序列無變異）',
    'Undefined (no variation in the series)',
    '計算不可（系列に変動がない）',
  ),
  notPlayed: l(
    '時間掃描：未播放',
    'Time scan: not playing',
    '時間走査：未再生',
  ),
  stopped: l(
    '播放已停止；圖中保留完整資料。',
    'Playback stopped; the full data remain visible.',
    '再生を停止しました。全データは図に残っています。',
  ),
  reduced: l(
    '已依減少動態效果偏好，直接顯示最終狀態。',
    'Showing the final state directly, respecting reduced-motion preferences.',
    '動きを減らす設定に従い、最終状態を直接表示しています。',
  ),
  n: l(
    '候選數 N（含一個真配對）',
    'Candidate count N (one true match)',
    '候補数 N（真の対応を 1 件含む）',
  ),
  fpr: l(
    '每個錯誤候選的誤報率 FPR',
    'False-positive rate FPR per false candidate',
    '誤った候補ごとの偽陽性率 FPR',
  ),
  tpr: l(
    '真配對檢出率 TPR（%）',
    'True-positive rate TPR (%)',
    '真の対応の検出率 TPR（%）',
  ),
  next: l('下一步', 'Next step', '次の段階'),
  first: l('回到第一步', 'Back to step one', '最初の段階に戻る'),
  playMix: l('播放一次', 'Play once', '一度再生'),
  pause: l('暫停播放', 'Pause playback', '再生を一時停止'),
  reset: l('重設', 'Reset', 'リセット'),
} as const;
export const routeCopy = {
  direct: {
    nodes: [
      [
        demoLabels.device,
        l(
          '直接使用住宅網路。沒有這一層 VPN 包裝。',
          'Uses the residential network directly, without this VPN layer.',
          '住宅回線を直接利用し、この VPN のカプセル化はない。',
        ),
        l('來源：住宅網路', 'Source: residential network', '送信元：住宅回線'),
      ],
      [
        l(
          '接取 ISP／Internet',
          'Access ISP / Internet',
          'アクセス ISP／Internet',
        ),
        l(
          '將連線路由到 tracker 或 peer。應用若有加密，仍保留網路端點。',
          'Routes the connection to a tracker or peer. Application encryption still leaves network endpoints visible.',
          '接続を tracker や peer に転送する。アプリが暗号化していても、ネットワークのエンドポイントは残る。',
        ),
        l(
          '可見：目的端點',
          'Visible: destination endpoint',
          '見える情報：宛先エンドポイント',
        ),
      ],
      [
        demoLabels.peer,
        l(
          '收到你的資料連線，回覆你的對外端點。',
          'Receives your data connection and replies to your public endpoint.',
          'データ接続を受け取り、外部に見えるエンドポイントへ応答する。',
        ),
        l(
          '來源：住宅對外端點',
          'Source: residential public endpoint',
          '送信元：住宅回線の対外エンドポイント',
        ),
      ],
    ],
    observers: [
      [
        demoLabels.isp,
        l(
          '可見你直接連向哪些端點及時間、方向、大小。內容可讀性取決於實際協定加密。',
          'Sees the endpoints you contact directly, plus timing, direction and size. Content readability depends on the encryption actually used by the protocol.',
          '直接接続するエンドポイントと、時刻・方向・サイズが見える。内容を読めるかは、実際のプロトコル暗号化に依存する。',
        ),
      ],
      [
        demoLabels.vpnSide,
        l(
          '這條路徑沒有 VPN 節點。',
          'There is no VPN node on this path.',
          'この経路には VPN ノードがない。',
        ),
      ],
      [
        l('Tracker／Peer', 'Tracker / Peer', 'Tracker／Peer'),
        l(
          '能看到這段連線呈現的對外端點；若有 NAT／CGNAT，該 IP 仍不等同唯一自然人。',
          'Sees the public endpoint presented by the connection. With NAT/CGNAT, that IP still does not identify a unique person.',
          'この接続に現れる対外エンドポイントが見える。NAT／CGNAT がある場合、その IP は一意の個人を意味しない。',
        ),
      ],
    ],
    summary: l(
      '直接連線時，swarm 的對外端點來自住宅接取網路；NAT 只改變位址映射。',
      'With a direct connection, the endpoint seen by the swarm comes from the residential access network; NAT only changes address mappings.',
      '直接接続では、swarm に見える対外エンドポイントは住宅のアクセス回線に由来する。NAT が変えるのはアドレスの対応関係だけ。',
    ),
  },
  vpn: {
    nodes: [
      [
        demoLabels.device,
        l(
          '住宅網路先連到 VPN。內層封包被隧道包裝。',
          'The residential connection first reaches the VPN. Inner packets are encapsulated in the tunnel.',
          '住宅回線からまず VPN に接続し、内側のパケットをトンネルで包む。',
        ),
        l('來源：住宅 IP', 'Source: residential IP', '送信元：住宅回線の IP'),
      ],
      [
        l('VPN 伺服器', 'VPN server', 'VPN サーバー'),
        l(
          '終止 VPN 隧道，代表客戶端向 peer 連線。',
          'Terminates the VPN tunnel and connects to peers on behalf of the client.',
          'VPN トンネルを終端し、クライアントに代わって peer に接続する。',
        ),
        l('入口 ↔ 出口', 'Ingress ↔ egress', '入口 ↔ 出口'),
      ],
      [
        demoLabels.peer,
        l(
          '實際交換片段，看到 VPN 的對外端點。',
          'Exchanges pieces and sees the VPN public endpoint.',
          '実際にピースを交換し、VPN の対外エンドポイントを見る。',
        ),
        l(
          '來源：VPN 出口 IP',
          'Source: VPN egress IP',
          '送信元：VPN 出口の IP',
        ),
      ],
    ],
    observers: [
      [
        demoLabels.isp,
        l(
          '看得到你連向 VPN，以及封包時間、方向與大小；內層目的端受隧道加密保護。',
          'Sees your connection to the VPN and packet timing, direction and size; tunnel encryption protects the inner destination.',
          'VPN への接続とパケットの時刻・方向・サイズが見える。内側の宛先はトンネルの暗号化で保護される。',
        ),
      ],
      [
        demoLabels.vpnSide,
        l(
          '轉送時具有入口與出口的觀察位置；應用另有加密時，移除 VPN 外層不會解開應用密文。',
          'Has observation points at ingress and egress while forwarding. Removing the VPN layer does not decrypt separately encrypted application data.',
          '転送時に入口と出口を観測できる位置にある。アプリが別途暗号化していれば、VPN の外層を外してもアプリの暗号文は復号されない。',
        ),
      ],
      [
        l('Tracker／Peer', 'Tracker / Peer', 'Tracker／Peer'),
        l(
          '相關流量都經隧道時，看見 VPN 出口；peer 仍知道自己交換的是哪個 torrent。',
          'Sees the VPN egress when all relevant traffic uses the tunnel; the peer still knows which torrent it is exchanging.',
          '関連トラフィックがすべてトンネルを通れば VPN 出口が見える。peer は交換している torrent を引き続き知っている。',
        ),
      ],
    ],
    summary: l(
      '這張圖假設所有相關 P2P 流量都經由指定路徑。',
      'This diagram assumes that all relevant P2P traffic follows the selected path.',
      'この図では、関連するすべての P2P トラフィックが指定経路を通ると仮定している。',
    ),
  },
  multi: {
    nodes: [
      [
        demoLabels.device,
        l(
          '先連向入口 VPN。',
          'Connects to the ingress VPN first.',
          'まず入口 VPN に接続する。',
        ),
        l('住宅 IP', 'Residential IP', '住宅回線の IP'),
      ],
      [
        l('入口 VPN', 'Ingress VPN', '入口 VPN'),
        l(
          '入口與出口放在不同網路位置。',
          'Ingress and egress occupy different network locations.',
          '入口と出口を異なるネットワーク位置に置く。',
        ),
        l('入口觀察點', 'Ingress observation point', '入口の観測点'),
      ],
      [
        l('出口 VPN', 'Egress VPN', '出口 VPN'),
        l(
          '建立向外的 peer 連線。',
          'Establishes the outward peer connection.',
          '外部の peer への接続を確立する。',
        ),
        l('出口觀察點', 'Egress observation point', '出口の観測点'),
      ],
      [
        demoLabels.peer,
        l(
          '看到出口 VPN 的端點。',
          'Sees the egress VPN endpoint.',
          '出口 VPN のエンドポイントを見る。',
        ),
        l('出口 IP', 'Egress IP', '出口 IP'),
      ],
    ],
    observers: [
      [
        demoLabels.isp,
        l(
          '直接看見你連向入口 VPN，仍可觀察外層的時間、方向與大小。',
          'Directly sees the connection to the ingress VPN and can still observe outer timing, direction and size.',
          '入口 VPN への接続が直接見え、外側の時刻・方向・サイズを引き続き観測できる。',
        ),
      ],
      [
        demoLabels.vpnSide,
        l(
          '位置分離可能限制只看一處的觀察者；同供應商的管理與控制仍需整體理解。',
          'Location separation may limit an observer who sees only one point; management and control by one provider must still be considered together.',
          '位置の分離は一か所しか見られない観測者を制限しうる。同一事業者の管理と制御は、引き続き全体として考える必要がある。',
        ),
      ],
      [
        l('Tracker／Peer', 'Tracker / Peer', 'Tracker／Peer'),
        l(
          '看到出口 VPN 的對外端點。跳數增加沒有自動抹去封包節奏。',
          'Sees the public endpoint of the egress VPN. Adding hops does not automatically erase packet rhythms.',
          '出口 VPN の対外エンドポイントが見える。ホップ数を増やしてもパケットのリズムは自動では消えない。',
        ),
      ],
    ],
    summary: l(
      '這裡示意同供應商的多跳；網路位置分散與管理信任分散是不同條件。',
      'This illustrates multiple hops operated by one provider; distributing network locations and distributing administrative trust are different conditions.',
      'ここでは同一事業者のマルチホップを示す。ネットワーク位置の分散と管理上の信頼の分散は別の条件。',
    ),
  },
} as const;
export const tunnelCopy = {
  up: [
    l(
      '隧道可用：經指定介面送出',
      'Tunnel available: sent through the designated interface',
      'トンネル利用可能：指定インターフェースから送信',
    ),
    l(
      'wg0 的內層流量，經這個 UDP socket 加密後運送。',
      'Inner wg0 traffic is encrypted and carried through this UDP socket.',
      'wg0 の内側のトラフィックは暗号化され、この UDP socket を通って運ばれる。',
    ),
    l(
      '隧道可用時，應用資料經 wg0 封裝，再由實體網卡運送。',
      'When the tunnel is available, application data are encapsulated through wg0 and then carried by the physical interface.',
      'トンネルが利用可能な場合、アプリのデータは wg0 でカプセル化され、物理インターフェースによって運ばれる。',
    ),
  ],
  down: [
    l(
      '隧道不可達：等待或失敗',
      'Tunnel unreachable: wait or fail',
      'トンネル到達不能：待機または失敗',
    ),
    l(
      '主機仍可能送握手或重試；這不代表 P2P 內層封包已直出。',
      'The host may still send handshakes or retries; that does not mean inner P2P packets escaped directly.',
      'ホストは引き続きハンドシェイクや再試行を送る可能性がある。それは内側の P2P パケットが直接外に出たことを意味しない。',
    ),
    l(
      '此模型沒有普通 WAN 備用路徑；隧道失效不會讓應用突然改走 eth0。',
      'This model has no ordinary WAN fallback; a tunnel failure does not make the application switch directly to eth0.',
      'このモデルには通常の WAN 予備経路がない。トンネルが失敗してもアプリが突然 eth0 に切り替わることはない。',
    ),
  ],
} as const;
export const mixCopy = [
  {
    center: l('訊息到達', 'Messages arrive', 'メッセージ到着'),
    label: l('等待送出', 'Awaiting output', '送信待ち'),
    output: l(
      '尚未送出；左側顯示收到的順序。',
      'Not sent yet; the left side shows the arrival order.',
      'まだ送信していない。左側に受信順序を示す。',
    ),
    text: l(
      '第 1 步：三個來源先後送來 A₁、B₁、A₂、C₁。若立刻照順序轉送，兩端時間可能容易對齊。',
      'Step 1: Three sources send A₁, B₁, A₂ and C₁ in that order. Immediate in-order forwarding may make the two ends easy to align in time.',
      '第 1 段階：三つの送信元から A₁、B₁、A₂、C₁ が順に届く。直ちに同じ順序で転送すると、両端の時刻を対応づけやすくなる可能性がある。',
    ),
  },
  {
    center: l('暫時等待', 'Wait briefly', '一時的に待機'),
    label: l(
      '混合器內的等待',
      'Waiting inside the mixer',
      'ミキサー内での待機',
    ),
    output: l(
      '保留訊息，等待其他來源；付出的是時間與緩衝空間。',
      'Hold messages while waiting for other sources, at the cost of time and buffer space.',
      '他の送信元を待つ間メッセージを保持する。時間とバッファ領域を消費する。',
    ),
    text: l(
      '第 2 步：等待讓不同來源的訊息有機會重疊。只有一個可混淆來源時，單純等一下不會自動帶來多人掩護。',
      'Step 2: Waiting allows messages from different sources to overlap. With only one plausible source, delay alone does not automatically provide cover from multiple users.',
      '第 2 段階：待つことで異なる送信元のメッセージが重なりうる。紛らわせる送信元が一つだけなら、少し待つだけで複数利用者のカバーが自動的に得られるわけではない。',
    ),
  },
  {
    center: l('換序與掩護', 'Reordering and cover', '順序変更とカバー'),
    label: l(
      '一種可能的送出順序',
      'One possible output order',
      '考えられる送信順序の一例',
    ),
    output: l(
      'C₁ → A₁ → D → B₁ → A₂',
      'C₁ → A₁ → D → B₁ → A₂',
      'C₁ → A₁ → D → B₁ → A₂',
    ),
    text: l(
      '第 3 步：改變輸出順序並加入 D（dummy）。真實協定還需要適當的加密外觀，避免密文被直接比對。',
      'Step 3: Change the output order and add D (dummy). A real protocol also needs suitable encrypted representations to prevent direct ciphertext comparison.',
      '第 3 段階：出力順序を変え、D（dummy）を追加する。実際のプロトコルでは暗号文を直接照合できないよう、適切な暗号化表現も必要になる。',
    ),
  },
] as const;
