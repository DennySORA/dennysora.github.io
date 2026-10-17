import type { Locale } from '../i18n/index.ts';
import type { CollectionNoteId } from './note-collections.ts';
import { folderTrail, noteFolderOf } from './note-tree.ts';

type Text = Record<Locale, string>;

export const collectionNoteMeta = {
  'japanese-structure': {
    tagIds: ['japanese', 'japanese-grammar', 'particles'],
    name: {
      'zh-hant': '1 句子結構',
      en: '1 Structure',
      ja: '1 文の構造',
    },
    title: {
      'zh-hant': '日語筆記 1｜句子結構：述語、格框架與助詞',
      en: 'Japanese notes 1 | Sentence structure: predicates, case frames and particles',
      ja: '日本語ノート 1｜文の構造：述語・格フレーム・助詞',
    },
    description: {
      'zh-hant':
        '一句日文的七步解析、常見錯誤的根因、名詞句與指示詞、格框架與主要助詞、は／が／には，以及移動、轉乘與出る。',
      en: 'A seven-step way to parse a Japanese sentence, the root causes of common errors, noun sentences and demonstratives, case frames and the main particles, wa / ga / ni wa, and movement, transfers and deru.',
      ja: '日本語の文を 7 段階で読む方法、よくある誤りの原因、名詞文と指示詞、格フレームと主な助詞、は／が／には、移動・乗り換え・出る。',
    },
  },
  'japanese-conjugation': {
    tagIds: ['japanese', 'japanese-grammar', 'conjugation'],
    name: {
      'zh-hant': '2 活用與接續',
      en: '2 Conjugation',
      ja: '2 活用と接続',
    },
    title: {
      'zh-hant': '日語筆記 2｜活用與接續：普通形、て形與自他動詞',
      en: 'Japanese notes 2 | Conjugation and connection: plain forms, te-forms and transitivity',
      ja: '日本語ノート 2｜活用と接続：普通形・て形・自他動詞',
    },
    description: {
      'zh-hant':
        '普通形四格、い形容詞／な形容詞／名詞的接續、て形與た形的音便、自他動詞與なる／する、ている、てしまう、てくる／ていく。',
      en: 'The four plain forms, how i-adjectives, na-adjectives and nouns connect, te- and ta-form sound changes, transitive and intransitive verbs with naru / suru, te iru, te shimau and te kuru / te iku.',
      ja: '普通形の 4 つの形、い形容詞・な形容詞・名詞の接続、て形・た形の音便、自動詞と他動詞・なる／する、ている、てしまう、てくる／ていく。',
    },
  },
  'japanese-clauses': {
    tagIds: ['japanese', 'japanese-grammar', 'clauses'],
    name: {
      'zh-hant': '3 時間與從句',
      en: '3 Time and clauses',
      ja: '3 時間と節',
    },
    title: {
      'zh-hant': '日語筆記 3｜時間與從句：とき、名詞化、關係子句與目的',
      en: 'Japanese notes 3 | Time and clauses: toki, nominalization, relative clauses and purpose',
      ja: '日本語ノート 3｜時間と節：とき・名詞化・連体修飾・目的',
    },
    description: {
      'zh-hant':
        '時間點、期間、頻率與截止；とき／前に／後で／てから的相對時態；こと／の與忘れる的作用範圍；關係子句；移動目的、ために與用途；ます語幹。',
      en: 'Points in time, durations, frequency and deadlines; relative tense in toki, mae ni, ato de and te kara; the scope of koto / no with wasureru; relative clauses; purpose with ni iku, tame ni and usage; the masu stem.',
      ja: '時点・期間・頻度・期限、とき／前に／後で／てからの相対時制、こと／のと忘れるの作用範囲、連体修飾節、移動の目的・ために・用途、ます形の語幹。',
    },
  },
  'japanese-reasons': {
    tagIds: ['japanese', 'japanese-grammar', 'modality'],
    name: {
      'zh-hant': '4 理由與意圖',
      en: '4 Reasons & intent',
      ja: '4 理由と意図',
    },
    title: {
      'zh-hant': '日語筆記 4｜理由、意圖與資訊來源：んです、から、つもり、そう',
      en: 'Japanese notes 4 | Reasons, intentions and sources: n desu, kara, tsumori and sō',
      ja: '日本語ノート 4｜理由・意図・情報源：んです・から・つもり・そう',
    },
    description: {
      'zh-hant':
        'んです、から／ので／ため、のに與逆接、たり／し的列舉、わけ系列、と思う與ように言う、予定／つもり／ことにする、推測與傳聞。',
      en: 'N desu, kara / node / tame, noni and other contrasts, listing with tari and shi, the wake family, to omou and yō ni iu, plans and intentions, inference and hearsay.',
      ja: 'んです、から／ので／ため、のにと逆接、たり／しの列挙、わけの系列、と思うとように言う、予定／つもり／ことにする、推量と伝聞。',
    },
  },
  'japanese-expressions': {
    tagIds: ['japanese', 'japanese-grammar', 'everyday-japanese'],
    name: {
      'zh-hant': '5 互動與表達',
      en: '5 Interaction',
      ja: '5 やりとりと表現',
    },
    title: {
      'zh-hant': '日語筆記 5｜互動與日常表達：授受、比較、副詞與店家用語',
      en: 'Japanese notes 5 | Everyday interaction: giving and receiving, comparison, adverbs and shop phrases',
      ja: '日本語ノート 5｜やりとりと日常表現：授受・比較・副詞・店での表現',
    },
    description: {
      'zh-hant':
        '授受與家族視點、比較與同じ、時間與頻率副詞、ほうがいい與請求、店家請求與付款、について等複合助詞、楽しい與楽しみ、身體狀況的固定搭配。',
      en: 'Giving and receiving from the family’s point of view, comparison and onaji, adverbs of time and frequency, hō ga ii and requests, asking and paying in shops, compound particles such as ni tsuite, tanoshii versus tanoshimi, and set phrases for feeling unwell.',
      ja: '授受と身内の視点、比較と同じ、時間・頻度の副詞、ほうがいいと依頼、店での依頼と支払い、についてなどの複合助詞、楽しいと楽しみ、体調の決まった言い方。',
    },
  },
  'japanese-vocabulary': {
    tagIds: ['japanese', 'vocabulary', 'katakana'],
    name: {
      'zh-hant': '6 詞彙與讀音',
      en: '6 Vocabulary',
      ja: '6 語彙と読み方',
    },
    title: {
      'zh-hant': '日語筆記 6｜詞彙與讀音：片假名、名詞、動詞索引與量詞',
      en: 'Japanese notes 6 | Vocabulary and readings: katakana, nouns, a verb index and counters',
      ja: '日本語ノート 6｜語彙と読み方：カタカナ語・名詞・動詞索引・助数詞',
    },
    description: {
      'zh-hant':
        '113 個片假名詞條與搭配、名詞與形容詞、把格框架一起記的動詞索引，以及日期、量詞與特殊讀音。',
      en: '113 katakana entries with their collocations, nouns and adjectives, a verb index that keeps each case frame, and dates, counters and special readings.',
      ja: 'カタカナ語 113 項目と組み合わせ、名詞と形容詞、格フレームごと覚える動詞索引、日付・助数詞・特別な読み方。',
    },
  },
  'japanese-review': {
    tagIds: ['japanese', 'japanese-grammar', 'study-methods'],
    name: {
      'zh-hant': '7 總複習',
      en: '7 Review',
      ja: '7 総復習',
    },
    title: {
      'zh-hant': '日語筆記 7｜總複習：43 個易錯點、接續總表與校訂紀錄',
      en: 'Japanese notes 7 | Review: 43 common traps, a connection table and the revision log',
      ja: '日本語ノート 7｜総復習：間違えやすい 43 項目・接続表・校訂記録',
    },
    description: {
      'zh-hant':
        '原手冊 43 個易錯點、四詞類接續總表、四層檢查與複習路徑，以及校訂紀錄、95 頁來源對照與外部查核來源。',
      en: 'The 43 common traps from the source handbook, a connection table for four word classes, a four-layer check and review path, plus the revision log, the 95-page source map and the external references.',
      ja: '元の復習冊子にある間違えやすい 43 項目、4 品詞の接続表、4 層のチェックと復習の進め方、校訂記録、95 ページの出典対照、外部の確認資料。',
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
  'h3-dit-components': {
    tagIds: [
      'video-generation',
      'diffusion-transformer',
      'quantization',
      'gpu',
    ],
    name: {
      'zh-hant': 'H3 DiT 元件比較',
      en: 'H3 DiT components',
      ja: 'H3 DiT 比較',
    },
    title: {
      'zh-hant': 'H3 DiT 元件比較：RTX 5080 上的量化、加速 LoRA 與 attention',
      en: 'Comparing H3 DiT components on an RTX 5080: quantization, acceleration LoRAs and attention',
      ja: 'H3 DiT コンポーネント比較：RTX 5080 での量子化・高速化 LoRA・attention',
    },
    description: {
      'zh-hant':
        '40 個 DiT 元件在同一份條件、同一個 seed 下的速度、記憶體與畫面比較：FP8／INT8／BF16、PAI 與 Turbo 加速 LoRA、AdaLN 與 attention，附 16 支可以切換聲音的 2×2 比較影片。',
      en: 'Speed, memory and image comparisons of 40 DiT components under the same conditioning and seed: FP8, INT8 and BF16, PAI and Turbo acceleration LoRAs, AdaLN and attention, with 16 synchronized 2×2 comparison videos whose audio you can switch.',
      ja: '同じ条件・同じ seed で 40 個の DiT コンポーネントを比較：FP8／INT8／BF16、PAI と Turbo の高速化 LoRA、AdaLN、attention ごとの速度・メモリ・画面。音声を切り替えられる 2×2 比較動画 16 本付き。',
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
