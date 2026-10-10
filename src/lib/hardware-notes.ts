import type { Locale } from '../i18n/index.ts';

export const hardwareCategories = ['computer'] as const;
export type HardwareCategory = (typeof hardwareCategories)[number];
export const hardwareNoteIds = ['140mm-case-fans'] as const;
export type HardwareNoteId = (typeof hardwareNoteIds)[number];
export const hardwareNotes = {
  '140mm-case-fans': {
    category: 'computer',
    tagIds: ['hardware', 'pc-cooling', 'case-fans'],
    title: {
      'zh-hant': '140 mm 風扇評估：靜音、風壓、風量與前 10 推薦',
      en: '140 mm fans: quiet airflow, static pressure and a top 10',
      ja: '140 mm ファン評価：静音・静圧・風量とおすすめ 10 選',
    },
    description:
      '同噪音實測、冷排與濾網、日本到手價和 27 款規格；附前 10 推薦、P–Q 工作點與風扇盒除錯。',
  },
} as const satisfies Record<
  HardwareNoteId,
  {
    category: HardwareCategory;
    tagIds: readonly string[];
    title: Record<Locale, string>;
    description: string;
  }
>;
export const hardwareCopy: Record<
  Locale,
  { title: string; intro: string; available: string }
> = {
  'zh-hant': {
    title: '硬體',
    intro:
      '電腦硬體的選購與實測整理。原廠規格、獨立實驗室量測、價格快照與推論分開標示。',
    available: '繁體中文原文 · 選購與實測筆記',
  },
  en: {
    title: 'Hardware',
    intro:
      'Buying notes and test summaries for computer hardware. Vendor specifications, independent lab measurements, price snapshots and conclusions are labelled separately.',
    available: 'Traditional Chinese source edition · Buying and test notes',
  },
  ja: {
    title: 'ハードウェア',
    intro:
      'PC ハードウェアの選び方と測定データの整理。メーカー仕様、第三者の測定、価格の記録、推論を区別して記載します。',
    available: '繁体字中国語の原文 · 選定と測定のノート',
  },
};
export const hardwareCategoryCopy: Record<
  Locale,
  Record<HardwareCategory, { title: string; intro: string }>
> = {
  'zh-hant': {
    computer: {
      title: '電腦',
      intro: '電腦零組件與散熱：同條件實測、規格、價格與安裝限制的比較。',
    },
  },
  en: {
    computer: {
      title: 'Computers',
      intro:
        'PC components and cooling: like-for-like measurements, specifications, prices and fitting constraints.',
    },
  },
  ja: {
    computer: {
      title: 'コンピューター',
      intro: 'PC パーツと冷却：同条件の測定、仕様、価格、取り付け条件の比較。',
    },
  },
};
export function hardwareNotePath(id: HardwareNoteId): string {
  return `/zh-hant/note/hardware/${hardwareNotes[id].category}/${id}/`;
}
