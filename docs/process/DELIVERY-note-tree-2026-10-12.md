# 筆記資料夾重新分類

狀態：程式、內容搬移、三語資料夾文字、文件與測試已完成，並在本機驗證（結果見文末）。擁有者授權一起 commit、合併到 `release` 並推送（2026-10-12）。

## 範圍

- 依 2026-10-12 指示重新分類筆記：
  - 軟體／網路／P2P。
  - 健康與醫學：原本的「醫學」與「健康」合併，下分藥物、病理、日常照顧。
  - 其他：不再分子資料夾。
  - 硬體／電腦與日本／日語不變。
- 同一天的另一項指示：移除「繁體中文 · English · 日本語 · …」這類語言註記，因為之後所有內容都會有三種語言。移除的位置有筆記目錄、資料夾卡片、網路筆記資料夾頁與專案目錄；專案頁的 `projectEditionsLabel` 一併刪除。
- 依擁有者指示，把「所有內容都要同時提供繁中、英文、日文」寫進 `PROJECT_AGENT.md` 的必讀契約（Critical contracts 第一條），並刪除要求既有網址持續可用的契約（見「網址」）。

## 結構

- `src/lib/note-tree.ts` 是唯一的結構來源：12 個資料夾的上層、圖示與插圖，以及 14 篇筆記各自所屬的資料夾（`noteFolderOf`）。網址是資料夾路徑加上筆記 ID；路由、Explorer、麵包屑、檔名、sitemap、`content:check` 與搜尋都從這裡推得。
- `src/lib/note-tree.server.ts` 保存 12 個資料夾的三語名稱與介紹，並把整棵樹依目前語言組成 loader 資料。原本分散在 `network-notes.ts`、`medical-notes.ts`、`hardware-notes.ts`、`notes-copy.ts` 與 `note-collections.server.ts` 的分類文字都移到這裡。
- 路由：所有資料夾統一成 `note-folder` 一種路由。筆記保留各自的 renderer（網路、醫學、硬體、學習筆記），由 `noteRoute` 對應；`resolveNotePath` 只允許最後一段是筆記。
- 資料夾頁：`Notes.tsx` 改成通用元件，先列子資料夾卡片，再列直接放在這一層的筆記與摘要。`NetworkNotes.tsx` 刪除；清單的 class 從 `.network-note-list` 改名為 `.note-list`。
- 內容搬移（位元組不變）：`content/notes/health/lumbar-spine-care.html` 移到 `content/notes/medical/daily-care/`，`content/notes/other/photography/landscape-photography.html` 移到 `content/notes/other/`。對照檔不需要修改。

## 三語文字

新的或改寫的資料夾文字三語同時提供：軟體（Software／ソフトウェア）、網路（Networks／ネットワーク）、健康與醫學（Health & medicine／健康と医学，介紹保留「僅供教育用途」的聲明）、日常照顧（Daily care／日常のケア，介紹沿用原本「健康」的文字），以及其他的新介紹（不再提拍攝技巧分類）。P2P 沿用原本網路資料夾的介紹；藥物、病理、硬體、電腦、日本、日語沿用既有的三語文字。`note-tree.test.ts` 確認英文名稱與介紹沒有中日文字、日文沒有只屬於繁體中文的字形、英日介紹都不是照抄中文。

## 網址

- 新路徑：`/{locale}/note/software/`、`…/software/network/`、`…/software/network/p2p/`（兩篇 P2P 筆記在此層）、`/{locale}/note/medical/daily-care/lumbar-spine-care/`、`/{locale}/note/other/landscape-photography/`。藥物、病理、硬體與日語的網址不變。
- 擁有者決定不加轉址。舊的 `/{locale}/note/network/`、`/note/network/p2p-downloader/`、`/note/network/p2p-privacy/`、`/note/health/`、`/note/health/lumbar-spine-care/`、`/note/other/photography/` 與 `/note/other/photography/landscape-photography/`（三種語言共 21 個網址）現在回傳 404，也不再出現在 sitemap。
- 擁有者同時刪除 `PROJECT_AGENT.md` 的「Existing URLs keep working」契約（舊網址必須以轉址頁維持、已發布的章節錨點不可改），只保留「未知路徑回傳真正的 404」。既有的轉址頁不受影響，照常保留；止痛藥舊網址（`/zh-hant/note/medical/analgesics/`）的轉址目標也沒有改變。

## 測試

- 新增 `tests/unit/note-tree.test.ts`：頂層資料夾、每個資料夾與筆記在三種語言都能解析、往返、發布與載入；舊路徑與放錯資料夾的路徑都不是頁面；麵包屑、檔名、資料夾頁的卡片與筆記清單；資料夾文字的翻譯檢查。
- 既有的單元與 e2e 測試改用新的路徑與元件；沒有子資料夾的資料夾頁以筆記標題當連結，硬體與醫學的 e2e 流程改為依標題點選。

## 驗證

在最終整合後的工作樹上執行（2026-10-12）：

- `pnpm verify`：通過（結束碼 0）。依序包含：
  - `format:check`：全部符合 Prettier。
  - `lint`：0 個警告。
  - `typecheck`：通過。
  - `test`：20 個檔案、152 個測試全部通過。
  - `build`：`content:check` 驗證 42 個筆記版本與 107 個預先產生的路徑（12 個資料夾 × 3 種語言，比原本多 3 個），100 個進 sitemap；`check-artifact` 確認 378 個檔案與所有本機連結，首頁初始 JS gzip 142.9 KiB（上限 150 KiB）。
  - `test:e2e`：Chrome，107 個測試全部通過。
- 本機 `127.0.0.1` 預覽、Chrome：
  - 三種語言的 13 個資料夾頁與 4 篇搬移的筆記（共 51 頁）在 320、390、768、1280、1440、1920 px 都沒有水平溢出，也沒有 console 錯誤。
  - 21 個舊網址都回傳 404。
  - Explorer 的 33 個名稱，在側欄（1440 px）與抽屜（320 px）、三種語言下都沒有被截斷。
- 人工檢視截圖：
  - 1440 px：日文筆記目錄、日文健康與醫學、繁中 P2P、英文其他。
  - 390 px：繁中日常照顧、日文其他、英文軟體。
  - 確認子資料夾卡片、筆記清單、目前路徑在 Explorer 展開、狀態列與麵包屑都正確。
- 未執行：公開網址上的檢查。這份紀錄寫在發布之前，部署後的檢查不在紀錄內。
