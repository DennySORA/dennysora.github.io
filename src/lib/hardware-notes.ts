import type { Locale } from '../i18n/index.ts';

export const hardwareNoteIds = ['140mm-case-fans'] as const;
export type HardwareNoteId = (typeof hardwareNoteIds)[number];
export const hardwareNotes = {
  '140mm-case-fans': {
    tagIds: ['hardware', 'pc-cooling', 'case-fans'],
    name: {
      'zh-hant': '140 mm 機殼風扇',
      en: '140 mm case fans',
      ja: '140 mm ケースファン',
    },
    title: {
      'zh-hant': '140 mm 風扇評估：靜音、風壓、風量與前 10 推薦',
      en: '140 mm fans: quiet airflow, static pressure and a top 10',
      ja: '140 mm ファン評価：静音・静圧・風量とおすすめ 10 選',
    },
    description: {
      'zh-hant':
        '同噪音實測、冷排與濾網、日本到手價和 27 款規格；附前 10 推薦、P–Q 工作點與風扇盒除錯。',
      en: 'Noise-normalized tests, radiators and filters, delivered prices in Japan and specifications for 27 fans, with a top 10, P–Q operating points and fan-box troubleshooting.',
      ja: '同騒音での測定、ラジエーターとフィルター、日本での送料込み価格、27 モデルの仕様。おすすめ 10 選、P–Q 動作点、ファンボックスのトラブルシューティングも収録。',
    },
  },
} as const satisfies Record<
  HardwareNoteId,
  {
    tagIds: readonly string[];
    /** Short name shown in the Explorer; fits the sidebar in full. */
    name: Record<Locale, string>;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
  }
>;
