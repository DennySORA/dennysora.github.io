import type { Locale } from '../i18n/index.ts';
const l = (zh: string, en: string, ja: string): Record<Locale, string> => ({
  'zh-hant': zh,
  en,
  ja,
});
export const demoLabels = {
  localOnly: l(
    '輸入只用於本頁公式示範，不會呼叫翻譯服務',
    "Inputs are used only for this page's formula demonstration; no translation service is called",
    '入力はこのページの数式デモにのみ使い、翻訳サービスは呼び出しません',
  ),
  level: l('閱讀狀態', 'Reading state', '閲覧状態'),
  idle: l('尚未捲動', 'Not scrolling yet', 'まだスクロールしていない'),
  reading: l('閱讀中', 'Reading', '閲覧中'),
  fast: l('快速掃讀', 'Fast scanning', '高速に流し読み'),
  direction: l('閱讀方向', 'Reading direction', '閲覧方向'),
  up: l('往上', 'Upward', '上方向'),
  down: l('往下', 'Downward', '下方向'),
  height: l(
    '可見畫面高度 H（px）',
    'Viewport height H (px)',
    '表示領域の高さ H（px）',
  ),
  base: l(
    '設定預載邊距 B（px）',
    'Configured preload margin B (px)',
    '設定した先読みマージン B（px）',
  ),
  invalid: l(
    '請填入範圍內的整數；圖中保留上一個有效結果。',
    'Enter integers within the allowed ranges; the diagram retains the last valid result.',
    '範囲内の整数を入力してください。図には直前の有効な結果が残ります。',
  ),
  zero: l(
    '預載邊距為 0：翻譯與段落註冊的前後預載範圍都為 0；可見畫面仍獨立判斷。',
    'A zero preload margin sets both translation and paragraph-registration margins to zero, ahead and behind; viewport visibility is still assessed independently.',
    '先読みマージンが 0 の場合、翻訳と段落登録の前後の先読み範囲はすべて 0 です。表示領域内かどうかは引き続き個別に判定します。',
  ),
  download: l('下載 SVG', 'Download SVG', 'SVG をダウンロード'),
} as const;
