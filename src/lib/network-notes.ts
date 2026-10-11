import type { Locale } from '../i18n/index.ts';

export const networkNoteIds = ['p2p-downloader', 'p2p-privacy'] as const;
export type NetworkNoteId = (typeof networkNoteIds)[number];
export const networkNotes = {
  'p2p-downloader': {
    tagIds: ['p2p', 'architecture', 'networking'],
    name: {
      'zh-hant': 'P2P 下載器',
      en: 'P2P downloader',
      ja: 'P2P ダウンローダー',
    },
    title: {
      'zh-hant': 'P2P Downloader v2.3：核心架構與連線治理',
      en: 'P2P Downloader v2.3: core architecture and connection governance',
      ja: 'P2P Downloader v2.3：コアアーキテクチャと接続管理',
    },
    description: {
      'zh-hant':
        '持續探索、彈性下載池、逐連線治理與可恢復命令；保留設計限制、25 份契約附錄和離線規則示例。',
      en: 'Continuous discovery, an elastic download pool, per-connection governance and recoverable commands, with design limitations, 25 contract appendices and offline rule examples.',
      ja: '継続的な探索、伸縮するダウンロードプール、接続単位の管理、復旧可能なコマンド。設計上の制約、25 件の契約付録、オフラインのルール例を収録。',
    },
  },
  'p2p-privacy': {
    tagIds: ['p2p', 'privacy', 'security'],
    name: {
      'zh-hant': 'P2P 匿名性',
      en: 'P2P anonymity',
      ja: 'P2P の匿名性',
    },
    title: {
      'zh-hant': 'P2P 匿名性：數位調查與端對端流量關聯',
      en: 'P2P anonymity: digital investigations and end-to-end traffic correlation',
      ja: 'P2P の匿名性：デジタル調査とエンドツーエンドのトラフィック相関',
    },
    description: {
      'zh-hant':
        '從防洩漏到防關聯：威脅模型、網路隔離、DAITA、mixnet 與研究驗證；保留 63 節原稿及一手來源。',
      en: 'From preventing leaks to resisting correlation: threat models, network isolation, DAITA, mixnets and research validation, retaining all 63 source sections and primary references.',
      ja: '漏えい防止から相関への耐性まで：脅威モデル、ネットワーク分離、DAITA、mixnet、研究の検証。原稿の全 63 節と一次資料を収録。',
    },
  },
} satisfies Record<
  NetworkNoteId,
  {
    /** Short name shown in the Explorer; fits the sidebar in full. */
    name: Record<Locale, string>;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    tagIds: readonly string[];
  }
>;
export const networkCopy: Record<
  Locale,
  { title: string; intro: string; available: string }
> = {
  'zh-hant': {
    title: '網路與 P2P',
    intro:
      '分散式下載、連線治理與網路隱私研究。設計、觀測與已驗證能力分開記錄。',
    available: '繁體中文 · English · 日本語 · 設計與研究筆記',
  },
  en: {
    title: 'Networks & P2P',
    intro:
      'Distributed downloading, connection management and network privacy research. Designs, observations and verified capabilities are kept distinct.',
    available: '繁體中文 · English · 日本語 · Design and research notes',
  },
  ja: {
    title: 'ネットワークと P2P',
    intro:
      '分散ダウンロード、接続管理、ネットワークプライバシーの研究。設計・観測・検証済みの能力を区別します。',
    available: '繁體中文 · English · 日本語 · 設計・研究ノート',
  },
};
