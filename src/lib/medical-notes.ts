import type { Locale } from '../i18n/index.ts';

export const medicalNoteIds = ['analgesics', 'brain-cns-tumors'] as const;
export type MedicalNoteId = (typeof medicalNoteIds)[number];
export const medicalNotes = {
  analgesics: {
    tagIds: ['medicine', 'pharmacology', 'analgesics', 'drug-safety'],
    name: {
      'zh-hant': '止痛藥',
      en: 'Pain medicines',
      ja: '鎮痛薬',
    },
    title: {
      'zh-hant': '止痛藥指南：種類、作用與用藥注意事項',
      en: 'Pain medicine guide: types, effects and precautions',
      ja: '鎮痛薬ガイド：種類・作用・使用上の注意',
    },
    description: {
      'zh-hant':
        'Loxoprofen、Ibuprofen 與 Acetaminophen 的藥理、安全性與證據來源。',
      en: 'Pharmacology, safety and evidence sources for loxoprofen, ibuprofen and acetaminophen.',
      ja: 'ロキソプロフェン、イブプロフェン、アセトアミノフェンの薬理、安全性、根拠となる資料。',
    },
  },
  'brain-cns-tumors': {
    tagIds: ['medicine', 'pathology', 'brain-tumors', 'glioma'],
    name: {
      'zh-hant': '腦與中樞神經腫瘤',
      en: 'Brain & CNS tumors',
      ja: '脳・中枢神経腫瘍',
    },
    title: {
      'zh-hant': '腦與中樞神經系統腫瘤：分類與膠質瘤入門',
      en: 'Brain and CNS tumors: classification and an introduction to gliomas',
      ja: '脳・中枢神経系腫瘍：分類とグリオーマ入門',
    },
    description: {
      'zh-hant':
        '原發性與轉移性腫瘤、WHO 分類、膠質瘤、分子標記及診斷流程的教育筆記。',
      en: 'Educational notes on primary and metastatic tumors, WHO classification, gliomas, molecular markers and the diagnostic process.',
      ja: '原発性・転移性腫瘍、WHO 分類、グリオーマ、分子マーカー、診断の流れを学ぶためのノート。',
    },
  },
} as const satisfies Record<
  MedicalNoteId,
  {
    tagIds: readonly string[];
    /** Short name shown in the Explorer; fits the sidebar in full. */
    name: Record<Locale, string>;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
  }
>;
