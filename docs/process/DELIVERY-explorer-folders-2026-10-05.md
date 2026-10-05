# 左側資料夾真正收合

狀態：實作、獨立 source review 與全部非瀏覽器 gates 完成；尚未提交或發布。紀錄來源為 `bootstrap_manual`／`agent_reported`；本環境沒有已安裝的 project-workflow engine。

## 範圍與基準

- 修正左側檔案樹內的資料夾箭頭，使它收合全部子項，而不是跳轉分類頁。資料夾名稱仍保留分類導覽。
- 遠端 main／release 基準：`15792fdbbb7102fbc81e88da108819dcd3a6fa70`。新分支 `fix/explorer-folder-collapse` 由此建立。
- 原本 local main／release 的 `db3ce2727c09129de3bd3b1f9103219d6b709b27` 保留不動；兩個基準的 tree 一致。
- 不修改先前醫學內容、標籤、搜尋、路由、整個 Explorer 的開關或發布流程。

## 重現與根因

2026-10-05，在 dot 雲端 Chrome 的正式腦腫瘤筆記頁、1180×757 畫面重現。六個資料夾箭頭都只是 `<a>` 裡的 SVG；沒有 disclosure 按鈕或 aria-expanded。點「醫學」箭頭會到 `/zh-hant/note/medical/`，六個子清單仍為 display:block，腦腫瘤連結仍可見。已檢視截圖，重現用 tab 已關閉。

## 實作

- 每個資料夾各自擁有記憶體中的展開狀態；功能性 state updater 支援連續切換。
- 原生按鈕與分類連結分開；按鈕提供三語名稱、tooltip、aria-expanded 及唯一 aria-controls。
- 使用 hidden 收起整個後代清單，移出畫面、鍵盤序與 accessibility tree，但保留子資料夾本身的 React state。
- 箭頭與資料夾圖示跟隨狀態；按鈕有 hover、active 與 focus-visible，沿用既有 tokens。
- 預設展開並保留 requires-js 規則：沒有 JavaScript 時全部內容及分類連結仍可讀。

## 能力與待驗證

- Context7 MCP 與已管理的 ctx7 CLI 均不可呼叫；本次核對 [React useState](https://react.dev/reference/react/useState)、[React useId](https://react.dev/reference/react/useId) 與 [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) 官方文件。
- 先前已確認本環境隔離 Chromium 被 IPC 權限阻擋，dot 雲端 Chrome 被禁止讀 loopback。此次不重試、不停用 browser sandbox、不建替代 tunnel。
- 新增 SSR 結構回歸及 Playwright 的巢狀、重複操作、鍵盤焦點、導航、語言切換、抽屜、無 JavaScript 與 axe cases。
- passed：`pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`，在 repo root 的 dot 雲端既有環境 exit 0。ESLint 零警告；15 files、117 unit tests；36 prerendered routes、29 sitemap entries、146 artifact files；全部本地連結有效；initial JS gzip 144.0 KiB，低於既有 150 KiB 預算。
- passed：`pnpm exec vitest run tests/unit/explorer.test.ts`，4 個 SSR 結構回歸；檢查六個 disclosure／導航分離、三語、全開初始 HTML、desktop／drawer 12 個唯一 IDs 與目前文章標記。
- passed（僅收集）：`pnpm exec playwright test --list`，91 tests／11 files，其中新增的 7 個 case 能正常載入。這不代表 E2E 執行通過。
- passed：獨立唯讀 source review 未找到具體缺陷；`git diff --check` 無空白問題。Review 沒有把 SSR／build 當成互動證明。
- blocked／not_run：修改後真實 Chromium 操作、7 個新 E2E、全套 91 E2E／axe、320–1920 px 驗收。沿用上述已確認的 IPC／loopback 限制，未重試或繞過。

## 恢復點

候選 patch 留在 `fix/explorer-folder-collapse`；只改 Explorer、三語介面字串、對應 CSS、兩個回歸 test 檔與本紀錄。非瀏覽器 gates 的程式快照已完成，之後僅補充本紀錄。主線已核對使用者既有的提交／合併 release／推送指示及先發布再驗證的同意。下一步只提交上述範圍；發布後要在正式站驗證箭頭、父子層級、快速重複、鍵盤焦點、分類導覽與語言切換。未經授權不提交或推送；不改寫保留的 local main／release。
