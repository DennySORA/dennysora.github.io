export const locales = ['zh-hant', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const htmlLang = { 'zh-hant': 'zh-Hant', en: 'en', ja: 'ja' } as const;
export const localeNames = {
  'zh-hant': '繁體中文',
  en: 'English',
  ja: '日本語',
};
export const localeShortNames = {
  'zh-hant': '繁中',
  en: 'EN',
  ja: '日本語',
};
export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

// Dates are formatted without Intl so prerendered HTML and hydration always agree.
const englishMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export function formatDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  if (locale === 'en') return `${englishMonths[month - 1]} ${day}, ${year}`;
  if (locale === 'ja') return `${year}年${month}月${day}日`;
  return `${year} 年 ${month} 月 ${day} 日`;
}
export function formatCompactDate(isoDate: string): string {
  return isoDate.replaceAll('-', '.');
}

/** Calendar-month difference, without inclusive-day counting or year rounding. */
export function formatYearMonthDuration(
  start: string,
  end: string,
  locale: Locale,
): string | null {
  const monthIndex = (value: string): number | null => {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
    return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
  };
  const first = monthIndex(start);
  const last = monthIndex(end);
  if (first === null || last === null || last < first) return null;
  const years = Math.floor((last - first) / 12);
  const months = (last - first) % 12;
  const parts: string[] = [];
  if (locale === 'en') {
    if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months || !years)
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    return `(${parts.join(' ')})`;
  }
  if (locale === 'ja') {
    if (years) parts.push(`${years}年`);
    if (months || !years) parts.push(`${months}か月`);
    return `（${parts.join('')}）`;
  }
  if (years) parts.push(`${years} 年`);
  if (months || !years) parts.push(`${months} 個月`);
  return `（${parts.join(' ')}）`;
}

