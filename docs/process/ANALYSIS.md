> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 架構、設計與遷移分析

版本：規劃草案 1.0｜檢視日期：2026-09-20｜目標：DennySORA 三語個人品牌與技術出版主站。

本文件是來源檢視後的實作建議，不是已部署產品。未修改遠端儲存庫、移轉所有權、改動 DNS、執行 Nano 排程或完成瀏覽器驗收。已讀取 GitHub 原始碼；兩個舊站的正式網域未在本次環境完成頁面檢查，不能由存取失敗推論網站故障。

## 1. 決策摘要

| 決策 | 建議 | 原因與邊界 |
|---|---|---|
| 個人主站 | 保留 DennySORA/dennysora.github.io 與既有 dennysora.me | 改產品結構，不刪除 Git 歷史；CNAME 是來源事實，不是 DNS 健康證據。 |
| 前端 | React、TypeScript、Vite、Tailwind CSS、pnpm | 對齊已讀 Ops-Tools skill；不使用 Next.js，不新增常駐 Node API。 |
| 頁面輸出 | React Router 官方 Framework Mode 的靜態預渲染；ssr:false，加完整 routes manifest | 需要一份明確的 public-content SSG 選型／recipe，不能把一般 SPA 範本當成文章網站完成品。 |
| 內容 | Git 管理的 Markdown、型別與 schema、語言版本關聯 | 作者內容與 UI 原始碼分離，不再把全文硬編碼在 TS 陣列。 |
| 留言 | 原生 GitHub Discussions 為預設；giscus 是另行接受第三方信任後的選項 | 資料在 GitHub，不代表 giscus 的服務也只在 GitHub。 |
| 舊 blog | 只轉換文章本文與必要 metadata | 不移植 Vue、星空背景、其他分類頁或舊 Agent 規則。 |
| 論文系統 | daily-paper-report 獨立移轉；先保留 Nano/Python/資料契約與既有網址 | 先搬所有權，再決定域名與 reader 改版，避免一次改三個故障面。 |
| 論文整合 | 主站 research 入口、經驗證的靜態 metadata 快照、精選連結 | 不讓自動日報淹沒人工編輯的 blog，也不使訪客載入依賴研究服務可用性。 |

此處「GitHub 為中心」涵蓋主站儲存、靜態發布、版本審查與留言。既有論文的計算仍由 Nano 處理；不將這件事偷偷改寫成「全部運算已在 GitHub」。

## 2. 來源盤點與可信度

### 2.1 個人站

已讀主站完整目錄、CNAME 與 index.html 代表段落。現有檔案包含 index.html、style.css、lang.js、site.js 與 detail 下的 about、depth、production、research 頁。目錄未顯示 React package manifest。首頁以 data-en/data-zh/data-ja 承載可見文字，初始 HTML 語言與部分 SEO metadata 固定英文。

保留可核對的經歷、專案、研究方向與聯絡資料；將履歷描述與網站實作技術分開。網站改成 React，不代表過往職歷變成 React 工作經驗。不要把現有靜態 online 標籤升級成不實的即時狀態。

