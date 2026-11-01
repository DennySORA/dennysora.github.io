import type { Locale } from '../i18n/index.ts';
import type { CollectionNoteId } from './note-collections.ts';
import { folderTrail, noteFolderOf } from './note-tree.ts';

type Text = Record<Locale, string>;

export const collectionNoteMeta = {
  'fan-system-matching': {
    tagIds: ['hardware', 'pc-cooling', 'case-fans'],
    name: { 'zh-hant': '風扇與風道', en: 'Fans & airflow', ja: 'ファンと通風' },
    title: {
      'zh-hant': '電腦風扇與風道：從 P–Q 曲線到系統工作點',
      en: 'PC fans and airflow: from P–Q curves to the operating point',
      ja: 'PC ファンと通風：P–Q 曲線から動作点まで',
    },
    description: {
      'zh-hant':
        '整合七份選購與實驗資料，分清原廠規格、第三方量測與模型假設，重新理解風扇比較、阻抗、噪音與安裝供電。附不冒充實測的互動試算。',
      en: 'Seven guides and labs reconciled: distinguish vendor specifications, third-party measurements and model assumptions when comparing fans, resistance, noise and installation power. Includes an explicitly hypothetical interactive model.',
      ja: '7 つのガイドと実験資料を統合。メーカー仕様、第三者測定、モデルの仮定を区別し、ファンの比較、通風抵抗、騒音、取り付けと電源を整理。仮想モデルであることを明示した対話型計算付き。',
    },
  },
  'lumbar-spine-care': {
    tagIds: ['health', 'lower-back', 'ergonomics'],
    name: {
      'zh-hant': '腰椎保護',
      en: 'Lower-back care',
      ja: '腰を守る',
    },
    title: {
      'zh-hant': '腰椎保護：姿勢、睡眠、運動與就醫警訊',
      en: 'Lower back care: posture, sleep, exercise and red flags',
      ja: '腰を守る：姿勢・睡眠・運動と受診の目安',
    },
    description: {
      'zh-hant':
        '從腰椎結構與神經症狀，到電腦工作站、睡姿與起床、步行與肌力訓練、七天調整計畫，以及需要急診或盡快就醫的警訊。僅供教育參考。',
      en: 'From lumbar structure and nerve symptoms to workstation setup, sleeping and getting up, walking and strength work, a seven-day plan and the red flags that need urgent or prompt care. Educational only.',
      ja: '腰椎の構造と神経症状から、パソコン作業の環境、寝姿勢と起き上がり方、ウォーキングと筋力トレーニング、7 日間の調整計画、救急や早めの受診が必要なサインまで。学習用です。',
    },
  },
  'landscape-photography': {
    tagIds: ['photography', 'landscape-photography', 'composition'],
    name: {
      'zh-hant': '風景攝影',
      en: 'Landscape photos',
      ja: '風景写真',
    },
    title: {
      'zh-hant': '風景攝影：從 31 張實拍與 21 張構圖示意圖學構圖、光線與曝光',
      en: 'Landscape photography from 31 real photos and 21 composition diagrams: composition, light and exposure',
      ja: '風景写真：実写 31 枚と構図図解 21 枚で学ぶ構図・光・露出',
    },
    description: {
      'zh-hant':
        '以同一天的 Pixel 9 實拍逐張檢視主體、導線、框景、焦段與機位、曝光、景深、流水與濾鏡；附超焦距與 ND 試算、裁切對照與四週練習，另收 21 張明確標為 GPT 生成的構圖示意圖。',
      en: 'One day of Pixel 9 photos, reviewed for subject, leading lines, framing, focal length and position, exposure, depth of field, water and filters, with hyperfocal and ND calculators, crop comparisons, a four-week practice plan and 21 composition diagrams clearly marked as GPT-generated.',
      ja: '同じ日に Pixel 9 で撮った写真で、主題・導線・フレーミング・焦点距離と立ち位置・露出・被写界深度・流水とフィルターを検討。超焦点距離と ND の試算、トリミング比較、4 週間の練習計画付き。GPT 生成と明記した構図図解 21 枚も収録。',
    },
  },
} as const satisfies Record<
  CollectionNoteId,
  {
    tagIds: readonly string[];
    /** Short name shown in the Explorer; fits the sidebar in full. */
    name: Text;
    title: Text;
    description: Text;
  }
>;

/** Repository path of a note's reviewed Traditional Chinese source fragment;
 * the content folders mirror the note/ tree. */
export function collectionNoteSource(id: CollectionNoteId): string {
  return `notes/${folderTrail(noteFolderOf[id]).join('/')}/${id}.html`;
}
