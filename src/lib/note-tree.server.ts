import type { Locale } from '../i18n/index.ts';
import { medicalNotes, type MedicalNoteId } from './medical-notes.ts';
import { networkNotes, type NetworkNoteId } from './network-notes.ts';
import { collectionNoteMeta } from './note-collections.server.ts';
import type { CollectionNoteId } from './note-collections.ts';
import {
  folderPath,
  noteKind,
  notePath,
  notesIn,
  subfolders,
  type NoteFolderId,
  type NoteId,
  type NoteTreeFolder,
} from './note-tree.ts';

type Text = Record<Locale, string>;

/** Folder names and introductions; they reach pages as loader data only. */
export const noteFolderCopy: Record<
  NoteFolderId,
  { title: Text; intro: Text }
> = {
  software: {
    title: { 'zh-hant': '軟體', en: 'Software', ja: 'ソフトウェア' },
    intro: {
      'zh-hant':
        '軟體設計、網路與分散式系統的筆記。設計、觀測與已驗證能力分開記錄。',
      en: 'Notes on software design, networking and distributed systems. Designs, observations and verified capabilities are kept distinct.',
      ja: 'ソフトウェア設計、ネットワーク、分散システムのノート。設計・観測・検証済みの能力を区別して記録します。',
    },
  },
  network: {
    title: { 'zh-hant': '網路', en: 'Networks', ja: 'ネットワーク' },
    intro: {
      'zh-hant': '網路協定、連線治理與網路隱私的研究筆記。',
      en: 'Research notes on network protocols, connection management and network privacy.',
      ja: 'ネットワークプロトコル、接続管理、ネットワークプライバシーの研究ノート。',
    },
  },
  p2p: {
    title: { 'zh-hant': 'P2P', en: 'P2P', ja: 'P2P' },
    intro: {
      'zh-hant':
        '分散式下載、連線治理與網路隱私研究。設計、觀測與已驗證能力分開記錄。',
      en: 'Distributed downloading, connection management and network privacy research. Designs, observations and verified capabilities are kept distinct.',
      ja: '分散ダウンロード、接続管理、ネットワークプライバシーの研究。設計・観測・検証済みの能力を区別します。',
    },
  },
  medical: {
    title: {
      'zh-hant': '健康與醫學',
      en: 'Health & medicine',
      ja: '健康と医学',
    },
    intro: {
      'zh-hant':
        '藥物、病理與日常照顧的學習筆記：作用機轉、疾病分類、安全性、自我照護與證據來源。僅供教育參考，不是個人診斷、處方或治療建議。',
      en: 'Study notes on medicines, pathology and daily care: mechanisms, classification, safety, self-care and evidence sources. Educational only, not a personal diagnosis, prescription or treatment advice.',
      ja: '薬物、病理、日常のケアの学習ノート：作用機序、疾患分類、安全性、セルフケア、根拠となる資料。学習用であり、個人の診断・処方・治療の助言ではありません。',
    },
  },
  drugs: {
    title: { 'zh-hant': '藥物', en: 'Medicines', ja: '薬物' },
    intro: {
      'zh-hant': '藥物種類、作用機轉、安全性與用藥注意事項。',
      en: 'Medicine types, mechanisms, safety and precautions.',
      ja: '薬の種類、作用機序、安全性と使用上の注意。',
    },
  },
  pathology: {
    title: { 'zh-hant': '病理', en: 'Pathology', ja: '病理' },
    intro: {
      'zh-hant': '疾病機制、腫瘤分類與分子病理的學習筆記。',
      en: 'Study notes on disease mechanisms, tumor classification and molecular pathology.',
      ja: '疾患の機序、腫瘍分類と分子病理の学習ノート。',
    },
  },
  'daily-care': {
    title: { 'zh-hant': '日常照顧', en: 'Daily care', ja: '日常のケア' },
    intro: {
      'zh-hant':
        '日常健康與自我照護的衛教整理，附可核對的公開來源。僅供教育參考，不是個人診斷或治療建議。',
      en: 'Health education notes on everyday self-care, with public sources you can check. Educational only, not a personal diagnosis or treatment advice.',
      ja: '日常のセルフケアに関する健康教育ノート。確認できる公開資料を添えています。学習用であり、個人の診断や治療の助言ではありません。',
    },
  },
  hardware: {
    title: { 'zh-hant': '硬體', en: 'Hardware', ja: 'ハードウェア' },
    intro: {
      'zh-hant':
        '電腦硬體的選購與實測整理。原廠規格、獨立實驗室量測、價格快照與推論分開標示。',
      en: 'Buying notes and test summaries for computer hardware. Vendor specifications, independent lab measurements, price snapshots and conclusions are labelled separately.',
      ja: 'PC ハードウェアの選び方と測定データの整理。メーカー仕様、第三者の測定、価格の記録、推論を区別して記載します。',
    },
  },
  computer: {
    title: { 'zh-hant': '電腦', en: 'Computers', ja: 'コンピューター' },
    intro: {
      'zh-hant': '電腦零組件與散熱：同條件實測、規格、價格與安裝限制的比較。',
      en: 'PC components and cooling: like-for-like measurements, specifications, prices and fitting constraints.',
      ja: 'PC パーツと冷却：同条件の測定、仕様、価格、取り付け条件の比較。',
    },
  },
  other: {
    title: { 'zh-hant': '其他', en: 'Other', ja: 'その他' },
    intro: {
      'zh-hant': '不屬於其他分類的學習筆記，例如拍攝技巧。',
      en: 'Study notes that fit none of the other folders, such as photography techniques.',
      ja: 'ほかの分類に入らない学習ノート。撮影テクニックなど。',
    },
  },
};

/** A note's name, title and summary, wherever its kind keeps them. */
export function noteMeta(id: NoteId) {
  switch (noteKind(id)) {
    case 'network-note':
      return networkNotes[id as NetworkNoteId];
    case 'medical-note':
      return medicalNotes[id as MedicalNoteId];
    case 'collection-note':
      return collectionNoteMeta[id as CollectionNoteId];
  }
}

/** The note/ tree in one language, as the Explorer and folder pages show them. */
export function noteTree(
  locale: Locale,
  parent: NoteFolderId | null = null,
): NoteTreeFolder[] {
  return subfolders(parent).map((id) => ({
    id,
    href: folderPath(id, locale),
    title: noteFolderCopy[id].title[locale],
    intro: noteFolderCopy[id].intro[locale],
    folders: noteTree(locale, id),
    notes: notesIn(id).map((noteId) => {
      const meta = noteMeta(noteId);
      return {
        id: noteId,
        href: notePath(noteId, locale),
        name: meta.name[locale],
        title: meta.title[locale],
        description: meta.description[locale],
      };
    }),
  }));
}
