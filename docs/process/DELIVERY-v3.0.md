# 2026-10-04 Moonlit Vim 改版（v3.0）交付紀錄

依據：擁有者 2026-10-04 的指示——上一版（v2.2 編輯器工作台）太醜，重新設計成 vim 風格、要有工程師的專業感，多用圖示與圖片（以 Codex 生成），並撰寫一份文件，要求之後加入的東西都依照這個設計風格。

這次改版取代 [v2.2](DELIVERY-v2.2.md) 的 VS Code 式外框（標題列、活動列、編輯器分頁、麵包屑）。其餘契約不變：三語、靜態預渲染、Pagefind、留言設定、無第三方請求與 storage、真 404、舊網址與無 JavaScript 可讀、品牌圖不改。

擁有者於 2026-10-04 看過本機預覽後，指示 commit 到 `main`、合併進 `release` 並推送。推送 `release` 會由 GitHub Actions 建置並部署；部署結果不在本紀錄內。

## 設計契約

完整、具約束力的規則在 [docs/DESIGN.md](../DESIGN.md)，[PROJECT_AGENT.md](../../PROJECT_AGENT.md) 已改為指向它。摘要：

- **主張**：Moonlit Vim，把網站呈現成一個 Neovim 工作階段。借用 vim 的元素，不模擬終端機；閱讀優先；只顯示真實的事實。
- **外框**：tabline（檔案樹收合鈕、品牌、buffers、搜尋、快速連結、語言）→ neo-tree 檔案樹 → winbar 路徑 → 帶行號的 Markdown buffer → lualine 式狀態列（powerline 箭頭）→ Vim 命令列。
- **模式**：NORMAL；焦點在文字欄位時為 INSERT（命令列顯示 `-- INSERT --`）；頁面有選取文字時為 VISUAL（`-- VISUAL --`）。
- **色彩**：改用 Noir Workbench 的 canonical 色票，對應到既有 token 名稱；本地新增 `entity-folder`、`gutter`、`syntax-marker`、`syntax-constant`、`overlay-scrim`，並補上 `surface-overlay`、`border-subtle`／`strong`、`text-disabled`、`action-active`、`danger-fill` 等角色。
- **字體**：中文與日文正文、標題改用 sans；等寬字只用在外框與機器值（v2.2 的標題用等寬字）。
- **圖示**：圖示優先，`Icon.tsx` 擴充為 53 個原創 SVG 圖示，並依檔案種類上色（Markdown 青綠、資料夾藍、外部網站紫）。
- **插圖**：星座線稿風格，5 張以 Codex 生成，用在空狀態、404、搜尋與筆記集合。

## 改版前的檢視（基準）

先建置原版並在 Chrome 截圖（1440×900、390×844），再做判斷：

- 外觀是 VS Code 的複製品，只有狀態列與 `~` 有 vim 的味道。
- 活動列的 3D 光澤點陣圖示與扁平的編輯器外框材質衝突，28px 時糊成一團。
- 活動列、檔案總管與分頁三處重複列出相同的四個目的地，約佔 330px 寬。
- 亮青色的主要按鈕與圓角卡片像網頁模板，不像工具。
- 部落格（目前沒有文章）只剩置中的一句話；筆記索引是兩張只有標題的卡片；搜尋頁是一般網頁表單加原生下拉選單。
- 等寬字標題混入 CJK 備用字，行號離換行的段落很遠。

## 變更

