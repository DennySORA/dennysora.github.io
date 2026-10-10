# 專案／工具分類與 dgxtop 架構說明頁

狀態：路由、目錄、內容、插圖、測試與文件已完成；`pnpm verify` 與 Chrome 截圖檢視已執行，唯一失敗為既有的醫學筆記測試（見驗證）。擁有者要求完成後直接發布：commit 到 `main`，再 fast-forward `release` 觸發部署。

## 範圍

- 依 2026-10-11 指示，新增「專案／工具」：`/{locale}/projects/` 與 `/{locale}/projects/tools/` 三語都有。2026-10-03 移除的 Projects 頁以「資料夾＋專案頁」的新結構回來；舊的扁平網址 `/<locale>/projects/dgxtop/` 與 Privacy 仍是 404。
- 第一個專案頁是 dgxtop 的架構與設計說明，依擁有者指示只有繁體中文與英文：`/zh-hant/projects/tools/dgxtop/`、`/en/projects/tools/dgxtop/`。日文目錄列出這頁、標示沒有日文版，並以 `hreflang="en"` 連到英文版。
- 內容依據 dgxtop repository（`spec/dgxtop-v2/`、README、`docs/process/v2-rewrite/`、`docs/validation/`，2026-10-11 核對）：重寫原因（F1–F10）、六元件與兩條路徑、adapter host 隔離、來源仲裁、精確歷史、受保護的程序終止、256 MiB 預算與過載狀態、crate 邊界、驗證狀態與取捨。效能數字一律寫成目標，驗收狀態照實寫（12 PASS、24 NOT_RUN、4 BLOCKED）。

## 結構與設計

- 單一來源：[`src/lib/project-pages.ts`](../../src/lib/project-pages.ts) 登記分類、各頁的 `editions`、`tagIds`、標題、摘要與截圖清單；路由、檔案樹、tabline、winbar、sitemap、搜尋與語言切換都由它與 `route-manifest.ts` 推導。
- 外框：tabline 新增第五個 buffer `projects`，檔案樹新增 `projects/` → 工具 → `dgxtop.md`。DESIGN.md 的外框圖、插圖表、守護測試清單同步更新。
- 目錄頁沿用集合卡片配方；`Collection` 從 `Notes.tsx` 移到 `src/components/Collection.tsx`，每個檔案帶自己的語言（筆記仍是 `zh-Hant`）。
- 插圖：`collection-tools-v1.webp` 依 DESIGN §7 用 Codex 生成一次、一次通過驗收（RGBA、外框 4% alpha 最大 0、主體四周留白、疊在三種底色上無白邊），處理成 192×192 WebP（10,622 bytes），紀錄在 `data/illustration-assets.json`。
- 圖表：七張 `.dg` 圖都是真正的文字（清單＋一張內嵌 SVG 時間軸），只用 token class；資料路徑 `entity-file` 實線、控制路徑 `entity-kind` 虛線，不用狀態色。新增「專案截圖」「專案架構圖」兩個元件配方到 DESIGN §9。README 用的 Codex 架構圖有文字與不透明底，不符合 §7，因此沒有放到網站。
- 截圖：7 張 dgxtop 實機截圖（DGX Spark GB10 與 RTX 5080 + RTX 3060 工作站），GPU 序號與 UUID 已用不含原始像素的馬賽克遮蔽，轉成無損 WebP（31–45 KB），放在 `assets/projects/dgxtop/`，只有頁面列出的檔案會被建置複製。第一張 eager、其餘 lazy，皆可開原尺寸。
- 效能：專案頁的文字與圖表是獨立 chunk，只在專案網址載入；初始 JS 由 146.7 KiB 變為 148.8 KiB（上限 150 KiB）。預先渲染先等這個 chunk（`loadProjectPageModule()` 設好 `status`／`value`，`use()` 同步取得），並把 `progressiveChunkSize` 設為無限大，避免 React 把大型 Suspense 內容移到隱藏區塊再用 inline script 換回；靜態 HTML 因此有完整內容，沒有 JavaScript 也能讀，搜尋索引也讀得到正文。
- 捲動區域：表格與 SVG 的可聚焦捲動區域集中在 `ScrollRegion`（與 Markdown 表格相同的 `role="region" tabindex="0"`），只有這個元件停用 `jsx-a11y/no-noninteractive-tabindex`，並寫明理由。

## 驗證

2026-10-11 在最終內容上執行：

- passed：`pnpm verify` 的 Prettier、ESLint（零警告）、typecheck、Vitest（17 files、136 tests，含新的 `tests/unit/projects.test.ts` 15 項）、build（51 routes、44 sitemap entries、186 artifact files、所有本地連結有效，initial JS gzip 148.8 KiB）。
- passed：新的 `tests/e2e/projects.spec.ts` 3 項（tabline → 專案 → 工具 → dgxtop、章節連結、語言切換、截圖解碼、無第三方請求／cookie／storage；日文 404 與英文版連結；320、390、768、1280、1440、1920 px 無水平溢出；axe WCAG 2.2 AA 零違規；無 JavaScript 時正文完整、沒有 `template` 或 `hidden` 區塊）。
- passed：配合新區域更新的既有測試（`site-simplification`、`explorer`、`workspace`、`simplification.spec`、`site-search.spec`、`site.spec`、`layout.spec`、`explorer.spec`）。Privacy 與舊扁平網址仍斷言為 404。
- passed：Playwright 全套 96 項中的 95 項。
- failed（既有問題）：`medical-notes.spec.ts` 的「brain guide … readable without JavaScript」，錯誤與改動前的基準執行相同（`locator.click: Test ended`，等待 `.medical-toc` 的「來源」連結），也記錄在 [硬體分類的交付紀錄](DELIVERY-hardware-2026-10-10.md)；未在本次範圍內修改。
- passed：Chrome（Playwright）截圖檢視：dgxtop 英文頁 1440 px 全頁、繁中頁 390 px、英文專案目錄 1440 px、日文工具資料夾 390 px。檢視時修正：連結尾端圖示被 preflight 換行、crate 與仲裁步驟格線的孤行、時間軸上方空白、標題下方間距、預先渲染時大型 Suspense 被移出 `main`。