來源：[主站](https://github.com/DennySORA/dennysora.github.io)、[CNAME](https://github.com/DennySORA/dennysora.github.io/blob/main/CNAME)、[首頁](https://github.com/DennySORA/dennysora.github.io/blob/main/index.html)。

### 2.2 Ops-Tools

已讀 resources/skills 下的 project-init、spec-process、react-frontend、frontend-product-design，及 architecture、color-system、document-contract 參考文件。這證明 repository 內有這些指引，不證明使用者本機安裝版本相同，也不證明 Codex／Claude 會自動載入。

project-init 的文件描述使用已審查 DennySORA-Agent-Prompt 3.0.0 內附快照，需核對 manifest；初始化 skill 與 spec-process 均要求明示叫用。不能在既有專案根目錄不經盤點直接重跑 scaffolder。來源中的 managed policy 不得手改以掩蓋不一致。

Ops-Tools 目前是私人儲存庫。它是開發流程來源，不是主站執行時依賴；本規劃不把私人 skill 原文、整個私有 repo 或任何環境資訊複製至公開網站。公開 repo 的政策文件發布範圍另做審查。

來源：[skills 目錄](https://github.com/DennySORA/Ops-Tools/tree/main/resources/skills)。

### 2.3 舊 blog

personal-website 使用 Vue/Vite/pnpm；來源文章在 src/data/blog-posts.ts，並非 Markdown 資料夾。已確認五筆文章資料：

| 原 slug | 主題 | 原日期 |
|---|---|---|
| tech-leadership-value-driven-discussion | 技術領導與價值驅動討論 | 2025-12-15 |
| pact-framework-technical-discussion | PAC-T 討論框架 | 2025-12-10 |
| llm-context-window-three-tiers | LLM Context Window 分級 | 2025-12-18 |
| sae-sparse-autoencoder-llm-interpretability | SAE 與 LLM 可解釋性 | 2025-12-20 |
| community-values-respect-technology | 社群價值宣言 | 2025-12-12 |

文章含 paragraph、heading、quote、callout、list 等結構，metadata 包含 excerpt、category、tags、createdAt、readingTime、featured、authorName。原 authorName 是「空羽ノ境」，保留原署名與來源；若要統一為 DennySORA，以作者別名關聯或經審查的編輯更正處理，不直接改寫來源事實。

這是目前讀到的原始碼文章數，不是透過正式站爬取驗證後的發布總數。移轉執行前仍須核對最新 ref、路由與已部署版本。

來源：[文章資料](https://github.com/sorahane-kyoukai/personal-website/blob/main/src/data/blog-posts.ts)、[router](https://github.com/sorahane-kyoukai/personal-website/blob/main/src/router/index.ts)。router 定義 /blog 與 /blog/:slug，其他 galgame/anime/health 等頁不在此次內容搬遷範圍。

### 2.4 論文系統

README 描述：Nano 上的 ARM64 環境執行 Python 流程，去重、評分、產生繁中研究導讀，發布靜態 Vue 前端；完整論文抽取文字留在 Nano，不發布至 GitHub。三個分支已由 branch API 確認存在：

| 分支 | 檢視時 SHA | 職責 |
|---|---|---|
| main | de3e6af6921f39ff3fd64244b7905a927859454a | 原始碼 |
| gh-pages | 596117840ee2dd53e80241bc9141650605516ecb | 發布內容 |
| state | 5a1393ca77ee688b84c1cdc42e1e31d2dbaf056f | README 所述 SQLite／JSON 狀態備份 |

gh-pages 有 api、day、reports、archive、sources、status 等輸出；尚未逐份驗證所有報告、資料 schema 或正式網址，不能承諾既有產物全部正確。

publish-pages.sh 的實際預設 REMOTE_URL 指向舊帳號，PAGES_DOMAIN 預設 paper.sorahane-kyoukai.org，且每次發布都重寫 CNAME。因此只改 repository 裡的 CNAME，不會完成遷移，下一次排程可能重新寫回舊值。

現有 README 說明 daily 00:00 UTC、weekly 週一 00:30 UTC、monthly 每月一日 01:00 UTC；保留語意，不因主站位於日本就擅自改為日本午夜。README 不等於已登入 Nano 驗證服務正在執行。

來源：[README](https://github.com/sorahane-kyoukai/daily-paper-report/blob/main/README.md)、[發布腳本](https://github.com/sorahane-kyoukai/daily-paper-report/blob/main/scripts/publish-pages.sh)、[分支](https://github.com/sorahane-kyoukai/daily-paper-report/branches)。

## 3. 產品定位與資訊架構

目標不是複製 VS Code 的所有操作，而是以工程師工作台的秩序，承載可閱讀、可搜尋、可信任的長文與專業自介。

主要旅程分為：首次來訪理解你做什麼；從文章理解你的技術思考；從專案檢視證據；閱讀研究導讀；帶著具體問題到 GitHub 討論。主頁只負責導引，不放完整履歷、全部文章和所有日報。

建議路由，語系代碼固定 zh-hant/en/ja；HTML lang 對應 zh-Hant/en/ja：

```text
/                              語言入口；可提示偏好，但不強制覆寫明示 URL
/zh-hant/                      個人首頁
/zh-hant/about/                自我介紹、經歷、聯絡入口
/zh-hant/projects/             精選專案
/zh-hant/projects/<slug>/      專案案例
/zh-hant/blog/                 人工編輯文章
/zh-hant/blog/<slug>/          文章
/zh-hant/research/             論文系統入口與導讀快照
/zh-hant/privacy/              隱私與留言說明
/en/...、/ja/...               對應版本
```

首頁建議順序：一句定位與簡介 → 三項專業領域 → 二至三個可驗證專案 → 三至五篇精選／最新文章 → 研究系統入口 → 聯絡。職稱、年資、效益數字與得獎資訊只使用可核對來源。

專案頁採問題／限制／設計／取捨／結果／目前狀態／原始碼與相關文章，不以技能百分比或滿屏 badge 表現專業。研究入口明確區分自動生成導讀、人工解讀和原論文，不把每日抓取當成個人研究成果。

## 4. 視覺與互動設計契約

### 4.1 深色工作台，而不是假終端

採石墨背景與低彩度面板，少量藍青色連結與 focus，語義色只出現在分類、提示和真實狀態。建議初始 token（專案提案，不是已通過對比測試）：

```css
:root {
  color-scheme: dark;
  --bg: #14171c;
  --surface: #1b2027;
  --raised: #232a33;
  --text: #e6edf3;
  --text-secondary: #b3bdc9;
  --text-muted: #9ca8b7;
  --link: #89b8ff;
  --focus: #72d6ed;
  --border: #39424e;
}
```

正文使用可讀的系統 sans-serif／CJK 字體，導覽、路徑、code 使用 monospace。不要用等寬字呈現整篇中日文。初版優先系統字體；自託管字體需處理授權、子集、載入大小，禁止第三方字體請求成為首次閱讀必要條件。

桌面採「窄導覽／文章／目錄」：左側是有文字的普通連結，樣式可近似 Explorer；標題上方以路徑 breadcrumb 建立檔案感；正文寬度約 68–76ch，CJK 另以 38–44 個全形字寬測試；右側 ToC 在空間不足時收起。沒有真實分頁狀態就不要做可關閉的假 tab。

Shell 語彙僅作輔助，例如小型 ~/blog 路徑與 code block；不要求輸入 cd/help 才能看文章。不引入 Monaco、xterm.js、粒子、打字機或全站動畫框架；這些不是閱讀任務需要。頁尾可以顯示語言、實際更新日期、預估閱讀時間，不顯示虛假的 CPU、在線或建置成功。

### 4.2 手機與可及性

小螢幕保留一個 document scroll owner，不把桌面三欄縮成三個滾動區。Header 顯示名稱、選單、搜尋、語言；導覽改抽屜，目錄改折疊。Overlay 需處理 focus trap、Escape、關閉後回到觸發點、body scroll restoration 與瀏覽器返回。

設計觸控目標至少 44×44 CSS px；測試 320、360、390、768、1280、1440 寬度、200% zoom，以及橫向。長 URL、code、表格只在自己的容器橫向滾動，不擠爆全頁。長日文標題不得截斷為無法理解的片語；內文與 ToC 不靠 hover 才可操作。

無動畫亦須可完成旅程。尊重 prefers-reduced-motion；頁面切換後有可預期的焦點與捲動策略，不讓效果決定狀態完成。正常、hover、focus、selected、empty、loading、error、retry 均在契約內。

參照 Ops frontend-product-design 的 semantic color contract；最終以實際 DOM、computed color、鍵盤與不同 viewport 驗證，不以 token 算式或建置成功代替。

## 5. React 與靜態預渲染

### 5.1 選型

保留 Vite／React／TS／Tailwind／pnpm。採 React Router 官方 Framework Mode 的預渲染能力，但只發布靜態產物，不部署 request-time SSR、API server 或 RSC。

這是針對 public-content site 的明確選型，不是任意把 Ops skills 換掉：已讀 architecture.md 偏向 Declarative/Data Mode 並要求不要預設 framework scaffolding。實作前補充 SSG recipe／決策紀錄，核對使用者實際載入的 policy；如需變更 shared skill，由該來源的正常審查處理，不在 PROJECT_AGENT.md 偷藏衝突，也不未經授權全面更新私人 Ops repo。

官方 React Router 支援 ssr:false + prerender。只寫 ssr:false 仍可能只是 SPA；prerender:true 不會自動列出所有動態文章 slug。以 schema 通過的 content manifest 產生語系、文章、專案、分類等所有正式路徑，連同 client navigation 所需 .data 檔驗證。

```ts
// 選型示意；不是宣稱已在本 repo 存在或通過建置的程式碼。
import type { Config } from '@react-router/dev/config';
import { listPublishedPaths } from './scripts/content/routes';

export default {
  ssr: false,
  async prerender() {
    return ['/', ...(await listPublishedPaths())];
  },
} satisfies Config;
```

不自寫第二套 routing engine，不採 BrowserRouter + 404.html 全部導回首頁的作法，不把文章改為 #/blog/...。React Router 的輸出範例包含 route/index.html 與 .data；真正選定版本的輸出與 trailing slash 必須以 GitHub Pages-like 靜態 server 測試，不能只測 Vite dev。

vite-react-ssg 是另一候選，但其來源目前建議新 React Router 7 使用官方 SSG，故不為維持既有 mode 字面而優先新增過渡依賴。Astro 是合理的內容站替代，但本案使用者明示轉 React，且有既定 Vite skill；不另外改成 Astro 主架構。Next.js 則被指定 skill 排除。

版本於實作 CP-00 一次性核對官方 stable、engines、peer dependency，記錄 React/ReactDOM、React Router、Vite/plugin、Tailwind/plugin、TS、pnpm、Node LTS 與 lockfile。規劃不猜造「最新版本」或 lock digest。

來源：[React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering)、[vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg)、[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

### 5.2 結構與單一權責

```text
repo/
├── AGENTS.md / CLAUDE.md / PROJECT_AGENT.md
├── POLICY_VERSION / POLICY_MANIFEST.sha256
├── docs/agent/                 受管政策；公開範圍先審查
├── docs/process/               本套九份計畫，合併需另經 repo scope 審查
├── src/
│   ├── app/                    路由、layouts、error boundary
│   ├── features/               blog、profile、projects、research、search、comments
│   ├── components/ui/          少量可及性 primitives
│   ├── i18n/                   UI 字典與 locale mapping
│   ├── lib/                    schemas、URL 與日期 pure functions
│   └── styles/                 tokens、prose、layout
├── content/
│   ├── posts/<content-id>/     meta.json + 各語系 Markdown
│   ├── profile/                經歷事實與各語言呈現
│   ├── projects/               專案案例
│   └── taxonomy/               穩定分類 ID 與翻譯名稱
├── data/research/              經驗證且有來源 ref 的小型快照
├── scripts/                    內容驗證、來源匯入、SEO、發布產物檢查
├── public/                     必要靜態素材
├── tests/                      unit、fixtures、e2e
└── .github/workflows/          CI 與受保護 Pages deploy
```

單一前端根 owner 即可，不為「結構化」新增 monorepo orchestration、backend 空資料夾或跨 repo 共用 UI 套件。URL 擁有語言、文章與可分享篩選狀態；local React state 擁有抽屜／搜尋開關；內容 manifest 擁有發布與翻譯資訊。初版不需要 Redux、多套 theme manager 或帳號資料庫。

文章 build-time rendering、syntax highlight、math 的成本不轉嫁為所有訪客共用巨型 JS。僅在需要頁面載入相應程式碼；不要把全站文章全文一次打包進 entry chunk。React 保留正常語義 HTML，關閉 JS 仍可閱讀與點連結。

## 6. 三語內容治理

### 6.1 三種不同語言責任

UI 翻譯、文章翻譯、搜尋／SEO 是三件事。切換按鈕不是三語完成證據。網址與文章 ID 穩定；頁面 title、description、摘要、分類、alt、閱讀時間、OG、RSS 均隨語言。

建議文章群組使用 meta.json 記錄 content ID、sourceLocale、原日期、author ID、topic IDs、來源與 discussionNumber。語系 Markdown 的 frontmatter 記錄 title、summary、locale、publication、translationState、sourceRevision、translatedAt。

```yaml
# content/posts/llm-context-window/ja.md 的 frontmatter 示意
locale: ja
title: "審查後的日文標題"
summary: "審查後的日文摘要"
publication: draft
translationState: machine-draft
sourceRevision: null
translatedAt: null
```

上例刻意是草稿：沒有來源 hash／審查證據就不偽造為已發布。產生器不能把 null 當有效翻譯完成。

publication：draft / published / archived。translationState：original / machine-draft / reviewed / stale。原文 published + original 可以發布；譯文需 reviewed 才自動發布。原文改動後，sourceRevision 不匹配的譯文標 stale，展示版本說明，不默默以最新日期重發。

### 6.2 切換與缺漏

從同一 content ID 找到已發布的目標語言，切到對應文章而非首頁。缺少譯文時保留當前文章，清楚說明尚無目標語言；使用者可選擇閱讀原文。不要在 /en/ 網址無提示展示繁中全文，或讓所有 hreflang 指向首頁。

初次完整上線建議範圍：核心導覽／About／精選專案具三語；已確認五篇舊文章各有原文與經審閱英日譯文。MVP 可以先用一篇完成三語驗證，不代表全站內容已完成。未來原文先發可行，但缺譯狀態必須透明，且新增工作項而非假裝完成。

英文翻譯保留技術精確性；日文採自然的書面技術敘述，不逐字照搬中文長句。建立術語表，固定例如 quantization／量化／量子化、稀疏自編碼器等對應；程式碼、公式、引用與原文網址不由翻譯器任意改寫。

### 6.3 SEO 與搜尋

每語言頁 self-canonical；hreflang 僅包含真實已發布對應版本。首頁語言入口可作 x-default。輸出每語系 RSS、sitemap、OG 以及適用的 Person／BlogPosting structured data；不能將所有翻譯 canonical 指向繁中，避免主動把對應語言當成重複頁。

Pagefind 作靜態搜尋候選：官方依 html lang 分開索引；extended release 支援中日文斷詞。仍需驗證 zh-Hant 的 UI 文案、繁中詞彙、日本語複合詞、Rust 符號、LLM 縮寫，以及快速切換語言後索引是否仍正確。初版搜尋只限本語言；跨語搜尋不是預設必要功能。

來源：[Pagefind multilingual](https://pagefind.app/docs/multilingual/)。

## 7. 留言安全與 GitHub 邊界

預設另建 DennySORA/blog-comments 公開 repo，啟用 Discussions，按內容群組預先建立討論。主站各語言版本讀同一個 discussionNumber，避免改標題、換網址或切語言後出現不同留言串。這是普通設定與小型 map，不需要抽象成 plugin framework。

| 模式 | 行為 | 邊界 |
|---|---|---|
| native（預設） | 文章下方顯示「到 GitHub 參與討論」 | 不新增留言代管服務或 OAuth 中介；在 GitHub 登入、發文、檢舉和管理。 |
| giscus（條件選項） | 同一 discussion 在文章內顯示與發文 | 資料在 GitHub，但服務／iframe 經 giscus，不是純 GitHub-only。 |

只使用 GitHub 系統的要求採 native 為保守解讀；不因前一輪提到 giscus 就自動授權新的第三方信任。若日後採 giscus，僅安裝指定 comments repo、核對 Discussions 權限、固定正式 origins、點擊後才載入、保留 native 備援與關閉開關；origins 不是私有存取控制。安全不能保證零漏洞。

原生方案不需要網頁持有 token 或 secret。不要自製把 GitHub OAuth client secret 放瀏覽器的替代留言。若要求「內嵌寫入且絕不透過其他服務」，需另行研究 GitHub 實際支援的授權流程／部署邊界，不能在這份靜態計畫中保證已有簡單安全解。

原生 GitHub 的 moderation、locking 和 community rules 是初版管理入口。留言本來公開，不當作私人客服。現有留言若有，不假定 Git clone 能備份；需要單獨調查 Discussions API 匯出、作者與時間保留及還原限制。自動搬運留言可能無法保留原生作者身份，不得冒用。

來源：[giscus](https://giscus.app/)、[GitHub Discussions 管理建議](https://docs.github.com/en/discussions/guides/best-practices-for-community-conversations-on-github)。

## 8. 舊文章只搬內容的程序

1. 固定 personal-website 的來源 commit，盤點 blog-posts.ts、blog 型別、router 與實際發布版本。五筆是基線；新來源新增文章則擴充清冊，不硬刪至五筆。
2. 以 TypeScript AST 或受限資料解析取出字面資料；不執行不明 repo 程式，也不以抓網頁 HTML 代替一手文章資料。
3. 對每種 block 定義明確映射：paragraph→段落，heading→原層級標題，list→清單，quote→引用，callout→受控 directive。未知 type 直接報錯，不能忽略。
4. 預設 Markdown；允許的 callout 由 renderer 映射 React 元件。舊來源、研究 JSON 與留言不做可執行 MDX。MDX 可編譯為 JavaScript，因此它是 code trust boundary，不是普通無害文字格式。
5. 保留 slug、日期、原文段落、清單順序、引文、作者與 tag 關聯。保留 semantic snapshot／block counts／来源blob hash，驗證重跑 importer 無重複與無漂移。
6. 若文章引用本地圖片，搬實際檔案並核對 hash；有 LFS 時不能把 pointer 當作圖片完成。舊站純裝飾 assets 不搬。
7. 建立 migration manifest：sourceRepo、sourceCommit、sourcePath、sourceSlug、sourceUrl、targetContentId、targetRoute、assetMap、contentChecksum、reviewStatus。
8. 技術內容重新查證或語氣編修另開 editorial change，與第一次等價搬遷分開。專業視覺不是擅自刪改作者觀點的理由。

來源：[MDX 安全邊界](https://mdxjs.com/packages/mdx/)。

## 9. 儲存庫移轉與資料責任

建議目標：

```text
DennySORA/dennysora.github.io   新主站
DennySORA/personal-website     舊來源保全、必要時承接舊域名橋接；名稱須先查碰撞
DennySORA/daily-paper-report   研究生成與發布系統
DennySORA/blog-comments        新建留言 repo；名稱須先查碰撞
```

「移轉 repository」不是「合併到另一個已存在的 repository」。不能把 personal-website transfer 直接覆蓋 dennysora.github.io。兩個來源先保留身份與歷史，再按範圍抽取內容；無必要不把 unrelated histories 強行合併。

GitHub 官方說明 repo 移轉會保留 Git 資訊並帶走 Issues／PR／部分設定資源，既有 deploy keys／secrets 仍關聯；因此不要假定移轉會自動清除舊權限。移轉後審查 collaborators、App installations、webhooks、deploy keys、Actions 與環境設定。需要輪替的 key 先安排不中斷替換，確認後撤銷，不是盲目全部刪除。

原 repo web/git URL 的重新導向不等於 GitHub Pages 網址重新導向。不要在舊 owner/name 重新建立同名 repo 作橋接，因為可能永久破壞原 repo 的轉址。橋接可以由移轉後的 legacy repo 或另一個不衝突的 repo 承接自訂網域。

本次 connector 對兩個來源 repo 顯示可讀，但沒有管理／推送權限；不能據此推論使用者本人沒有所有權。實際移轉需由具來源 admin 與目標接收權限的登入完成。這是執行先決條件，不是要求現在停止規劃。

來源：[GitHub repository transfer](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)。

## 10. 論文系統移轉 runbook

### 10.1 切換前

盤點所有 refs／tags、gh-pages 輸出清冊、報告數量與 hash、state 格式、Nano 設定檔中的非機密鍵名與 schedule；不把 secret 值抄進 plan。以 SQLite 一致性備份方法產生可恢復快照，驗證還原，再處理 repository 所有權。只複製正在寫入的 DB 檔不能作為一致性證明。

先停止新排程進入，等待正在執行的有界工作結束或安全取消；保留單一發布者鎖。不要讓新舊 checkout 同時寫同一個 gh-pages／state。記錄目前 app/source/public artifact/DB schema/remote/domain，作為 rollback tuple。

### 10.2 切換

移轉 repository，核對 main／gh-pages／state 及必要 GitHub 資源仍在；更新 Nano checkout remote，以及 publish-pages.sh／publish-state.sh、部署環境的 repo URL。保留既有 uv 與 pnpm locks，不因搬移主站同時升級研究模型和依賴。

首先保留 paper.sorahane-kyoukai.org 這個對外 URL，依實際 Pages／DNS ownership 完成安全轉接；不能保證跨 owner 驗證完全無中斷，需維護窗口與檢查。若日後採 paper.dennysora.me，才更新 PAGES_DOMAIN、前端 base/site URL、canonical、RSS、JSON 連結、主站整合設定和舊域名橋接。

PAGES_DOMAIN 很重要：目前發布腳本每次重寫 CNAME，不更新它就可能反向覆盖人工變更。REMOTE_URL 與 STATE 發布來源也須逐一核對，不能僅改 main 分支 README。

### 10.3 驗證與恢復排程

先 dry-run 生成到隔離輸出，檢查 index.html／api/daily.json、引用 assets、schema、日期語意與禁止檔案；確認 .env、state.sqlite、完整抽取原文與 backups 不在公開產物。驗證輸出再做一次受控發布，核對實際 API、報告頁與 TLS，最後只啟用一份原 schedule。

若切換失敗，先關閉新 writer，復用已驗證舊 artifact／設定，不讓新舊同時寫入。DB schema 未變更時不應不必要覆寫最新資料；若必須還原，保留恢復點之後的新資料與明確損失範圍。重新移轉 repo 不一定是必要或最快的回滾途徑。

### 10.4 state 分支隱私

來源 repo 是公開的；state 分支名稱不使它成為私人備份。本次未讀取 DB 與 cache 內容，所以不能宣稱已洩漏資訊。但切換前必須審查：若存在敏感狀態，後續備份改往私人 repo 或受控加密備份。不把目前公開 history 當成刪掉檔案即完成撤回；已有暴露才啟動相應憑證處置與歷史清理審查。

## 11. 主站與論文系統的整合契約

初版 research 是完整、可三語閱讀的入口，但不承諾所有歷史繁中日報已翻譯。Research card 具有 report ID、kind(daily/weekly/monthly)、period、display title、original language、publishedAt、sourceCommit、source URL 與生成／審閱標記。

主站建置只讀固定 ref 的公開 metadata，並檢查 schema、大小、檔名、https URL 與允許域名。不得直接載入或執行外站生成 HTML／MDX。更可靠的方式是更新快照的 PR 流程，經驗證合併後由主站自己的 deploy 發布；不給 Nano 個人主站寫入權限。

研究來源暫時不可用時保留上一次可驗證快照；UI 展示真實資料時間，而非把 build time 當內容更新。首次無快照時展示清楚空狀態和研究站連結。未來需要自動 refresh 的 GitHub Action 可另行配置，但本次沒有建立任何排程。

每日研究全文三語化與研究 Vue reader 改 React 均作後續獨立 owner 任務：前者改 pipeline、翻譯快取與成本；後者保留 JSON schema、舊 URL、深連結、資料來源與生成流程。不是替主站加語言按鈕即可完成，不以「React 完成」名義偷偷忽略 reader。

## 12. 網址、網域與 SEO 遷移

### 12.1 舊 blog 與履歷

逐一對照 /blog/:slug → /zh-hant/blog/:slug/；列表 /blog → /zh-hant/blog/。保留舊 slug，避免在首次轉換又改标题路由。

舊主站 detail 路由需要逐頁確認後對照：detail/about → about、production → projects、research → research，detail/depth 則按實際內容轉成適合的 profile／project／article，不未讀就全送首頁。hash anchors 若改動，建立可行的 anchor aliases；查詢參數採允許清單，不接受任意 redirect 目的地。

純 GitHub Pages 不應承諾自訂任意 HTTP 301/308 rewrite。採每個已知路徑的靜態 bridge，包含 canonical、新地址普通連結與可選 meta refresh／保留 fragment 的受控腳本；它不是伺服器層永久轉址。若真的要求完整 HTTP redirect rules，需要額外 DNS forwarding／edge 能力，這會擴大「只用 GitHub」的服務範圍。

未知舊路徑保留有用的 404／索引，不用全域把404偽裝200首頁。原 org 其他頁不因本次 blog-only 要求被擅自刪除。

### 12.2 Domain ownership

dennysora.me 保留為主站提案。舊自訂網域跨 owner 轉移需核對 verified domains：GitHub 官方說明驗證與帳號／組織綁定，驗證被其他 owner 使用的網域可能立即釋放舊 Pages 綁定；因此不能把「先驗證」當完全無副作用的操作。需在實際移轉窗口协调 TXT、Pages ownership、DNS 與憑證。

採自訂 Actions deploy 的主站，CNAME 檔本身不是 domain 設定來源，應核對 Pages settings；研究站目前從 branch 發布，CNAME 仍直接相關。這兩種發布模式不可混為一談。DNS 停用前先規劃舊域名處置，不留下未綁定且仍指向 Pages 的紀錄。

來源：[domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)、[CNAME 與發布模式](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)。

## 13. CI、安全與驗收預算

PR：frozen lock install → lint/typecheck/unit → content/schema/links/locale → production build → static server 的 Playwright／a11y／JS-disabled 測試。Deploy：只發布同一個已驗證 artifact；限制 main／受保護環境；build 無寫入權限，deploy 才給 Pages/OIDC 所需權限。第三方 Actions 依官方安全建議固定完整 commit SHA，依賴更新經測試。

避免會在帶 secrets 的環境執行不受信 PR 程式碼的 workflow。匯入 content 也視為可攻擊 build/parser 的輸入：限定大小與型別、禁外部 executable MDX，檢查 HTML、URL 協議、SVG 和危險連結。資料寫進 loader payload、.data、source maps 都可能公開，不能只掃 JS entry。主站公開 repo 的草稿與 Git history 也不是私密記事本。

不能為使用 GitHub Pages 假設任意 response headers／_headers 配置會生效；CSP 若透過 meta 僅是可用範圍內的補強，不替代完整服務端 header 能力。初版從無第三方自動腳本、無 secrets、明確輸入邊界縮小攻擊面。

建議工程預算（自訂目標、尚未量測）：基本頁面初始自家 JS gzip ≤150 KB；搜尋按需載入；非文章必要素材不阻塞文字；長文在停用 JS 時仍有完整主要內容。性能門檻需標記裝置／網路／冷快取條件，不能保證所有裝置相同。

驗收狀態全部詳見 E2E_CHECKLIST；本次只檢查文件一致性，不宣稱 product tests passed。

## 14. 風險與尚未決定的項目

| 風險／決策 | 目前處理 |
|---|---|
| 使用者說全部走 GitHub 是否包含拒絕 giscus 代管 | native 預設，內嵌 giscus 明列條件選項，不擋其他工作。 |
| SSG 與目前 skills 的一般 SPA recipe 差異 | CP-00 明確 public-content SSG 決策；先驗證載入版，不能假稱整套 skill 已使用。 |
| repo admin／目標名稱碰撞 | 移轉前 gate，目前不執行遠端變更。 |
| 正式站、DNS、Nano 未驗證 | 建立工作項與明確 blocker；不以來源文件當作線上成功。 |
| 舊文章正文等價與作者歸屬 | 原文匯入與修訂分 PR、留 provenance。 |
| public state 潛在敏感資料 | 只提出審查，未看 DB 不下洩漏結論。 |
| 日報海量三語翻譯與成本 | 第一階段保留原文，介面／metadata 真實標語言；全文翻譯另定。 |
| 靜態 bridge 不是301 | 文件與驗收明確；額外 edge 僅在改變約束後評估。 |

對主站架構方向的判斷信心約90%；對未檢查 admin、DNS、Nano 的實際移轉是否能直接無調整執行，信心約70%。這是規劃不確定性的主觀標示，不是系統安全或成功率的統計估計。

下一個不受遠端權限阻擋的工作：建立來源／URL／內容 manifest，核對本機 skill 版本，完成 SSG 與 content schema 決策，然後以一篇三語文章做端到端垂直切片。