- **外框**：新增 `TabLine.tsx`、`WinBar.tsx`、`StatusLine.tsx`、`file-icons.ts`、`link-icon.ts`；改寫 `SiteLayout.tsx`、`Explorer.tsx`、`Buffer.tsx`、`PageHead.tsx`、`Icon.tsx`。刪除 `ActivityBar.tsx`、`TitleBar.tsx`、`EditorHead.tsx`、`StatusBar.tsx`，以及沒有被引用的 `SiteFooter.tsx`。檔案樹收合鈕移到 tabline（只剩一個收合鈕）。
- **頁面**：
  - 首頁 README：front matter、開始選單（部落格、筆記、搜尋、論文日報，提示為路徑或真的按鍵 `/`）、Logo 改放在影像預覽浮動視窗；能力改為以縮排導引線分組；經歷改為 `git log` 樣式，標示 `HEAD` 與 `+--` 摺疊列。
  - 部落格空狀態：插圖加上「瀏覽筆記」「前往論文日報」等下一步。
  - 筆記索引：改為資料夾預覽卡片（插圖、說明、檔案列表、數量、語言）。
  - 網路筆記資料夾：加上特徵插圖。
  - 醫學封面：加上浮動視窗外框。
  - 搜尋頁：Telescope 式提示列、結果視窗與類型圖示。
  - 404：加上 `E404` 診斷晶片與插圖。
- **樣式**：重寫 `tokens.css`、`layout.css`、`buffer.css`、`components.css`、`pages.css`、`prose.css`；更新 `base.css`、`medical.css`、`network-notes.css`、`print.css`；新增強制色彩模式的處理。
- **文字**：新增三語字串 `quickLinks`（取代 `activityBar`）、`explorerCollapse`、`explorerExpand`、`emptyFolder`、`browseNotes`，以及筆記集合的數量與醫學說明。
- **建置**：轉址頁的內嵌樣式改用新色票；產物檢查改為驗證 `data/illustration-assets.json` 裡每一張插圖的 SHA-256，並拒絕沒有紀錄的插圖。
- **無 JavaScript**：搜尋頁的說明從 body 的 `<noscript>` 改為站內既有的 `no-js-only` 寫法（理由見下方「測試調整」）。
- **移除**：`assets/illustrations/navigation-icons-v1.png`（3D 活動列圖示）與它的紀錄 `data/navigation-assets.json`，歷史仍可在 Git 查到。
- **文件**：新增 [DESIGN.md](../DESIGN.md)；更新 PROJECT_AGENT.md、README.md 與 CONTENT_WORKFLOW.md 中描述舊外框的段落。

## 生成圖片（Codex）

依設計 skill 的範圍化 Codex 路徑執行。前置條件：codex-cli 0.160.0、已登入、非巢狀呼叫。每次只生成一張，依序呼叫 `codex exec --cd <私人暫存目錄> --skip-git-repo-check --sandbox workspace-write --ephemeral --json -`，只送出主題、調色盤、尺寸與透明度的 brief，不送原始碼。5 次呼叫都沒有錯誤或額度訊息，各約 57–75 秒。

| 檔案 | 透明度驗收 | 最終 bytes |
|---|---|---|
| `collection-network-v1.webp`（192×192） | 通過 | 16780 |
| `collection-medicine-v1.webp`（192×192） | 通過 | 14464 |
| `search-telescope-v1.webp`（240×240） | 通過 | 16254 |
| `empty-blog-v1.webp`（640×477） | 通過 | 43710 |
| `not-found-v1.webp`（720×246） | 通過 | 21396 |

驗收內容：解碼為 RGBA、四角與外框 4% 區域的 alpha 最大值為 1、主體四周有留白，並在 `#0c1118`、白色、洋紅色三種背景上目視合成，沒有白邊、光暈、底板或矩形。之後依主體裁切、在預乘 alpha 下縮放到 2 倍顯示尺寸，再轉成 WebP，並對最終 bytes 重跑驗收。

`empty-blog` 的原始 PNG 在完全透明的像素底下帶有光暈色，合成時看不見，經預乘縮放與 WebP 編碼後已清除。Codex 送來的望遠鏡原圖是 1254×1254，它自己先等比縮成 1024×1024，沒有變形。原始輸出與暫存目錄在驗收後刪除；SHA-256、brief 摘要與 brief 的 SHA-256 記錄在 [illustration-assets.json](../../data/illustration-assets.json)。

## 驗證

| 指令或檢查 | 結果 |
|---|---|
| `pnpm verify`（format、lint、typecheck、unit、build、e2e） | passed：105 個 unit、76 個 Playwright（含 axe WCAG 2.2 AA）；build 產生 29 條路由、22 條進 sitemap，產物檢查 131 個檔案 |
| initial JS gzip | 142.5 KiB（改版前 140.2 KiB） |
| Context7 | `ctx7` 0.5.12 查詢 React Router 的 memory router；文件只回傳 data router 版本，宣告式 `MemoryRouter` 的參數改以已安裝的 react-router 8.4.0 型別定義確認 |

