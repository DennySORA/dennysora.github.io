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

const en = {
  skip: 'Skip to content',
  brandHome: 'DennySORA home',
  mainNav: 'Main navigation',
  navLibrary: 'Writing & research',
  navProjects: 'Projects',
  navAbout: 'About',
  navPapers: 'Paper Daily',
  searchArticles: 'Search articles',
  language: 'Language',
  openMenu: 'Open navigation',
  closeMenu: 'Close navigation',
  menuTitle: 'Navigation',
  footerTagline: 'Engineering, research and the ongoing work of understanding.',
  footerLinks: 'Site links',
  github: 'GitHub',
  email: 'Email',
  rss: 'RSS',
  privacy: 'Privacy',
  newTab: 'external site',
  unavailableTranslation: 'not available in this language yet',
  siteTagline: 'Engineering · Writing · Research',

  homeEyebrow: 'DennySORA · 李汶道',
  homeTitle: 'Building and writing about backend, cloud and AI systems',
  homeIntro:
    'I’m DennySORA, an engineer working across AI systems, backend and cloud infrastructure. This is where I document the things I build, the questions I explore, and what I learn along the way.',
  readLibrary: 'Read writing & research',
  viewProjects: 'View projects',
  featuredTitle: 'Featured',
  latestTitle: 'Latest writing',
  allArticles: 'All articles',
  selectedWork: 'Selected work',
  allProjects: 'All projects',
  aboutShortTitle: 'About DennySORA',
  aboutShortText:
    'I work where backend systems, infrastructure and AI meet. Currently studying Japanese in Tokyo, and continuing to build and explore.',
  readAbout: 'Read the full introduction',
  papersQuietText:
    'Automatically curated paper guides live on their own site, apart from my writing.',
  papersQuietLink: 'About Paper Daily',

  aboutEyebrow: 'About',
  aboutOverview: 'Overview',
  viewMyProjects: 'View my projects',
  getInTouch: 'Get in touch',
  competenciesTitle: 'What I work on',
  competenciesIntro:
    'Professional practice, personal projects and what I am still learning are kept apart, so each ability has context and something you can check.',
  levelProduction: 'Professional practice',
  levelPractice: 'Personal projects',
  levelLearning: 'Learning',
  examples: 'Examples',
  tools: 'Tools',
  seeExperience: 'See related experience',
  readPost: 'Read',
  projectSource: 'Source',
  worksTitle: 'Get to know my work',
  aboutProject: 'About this project',
  experienceTitle: 'Along the way',
  experienceIntro:
    'Roles and main work first; details for anyone who wants to go deeper. Based on the résumé already published on this site.',
  present: 'Present',
  educationStatus: 'Education · current status',
  showAllWork: (count: number) => `Show all ${count} work items`,
  exploringTitle: 'Questions I am still exploring',
  exploringUpdated: (date: string) => `Based on public notes as of ${date}`,
  readResearch: 'Read the research notes',
  seePapers: 'About Paper Daily',
  beyondTitle: 'Beyond engineering',
  educationTitle: 'Education',
  recordTitle: 'Full record',
  recordIntro:
    'The complete skill list, technical depth and other public work from the previous profile, kept for anyone who wants every detail.',
  recordSkills: 'Skills',
  recordDepth: 'Technical depth',
  recordOpenSource: 'Open-source repositories',
  recordCommunity: 'Community',
  recordWriting: 'Other writing',
  contactTitle: 'Start with a concrete question.',
  contactText:
    'Technical discussion, open-source tools, or a different view on something I wrote.',
  copyEmail: 'Copy email address',
  emailCopied: 'Email address copied',
  copyEmailFailed: 'Copy failed — select the address instead.',

  projectsEyebrow: 'From idea to implementation',
  projectsTitle: 'Projects',
  projectsIntro:
    'More than a list of repository names: what each tool is for, its scope, and where the source lives.',
  categoryOpenSource: 'Open-source tool',
  categoryWork: 'Work system',
  categoryExperiment: 'Experiment',
  sourceOnGitHub: 'Source on GitHub',
  readCaseStudy: 'Read the case study',
  tryDemo: 'Try the demo',
  relatedWriting: 'Related writing',
  projectsNote:
    'Full case studies are still being written. Until one is published, each project links straight to its repository.',
  projectOverviewNote:
    'A full case study for this project has not been published yet. The repository is the authoritative source.',
  projectRole: 'Role',
  projectRepository: 'Repository',
  projectTechnologies: 'Technologies',
  backToProjects: 'Back to projects',

  libraryEyebrow: 'Writing & thinking',
  libraryTitle: 'Writing & research',
  libraryIntro:
    'Notes on engineering practice, model research and the reasoning behind each trade-off. You don’t need to decide whether it is a blog post or research first — start from the question you care about.',
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
  papersNoteTitle: 'Looking for automatically curated paper guides?',
  papersNoteText:
    'Paper Daily has its own entry and is kept separate from the articles I write.',
  goToPapers: 'Go to Paper Daily',
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
  backToLibrary: 'Back to writing & research',

  published: 'Published',
  updated: 'Updated',
  readingTime: (minutes: number) => `About ${minutes} min read`,
  translationOriginal: 'Original',
  translationInherited: 'Existing published translation',
  toc: 'On this page',
  tags: 'Tags',
  provenanceTitle: 'About this note',
  adapted:
    'Adapted from the existing technical profile on 20 September 2026. This is not a recovered article from the former blog; the original profile remains available in Git history.',
  viewSource: 'View source',
  authorNote: 'Writing about the thinking behind backend, cloud and AI work.',
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
    'Questions, additions or a different view on this article are welcome. Comments are public, and posting requires a GitHub account.',
  commentsUnconfigured: 'Comments for this article are not open yet.',
  commentsUnconfiguredText:
    'The discussion service has not been set up. You can reach me on GitHub or by email in the meantime.',
  commentsDisabled: 'Comments are closed for this article.',
  commentsLoad: 'Load comments',
  commentsOpenGitHub: 'Open the discussion on GitHub',
  commentsThirdParty:
    'Loading contacts giscus.app; the comments themselves are stored in GitHub Discussions. Nothing is loaded until you choose to.',
  commentsLoading: 'Connecting to the comment service…',
  commentsFailed: 'Comments could not be loaded',
  commentsFailedTimeout: 'The comment service did not respond in time.',
  commentsFailedBlocked:
    'The comment service was blocked or could not be reached.',
  commentsFailedMissing: 'The discussion for this article could not be found.',
  commentsLocked: 'This discussion is locked; existing comments stay readable.',
  commentsEmpty: 'No comments yet.',
  commentsCount: (count: number) =>
    count === 1 ? '1 comment' : `${count} comments`,
  commentsNative:
    'Discussion happens on GitHub, and every language version shares the same thread.',
  privacyLink: 'Privacy note',

  papersEyebrow: 'A separate research-reading tool',
  papersTitle: 'Paper Daily',
  papersLead:
    'It gathers leads to help you start reading. Deep understanding stays with the original paper and your own judgement.',
  papersText:
    'This is the entry point to an automated paper curation and reading-guide system. The main site keeps the engineering articles and research notes I write myself; the two have different sources and roles.',
  openPapers: 'Open Paper Daily',
  readMyResearch: 'Read my research notes',
  papersFine:
    'Goes to paper.dennysora.me. The reading guides are written in Traditional Chinese.',
  twoKindsTitle: 'Two kinds of content, two ways of reading',
  digestHeading: 'Paper Daily: curation and guides',
  digestText:
    'Browse paper data and generated guides in the separate system, then return to the original paper to check methods, assumptions and conclusions.',
  mainHeading: 'Main site: my own research and implementation',
  mainText:
    'My questions, experiments, implementation experience and technical trade-offs all live in Writing & research.',
  sourcesTitle: 'Sources should be clear',
  generatedHeading: 'Generated does not mean reviewed',
  generatedText:
    'Automatically generated content cannot be treated as conclusions the author has verified. Generation, human review and the original source are labelled separately.',
  snapshotHeading: 'The entry does not depend on a live snapshot',
  snapshotText:
    'This page works without a new snapshot. It does not claim live updates or show paper counts it has not retrieved.',
  snapshotTitle: 'A fixed snapshot',
  snapshotDate: (date: string) => `Snapshot from ${date}`,
  snapshotNotLive: 'This is a fixed snapshot, not a live feed.',
  generatedLabel: 'Automatically generated · not individually reviewed',
  originalPaper: 'Original paper',
  readGuide: 'Reading guide (Traditional Chinese)',
  snapshotSource: 'Snapshot source',
  researchBannerTitle: 'Curious what I am researching?',
  researchBannerText:
    'Start with the research and experiment notes on training a trilingual model.',

  researchBridgeEyebrow: 'This page has moved',
  researchBridgeTitle: 'Research notes are now part of Writing & research.',
  researchBridgeText:
    'Automatically generated paper guides have their own entry. Choose where you want to go.',
  researchBridgeNotes: 'Read research notes',
  researchBridgePapers: 'Go to Paper Daily',

  privacyTitle: 'Privacy & comments',
  privacyIntro:
    'A small, static corner of the web. No site accounts, advertising, or analytics.',
  privacyStatic:
    'Pages are served as static files by GitHub Pages. This site adds no analytics, advertising, cookies or browser storage. The hosting provider may process request metadata under its own privacy policy.',
  privacySearch:
    'Article search runs in your browser using an index served by this site; your query is not sent anywhere else.',
  privacyLinks:
    'External links, such as GitHub or Paper Daily, connect to those services only when you follow them.',
  privacyCommentsUnconfigured:
    'Article comments are not enabled yet, so no comment service is contacted.',
  privacyCommentsNative:
    'Comments use native GitHub Discussions on github.com. GitHub handles sign-in, public posts and moderation.',
  privacyCommentsGiscus:
    'Comments load only after you choose “Load comments”. The widget is provided by giscus.app and the comments are stored in GitHub Discussions. If you sign in through giscus, it keeps its own session in your browser.',
  privacyPublic:
    'Comments are public. Do not post credentials or private information.',
  githubPrivacy: 'GitHub Privacy Statement',

  notFoundTitle: 'This path doesn’t lead to a page.',
  notFoundText:
    'The address may have changed. Browse writing & research, or return to the home page.',
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
  navLibrary: '文章與研究',
  navProjects: '專案',
  navAbout: '關於我',
  navPapers: '論文日報',
  searchArticles: '搜尋文章',
  language: '語言',
  openMenu: '開啟導覽',
  closeMenu: '關閉導覽',
  menuTitle: '導覽',
  footerTagline: '工程、研究，以及持續理解的過程。',
  footerLinks: '網站連結',
  github: 'GitHub',
  email: 'Email',
  rss: 'RSS',
  privacy: '隱私說明',
  newTab: '外部網站',
  unavailableTranslation: '尚無此語言版本',
  siteTagline: '工程 · 寫作 · 研究',

  homeEyebrow: 'DennySORA · 李汶道',
  homeTitle: '後端、雲端與 AI 系統的實作與思考',
  homeIntro:
    '我是 DennySORA，專注於 AI 系統、後端與雲端基礎設施。在這裡，記錄實作的過程、值得探索的問題，以及一路上的思考。',
  readLibrary: '閱讀文章與研究',
  viewProjects: '查看專案',
  featuredTitle: '精選文章',
  latestTitle: '最新文章',
  allArticles: '全部文章',
  selectedWork: '代表作品',
  allProjects: '全部專案',
  aboutShortTitle: '關於 DennySORA',
  aboutShortText:
    '我的工作橫跨後端系統、基礎設施與 AI。目前在東京學習日語，持續實作、探索，也持續學習。',
  readAbout: '閱讀完整自介',
  papersQuietText: '自動整理的論文導讀有獨立入口，不和我的文章混在一起。',
  papersQuietLink: '了解論文日報',

  aboutEyebrow: '關於我',
  aboutOverview: '個人概覽',
  viewMyProjects: '看看我的專案',
  getInTouch: '與我聯絡',
  competenciesTitle: '我主要在做什麼',
  competenciesIntro:
    '把工作實務、個人實作與正在學習的方向分開，讓能力有脈絡，也有可查看的例子。',
  levelProduction: '工作實務',
  levelPractice: '個人實作',
  levelLearning: '學習探索',
  examples: '代表工作',
  tools: '工具',
  seeExperience: '查看相關經歷',
  readPost: '閱讀',
  projectSource: '原始碼',
  worksTitle: '用作品認識我',
  aboutProject: '了解專案',
  experienceTitle: '一路走來',
  experienceIntro:
    '先看角色與主要工作，細節留給想深入了解的人。以下依本站既有的公開履歷整理。',
  present: '至今',
  educationStatus: '教育・目前狀態',
  showAllWork: (count: number) => `展開全部工作內容（${count} 項）`,
  exploringTitle: '還在探索的問題',
  exploringUpdated: (date: string) => `依 ${date} 的公開筆記整理`,
  readResearch: '閱讀研究紀錄',
  seePapers: '了解論文日報',
  beyondTitle: '工程之外',
  educationTitle: '學歷',
  recordTitle: '完整紀錄',
  recordIntro:
    '原個人頁的完整技能清單、技術深度與其他公開作品，留給想看全部細節的人。',
  recordSkills: '技能清單',
  recordDepth: '技術深度',
  recordOpenSource: '開源 repository',
  recordCommunity: '社群',
  recordWriting: '其他寫作',
  contactTitle: '從一個具體的問題開始交流。',
  contactText: '技術討論、開源工具，或對文章的不同觀點。',
  copyEmail: '複製信箱',
  emailCopied: '已複製信箱',
  copyEmailFailed: '無法複製，請直接選取信箱。',

  projectsEyebrow: '從想法到實作',
  projectsTitle: '專案',
  projectsIntro:
    '不只是一列 repository 名稱。從用途、實作範圍與原始碼，了解這些工具和系統。',
  categoryOpenSource: '開源工具',
  categoryWork: '工作中的系統實作',
  categoryExperiment: '個人實驗',
  sourceOnGitHub: 'GitHub 原始碼',
  readCaseStudy: '查看案例',
  tryDemo: '使用 Demo',
  relatedWriting: '閱讀相關實作紀錄',
  projectsNote:
    '完整案例仍在整理中；在正式發布之前，每個專案都直接連到它的 repository。',
  projectOverviewNote:
    '這個專案的完整案例尚未發布，請以 repository 的內容為準。',
  projectRole: '角色',
  projectRepository: 'Repository',
  projectTechnologies: '技術',
  backToProjects: '返回專案',

  libraryEyebrow: '寫作與思考',
  libraryTitle: '文章與研究',
  libraryIntro:
    '記錄工程實作、模型研究，以及每一次取捨背後的思考。不必先決定這是部落格還是研究，從你想了解的問題開始。',
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
  emptyTitle: '沒有符合這些條件的文章',
  emptyText: '試著移除一個條件，或改用更簡單的關鍵字。',
  queryCondition: (query: string) => `「${query}」`,
  partialNotice: '全文搜尋暫時無法使用，目前只搜尋標題與摘要。',
  retry: '重試',
  noJsSearch: '全文搜尋需要 JavaScript。你仍可以依主題或標籤瀏覽全部文章。',
  browseByTopic: '依主題瀏覽',
  allTags: '全部標籤',
  papersNoteTitle: '想看自動整理的論文導讀？',
  papersNoteText: '論文日報另有獨立入口，不和作者的文章混在一起。',
  goToPapers: '前往論文日報',
  matchedSection: '命中章節',
  previousPage: '上一頁',
  nextPage: '下一頁',
  pageStatus: (page: number, total: number) => `第 ${page} 頁，共 ${total} 頁`,
  pagination: '分頁',

  topicEyebrow: '主題',
  tagEyebrow: '標籤',
  tagsTitle: '全部標籤',
  tagsIntro: '具體的技術與概念，只連到真正討論它們的文章。',
  backToLibrary: '返回文章與研究',

  published: '發布',
  updated: '更新',
  readingTime: (minutes: number) => `約 ${minutes} 分鐘`,
  translationOriginal: '原文',
  translationInherited: '沿用既有公開譯文',
  toc: '本文目錄',
  tags: '標籤',
  provenanceTitle: '關於這篇筆記',
  adapted:
    '於 2026 年 9 月 20 日整理自既有技術檔案，並非已刪除舊 blog 的復原文章；原始技術檔案保留於 Git 歷史。',
  viewSource: '查看本文來源',
  authorNote: '記錄後端、雲端與 AI 實作中的思考。',
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
    '對這篇文章有疑問、補充或不同觀點，歡迎一起討論。留言公開顯示，發言需要 GitHub 帳號。',
  commentsUnconfigured: '這篇文章的留言尚未開放。',
  commentsUnconfiguredText:
    '留言服務尚未設定完成。在此之前，歡迎透過 GitHub 或 Email 與我聯絡。',
  commentsDisabled: '這篇文章已關閉留言。',
  commentsLoad: '載入留言',
  commentsOpenGitHub: '在 GitHub 開啟討論',
  commentsThirdParty:
    '載入時會連線到 giscus.app，留言內容存放在 GitHub Discussions；在你選擇之前不會載入任何內容。',
  commentsLoading: '正在連線到留言服務…',
  commentsFailed: '留言載入失敗',
  commentsFailedTimeout: '留言服務沒有在時限內回應。',
  commentsFailedBlocked: '留言服務被封鎖或無法連線。',
  commentsFailedMissing: '找不到這篇文章對應的討論串。',
  commentsLocked: '這個討論已鎖定，既有留言仍可閱讀。',
  commentsEmpty: '目前還沒有留言。',
  commentsCount: (count: number) => `${count} 則留言`,
  commentsNative: '討論在 GitHub 進行，三種語言版本共用同一則討論串。',
  privacyLink: '隱私說明',

  papersEyebrow: '獨立的研究閱讀工具',
  papersTitle: '論文日報',
  papersLead: '整理線索，幫助開始閱讀。把深入理解，留給原論文與你的判斷。',
  papersText:
    '這是論文整理與自動導讀系統的獨立入口。主站則保留我親自撰寫的工程文章與研究筆記，兩者有不同的來源與角色。',
  openPapers: '開啟論文日報',
  readMyResearch: '閱讀我的研究筆記',
  papersFine: '前往 paper.dennysora.me。導讀內容以繁體中文撰寫。',
  twoKindsTitle: '兩種內容，兩種閱讀方式',
  digestHeading: '論文日報：整理與導讀',
  digestText:
    '透過獨立系統查看論文資料與生成導讀，再回到原論文核對方法、假設與結論。',
  mainHeading: '主站文章：作者的研究與實作',
  mainText: '我的問題、實驗、實作經驗與技術取捨，統一放在文章與研究中。',
  sourcesTitle: '來源要清楚',
  generatedHeading: '生成，不等於已審閱',
  generatedText:
    '自動生成的內容不能直接當作作者已驗證的結論。生成狀態、人工審閱與原論文來源分別標示。',
  snapshotHeading: '入口不依賴即時快照',
  snapshotText:
    '即使沒有新快照，這個入口仍然可用。本頁不宣稱即時更新，也不顯示未取得的論文數量。',
  snapshotTitle: '固定快照',
  snapshotDate: (date: string) => `快照日期 ${date}`,
  snapshotNotLive: '這是固定快照，並非即時資訊。',
  generatedLabel: '自動生成・未逐篇人工審閱',
  originalPaper: '原始論文',
  readGuide: '閱讀導讀（繁體中文）',
  snapshotSource: '快照來源',
  researchBannerTitle: '想了解我正在研究什麼？',
  researchBannerText: '從三語模型的研究與實驗紀錄開始。',

  researchBridgeEyebrow: '頁面已整合',
  researchBridgeTitle: '研究筆記已整合至「文章與研究」。',
  researchBridgeText: '自動論文導讀則有獨立入口。請選擇你要前往的地方。',
  researchBridgeNotes: '閱讀研究筆記',
  researchBridgePapers: '前往論文日報',

  privacyTitle: '隱私與留言說明',
  privacyIntro: '一個簡單的靜態網站。沒有站內帳號、廣告或分析追蹤。',
  privacyStatic:
    '本站由 GitHub Pages 提供靜態檔案，不加入分析追蹤、廣告、Cookie 或瀏覽器儲存。託管服務可能依其隱私政策處理請求資訊。',
  privacySearch:
    '文章搜尋在你的瀏覽器中進行，使用本站提供的索引；查詢內容不會傳送到其他地方。',
  privacyLinks:
    'GitHub、論文日報等外部連結，只有在你開啟時才會連線到對應服務。',
  privacyCommentsUnconfigured: '文章留言尚未啟用，因此不會連線到任何留言服務。',
  privacyCommentsNative:
    '留言使用 github.com 上的原生 GitHub Discussions；登入、公開發文與管理由 GitHub 處理。',
  privacyCommentsGiscus:
    '只有在你按下「載入留言」後才會載入留言。留言元件由 giscus.app 提供，內容存放在 GitHub Discussions；若透過 giscus 登入，它會在你的瀏覽器保存自己的工作階段。',
  privacyPublic: '留言會公開顯示，請勿貼上憑證或私人資訊。',
  githubPrivacy: 'GitHub 隱私聲明',

  notFoundTitle: '這條路徑沒有對應的頁面。',
  notFoundText: '網址可能已變更。你可以瀏覽文章與研究，或回到首頁。',
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
  navLibrary: '記事と研究',
  navProjects: 'プロジェクト',
  navAbout: '自己紹介',
  navPapers: '論文デイリー',
  searchArticles: '記事を検索',
  language: '言語',
  openMenu: 'ナビゲーションを開く',
  closeMenu: 'ナビゲーションを閉じる',
  menuTitle: 'ナビゲーション',
  footerTagline: 'エンジニアリング、研究、そして理解し続ける過程。',
  footerLinks: 'サイトのリンク',
  github: 'GitHub',
  email: 'メール',
  rss: 'RSS',
  privacy: 'プライバシー',
  newTab: '外部サイト',
  unavailableTranslation: 'この言語の版はまだありません',
  siteTagline: 'エンジニアリング · 執筆 · 研究',

  homeEyebrow: 'DennySORA · 李汶道',
  homeTitle: 'バックエンド、クラウド、AI システムの実装と考察',
  homeIntro:
    'DennySORA です。AI システム、バックエンド、クラウド基盤に取り組むエンジニアです。つくったもの、探究したい問い、その過程での学びをここに記録しています。',
  readLibrary: '記事と研究を読む',
  viewProjects: 'プロジェクトを見る',
  featuredTitle: 'ピックアップ',
  latestTitle: '最新の記事',
  allArticles: 'すべての記事',
  selectedWork: '代表的な制作物',
  allProjects: 'すべてのプロジェクト',
  aboutShortTitle: 'DennySORA について',
  aboutShortText:
    'バックエンド、インフラ、AI の交わる領域で活動しています。現在は東京で日本語を学びながら、開発と探究を続けています。',
  readAbout: '自己紹介を読む',
  papersQuietText:
    '自動でまとめた論文ガイドは、私の記事とは分けて専用の入口にあります。',
  papersQuietLink: '論文デイリーについて',

  aboutEyebrow: '自己紹介',
  aboutOverview: '概要',
  viewMyProjects: 'プロジェクトを見る',
  getInTouch: '連絡する',
  competenciesTitle: '主に取り組んでいること',
  competenciesIntro:
    '業務での実践、個人での実装、学習中のことを分けて示し、それぞれの能力に背景と確認できる例を添えています。',
  levelProduction: '業務での実践',
  levelPractice: '個人での実装',
  levelLearning: '学習・探究',
  examples: '主な取り組み',
  tools: 'ツール',
  seeExperience: '関連する経歴を見る',
  readPost: '読む',
  projectSource: 'ソースコード',
  worksTitle: '制作物から知る',
  aboutProject: 'プロジェクトについて',
  experienceTitle: 'これまでの歩み',
  experienceIntro:
    'まず役割と主な仕事を、詳細は深く知りたい方のために。このサイトで公開済みの経歴をもとに整理しています。',
  present: '現在',
  educationStatus: '教育・現在の状況',
  showAllWork: (count: number) => `すべての業務内容を表示（${count} 件）`,
  exploringTitle: 'まだ探究している問い',
  exploringUpdated: (date: string) => `${date} 時点の公開ノートをもとに整理`,
  readResearch: '研究記録を読む',
  seePapers: '論文デイリーについて',
  beyondTitle: 'エンジニアリングの外側',
  educationTitle: '学歴',
  recordTitle: '詳細な記録',
  recordIntro:
    '以前のプロフィールにあったスキル一覧、技術的深さ、その他の公開作品。すべての詳細を見たい方のために残しています。',
  recordSkills: 'スキル一覧',
  recordDepth: '技術的深さ',
  recordOpenSource: 'オープンソースリポジトリ',
  recordCommunity: 'コミュニティ',
  recordWriting: 'その他の執筆',
  contactTitle: '具体的な問いから話しましょう。',
  contactText: '技術的な議論、オープンソースツール、記事への異なる視点など。',
  copyEmail: 'メールアドレスをコピー',
  emailCopied: 'メールアドレスをコピーしました',
  copyEmailFailed: 'コピーできませんでした。アドレスを選択してください。',

  projectsEyebrow: 'アイデアから実装へ',
  projectsTitle: 'プロジェクト',
  projectsIntro:
    'リポジトリ名の一覧ではなく、用途、実装範囲、ソースコードから各ツールとシステムを紹介します。',
  categoryOpenSource: 'オープンソースツール',
  categoryWork: '業務でのシステム実装',
  categoryExperiment: '個人の実験',
  sourceOnGitHub: 'GitHub のソースコード',
  readCaseStudy: '事例を読む',
  tryDemo: 'デモを使う',
  relatedWriting: '関連する実装記録を読む',
  projectsNote:
    '詳しい事例は準備中です。公開されるまでは、各プロジェクトからリポジトリへ直接リンクしています。',
  projectOverviewNote:
    'このプロジェクトの詳しい事例はまだ公開していません。内容はリポジトリを正とします。',
  projectRole: '役割',
  projectRepository: 'リポジトリ',
  projectTechnologies: '技術',
  backToProjects: 'プロジェクト一覧へ',

  libraryEyebrow: '執筆と思考',
  libraryTitle: '記事と研究',
  libraryIntro:
    'エンジニアリングの実践、モデルの研究、そして各トレードオフの背景にある考えを記録しています。ブログか研究かを先に決める必要はありません。知りたい問いから始めてください。',
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
  papersNoteTitle: '自動でまとめた論文ガイドをお探しですか？',
  papersNoteText:
    '論文デイリーには専用の入口があり、私が書いた記事とは分けています。',
  goToPapers: '論文デイリーへ',
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
  backToLibrary: '記事と研究へ戻る',

  published: '公開',
  updated: '更新',
  readingTime: (minutes: number) => `約 ${minutes} 分`,
  translationOriginal: '原文',
  translationInherited: '既存の公開訳を継承',
  toc: 'この記事の目次',
  tags: 'タグ',
  provenanceTitle: 'このノートについて',
  adapted:
    '2026 年 9 月 20 日に既存の技術プロフィールから再構成しました。削除された旧ブログの復元記事ではありません。原資料は Git 履歴に残っています。',
  viewSource: '出典を見る',
  authorNote: 'バックエンド、クラウド、AI の実装で考えたことを記録しています。',
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
    'この記事への質問、補足、異なる視点を歓迎します。コメントは公開され、投稿には GitHub アカウントが必要です。',
  commentsUnconfigured: 'この記事のコメントはまだ公開していません。',
  commentsUnconfiguredText:
    'コメントサービスの設定がまだ完了していません。それまでは GitHub またはメールでご連絡ください。',
  commentsDisabled: 'この記事のコメントは受け付けていません。',
  commentsLoad: 'コメントを読み込む',
  commentsOpenGitHub: 'GitHub でディスカッションを開く',
  commentsThirdParty:
    '読み込むと giscus.app に接続し、コメントは GitHub Discussions に保存されます。選択するまで何も読み込みません。',
  commentsLoading: 'コメントサービスに接続しています…',
  commentsFailed: 'コメントを読み込めませんでした',
  commentsFailedTimeout: 'コメントサービスが時間内に応答しませんでした。',
  commentsFailedBlocked:
    'コメントサービスがブロックされたか、接続できませんでした。',
  commentsFailedMissing: 'この記事のディスカッションが見つかりません。',
  commentsLocked:
    'このディスカッションはロックされています。既存のコメントは読めます。',
  commentsEmpty: 'まだコメントはありません。',
  commentsCount: (count: number) => `${count} 件のコメント`,
  commentsNative: '議論は GitHub で行い、各言語版で同じスレッドを共有します。',
  privacyLink: 'プライバシーについて',

  papersEyebrow: '独立した論文リーディングツール',
  papersTitle: '論文デイリー',
  papersLead:
    '読み始めるための手がかりをまとめます。深い理解は、原論文とあなた自身の判断に委ねます。',
  papersText:
    '論文の整理と自動ガイドのシステムへの入口です。メインサイトには私が書いたエンジニアリング記事と研究ノートを置いており、両者は出典も役割も異なります。',
  openPapers: '論文デイリーを開く',
  readMyResearch: '私の研究ノートを読む',
  papersFine:
    'paper.dennysora.me へ移動します。ガイドは繁体字中国語で書かれています。',
  twoKindsTitle: '二種類のコンテンツ、二つの読み方',
  digestHeading: '論文デイリー：整理とガイド',
  digestText:
    '独立したシステムで論文データと生成されたガイドを確認し、原論文に戻って手法、前提、結論を確かめてください。',
  mainHeading: 'メインサイト：著者自身の研究と実装',
  mainText:
    '私の問い、実験、実装の経験、技術的なトレードオフは「記事と研究」にまとめています。',
  sourcesTitle: '出典を明確に',
  generatedHeading: '生成されたものは、確認済みではない',
  generatedText:
    '自動生成された内容を、著者が検証した結論として扱うことはできません。生成の状態、人による確認、原論文の出典をそれぞれ明示します。',
  snapshotHeading: '入口はライブのスナップショットに依存しない',
  snapshotText:
    '新しいスナップショットがなくても、このページは機能します。リアルタイム更新をうたったり、取得していない論文数を表示したりはしません。',
  snapshotTitle: '固定スナップショット',
  snapshotDate: (date: string) => `${date} のスナップショット`,
  snapshotNotLive: '固定されたスナップショットです。ライブ情報ではありません。',
  generatedLabel: '自動生成・個別の人手による確認なし',
  originalPaper: '原論文',
  readGuide: 'ガイドを読む（繁体字中国語）',
  snapshotSource: 'スナップショットの出典',
  researchBannerTitle: '私がいま何を研究しているか知りたい方へ',
  researchBannerText: '三言語モデルの研究と実験の記録から読んでみてください。',

  researchBridgeEyebrow: 'このページは統合されました',
  researchBridgeTitle: '研究ノートは「記事と研究」に統合されました。',
  researchBridgeText:
    '自動生成の論文ガイドには専用の入口があります。行き先を選んでください。',
  researchBridgeNotes: '研究ノートを読む',
  researchBridgePapers: '論文デイリーへ',

  privacyTitle: 'プライバシーとコメント',
  privacyIntro:
    '小さな静的サイトです。サイト内のアカウント、広告、アクセス解析はありません。',
  privacyStatic:
    'このサイトは GitHub Pages から静的ファイルとして配信されます。アクセス解析、広告、Cookie、ブラウザーストレージは追加していません。ホスティング事業者は独自のプライバシーポリシーに従いリクエスト情報を処理する場合があります。',
  privacySearch:
    '記事検索は、このサイトが配信するインデックスを使ってブラウザー内で行われます。検索語が他の場所へ送信されることはありません。',
  privacyLinks:
    'GitHub や論文デイリーなどの外部リンクは、開いたときにのみ各サービスへ接続します。',
  privacyCommentsUnconfigured:
    '記事のコメントはまだ有効になっていないため、コメントサービスへは接続しません。',
  privacyCommentsNative:
    'コメントは github.com のネイティブな GitHub Discussions を使います。ログイン、公開投稿、管理は GitHub が行います。',
  privacyCommentsGiscus:
    '「コメントを読み込む」を選んだときにのみコメントを読み込みます。ウィジェットは giscus.app が提供し、コメントは GitHub Discussions に保存されます。giscus でログインすると、giscus は独自のセッションをブラウザーに保存します。',
  privacyPublic:
    'コメントは公開されます。認証情報や個人情報は投稿しないでください。',
  githubPrivacy: 'GitHub プライバシーステートメント',

  notFoundTitle: 'このパスにページはありません。',
  notFoundText:
    'アドレスが変わった可能性があります。記事と研究を見るか、ホームに戻ってください。',
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
