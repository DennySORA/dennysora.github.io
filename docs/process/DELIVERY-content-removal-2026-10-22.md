# 2026-10-22 移除已搬遷的 AI／影片內容

## 範圍與結果

初次交付只在雲端工作副本修改，當時未 commit、push、建立 PR 或部署。基準 commit：`a09f9b434ce537ca634bb759bdd8a4ce37d639cf`。

- 移除 AI 區域、H3 DiT 比較、Video Console、三語模型研究文章，以及對應三語文案、素材、媒體紀錄、分類、標籤與搜尋入口。
- 移除 Paper Daily 連結、研究橋接頁及舊 `papers/`、`detail/research/` 轉址，不臆測新站位置。
- 三語首頁履歷與專案資料移除 AI／Agent 推廣；兩篇保留的工程草稿僅保留一般工程、雲端與平台內容，仍不公開。更新來源雜湊與保留章節錨點，歷史來源 commit 與 SHA 不改寫。
- 保留四個導覽區域、14 篇筆記的 42 個完整語言版本、dgxtop 與其他無關內容。攝影構圖圖例和一般系統監控範例不因製作工具或程序名稱而刪除，生成圖來源標示維持真實。
- 部落格目前沒有公開文章，保留三語空狀態及前往筆記的連結。已搬遷頁面回傳 404，不再出現在導覽、RSS、sitemap 或搜尋索引。
- 通用媒體 renderer／驗證器與對應隔離測試保留；兩份公開媒體 registry 均為空。未操作外部媒體資料集。

## 已觀察驗證

- passed：鎖定依賴安裝；lockfile、版本 pin、部署設定未修改。
- passed：Prettier 格式、零警告 ESLint、React Router typegen 與 TypeScript。
- passed：23 個 unit test 檔，174 個測試；保留一般路由 404、來源、翻譯、錨點與媒體驗證契約，新增移除內容不再公開的斷言。
- passed：內容檢查，兩篇未公開草稿、42 份筆記語言版本、104 個預渲染路徑。
- passed：production build、搜尋產物和靜態 artifact 檢查，100 個 sitemap 路徑，390 個產物檔案，所有同源連結有效；首頁初始 JS gzip 143.7 KiB。
- passed：產物沒有被移除的路徑、`.data` payload、專屬素材或舊 AI 轉址；三語頁面與搜尋資料未殘留被移除文章的識別字。
- not_run：瀏覽器、Playwright／axe、實際視覺與手機互動驗收，本次未獲明示執行授權。受影響 E2E 測試已更新並通過型別檢查，但不宣稱其執行通過。
- not_run：GitHub Actions、正式網域及遠端部署驗收；線上網站不會因本機修改而變更。

環境：Node 24.19.0 符合 repo 範圍；已安裝的 pnpm 是 11.25.0，repo pin 是 11.6.0。Corepack 的離線快取沒有 pin 版本；未為此更改專案版本或 lockfile。

## 復原與下一步

刪除內容仍在基準 Git 歷史中，可用反向 patch 復原。交付原始碼封存及完整 binary patch；套用時須使用上述基準或先核對差異。若要正式發佈，需要另行明示授權。瀏覽器驗收是尚未完成的驗證範圍。

## 發布前補充

擁有者於同日另外授權 push 並合併至既有 `release`，亦確認此次提交身分與雲端瀏覽器驗收；沒有變更全域 Git 設定。重新取得遠端分支後，`main` 與 `release` 均仍在上述基準，沒有需合併的他人變更。依 repo 契約先更新 `main`，再 non-force fast-forward `release`，由既有工作流程建置並部署。

重新執行格式、lint、typecheck 及差異檢查均通過；交付後程式碼與先前 174 個單元測試通過時相同，只有本文及內容流程文件補充。

瀏覽器驗收實際嘗試使用雲端已安裝的 Chromium 155，並以暫時設定覆寫預設 Google Chrome channel；沒有安裝軟體或更改 repo 的 Playwright 設定。103 個案例中，3 個 HTTP-only 案例通過，其餘 100 個在瀏覽器啟動階段因環境的本機 socket 限制而無法執行，並非頁面斷言失敗。支援的提升權限路徑也在建立執行環境時失敗；另一個雲端瀏覽器無法連到工作副本的 loopback preview。因此 Playwright／axe 與畫面檢查仍為 blocked，不宣稱完整 `pnpm verify` 通過。

擁有者已明確同意本次發布略過上述受環境阻擋的瀏覽器／畫面門檻，先依已通過的靜態、單元與建置驗證發布，再核對 GitHub Pages 工作流程及線上內容。此例外僅限本次發布，既有測試設定與日後發布門檻不變；互動及版面仍有未經瀏覽器驗證的剩餘風險。
