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
    article: 'Loxoprofen × Ibuprofen × Acetaminophen：藥理與安全性',
    intro: '整理閱讀與學習的筆記。醫學內容僅供教育參考，不是個人診斷或處方。',
    available: '繁體中文 · 2026-09-30',
    count: (n) => `${n} 篇筆記`,
    medicalIntro:
      '臨床藥理的學習筆記：作用機轉、安全性與證據來源。僅供教育參考，不是個人診斷或處方。',
  },
  en: {
    notes: 'Notes',
    medical: 'Medicine',
    article: 'Loxoprofen × Ibuprofen × Acetaminophen: pharmacology and safety',
    intro:
      'Reading and study notes. Medical content is educational and is not a personal diagnosis or prescription.',
    available: 'Available in Traditional Chinese · 2026-09-30',
    count: (n) => (n === 1 ? '1 note' : `${n} notes`),
    medicalIntro:
      'Clinical pharmacology study notes: mechanisms, safety and evidence sources. Educational only, not a personal diagnosis or prescription.',
  },
  ja: {
    notes: 'ノート',
    medical: '医学',
    article: 'Loxoprofen × Ibuprofen × Acetaminophen：薬理と安全性',
    intro:
      '読書と学習のノート。医学の内容は学習用であり、個人の診断や処方ではありません。',
    available: '繁体字中国語のみ · 2026-09-30',
    count: (n) => `${n} 件のノート`,
    medicalIntro:
      '臨床薬理の学習ノート：作用機序、安全性、根拠となる資料。学習用であり、個人の診断や処方ではありません。',
  },
};
