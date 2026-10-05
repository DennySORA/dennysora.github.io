import type { Locale } from '../i18n/index.ts';

export const medicalCategories = ['drugs', 'pathology'] as const;
export type MedicalCategory = (typeof medicalCategories)[number];
export const medicalNoteIds = ['analgesics', 'brain-cns-tumors'] as const;
export type MedicalNoteId = (typeof medicalNoteIds)[number];
export const medicalNotes = {
  analgesics: {
    category: 'drugs',
    tagIds: ['medicine', 'pharmacology', 'analgesics', 'drug-safety'],
    title: {
      'zh-hant': '止痛藥指南：種類、作用與用藥注意事項',
      en: 'Pain medicine guide: types, effects and precautions',
      ja: '鎮痛薬ガイド：種類・作用・使用上の注意',
    },
    description:
      'Loxoprofen、Ibuprofen 與 Acetaminophen 的藥理、安全性與證據來源。',
  },
  'brain-cns-tumors': {
    category: 'pathology',
    tagIds: ['medicine', 'pathology', 'brain-tumors', 'glioma'],
    title: {
      'zh-hant': '腦與中樞神經系統腫瘤：分類與膠質瘤入門',
      en: 'Brain and CNS tumors: classification and an introduction to gliomas',
      ja: '脳・中枢神経系腫瘍：分類とグリオーマ入門',
    },
    description:
      '原發性與轉移性腫瘤、WHO 分類、膠質瘤、分子標記及診斷流程的教育筆記。',
  },
} as const satisfies Record<
  MedicalNoteId,
  {
    category: MedicalCategory;
    tagIds: readonly string[];
    title: Record<Locale, string>;
    description: string;
  }
>;
export const medicalCategoryCopy: Record<
  Locale,
  Record<MedicalCategory, { title: string; intro: string }>
> = {
  'zh-hant': {
    drugs: {
      title: '藥物',
      intro: '藥物種類、作用機轉、安全性與用藥注意事項。',
    },
    pathology: {
      title: '病理',
      intro: '疾病機制、腫瘤分類與分子病理的學習筆記。',
    },
  },
  en: {
    drugs: {
      title: 'Medicines',
      intro: 'Medicine types, mechanisms, safety and precautions.',
    },
    pathology: {
      title: 'Pathology',
      intro:
        'Study notes on disease mechanisms, tumor classification and molecular pathology.',
    },
  },
  ja: {
    drugs: {
      title: '薬物',
      intro: '薬の種類、作用機序、安全性と使用上の注意。',
    },
    pathology: {
      title: '病理',
      intro: '疾患の機序、腫瘍分類と分子病理の学習ノート。',
    },
  },
};
export function medicalNotePath(id: MedicalNoteId): string {
  return `/zh-hant/note/medical/${medicalNotes[id].category}/${id}/`;
}
