# 醫學筆記分類與腦／CNS 腫瘤導覽

狀態：內容、分類與標籤已完成；非瀏覽器檢查與來源複查通過。使用者已接受發布前瀏覽器驗證缺口並授權發布。

## 範圍

- 依 2026-10-05 指示，既有止痛藥筆記歸入「醫學／藥物」，新附件歸入「醫學／病理」。
- 保留既有止痛藥內文及永久錨點，舊網址提供保留 fragment 的搬移頁。
- 將腦／CNS 腫瘤 HTML 改為 Moonlit Vim 靜態內容片段，保留原稿章節、表格、來源與教育用途限制。
- 原稿的解剖示意、假數值進度條與自訂色彩不沿用；分類和診斷關係改用可讀的語意 HTML。
- 只提供繁體中文原文；分類介面保留三語，不捏造譯文。
- 使用者已授權完成後 commit、合併 release、push；發布前必須完成本地檢查。

## 基準與能力

- 初始工作樹乾淨；本地 main、遠端 main 與 release 都為 `9169a236b815d1a4e542c01742f5fec71d52171e`。
- 無可呼叫的 Context7 或已管理的 ctx7 CLI；第三方介面以 React 與 React Router 官方文件核對。
- 醫學原稿已對照原始資料核對，必要更正隨正文記錄。

## 驗證

標籤功能整合後，所有下列非瀏覽器 gates 已在同一程式樹重新執行：

- passed：`pnpm format:check`、`pnpm lint`（零警告）、`pnpm typecheck`、`pnpm test`（14 files、113 tests）、`pnpm build`（36 routes、29 sitemap entries、146 artifact files、所有本地連結有效，initial JS gzip 143.8 KiB）。
- passed：新片段的 HTML 元素巢狀、12 章永久錨點、所有頁內連結、單一 h1、統計口徑及來源限制的單元檢查。
- blocked：隔離 Chromium（保留 browser sandbox）在一般與已核准的升級執行中均無法建立 IPC socket，回報 `Operation not permitted`。
- blocked：雲端 Chrome 對 loopback preview 回報 `net::ERR_BLOCKED_BY_CLIENT`。未繞過限制、停用 browser sandbox 或建立替代通道；任務 preview server 與 tab 已關閉。
- not_run：84 個 Playwright、axe、320–1920 px 截圖檢視與互動驗收。沒有把 source／build 通過宣稱成 browser 通過。
- 安裝：首次 frozen install 的執行回報曾為 approval review cancelled；確認程序已結束且依賴未完整後，同一路徑的一次有界重試成功，exit 0，403 個鎖定依賴。未修改 manifest、lockfile 或全域設定。

本紀錄完成於候選提交前。2026-10-05 使用者已明確接受先透過 release 發布，再於正式網站檢查的方案，包含版面或互動問題可能先上線才被發現的風險。發布結果應以 main／release 的實際 Git 物件、該 release commit 的部署工作與正式網站驗證為準；本紀錄不把發布前未完成的瀏覽器檢查記成通過。


## 醫學內容核對

來源核對與整合結果：

- CBTRUS 2018–2022 cohort 的 6.86／10 萬人年、22.2% 與 52.2% 保留，補上全齡、美國、分母、不含轉移及 WHO 2016 登錄分組限制。
- 神經元低分裂活動改為生物學背景，沒有宣稱是腦癌較少的已確立原因。
- 分類樹明確包含室管膜腫瘤；IDH-wildtype 不單獨等於 GBM；成人型／兒童型並非絕對年齡限制。
- 原稿解剖圖的腦下垂體標記位置不正確，改為組織／腫瘤關聯概念圖。診斷圖改為可縮排、可離線閱讀的語意流程。
- 移除無量測依據的 78% grade 進度條及裝飾狀態色；警訊保留並補 NHS 一手來源。
- 新增 NINDS、NCI ependymoma 與 cIMPACT-NOW 資料連結；本文列明資料核對日期，未新增個人診斷或治療方案。

來源已隨正文保存。原始附件沒有修改。


## 標籤與搜尋

- 目前四篇公開筆記的標籤位於 h1 正下方；未發布的部落格文章在發布後使用相同版位。既有草稿沒有因此公開。
- 止痛藥：醫學、藥理學、止痛藥、用藥安全。腦腫瘤：醫學、病理學、腦與中樞神經腫瘤、膠質瘤。
- P2P 架構筆記：P2P、架構設計、網路通訊。P2P 隱私筆記：P2P、隱私、資安。
- 標籤連結開啟全站精確 `tag` 篩選，可併用文字及內容類型；支援三語標籤／別名、清除、URL 歷史與未知標籤空結果。
- 搜尋索引只取實際發布標題下的標籤；完整 taxonomy 留在建置端。缺少、重複或未知筆記標籤會阻止 content validation；文章 schema 要求 1–4 個標籤。
- 已核對產物索引：`medicine` 對應兩篇醫學筆記、`p2p` 對應兩篇網路筆記；不存在的標籤回傳零結果。


## 相容性複查與修正

- 舊 analgesics 入口原先沿用通用搬移頁；複查發現沒有 JavaScript 時可能遺失原本的章節目的地。現在舊入口保留完整靜態正文與全部原錨點，canonical 指向新藥物分類頁並設 noindex；只有 JavaScript 啟用時才帶原 fragment 轉址，沒有 meta refresh。產物檢查會逐一比對全部錨點。
- 更新搜尋 E2E 的公開筆記數量，改由兩份筆記 metadata 合計，不硬編碼成舊有三篇。
- 醫學子分類的預覽 buffer 保持緊接 note 區域，不落到 Paper Daily 後方；新增 SSR regression test。
- 上述修正後已重新執行所有非瀏覽器 gates（format、lint、typecheck、113 unit、build 與 artifact checks 全部通過）；實際瀏覽器驗收仍保留 blocked / not_run，不以 source 檢查替代。
