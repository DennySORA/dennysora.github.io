# 重建實作紀錄

> 2026-09-26 更新：下列「設計」段落的石墨黑工作台與 Explorer 導覽，以及「搜尋使用分語系靜態 JSON」的取捨，已由 UI／UX v2.1 取代（semantic-dark tokens、三種任務版型、Pagefind）。現況見 [DELIVERY-v2.1.md](DELIVERY-v2.1.md)。

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

## 2026-10-03｜SITE-REMOVE-01：移除 Projects、隱私頁並精簡首頁

狀態：進行中；紀錄來源：`bootstrap_manual`／`agent_reported`。此環境沒有可呼叫的工作流程 engine；本紀錄沿用既有文件，不宣稱機器驗收。

範圍：依擁有者最新指示，移除三語 Projects 與 `privacy.md` 頁面、導覽及入站連結；首頁移除作品、開頭註解、探索問題、工程之外、完整紀錄與最後聯絡區塊。保留核心自介、能力、經歷、既有部落格／筆記與 GitHub repositories。`privacy.md` 是 Explorer 顯示名稱，其來源為 `src/features/misc/Privacy.tsx`；不刪除 P2P privacy 筆記。

基準：已查驗遠端 `main` 為 `25a1e05d8142dbd0982146526b1cccbe19a4b1d2`，本地 181 個 tracked files 與其完全一致；當時沒有 release tags。最新成功部署 run 為 `37109773040`（`96df79faa97510aad0861bad8dba12bcf2e61996`）。只保留既有日期 tag 發布例外，不改動 workflow。

計畫：移除路由、頁面與首頁區塊；更新三語導覽、舊錨點、產物與回歸測試；執行格式、lint、types、unit、build、browser 檢查，再核對遠端並回報發布狀態。Context7 不可呼叫，使用 React Router／Playwright 官方文件核對預渲染與測試時限。

新增範圍：瀏覽器語言偏好只用於 `/`；明確語言網址與手動切換優先，不新增 storage。首頁 front matter 修正為 `name: 李汶道`、`alias: DennySORA`，JSON-LD 同步；移除實際位於 Blog 的論文日報提示框。收合 Explorer 後將內容置中；左側活動列改為有可見文字、目的地提示與目前狀態的三語導覽。已檢視擁有者提供的按鈕截圖，確認是活動列，圖像資產另以隔離工作製作，不修改品牌 Logo。

目前證據（同一份整合來源，圖像與導覽完成後）：`pnpm format:check`、`pnpm lint`、`pnpm typecheck` passed；`pnpm test` passed（12 files／96 tests）；`pnpm build` passed（26 prerendered routes、22 sitemap routes，local links、removed-page absence、圖像 SHA-256 及產物檢查通過；initial JS gzip 137.6 KiB）。首輪新增的首頁測試誤把已移除作品卡片的 dgxtop 當作保留能力區塊的連結，已依實際能力證據改測 httpulse，完整 96 tests 重跑通過。

Browser gate：blocked，未宣稱畫面或互動驗收。原設定的 Google Chrome 不存在；改用已安裝 Chromium、保留 browser sandbox 的單一 focused test，在 normal 與一次核准的 shell escalation 均於啟動時因 `socket() failed: Operation not permitted` 結束，未載入頁面。沒有停用 sandbox、建立 tunnel 或變更測試門檻。新增的 browser cases 涵蓋三語刪除、可見導覽、偏好順序、明確語言優先、no-JavaScript 與 1280／1440／1920 置中及反覆切換；尚待可用瀏覽器執行。

圖像：`assets/illustrations/navigation-icons-v1.png`，1983×793 RGBA、530874 bytes，由 imagegen 建立，實際像素及透明度已檢視；五格 CSS sprite 不改動原始 pixels，provenance／SHA-256 在 `data/navigation-assets.json`。沒有變更品牌圖或既有 P2P notes。

下一步：核對最後 diff／遠端 main 後提交本次來源；日期 release tag 與實際部署仍待可用的 tag 發布管道。最終 https://dennysora.me/ 的新版 browser QA 未完成，不能把來源更新當作已部署。

補充驗證：原設定 Playwright 的 HTTP-only `every production route` case passed（1 test／26 routes，1.9s）。這個 case 不啟動 browser，因此只證明真實 loopback 產物的 HTTP／HTML，不是視覺或互動 pass。最初以行首錨定的 grep 未匹配任何 test，已改用完整測試名稱重跑。

最後整合重跑：format、lint、typecheck、99 unit tests（12 files）與完整 build／artifact passed。新增可見標籤必須包含在 accessible name 的三語回歸測試；未放寬 lint、型別或測試要求。以雲端瀏覽器實際開啟 https://dennysora.me/ 並檢視畫面，仍看到舊版 Projects、privacy.md、舊首頁段落及反向 name／alias；因此本次來源尚未對外部署。遠端 main 最後核對仍為 25a1e05，release tags 仍為空。GitHub 連線身份已確認符合 DennySORA；本地未設定 Git 身份，不修改 Git config，使用 GitHub Git database 組裝 commit 並在更新 main 前核對 raw commit identity/tree/parent。
