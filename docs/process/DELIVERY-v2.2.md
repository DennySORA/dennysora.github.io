# 2026-09-27 編輯器工作台改版（v2.2）交付紀錄

依據：擁有者 2026-09-27 的指示——首頁應是自我介紹頁，要有 Logo 與履歷，再切換到部落格；論文日報直接轉到論文網站，不要獨立頁面；整體更有程式風格，像 vim 或 VS Code。

這些指示取代 [v2.1 規格](DELIVERY-v2.1.md)中的三項決定：移除全站 IDE 外框、首頁與 About 分開、站內 `/papers/` 頁。其餘 v2.1 契約不變：semantic dark tokens、三語、靜態發布、Pagefind 搜尋、留言設定、無第三方請求、真 404、舊網址與無 JavaScript 可讀。

擁有者於 2026-09-27 看過本機預覽後，指示直接 commit 到 `main`、push 並部署；部署結果記錄在 [FOLLOW-UP-v2.1.md](FOLLOW-UP-v2.1.md)。

## 設計契約

- **任務**：訪客先認識作者（首頁 `README.md`：Logo、基本資料、簡介與履歷），再切到部落格或專案；論文日報是外部網站。
- **外框**：VS Code 式工作台。標題列放品牌、搜尋入口（command center）與語言；活動列放圖示快捷連結；檔案總管列出真實的頁面與文章；編輯器分頁是主要導覽，文章等內頁以斜體預覽分頁顯示目前檔案；麵包屑顯示路徑；vim 式狀態列顯示模式、分支、檔案路徑與位置。
- **捲動**：文件本身是唯一捲動者，外框用 sticky／fixed，因此連結、頁內搜尋、上一頁與錨點都照常運作。
- **內容**：每頁呈現為開啟中的 Markdown buffer——左側行號、`#` 標題標記、YAML front matter、`//` 註解、vim 的 `~` 結尾列。行號用 CSS counter，以空的替代文字對輔助科技隱藏；所有行號共用同一個 buffer 作定位基準，巢狀內容也對齊同一欄。
- **字體**：外框、標題、標籤與中繼資料用系統等寬字體（CJK 落到系統字體）；長文正文維持無襯線字體。不下載外部字型。
- **色彩**：沿用 v2.1 tokens，新增 6 個工作台層級（`chrome`、`sidebar`、`tab-inactive`、`gutter`、`syntax-marker`、`entity-folder`），在 [tokens.css](../../src/styles/tokens.css) 標明為本地新增，對比由單元測試保護。
- **狀態列只顯示真實資訊**：模式跟隨文字輸入焦點（NORMAL／INSERT）；位置跟隨捲動（Top／NN%／Bot／All）；`main` 連到本站 repository。
- **寬度**：≥1100px 為活動列＋檔案總管＋編輯器；768–1099px 為活動列＋編輯器，檔案總管改成左側抽屜；<768px 為標題列、可橫捲的分頁、內容與頁尾的狀態列，行號隱藏。
- **不做**：模擬終端、攔截一般字母鍵（只保留 `/` 與 Ctrl/Cmd+K）、新增依賴。

## 變更

- **路由**：各語言首頁即 README（履歷＋Logo＋最近的文章）。`/<locale>/about/` 改為保留錨點的轉址頁（`/en/about/#exp-h` → `/en/#exp-h`），舊單頁錨點也改指首頁。`/<locale>/papers/` 改為立即轉到 <https://paper.dennysora.me/> 的頁面（`noindex`、不在 sitemap）；分頁、檔案總管、活動列、頁尾與 `/research/` 導引都直連外站。
- **品牌**：首頁大型 Logo 使用 `assets/logo-hero.webp`／`@2x`，由 `logo_full.png` 只修掉左右透明欄、縮放為 WebP，記錄在 [brand-assets.json](../../data/brand-assets.json)。母檔沒有 `logo.png` 的白色外框，所以用背景光暈襯托，不對圖片套濾鏡。
- **命名**：「文章與研究」改稱「部落格」（Blog／ブログ）。
- **移除**：站內論文日報頁；只供該頁使用的快照資料、匯入器、schema、測試與 `research:import` 指令；舊的 Home、About 與 Header 元件；因此不再使用的 43 個翻譯字串。

## 驗證

| 指令或檢查 | 結果 |
|---|---|
| `pnpm verify`（format、lint、typecheck、unit、build、e2e） | passed：66 個 unit、53 個 Playwright（含 axe），build 產生 68 條路由、55 條進 sitemap，搜尋索引三語各 3 篇 |
| initial JS gzip | 136.5 KiB（預算 150 KiB） |
| `git diff --cached --check` | passed |

Chrome 實際檢視（production build，loopback 預覽）：1280×800、1440×900、1920×1080、768×1024、390×844、320×720 的首頁（三語）、部落格、文章、專案、Tag 索引、404；以及手機檔案總管抽屜、搜尋命中時的 INSERT 模式、語言選單與鍵盤焦點。

檢視時發現並修正：

- 兩欄段落的行號在同一欄重疊，改為單欄。
- 手機分頁列裡的隱藏標籤撐寬頁面（390px 時頁寬 606px），改由分頁列自己作為定位基準。
- `~` 結尾列原本用 opacity 淡化，改用實色 token。
- 過長的 front matter 值原本換到鍵的下一行，改為在鍵旁換行。
- 換行的按鈕列行號原本置中，改為對齊第一列。
- 頁面完成 hydration 前按 `/` 不會觸發；快捷鍵生效後在 `<html>` 標記 `data-keys="ready"`，測試等它再按鍵。

## 仍未完成

待擁有者決定的事項見 [FOLLOW-UP-v2.1.md](FOLLOW-UP-v2.1.md)。真實作業系統輸入法與真實瀏覽器 200% 縮放仍未實測（與 v2.1 相同）。
