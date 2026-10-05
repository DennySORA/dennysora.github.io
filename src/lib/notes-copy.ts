import { medicalNotes } from './medical-notes.ts';
import type { Locale } from '../i18n/index.ts';

export const noteCopy: Record<
  Locale,
  {
    notes: string;
    medical: string;
    article: string;
    intro: string;
    available: string;
    count: (n: number) => string;
    medicalIntro: string;
  }
> = {
  'zh-hant': {
    notes: '筆記',
    medical: '醫學',
    article: medicalNotes.analgesics.title['zh-hant'],
    intro: '整理閱讀與學習的筆記。醫學內容僅供教育參考，不是個人診斷或處方。',
    available: '繁體中文原文 · 僅供教育參考',
    count: (n) => `${n} 篇筆記`,
    medicalIntro:
      '藥物與病理的學習筆記：作用機轉、疾病分類、安全性與證據來源。僅供教育參考，不是個人診斷或處方。',
  },
  en: {
    notes: 'Notes',
    medical: 'Medicine',
    article: medicalNotes.analgesics.title['en'],
    intro:
      'Reading and study notes. Medical content is educational and is not a personal diagnosis or prescription.',
    available:
      'Traditional Chinese source edition · Educational reference only',
    count: (n) => (n === 1 ? '1 note' : `${n} notes`),
    medicalIntro:
      'Medicine and pathology study notes: mechanisms, classification, safety and evidence sources. Educational only, not a personal diagnosis or prescription.',
  },
  ja: {
    notes: 'ノート',
    medical: '医学',
    article: medicalNotes.analgesics.title['ja'],
    intro:
      '読書と学習のノート。医学の内容は学習用であり、個人の診断や処方ではありません。',
    available: '繁体字中国語の原文 · 学習用の参考資料',
    count: (n) => `${n} 件のノート`,
    medicalIntro:
      '薬物と病理の学習ノート：作用機序、疾患分類、安全性、根拠となる資料。学習用であり、個人の診断や処方ではありません。',
  },
};