const en = {
  skip: 'Skip to content',
  brandHome: 'DennySORA home',
  mainNav: 'Main navigation',
  navLibrary: 'Blog',
  navAbout: 'About me',
  navPapers: 'Read daily papers',
  quickLinks: 'Quick links',
  explorerCollapse: 'Collapse Explorer',
  explorerExpand: 'Expand Explorer',
  folderCollapse: 'Collapse folder',
  folderExpand: 'Expand folder',
  emptyFolder: '(empty)',
  breadcrumb: 'Current location',
  siteSource: 'Source of this site on GitHub (main branch)',
  logoAlt: 'DennySORA logo: a cosmic figure holding a glowing moon',
  readBlog: 'Read the blog',
  recentTitle: 'Recent posts',
  searchSite: 'Search the site',
  language: 'Language',
  openMenu: 'Open explorer',
  closeMenu: 'Close explorer',
  menuTitle: 'Explorer',
  footerTagline: 'Engineering, research and the ongoing work of understanding.',
  footerLinks: 'Site links',
  github: 'GitHub',
  email: 'Email',
  rss: 'RSS',
  newTab: 'external site',
  unavailableTranslation: 'not available in this language yet',
  allArticles: 'All articles',
  communityTitle: 'Recommended community',
  communityInvitation:
    'Interested in AI? Everyone is welcome to join the conversation in this Facebook group.',
  competenciesTitle: 'Core technologies & implementation',
  competenciesIntro:
    'From cloud and backend engineering to model training, GPU inference, network security and cryptography.',
  competenciesCaveat:
    'Includes research and experimental implementations; some GPU workflows still require validation.',
  levelProduction: 'Professional practice',
  levelPractice: 'Personal projects',
  levelLearning: 'Learning',
  examples: 'Examples',
  tools: 'Tools',
  readPost: 'Read',
  projectSource: 'Source',
  experienceTitle: 'Along the way',
  experienceIntro:
    'Roles and main work first; details for anyone who wants to go deeper. Based on the résumé already published on this site.',
  present: 'Present',
  educationStatus: 'Education · current status',
  showAllWork: (count: number) => `Show all ${count} work items`,

  libraryEyebrow: 'Writing & thinking',
  libraryTitle: 'Blog',
  libraryIntro:
    'Notes on engineering practice and the reasoning behind each trade-off. Start from the question you care about.',
  searchLabel: 'Search articles',
  searchPlaceholder: 'Search articles, concepts or technologies…',
  clearSearch: 'Clear search',
  searchScope: (language: string) => `Searches published ${language} articles`,
  topicFilter: 'Topic',
  typeFilter: 'Type',
  tagFilter: 'Tags',
  allFilter: 'All',
  tagFilterHint: 'Matches any selected tag',
  articleCount: (count: number) =>
    count === 1 ? '1 article' : `${count} articles`,
  anyTagSelected: 'matching any selected tag',
  sortLabel: 'Sort',
  sortRelevance: 'Relevance',
  sortLatest: 'Latest',
  clearAll: 'Clear all',
  activeConditions: 'Active conditions',
  removeCondition: (label: string) => `Remove ${label}`,
  searching: 'Searching…',
  noPostsTitle: 'No posts yet',
  noPostsText: 'There are no published blog posts right now.',
  browseNotes: 'Browse the notes',
  emptyTitle: 'No articles match these conditions',
  emptyText: 'Try removing a condition, or use a shorter keyword.',
  queryCondition: (query: string) => `“${query}”`,
  partialNotice:
    'Full-text search is unavailable right now, so only titles and summaries are searched.',
  retry: 'Try again',
  noJsSearch:
    'Full-text search needs JavaScript. You can still browse every article by topic or tag.',
  browseByTopic: 'Browse by topic',
  allTags: 'All tags',
  matchedSection: 'Matched section',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageStatus: (page: number, total: number) => `Page ${page} of ${total}`,
  pagination: 'Pagination',

  topicEyebrow: 'Topic',
  tagEyebrow: 'Tag',
  tagsTitle: 'All tags',
  tagsIntro:
    'Specific technologies and concepts, each linked to the articles that actually discuss them.',
  backToLibrary: 'Back to the blog',

  published: 'Published',
  updated: 'Updated',
  readingTime: (minutes: number) => `About ${minutes} min read`,
  translationOriginal: 'Original',
  translationInherited: 'Existing published translation',
  translationReviewed: 'Reviewed translation',
  toc: 'On this page',
  tags: 'Tags',
  provenanceTitle: 'About this note',
  adapted:
    'Adapted from the existing technical profile on 20 September 2026. This is not a recovered article from the former blog; the original profile remains available in Git history.',
  viewSource: 'View source',
  authorNote: 'Writing about the thinking behind backend and cloud work.',
  aboutAuthor: 'About the author',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',
  copyLinkFailed: 'Copy failed — use the address bar',
  relatedTitle: 'Keep reading',
  copyCode: 'Copy',
  copyCodeLabel: (language: string) => `Copy ${language} code`,
  copied: 'Copied',
  copyError: 'Copy unavailable — select the code manually.',
  copyFailedShort: 'Copy failed — select manually',
  codeBlock: 'Code',
  plainText: 'Text',
  tableLabel: 'Table',
  mathLabel: 'Math',
  calloutNote: 'Note',
  calloutTip: 'Tip',
  calloutWarning: 'Warning',
  footnotes: 'Footnotes',
  backToReference: 'Back to reference {0}',
  mathError: 'This formula could not be rendered.',

  commentsTitle: 'Comments & discussion',
  commentsIntro:
    'Questions, additions and different views are welcome. All language editions share one thread. Comments are public; posting requires a GitHub account.',
  commentsUnconfigured: 'Comments for this page are not open yet.',
  commentsUnconfiguredText:
    'The discussion service has not been set up. You can reach me on GitHub or by email in the meantime.',
  commentsDisabled: 'Comments are closed for this page.',
  commentsOpenGitHub: 'Open the discussion on GitHub',
  commentsFindGitHub: 'Find this page’s discussion on GitHub',
  commentsThirdParty:
    'Comments and the composer load automatically as you approach this section, connecting to giscus.app and GitHub. Reading needs no sign-in; posting uses a GitHub account. Comments are public, and signing in may store a giscus session in your browser.',
  commentsLoading: 'Connecting to the comment service…',
  commentsFailed: 'Comments could not be loaded',
  commentsSlow:
    'Comments are taking longer to load. The connection is still open; you can wait, retry or read on GitHub.',
  commentsFailedAuthentication:
    'Comment sign-in could not be restored. Reading needs no sign-in; the widget may reconnect automatically, or you can retry.',
  commentsFailedRateLimit:
    'The comment service is temporarily rate-limited. Please retry later or read on GitHub.',
  commentsFailedBlocked:
    'The comment service could not be reached. Please retry or read on GitHub.',
  commentsFailedMissing: 'The discussion for this page could not be found.',
  commentsLocked: 'This discussion is locked; existing comments stay readable.',
  commentsEmpty: 'No comments yet.',
  commentsCount: (count: number) =>
    count === 1 ? '1 comment' : `${count} comments`,
  commentsNative:
    'Discussion happens on GitHub, and every language version shares the same thread.',

  notFoundTitle: 'This path doesn’t lead to a page.',
  notFoundText:
    'The address may have changed. Browse the blog, or return to the home page.',
  returnHome: 'Back to the home page',
  legacyStatus: 'Content status',
  legacyMissingTitle: 'The original article is unavailable.',
  legacyMissingText:
    'The former blog repository was deleted. Its article text was not recovered, so it has not been recreated or presented as migrated content.',
};