Chrome 實際檢視（production build，loopback 預覽），截圖都已逐張檢視：

- 1280×800：首頁、日文部落格、搜尋、P2P 筆記。
- 1440×900：首頁（中文、日文）、部落格、筆記索引、網路資料夾、醫學資料夾、兩篇長筆記、搜尋、research 轉址、404。
- 1920×1080：英文首頁、筆記索引、404。
- 1024×768：日文首頁。
- 768×1024：筆記索引、P2P 筆記。
- 390×844：首頁、部落格、筆記索引、手機抽屜、頁面底部。
- 320×720：首頁、搜尋。

狀態：INSERT（輸入搜尋）、VISUAL（選取文字）、收合檔案樹後內容置中、鍵盤焦點在 buffer 上、語言選單展開、手機檔案樹抽屜；程式碼區塊、表格、callout 與公式以測試 fixture 檢視。

檢視時發現並修正：

- 狀態列右側的位置段（Top）文字幾乎看不見：`.status-item` 的 `color: inherit` 在疊層順序上蓋過深色字，改為提高選擇器權重。
- `utf-8` 被位置段的 powerline 箭頭蓋住，改為讓箭頭落在留白裡。
- 開始選單的行號比項目高 4px：列高 36px，但行框只有 28px。改為讓列的 line-height 等於列高。
- 筆記索引兩張卡片並排，行號 3 與 4 疊在同一處。改為整個網格只編一次號。
- 檔案樹的「（空）」用了斜體，中文會變成假斜體，已移除斜體。
- `medical.css` 與 `network-notes.css` 殘留舊的資料夾頁規則，而且載入順序較晚，蓋過新版樣式。已刪除，改由 `pages.css` 統一負責。
- 醫學封面原圖有大片深色底，恢復只顯示插圖帶的裁切；這張不是品牌圖。
- 手機上換成兩行的職稱，圖示會置中在兩行之間，改為對齊第一行。

## 測試調整

- **為新外框改寫**：design tokens（新色票與對比契約）、語意色、狀態色清單、對比檢查的選擇器、buffers（原 `.tabs`）、`.tabline` 的 Logo 高度 30px、tabline 快速連結、首頁行數（56 → 59，移除 1 行主要按鈕、加入 4 行開始選單）。
- **取代已刪除的元件**：活動列的測試改為檢查 tabline 的 buffers、快速連結名稱，以及不再出現點陣圖導覽圖示；活動列搜尋的測試改為首頁開始選單的搜尋。
- **hover 讀值**：減少動態模式下仍有 0.01ms 的過渡，立即讀色會讀到舊值，改用會重試的 `toHaveCSS`。
- **搜尋結果**：筆記索引現在列出筆記標題，搜尋「Ibuprofen」時資料夾頁也會正確命中，所以測試改為以筆記自己的連結定位結果。
- **無 JavaScript 說明**：body 裡 `<noscript>` 的內容在 Chrome 的無 JavaScript 模擬下仍被瀏覽器樣式隱藏，原版也重現同樣的失敗，屬於既有問題。改用站內既有的 `no-js-only` 寫法後通過。

## 仍未完成或未驗證

- **未實測**：真實瀏覽器 200% 縮放、真實作業系統輸入法、Windows 高對比（forced-colors）的實際畫面、Windows／Linux 的字體呈現。強制色彩模式只有 CSS 規則，沒有截圖驗證。
- **既有風險**：全站單一按鍵 `/` 開啟搜尋的快捷鍵，沒有 WCAG 2.1.4 要求的關閉機制。這次沒有新增任何單一按鍵快捷鍵，也沒有改變它；是否加入關閉開關由擁有者決定。
- **文章頁**：目前沒有公開文章，文章閱讀頁只透過測試 fixture 檢視排版，沒有以真實文章檢視。
