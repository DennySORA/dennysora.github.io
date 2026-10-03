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

## 2026-10-03｜SITE-RELEASE-01：改由 release branch 發布

狀態：進行中；紀錄來源：`bootstrap_manual`／`agent_reported`。擁有者最新指示以 `release` branch push／merge 自動 build 與 deploy，取代前節的日期 tag 發布契約。前節來源已提交至 `f540959fa094c5a7f64c1ee633878602bae38886`；本次開始時遠端 main 仍為該 commit，尚無 `release` branch。

範圍：只調整 `.github/workflows/site.yml` 的名稱、觸發條件與移除日期 tag／current main guard，並同步現行 README、發布文件與 Agent 指令。保留鎖定的官方 Actions、最小 Pages／OIDC 權限、`github-pages` 環境與 build/client 產物契約。現有測試沒有 tag 發布契約；不為單純 YAML 鏡像增加測試。Context7 MCP／受管理 CLI 不可用，已核對 GitHub 官方 push branch filter 與 Pages custom workflow 文件。

計畫：驗證 workflow 結構與既有 build；僅提交這次七個路徑的差異到 main，核對 raw commit 與遠端 ref，再從該 commit 建立 release。觀察 exact-head 的 Actions build／deploy 結果，最後檢查正式網站。沒有放寬環境保護或新增憑證。

發布前驗證：workflow YAML 成功解析，確認只接受 `push.branches: [release]`、build 只讀權限、deploy 的 needs／最小權限／環境與同一 artifact；七個修改路徑的基準 blob 均與遠端 f540959 一致，文件相對連結存在。`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`（12 files／99 tests）、`pnpm build`（26 routes／121 files／137.6 KiB initial JS）及 `git diff --check` passed。本次沒有修改 UI；前節 browser 啟動限制仍存在，不宣稱新的 browser suite pass。下一步是提交已驗證來源與建立 release，部署成功須以後續 Actions／正式站證據判定。

發布結果（本地 checkpoint，尚未另行提交）：commit `abb4f47ec9ddd163e072cf2002767300636e39ce` 的 raw tree／parent／身份已核對，main 與新建 release 均回讀一致。Push 觸發 [Actions run 37143961071](https://github.com/DennySORA/dennysora.github.io/actions/runs/37143961071)：build 及 github-pages artifact upload 成功，deploy 在 runner 啟動前失敗。GitHub 正式 run 頁註記：`Branch "release" is not allowed to deploy to github-pages due to environment protection rules.` 未停用、繞過或修改環境保護，未重試相同失敗。狀態為 blocked；下一步是由具備權限的擁有者，僅將 release 加入既有 github-pages 環境允許發布的 branch，保留其他保護；完成後重新執行這次失敗的 deploy job，再核對正式站。發布來源及三語 UI 目前仍不能宣稱已部署。

## 2026-10-03｜SITE-SEARCH-01：全站搜尋涵蓋筆記

狀態：進行中；紀錄來源：`bootstrap_manual`／`agent_reported`。前一發布阻擋已由擁有者處理，run 37143961071 attempt 2 於 18:34 UTC 成功，main／release 均為 abb4f47。正式站已由瀏覽器驗證顯示新版。擁有者回報搜尋仍進入部落格；實際來源的標題列、活動列與快捷鍵皆指向 blog/#search，原 Pagefind 只索引已發布文章，沒有文章時跳過全部索引。

方案：新增三語 /search/ 頁，使用已預渲染公開頁面的正文建立本機靜態搜尋索引；包含首頁、文章、筆記與目錄，不索引搜尋頁、404、已移除頁面或外站內容。依目前語言優先選同一內容的版本；缺少翻譯時明示原文語言並連向實際存在的頁面。搜尋載入、失敗／重試、空查詢、無結果、分類、URL／Back 狀態與鍵盤入口都要有驗證。沿用既有 React、深色樣式與最小 Pages workflow，完成後 main → release 非強制更新並確認部署。

驗證：`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、105 unit tests（13 files）及完整 build passed；29 prerendered routes、22 sitemap routes、128 artifact files、initial JS gzip 140.2 KiB。全站索引 421153 bytes、21 個公開頁面版本，其中 3 份筆記；依語言去重後顯示正確目的地。初次 artifact check 把筆記內原本可見的 raw GitHub URL 程式碼當成載入資產，已將搜尋 JSON 的檢查限於可導航 href；每份 index 仍必須逐字符合由公開 main 抽取的內容，顯示文字只使用 React text nodes。沒有放寬 HTML／JS／CSS 的資產規則。

HTTP-only Playwright passed（2 cases）：29 個正式 routes、三語 search noindex 與導覽連結、全站索引、正文專有詞 ngosang 可找到 downloader 筆記。新增 browser tests 覆蓋三語入口、note 目的地、分類／無結果、Back、語言切換、載入失敗重試與 no-JavaScript 導覽；先前 Chrome／Chromium 啟動限制仍存在，尚未執行這批 browser cases。同步修正一個殘留舊首頁章節的 layout assertion，反映已核准刪除後的兩個核心區塊及 56 個 numbered lines。下一步：核對遠端 main／release，提交本次差異並 fast-forward release，驗證 exact-head Actions 後做正式站搜尋互動檢查。
