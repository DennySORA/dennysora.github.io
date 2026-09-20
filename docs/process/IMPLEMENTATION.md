# 重建實作紀錄

2026-09-20。此紀錄承接 ZIP 的規格；本次使用者已授權本機完整重寫，取代 REQ-022 的歷史「僅規劃」限制。遠端移轉、部署、DNS、Nano 維運不在本機寫入範圍。

## 設計與架構決策

採 React Router Framework Mode 的 build-time prerender，`ssr: false`；React、TypeScript、Vite、Tailwind、pnpm。這是本計畫明示的 public-content SSG recipe，無常駐伺服器，無 RSC。文章由 Markdown 在建置時轉換並清理，禁止執行 MDX；公開產物只取 `build/client`。

設計：石墨黑工作台，固定窄 Explorer 導覽、寬鬆內容欄與有條件的右側目錄。首頁以「理解工程、記錄思考」為核心，自介 → 精選文章 → 專案 → 研究入口。藍色是操作、青色是工程主題、紫色是 AI 主題、琥珀色是研究／待審狀態。正文使用系統 sans-serif，路徑和標籤使用 monospace；不增加字體網路依賴、假 telemetry 或終端輸入。

320–1920 px，單一 document scroll owner；長字串換行，code/table 局部捲動。手機導覽使用原生 dialog，處理焦點、Escape、背景鎖定、返回和關閉。文章控制和 ToC 不依賴 hover。正文最大約 44rem。靜態連結在 JavaScript 關閉時仍可導航；搜尋為漸進增強。

## 已確認的來源差異

- 原主站是 HTML/CSS/JS，無既有 package manifest；政策 manifest 本機校驗全數一致。保留 PROJECT_AGENT 的歷史事實，以本紀錄補充已授權的架構遷移。
- 已載入的 Skills 是本機安裝版本；未核對私人 Ops-Tools 的遠端來源版本，亦不複製其實作至公開產物。
- `sorahane-kyoukai/personal-website` 與 `DennySORA/personal-website` 讀取回傳 404；使用者已確認舊 blog repo 被刪除。不得憑五個標題製造遷移成功紀錄。
- 研究 repo 已在 `DennySORA/daily-paper-report`，公開 `gh-pages` ref 為 `0c9821facd9c7950bafd44ce1453b8a19ae8cb75`，CNAME 為 `paper.dennysora.me`。以真實來源取代 ZIP 的過期 owner／域名；未操作 Nano 或 state。

## 文件依據與驗證

React Router 預渲染／路由經 Context7 核對；三次查詢額度用於 SSG。其他依賴使用官方文件補足：[React Router](https://reactrouter.com/how-to/pre-rendering)、[Vite](https://vite.dev/guide/)、[Tailwind](https://tailwindcss.com/docs/installation/using-vite)、[React](https://react.dev/reference/react)、[Zod](https://zod.dev/api)、[Marked](https://marked.js.org/)、[sanitize-html](https://github.com/apostrophecms/sanitize-html)、[pnpm](https://pnpm.io/settings)、[typescript-eslint](https://typescript-eslint.io/getting-started/)、[Playwright](https://playwright.dev/docs/test-configuration)。相容 stable 版本以 npm registry engines／peer ranges 決定，記錄於 package.json 與 lockfile。

完整實測與剩餘範圍見 [DELIVERY.md](DELIVERY.md)。原 ZIP 的規劃不構成已執行證據。

## 實作偏差與取捨

- 搜尋使用分語系靜態 JSON + `Intl.Segmenter`/NFKC，未採 Pagefind。現有內容只有三篇筆記，中日文、全形 Latin 與 Rust 符號測試可覆蓋需求；保留讀取失敗、retry、無結果、URL 篩選。內容增長後應量測索引體積再決定替換，未宣稱實作 Pagefind。
- 舊 blog 五篇沒有本文，不能做等價匯入。現在三篇為來源可追溯的 profile adaptation，日期為本次整理日期，並非舊文章原始日期；保留原站已公開的三語正文，新的標題摘要屬編輯整理。未假冒人類重新審阅。原頁其餘技能、工作經歷、學歷、社群、技術深度保留在 About。
- 留言元件與穩定 ID 對照契約已實作；真實 Discussions repository／number 尚未設定。頁面呈現「未連結」；無假可用按鈕、token、giscus 或登入系統。
- 所有自介素材沿用原站 avatar；視覺圖解使用 CSS/SVG。沒有需要額外點陣插圖的區塊，因此未呼叫影像生成服務，也未聲稱使用 GPT image 2.5。
- TypeScript 與 ESLint 選取當時 peer ranges 支援的最高 stable 相容版本；TypeScript 7 不在所選 typescript-eslint 的支援範圍，jsx-a11y 不支援 ESLint 10。ESLint 9 的 registry deprecation 訊號保留為維護風險，沒有強制覆寫 peer 限制。依賴 audit 沒有已知漏洞。
- 原始 `index.html`、`detail/*/index.html`、`style.css`、`lang.js`、`site.js` 已由新來源取代。刪除前逐檔核對 HEAD 一致，未刪除使用者修改。原文固定 commit 與來源 checksum 記於 migration manifest；原始 assets 保留，但產物僅複製實際使用的三張圖片。
- 主站完全靜態。研究頁使用已固定 commit 的公開資料，导讀 `.html` 與 `/reports/` HTTP 回讀 200；沒有操作外站 Vue 專案、Nano 或排程。
