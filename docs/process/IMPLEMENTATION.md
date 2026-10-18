# 重建實作紀錄

## 2026-10-18｜Video Console 三語介紹、配音操作影片與分頁發布

狀態：實作、媒體託管與首版正式發布完成；作者新增前言及本機發布驗證完成；紀錄來源 `agent_reported`。網站基準 `17d56e1c50d50fc3369fa37a0989c90557bc9e24`，開始時乾淨。使用者要求完整介紹專案、市售差異、真實操作錄影，接續授權發布，並指定補上操作軌跡、kuro-tts 日文配音、三語字幕及類似 H3 DiT 筆記的內文分頁。

作者後續要求把自己的話放在最前面；繁中逐字保留原文、段落與五項未來規劃，英日保留直接語氣並完成兩個獨立 AI agent 語意對照。三語在分隔線後的既有正文與 `7fcc06bc96d0e86433af492b095234ca0491c745` bytes 完全一致，13 個 anchors、14 個媒體引用與 10 個外部連結均未變；審閱證據與原文 hash 已更新。首版 Pages workflow [39086467567](https://github.com/DennySORA/dennysora.github.io/actions/runs/39086467567) 成功，正式站六影片播放與 15 份字幕回讀已驗證；本次僅重發新增前言。新增後完整 `pnpm verify` 再次通過（180 unit／119 Playwright tests、128 routes／576 files，144.5 KiB initial JS gzip）；隔離瀏覽器已讀回三語首段與五項 roadmap，並檢視繁中 1440／320、日文 1280 畫面，無水平溢出。最終遠端狀態仍以本次 release 的 Pages workflow 與正式頁面回讀為準。

文章有 13 節，分成總覽、Studio、設備與流程、紀錄與推理、工具比較與限制五頁；三語共用原錨點與影片。7 張介面截圖、原創動漫／寫實成品，以及五支新錄操作影片。Studio 64.46 秒、流程 55.54 秒、元件 64.79 秒、紀錄 64.92 秒、推理 78.04 秒；另有 10.33 秒成品，共內嵌 6 支影片。30 段日文合成旁白與 15 份 WebVTT 使用同一時間軸。游標、軌跡與點擊圈由實際瀏覽器事件驅動；操作等待剪短，旁白需要時保留停格，無關活動名稱遮蔽並裁去頂端 50 px。最終接觸表已逐段檢視；未將影片長度當生成耗時。

生成示範時來源 `41bed3ac931a1466c757ec07f14cf674f4fee5c4`，擴寫 source inspection 為 `c5f064d056738822c6878654c6e2b05c5c494ad0`，不冒稱 deployed bundle 完全一致。補拍僅操作自建示範專案與紀錄、配置及空白推理表單；沒有再送生成／匯出、啟停元件或改設定，未執行語意分析、資料集輸出、訓練、換角或全部效果。原創兩段生成及第一次實際匯出證據與補拍分開敘述。市場比較引用當日官方文件，不宣稱跨產品 benchmark 或獨占功能。

旁白使用指定 kuro-tts 的既有環境與模型，在 CPU 產生本次新文稿，避開其他使用者 GPU 工作。兩個離線 ASR 模型只檢查新音檔，針對關鍵誤讀改寫並重製；這是自動可辨識性核對，沒有宣稱人工聽感、母語口音或聲音品質認證。使用者這次的文章發布與指定配音範圍只涵蓋新教學旁白，不包含原始語料、模型、參考聲音或憑證。可公開 provenance 只留工具來源 commit、合成聲明、處理方式與成品 hashes。

六支 MP4 已上傳至既有 Hugging Face dataset 的 `posts/video-console/media/`，固定 commit `2179b1bfa8e44187c42e57d34cbc0926f4077cbd`；逐檔遠端 `x-linked-size`／`x-linked-etag` 與本機 bytes／SHA-256 相符。`data/post-media.json` 擁有託管與字幕契約，MP4 不進 Git／Pages 產物；poster 與字幕同源。38 個本機媒體資產記錄於 provenance。未發布其他原始聲音或私人素材。

原生 workers 在獨立 scratch 提供媒體契約、分頁、發布測試與三語對照審閱；root 是工作樹唯一 writer。英日審閱如實標為 AI 對照審閱，非作者逐字或人工母語審閱；證據見 [VIDEO-CONSOLE-REVIEW.md](VIDEO-CONSOLE-REVIEW.md)。分頁保留全部靜態內容、深連結、鍵盤與 no-JavaScript 導覽；切換時暫停隱藏影片。草稿 preview 與 production cache 隔離，字幕僅由受控 renderer 產生。

前一版草稿曾通過 38 個核心測試及本機六影片播放、320–1920 寬度檢視；這些不代替本次新增旁白／分頁的發布驗收。最終 `pnpm verify` 通過：format、lint、types、180 unit tests、完整 build／artifact、119 Playwright tests。建置為 128 routes、576 files、initial JS gzip 144.5 KiB，未提高既有上限。首輪修正兩項舊內容假設：所有文章都有留言串，以及首頁沒有最近文章；保留本篇 comments disabled／null 與舊草稿 noindex 橋接。其後僅為日文字幕加入句子內換行，文字內容不變，重新通過 content check、7 項媒體契約測試、完整 build，並回到瀏覽器確認最終字幕。

MCP 隔離瀏覽器對正式產物實測：六影片 currentTime 前進、readyState=4、audio decoded bytes 增加且無 media error；15 個文字軌全數載入 90 cues。三語各自預設正確字幕，已檢視繁中 1440／320、英文 1920、日文 1280 的畫面，頁面沒有水平溢出。播放前六影片 readyState=0，無第三方 resource request；切換分頁讓正在播放的影片實際 pause，console 無 error／warn。與完整 E2E 的深連結、鍵盤、no-JavaScript、axe、notes 回歸證據互相補充，不宣稱逐幀人工審核或完整聽辨全部旁白。發布使用已核對的 main → release 非強制更新；遠端部署結果以該提交的 Pages workflow 及正式站回讀為準。

基礎設施文件的 JSON／canonical digest 以標準函式庫核對，其他 Fleet／Nano 工作保持原樣。docs repository 完整 executable gate 缺 trusted external boundary，仍為 BLOCKED / NOT RUN，不以網站檢查代替。新音檔、ASR／整合 scratch 與七份 managed 原始 screencast 已刪除並回讀不存在；來源服務與日常瀏覽器保持原狀。正式發布的 13 個 heading IDs 已登錄錨點契約。網站驗收 browser／loopback server 在正式站驗證後關閉。

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

## 2026-10-11｜筆記與資料三語補齊

狀態：本機實作與驗證完成；後續發布前核對見下節。紀錄來源：`agent_reported`。基準 `488ca2523cdadfd5c21dd2f1a3e725751cf7cd72`，開始時工作樹乾淨。擁有者要求深度盤點並實作缺漏的多語內容；範圍是本站既有繁體中文、英文、日文，不包含外站論文日報，也未授權 commit、push 或發布。

盤點：五篇 HTML 筆記只有中文正文；路由、目錄與 Explorer 固定導向中文，摘要與互動結果仍有單語文字；dgxtop 專案頁缺日文。profile、三篇 posts、taxonomy 已有三語結構；三篇 posts 各語系均為 draft，本次保留既有發布狀態。先補全文、圖表／無障礙文字和互動文案，再串接三語路由、搜尋、metadata 與語言切換；保留原文、數字、URL、章節 ID 和原始驗證界線。

分工：三個原生 worker 只在隔離暫存目錄草擬 downloader、privacy、hardware 的英日譯文；主 agent 是工作樹唯一整合者，負責醫學、專案、載入機制及驗證。翻譯以來源文字對照，建置時缺漏或陳舊對照直接失敗，禁止靜默退回中文。Context7 已核對 React Router prerender 與 loader 契約；不升級依賴。

驗證計畫：既有 unit suite 沒有 coverage 門檻，與 browser suite 分開，沒有刪除測試的必要；使用現有 format、lint、typecheck、內容檢查、unit tests、production build。新增對照完整性、跳脫、三語路由與深連結回歸。依本次明示提供的 repository 規則，補上本機隔離 Chrome 的英日互動、搜尋、語言切換與既有寬度矩陣驗證；此規則優先於 Skill 的通用 browser opt-in 預設。完成後補實際命令與結果。

實作盤點：

| 內容                          | 原狀態       | 本次結果                               |
| ----------------------------- | ------------ | -------------------------------------- |
| 鎮痛藥指南、腦與中樞神經腫瘤  | 只有中文全文 | 每篇繁中、英文、日文全文               |
| P2P Downloader、P2P 隱私研究  | 只有中文全文 | 每篇三語全文，包含原有契約／研究附錄   |
| 140 mm 風扇評估               | 只有中文全文 | 三語正文、表格、圖表與互動訊息         |
| dgxtop 架構與設計             | 繁中、英文   | 補齊日文正文、圖表、截圖說明與替代文字 |
| profile、taxonomy、三篇 posts | 已有三語資料 | 保留資料；posts 的三語 draft 狀態不變  |

五份 JSON 共 4,404 組 `source`／`en`／`ja` 對照；原 HTML 未變更。中文變更會觸發缺漏／陳舊對照檢查，原有英語說明另列明確對照。所有 15 份筆記版本的 ID、來源連結與 `data-*` 均由回歸測試逐項核對。目錄、Explorer、metadata、alternate links、語言切換、標籤與全站搜尋同步導向讀者選定的語言；沒有新增未發布文章。

修正過程：初次 build 的 initial JS 超過既有 150 KiB 門檻，將含互動工具的筆記元件沿用專案頁模式分塊載入，build-time 先載入模組以保留完整靜態 HTML；未提高門檻。實際 Chrome 檢查發現英日 SVG 標籤超界及圖例重疊，已精簡圖內標籤且保留限定語意，新增 viewport、文字碰撞與流程方塊邊界檢查。dgxtop 的 bridge 原本就跨越時間桶，不能把時間桶誤當文字容器；此項以來源結構與截圖核對，方塊容納規則限定於網路流程圖。

靜態與內容結果：`pnpm format:check`、`pnpm lint`、`pnpm typecheck` passed；`pnpm test` passed（18 files／141 tests）。最後 `pnpm build` passed：62 個 prerender routes、55 個 sitemap routes、212 個產物檔，initial JS gzip 145.1 KiB；內容完整性、local links、anchors、品牌資產與搜尋內容契約通過。建置顯示「Search index skipped」指沒有已發布 blog 文章可供 Pagefind 索引；全站搜尋的筆記索引仍正常產生並測試。

瀏覽器環境：使用已安裝 Google Chrome 的隔離新 profile、保留 sandbox；只將這次 build/client 的 212 個一般檔案逐檔複製至任務暫存目錄，拒絕 symlink，另存 SHA-256 manifest，伺服器僅綁定 loopback。沒有操作日常瀏覽器、擴充套件、儲存資料或遠端網站。Context7 用於 React Router；後續文件查詢額度不足以完成 Playwright 解析加查詢，改查 [官方 CLI](https://playwright.dev/docs/test-cli) 與 [webServer](https://playwright.dev/docs/test-webserver) 文件，沒有安裝新的 lookup client。

視覺證據：已人工檢視英日鎮痛藥頁首在 320／390／768／1280／1440／1920 px、英日 downloader／privacy／風扇頁首在 1440 px、英文 dgxtop 頁首的同一六寬度矩陣，以及英日 downloader 架構、風扇圖例與 dgxtop 履歷圖。首屏未見正文裁切或重疊；SVG 檢查另量測全部圖表文字。此證據不等於逐頁全文的人工視覺審查。翻譯依原稿保留劑量、否定、數據、日期及證據限制，經 agent 交叉抽查；沒有宣稱醫師或其他領域專家重新審查，也沒有更新原研究或價格。

全站 browser 回歸：`pnpm exec playwright test` 使用上述隔離設定與 `--max-failures=3 --global-timeout=60000`，99 cases 中 98 passed、1 failed（50.8s）。失敗是無 JavaScript 醫學目錄的來源連結被 fixed 狀態列攔住；在醫學目錄連結加入使用既有 footer token 的 [scroll-margin-bottom](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-margin-bottom)，保留正常 click 與原本限制，並將同一案例擴為三語、確認目的標題進入 viewport。另補齊英文跨 inline 標籤接縫空格；沒有改動原中文 HTML、程式識別字或數據。

最終影響範圍重測：`medical-notes.spec.ts` 與 `note-translations.spec.ts`，以 `--grep 'translated diagram labels|note tools|brain guide is accessible' --max-failures=1 --global-timeout=20000` 選取四個案例，4 passed（11.5s）。涵蓋英日互動、搜尋／無結果、輸入失敗、匯出、語言切換、無 JS 正文與三語來源跳轉、SVG 邊界／碰撞。加強目的地檢查時曾誤用 `#sources h2`，已依原稿實際 `h2#sources` 改正後重測。未把中斷案例當 pass，未再次整套重跑；原 98 個通過案例加上修正後定向結果是本次 evidence boundary。

最後重新執行 format、lint、typecheck、141 unit tests 與 production build，全部 passed。全站搜尋檔有 54 個公開頁面版本，其中 15 份筆記（每語言 5 份）；文章仍為 draft，沒有 Pagefind 文章索引是預期狀態。五份原始 HTML 與 HEAD 逐 bytes 一致；本次維持原 500,000-byte JSON 檔案上限。README 與兩份更新文件共 31 個相對連結皆存在，`git diff --check` passed。截圖、測試 log、browser profile、build 產物均未加入版本控制。commit、push、release branch 與正式站均未變更。

## 2026-10-11｜多語內容發布前核對

擁有者後續明確授權「commit and merge to release and push」。Fetch 後 `main`、`origin/main`、`origin/release` 同為 `488ca2523cdadfd5c21dd2f1a3e725751cf7cd72`，沒有分歧，可採非強制 fast-forward。提交維持既有 DennySORA 身份與 OpenPGP 簽章設定；不改 Git 設定、workflow、依賴或 Pages 保護規則。

重新核對 production artifact 的 212 個 SHA-256 均與上一節最終產物一致。為本次 publication 執行完整 Playwright suite（隔離 Chrome／產物設定，`--max-failures=1 --global-timeout=55000`），99／99 passed，39.8s；這是一次完整通過的批次，先前失敗與定向重測的歷史紀錄保留。既有 141 unit tests、format、lint、typecheck、production build 及已檢視的畫面證據對應同一產品來源；本節僅新增發布核對紀錄。

唯讀 worker 核對提交範圍，確認沒有 browser profile、截圖、log 或 build 產物；release-only workflow 與環境保護未變。主 agent 保留唯一 Git 寫入權。Git fast-forward／atomic refs 契約由 Context7 核對；Actions 查詢使用已安裝 `gh` 的官方 help。下一個操作是提交已驗證來源、fast-forward release、atomic push main／release，再回讀遠端 HEAD 與該 commit 的 Actions build／deploy；此段不提前宣稱已推送或已部署。
