import { medicalNotes } from './medical-notes.ts';
import type { Locale } from '../i18n/index.ts';

export const noteCopy: Record<
  Locale,
  {
    notes: string;
    article: string;
    intro: string;
    count: (n: number) => string;
  }
> = {
  'zh-hant': {
    notes: '筆記',
    article: medicalNotes.analgesics.title['zh-hant'],
    intro: '整理閱讀與學習的筆記。醫學內容僅供教育參考，不是個人診斷或處方。',
    count: (n) => `${n} 篇筆記`,
  },
  en: {
    notes: 'Notes',
    article: medicalNotes.analgesics.title['en'],
    intro:
      'Reading and study notes. Medical content is educational and is not a personal diagnosis or prescription.',
    count: (n) => (n === 1 ? '1 note' : `${n} notes`),
  },
  ja: {
    notes: 'ノート',
    article: medicalNotes.analgesics.title['ja'],
    intro:
      '読書と学習のノート。医学の内容は学習用であり、個人の診断や処方ではありません。',
    count: (n) => `${n} 件のノート`,
  },
};
