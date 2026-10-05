import type { Locale } from '../i18n/index.ts';

export const networkNoteIds = ['p2p-downloader', 'p2p-privacy'] as const;
export type NetworkNoteId = (typeof networkNoteIds)[number];
export const networkNotes = {
  'p2p-downloader': {
    tagIds: ['p2p', 'architecture', 'networking'],
    title: 'P2P Downloader v2.3：核心架構與連線治理',
    description:
      '持續探索、彈性下載池、逐連線治理與可恢復命令；保留設計限制、25 份契約附錄和離線規則示例。',
  },
  'p2p-privacy': {
    tagIds: ['p2p', 'privacy', 'security'],
    title: 'P2P 匿名性：數位調查與端對端流量關聯',
    description:
      '從防洩漏到防關聯：威脅模型、網路隔離、DAITA、mixnet 與研究驗證；保留 63 節原稿及一手來源。',
  },
} satisfies Record<
  NetworkNoteId,
  { title: string; description: string; tagIds: readonly string[] }
>;
export const networkCopy: Record<
  Locale,
  { title: string; intro: string; available: string }
> = {
  'zh-hant': {
    title: '網路與 P2P',
    intro:
      '分散式下載、連線治理與網路隱私研究。設計、觀測與已驗證能力分開記錄。',
    available: '繁體中文原稿 · 設計與研究筆記',
  },
  en: {
    title: 'Networks & P2P',
    intro:
      'Distributed downloading, connection management and network privacy research. Designs, observations and verified capabilities are kept distinct.',
    available: 'Traditional Chinese source edition · Design and research notes',
  },
  ja: {
    title: 'ネットワークと P2P',
    intro:
      '分散ダウンロード、接続管理、ネットワークプライバシーの研究。設計・観測・検証済みの能力を区別します。',
    available: '繁体字中国語の原文 · 設計・研究ノート',
  },
};