type Dictionary = {
  [K in keyof typeof en]: (typeof en)[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : string;
};

const zh: Dictionary = {
  skip: '跳至主要內容',
  brandHome: 'DennySORA 首頁',
  mainNav: '主要導覽',
  navLibrary: '部落格',
  navAbout: '自我介紹',
  navPapers: '去看每日論文',
  quickLinks: '快速連結',
  explorerCollapse: '收合檔案總管',
  explorerExpand: '展開檔案總管',
  folderCollapse: '收合資料夾',
  folderExpand: '展開資料夾',
  emptyFolder: '（空）',
  breadcrumb: '目前位置',
  siteSource: '本站在 GitHub 的原始碼（main 分支）',
  logoAlt: 'DennySORA 標誌：懷抱發光月亮的宇宙人像',
  readBlog: '閱讀部落格',
  recentTitle: '最近的文章',
  searchSite: '全站搜尋',
  language: '語言',
  openMenu: '開啟檔案總管',
  closeMenu: '關閉檔案總管',
  menuTitle: '檔案總管',
  footerTagline: '工程、研究，以及持續理解的過程。',
  footerLinks: '網站連結',
  github: 'GitHub',
  email: 'Email',
  rss: 'RSS',
  newTab: '外部網站',
  unavailableTranslation: '尚無此語言版本',
  allArticles: '全部文章',
  communityTitle: '社群推薦',
  communityInvitation: '對 AI 有興趣嗎？歡迎大家來 Facebook 社團一起交流！',
  competenciesTitle: '核心技術與實作方向',
  competenciesIntro:
    '從雲端與後端工程，到模型訓練、GPU 推論、網路安全與密碼學。',
  competenciesCaveat: '含研究與實驗性實作；部分 GPU 流程尚待驗證。',
  levelProduction: '工作實務',
  levelPractice: '個人實作',
  levelLearning: '學習探索',
  examples: '代表工作',
  tools: '工具',
  readPost: '閱讀',
  projectSource: '原始碼',
  experienceTitle: '一路走來',
  experienceIntro:
    '先看角色與主要工作，細節留給想深入了解的人。以下依本站既有的公開履歷整理。',
  present: '至今',
  educationStatus: '教育・目前狀態',
  showAllWork: (count: number) => `展開全部工作內容（${count} 項）`,

  libraryEyebrow: '寫作與思考',
  libraryTitle: '部落格',
  libraryIntro:
    '記錄工程實務，以及每個取捨背後的思考。從你關心的問題開始閱讀。',
  searchLabel: '搜尋文章',
  searchPlaceholder: '搜尋文章、概念或技術名稱…',
  clearSearch: '清除搜尋',
  searchScope: (language: string) => `搜尋已發布的${language}文章`,
  topicFilter: '主題',
  typeFilter: '類型',
  tagFilter: '標籤',
  allFilter: '全部',
  tagFilterHint: '符合任一所選標籤',
  articleCount: (count: number) => `${count} 篇文章`,
  anyTagSelected: '符合任一所選標籤',
  sortLabel: '排序',
  sortRelevance: '相關性',
  sortLatest: '最新',
  clearAll: '清除全部條件',
  activeConditions: '目前的篩選條件',
  removeCondition: (label: string) => `移除「${label}」`,
  searching: '搜尋中…',
  noPostsTitle: '目前還沒有文章',
  noPostsText: '部落格目前尚未發布文章。',
  browseNotes: '瀏覽筆記',
  emptyTitle: '沒有符合這些條件的文章',
  emptyText: '試著移除一個條件，或改用更簡單的關鍵字。',
  queryCondition: (query: string) => `「${query}」`,
  partialNotice: '全文搜尋暫時無法使用，目前只搜尋標題與摘要。',
  retry: '重試',
  noJsSearch: '全文搜尋需要 JavaScript。你仍可以依主題或標籤瀏覽全部文章。',
  browseByTopic: '依主題瀏覽',
  allTags: '全部標籤',
  matchedSection: '命中章節',
  previousPage: '上一頁',
  nextPage: '下一頁',
  pageStatus: (page: number, total: number) => `第 ${page} 頁，共 ${total} 頁`,
  pagination: '分頁',

  topicEyebrow: '主題',
  tagEyebrow: '標籤',
  tagsTitle: '全部標籤',
  tagsIntro: '具體的技術與概念，只連到真正討論它們的文章。',
  backToLibrary: '返回部落格',

  published: '發布',
  updated: '更新',
  readingTime: (minutes: number) => `約 ${minutes} 分鐘`,
  translationOriginal: '原文',
  translationInherited: '沿用既有公開譯文',
  translationReviewed: '已對照審閱譯文',
  toc: '本文目錄',
  tags: '標籤',
  provenanceTitle: '關於這篇筆記',
  adapted:
    '於 2026 年 9 月 20 日整理自既有技術檔案，並非已刪除舊 blog 的復原文章；原始技術檔案保留於 Git 歷史。',
  viewSource: '查看本文來源',
  authorNote: '記錄後端與雲端實作中的思考。',
  aboutAuthor: '了解作者',
  copyLink: '複製文章連結',
  linkCopied: '已複製連結',
  copyLinkFailed: '無法複製，請從網址列複製',
  relatedTitle: '繼續閱讀',
  copyCode: '複製',
  copyCodeLabel: (language: string) => `複製 ${language} 程式碼`,
  copied: '已複製',
  copyError: '無法複製，請手動選取程式碼。',
  copyFailedShort: '無法複製，請手動選取',
  codeBlock: '程式碼',
  plainText: '純文字',
  tableLabel: '表格',
  mathLabel: '數學式',
  calloutNote: '備註',
  calloutTip: '提示',
  calloutWarning: '注意',
  footnotes: '註腳',
  backToReference: '回到引用 {0}',
  mathError: '這個公式無法轉換。',

  commentsTitle: '留言與討論',
  commentsIntro:
    '歡迎提出疑問、補充或不同觀點，三種語言版本共用同一則討論串。留言公開顯示，發言需要 GitHub 帳號。',
  commentsUnconfigured: '這個頁面的留言尚未開放。',
  commentsUnconfiguredText:
    '留言服務尚未設定完成。在此之前，歡迎透過 GitHub 或 Email 與我聯絡。',
  commentsDisabled: '這個頁面已關閉留言。',
  commentsOpenGitHub: '在 GitHub 開啟討論',
  commentsFindGitHub: '在 GitHub 尋找本頁討論',
  commentsThirdParty:
    '接近本區時會自動連線至 giscus.app 與 GitHub，顯示留言和輸入框。閱讀不需登入，發言才需要 GitHub 帳號。留言公開；登入後，giscus 可能在瀏覽器儲存登入階段。',
  commentsLoading: '正在連線到留言服務…',
  commentsFailed: '留言載入失敗',
  commentsSlow:
    '留言載入較慢，仍在等待連線。你可以繼續等候、重試，或在 GitHub 閱讀。',
  commentsFailedAuthentication:
    '無法恢復留言的登入狀態。閱讀不需登入；留言框可能會自動重新連線，也可以按重試。',
  commentsFailedRateLimit:
    '留言服務暫時達到請求上限，請稍後重試，或在 GitHub 閱讀。',
  commentsFailedBlocked: '目前無法連線到留言服務；請重試，或在 GitHub 閱讀。',
  commentsFailedMissing: '找不到這個頁面對應的討論串。',
  commentsLocked: '這個討論已鎖定，既有留言仍可閱讀。',
  commentsEmpty: '目前還沒有留言。',
  commentsCount: (count: number) => `${count} 則留言`,
  commentsNative: '討論在 GitHub 進行，三種語言版本共用同一則討論串。',

  notFoundTitle: '這條路徑沒有對應的頁面。',
  notFoundText: '網址可能已變更。你可以瀏覽部落格，或回到首頁。',
  returnHome: '回到首頁',
  legacyStatus: '內容狀態',
  legacyMissingTitle: '原始文章暫無法取得。',
  legacyMissingText:
    '舊 blog 的儲存庫已刪除，文章本文未能復原，因此本站沒有重造內容或將它標示為已搬遷。',
};

const ja: Dictionary = {
  skip: '本文へ移動',
  brandHome: 'DennySORA ホーム',
  mainNav: 'メインナビゲーション',
  navLibrary: 'ブログ',
  navAbout: '自己紹介',
  navPapers: '毎日の論文を読む',
  quickLinks: 'クイックリンク',
  explorerCollapse: 'エクスプローラーを折りたたむ',
  explorerExpand: 'エクスプローラーを展開',
  folderCollapse: 'フォルダーを折りたたむ',
  folderExpand: 'フォルダーを展開',
  emptyFolder: '（空）',
  breadcrumb: '現在地',
  siteSource: 'GitHub 上のこのサイトのソース（main ブランチ）',
  logoAlt: 'DennySORA のロゴ：光る月を抱く宇宙の人物',
  readBlog: 'ブログを読む',
  recentTitle: '最近の記事',
  searchSite: 'サイト内検索',
  language: '言語',
  openMenu: 'エクスプローラーを開く',
  closeMenu: 'エクスプローラーを閉じる',
  menuTitle: 'エクスプローラー',
  footerTagline: 'エンジニアリング、研究、そして理解し続ける過程。',
  footerLinks: 'サイトのリンク',
  github: 'GitHub',
  email: 'メール',
  rss: 'RSS',
  newTab: '外部サイト',
  unavailableTranslation: 'この言語の版はまだありません',
  allArticles: 'すべての記事',
  communityTitle: 'おすすめのコミュニティ',
  communityInvitation:
    'AI に興味がありますか？Facebook グループで、ぜひ一緒に語り合いましょう！',
  competenciesTitle: '主要技術と実装の方向性',
  competenciesIntro:
    'クラウドとバックエンドから、モデル学習、GPU 推論、ネットワークセキュリティ、暗号技術まで。',
  competenciesCaveat:
    '研究・実験的な実装を含み、一部の GPU 処理は検証待ちです。',
  levelProduction: '業務での実践',
  levelPractice: '個人での実装',
  levelLearning: '学習・探究',
  examples: '主な取り組み',
  tools: 'ツール',
  readPost: '読む',
  projectSource: 'ソースコード',
  experienceTitle: 'これまでの歩み',
  experienceIntro:
    'まず役割と主な仕事を、詳細は深く知りたい方のために。このサイトで公開済みの経歴をもとに整理しています。',
  present: '現在',
  educationStatus: '教育・現在の状況',
  showAllWork: (count: number) => `すべての業務内容を表示（${count} 件）`,

  libraryEyebrow: '執筆と思考',
  libraryTitle: 'ブログ',
  libraryIntro:
    'エンジニアリングの実践と、各トレードオフの背景にある考えを記録しています。知りたい問いから始めてください。',
  searchLabel: '記事を検索',
  searchPlaceholder: '記事、概念、技術名で検索…',
  clearSearch: '検索をクリア',
  searchScope: (language: string) => `公開済みの${language}の記事を検索します`,
  topicFilter: 'テーマ',
  typeFilter: '種類',
  tagFilter: 'タグ',
  allFilter: 'すべて',
  tagFilterHint: '選択したタグのいずれかに一致',
  articleCount: (count: number) => `${count} 件の記事`,
  anyTagSelected: '選択したタグのいずれかに一致',
  sortLabel: '並び順',
  sortRelevance: '関連度',
  sortLatest: '新しい順',
  clearAll: 'すべての条件を解除',
  activeConditions: '現在の条件',
  removeCondition: (label: string) => `「${label}」を解除`,
  searching: '検索中…',
  noPostsTitle: '記事はまだありません',
  noPostsText: '現在、公開済みのブログ記事はありません。',
  browseNotes: 'ノートを見る',
  emptyTitle: 'この条件に一致する記事はありません',
  emptyText: '条件を一つ外すか、より短いキーワードをお試しください。',
  queryCondition: (query: string) => `「${query}」`,
  partialNotice:
    '全文検索は現在利用できないため、タイトルと要約のみを検索しています。',
  retry: '再試行',
  noJsSearch:
    '全文検索には JavaScript が必要です。テーマやタグからすべての記事を閲覧できます。',
  browseByTopic: 'テーマから探す',
  allTags: 'すべてのタグ',
  matchedSection: '一致したセクション',
  previousPage: '前のページ',
  nextPage: '次のページ',
  pageStatus: (page: number, total: number) =>
    `${total} ページ中 ${page} ページ目`,
  pagination: 'ページ送り',

  topicEyebrow: 'テーマ',
  tagEyebrow: 'タグ',
  tagsTitle: 'すべてのタグ',
  tagsIntro:
    '具体的な技術や概念を、実際にそれを扱っている記事へつないでいます。',
  backToLibrary: 'ブログへ戻る',

  published: '公開',
  updated: '更新',
  readingTime: (minutes: number) => `約 ${minutes} 分`,
  translationOriginal: '原文',
  translationInherited: '既存の公開訳を継承',
  translationReviewed: '照合・確認済みの翻訳',
  toc: 'この記事の目次',
  tags: 'タグ',
  provenanceTitle: 'このノートについて',
  adapted:
    '2026 年 9 月 20 日に既存の技術プロフィールから再構成しました。削除された旧ブログの復元記事ではありません。原資料は Git 履歴に残っています。',
  viewSource: '出典を見る',
  authorNote: 'バックエンドとクラウドの実装で考えたことを記録しています。',
  aboutAuthor: '著者について',
  copyLink: 'リンクをコピー',
  linkCopied: 'リンクをコピーしました',
  copyLinkFailed: 'コピー失敗・アドレスバーから',
  relatedTitle: '続けて読む',
  copyCode: 'コピー',
  copyCodeLabel: (language: string) => `${language} のコードをコピー`,
  copied: 'コピーしました',
  copyError: 'コピーできません。コードを選択してコピーしてください。',
  copyFailedShort: 'コピー失敗・手動で選択',
  codeBlock: 'コード',
  plainText: 'テキスト',
  tableLabel: '表',
  mathLabel: '数式',
  calloutNote: 'メモ',
  calloutTip: 'ヒント',
  calloutWarning: '注意',
  footnotes: '脚注',
  backToReference: '参照 {0} に戻る',
  mathError: 'この数式は変換できませんでした。',

  commentsTitle: 'コメントと議論',
  commentsIntro:
    '質問、補足、異なる視点を歓迎します。各言語版で同じスレッドを共有します。コメントは公開され、投稿には GitHub アカウントが必要です。',
  commentsUnconfigured: 'このページのコメントはまだ公開していません。',
  commentsUnconfiguredText:
    'コメントサービスの設定がまだ完了していません。それまでは GitHub またはメールでご連絡ください。',
  commentsDisabled: 'このページのコメントは受け付けていません。',
  commentsOpenGitHub: 'GitHub でディスカッションを開く',
  commentsFindGitHub: 'GitHub でこのページの議論を探す',
  commentsThirdParty:
    'この欄に近づくと giscus.app と GitHub に自動接続し、コメントと入力欄を表示します。閲覧にログインは不要で、投稿には GitHub アカウントを使用します。コメントは公開され、ログイン後はブラウザーに giscus のセッションが保存される場合があります。',
  commentsLoading: 'コメントサービスに接続しています…',
  commentsFailed: 'コメントを読み込めませんでした',
  commentsSlow:
    'コメントの読み込みに時間がかかっています。接続は継続中です。そのまま待つか、再試行するか、GitHub で閲覧できます。',
  commentsFailedAuthentication:
    'コメントのログイン状態を復元できませんでした。閲覧にログインは不要です。自動で再接続する場合がありますが、再試行もできます。',
  commentsFailedRateLimit:
    'コメントサービスのリクエスト上限に達しています。しばらくしてから再試行するか、GitHub で閲覧してください。',
  commentsFailedBlocked:
    'コメントサービスに接続できませんでした。再試行するか、GitHub で閲覧してください。',
  commentsFailedMissing: 'このページのディスカッションが見つかりません。',
  commentsLocked:
    'このディスカッションはロックされています。既存のコメントは読めます。',
  commentsEmpty: 'まだコメントはありません。',
  commentsCount: (count: number) => `${count} 件のコメント`,
  commentsNative: '議論は GitHub で行い、各言語版で同じスレッドを共有します。',

  notFoundTitle: 'このパスにページはありません。',
  notFoundText:
    'アドレスが変わった可能性があります。ブログを見るか、ホームに戻ってください。',
  returnHome: 'ホームへ戻る',
  legacyStatus: 'コンテンツの状態',
  legacyMissingTitle: '元の記事を取得できません。',
  legacyMissingText:
    '旧ブログのリポジトリは削除されました。本文を復元できていないため、再作成したり移行済みと表示したりしていません。',
};

export const dictionaries: Record<Locale, Dictionary> = {
  'zh-hant': zh,
  en,
  ja,
};
export type { Dictionary };
