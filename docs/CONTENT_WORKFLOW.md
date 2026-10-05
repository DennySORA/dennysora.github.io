# 寫作、翻譯與發布

## 內容來源

文章的單一來源是 `content/posts/<id>/meta.json` 與同目錄 `<locale>.md`。語言值為 `zh-hant`、`en`、`ja`；完整欄位契約以 [schema](../src/lib/schema.ts) 為準。請從既有文章複製欄位結構，填入真實 id、slug、作者、日期、分類、來源，不要沿用另一篇文章的來源證據。

「文章與研究」是同一個人工內容庫，以三個互不混用的維度整理，定義在 [`content/taxonomy/`](../content/taxonomy/)：

- `topics`：主要領域（`engineering`、`systems`、`ai`），ID 固定，只調整顯示名稱。
- `contentType`：寫作形式（`essay`、`tutorial`、`research-note`、`case-study`）。人工研究筆記用 `research-note`，不另開目錄。
- `tagIds`：1–4 個具體技術或概念，只標注文章真正討論的內容。新 Tag 先加入 `tags.json`（穩定 kebab-case ID、三語名稱與受控搜尋別名）；未知 Tag、關聯 ID 或保留字 slug（`tags`、`topics`）會讓建置失敗。
- `relatedPostIds`／`relatedProjectIds`：明確關聯優先，其餘相關文章依共同 Tag 與主題排序。
- `commentsEnabled`：作者是否開放留言；與留言服務是否設定是兩件事。

1. 新增穩定 id 目錄及原文 Markdown，`sourceLocale` 指向原文，原文 `translationState` 為 `original`，`publication` 先為 `draft`。
2. 填寫真實來源。`source.kind=original` 用於新作，`profile-adaptation` 用於既有履歷編輯整理，`legacy-blog` 僅用於有原始內容的匯入。來源 commit、path、URL 應可核對，不能用虛構 SHA；在草稿提交後填入其固定 commit，再做發布變更。
3. 新譯文先設 `translationState=machine-draft`、`publication=draft`。缺少語言可省略該 edition。機器翻譯不自動成為 reviewed。
4. 作者審閱完成後，填入可核對的 `reviewEvidence` HTTPS 連結與原文檔案 SHA-256，將譯文改為 `reviewed`、`published`。`source-published` 僅供本次繼承原站公開譯文，不能拿來跳過新稿審阅。
5. 更新原文時同步更新 `updatedAt`；舊譯文 hash 不符會被判定 stale。先把譯文改回 draft，再重新審阅；不要只更新 hash 來略過審查。宣稱 published 卻 stale 的譯文會阻止建置。
6. 執行 `pnpm verify`，檢查實際三語頁面，再由擁有者進行 PR 審阅及發布。

計算單篇原文 revision（示例指向既有文章）：

```sh
shasum -a 256 content/posts/engineering-principles/zh-hant.md
```

id 用於跨語系文章身份和 discussion 對照；slug 改名時必須補明確的舊路徑 bridge。

### 正文格式

正文在建置時轉成靜態 HTML，不執行 MDX、script、iframe 或任意 HTML。作者 HTML 與產生器輸出（程式碼高亮、公式）分別套用有界的清理規則，見 [renderer](../src/lib/markdown.server.ts)。

- 標題：`## 標題 {#stable-id}` 可指定永久錨點；未指定時英文標題產生 slug，中日文標題產生穩定雜湊。
- 已發布的錨點記在 [`data/migration/heading-anchors.json`](../data/migration/heading-anchors.json)，改寫或刪除這些標題時，建置會指出缺少的 `#id`；在新標題補上 `{#原本的 id}` 即可保留舊連結。
- 程式碼：` ```rust title="src/main.rs" ` 會在建置時以 Shiki 高亮並顯示檔名；`text` 與未支援的語言保持純文字。
- 公式：`$inline$` 與獨立一行的 `$$ … $$`，以 KaTeX（`trust: false`、限制展開與尺寸）輸出 MathML；錯誤時顯示原始公式與提示，不顯示例外訊息。只有含公式的文章才載入公式樣式。
- 圖片：只接受與文章放在同一目錄的 PNG、JPEG、WebP、GIF，必須有描述性 alt，標題會成為圖說；建置時讀取尺寸並複製到 `/content-assets/`。遠端圖片會被拒絕。
- 另支援 GFM 表格（窄螢幕在表格內捲動）、註腳 `[^1]`，以及 `> [!NOTE]`、`> [!TIP]`、`> [!WARNING]` 三種提示框。

閱讀時間依語言估算（中日文以字數、英文以詞數，另計程式碼與公式），只顯示「約 N 分鐘」。

草稿不產生文章 URL，也不進列表、搜尋、RSS、sitemap 或公開 loader payload。`archived` 目前同樣不公開；若需保留公開歷史文章，維持 published 並在內容中說明歷史狀態。語系切換只連到已發布的版本；未發布語系會顯示不可用提示。

## 學習筆記與醫學分類

筆記與部落格文章分開發布。`src/lib/medical-notes.ts` 與 `src/lib/network-notes.ts` 保存筆記標題、摘要及實際內容對應的 `tagIds`；標籤須存在於受控 taxonomy，且至少一個，不可重複。筆記標題下的標籤由建置時加入，保留原有章節錨點，不在內容片段加入 script 或行內色彩。

醫學依 `src/lib/medical-notes.ts` 的分類契約整理：

- 藥物：`/zh-hant/note/medical/drugs/analgesics/`，原文維持在 `content/notes/medical.html`。舊的 `/zh-hant/note/medical/analgesics/` 保留完整靜態正文與既有 fragment（canonical 指向新頁、noindex）；啟用 JavaScript 時帶原 fragment 轉址，無 JavaScript 時可直接閱讀原錨點。
- 病理：`/zh-hant/note/medical/pathology/brain-cns-tumors/`，原文位於 `content/notes/medical/pathology/brain-cns-tumors.html`。

分類入口及標籤名稱支援三語；筆記仍只有已提供的繁體中文原文。新增譯文之前，不建立不存在的英、日文筆記網址。醫學筆記需保留教育用途聲明、可核對來源、統計適用範圍與推論限制。

## 搜尋

tabline 的搜尋入口、首頁 README 的開始選單與 `/`／Ctrl+K／Cmd+K 開啟 `/<locale>/search/` 全站搜尋。建置從正式預渲染頁面的 main 正文產生同源 `site-search.json`，包含首頁、公開文章、筆記及目錄；不讀取草稿、移除的頁面或論文日報外站本文。標題、摘要、標籤（含三語名稱與受控別名）與全文皆可搜尋，依文章／筆記／頁面分類。每篇文章與筆記在主標題下方顯示標籤；點擊進入 `/<locale>/search/?tag=<id>` 的精確標籤篩選，可再搭配關鍵字與內容類型。未知標籤顯示空結果，不退回全部內容。每份內容優先顯示目前語言，沒有翻譯時連向實際原文並明示語言。搜尋頁不進 sitemap；關鍵字與類型保留在 URL，可使用 Back／Forward 與語言切換。索引載入失敗可重試；無 JavaScript 時仍可透過首頁、部落格與筆記連結瀏覽。

以下 Pagefind 行為只適用於部落格內的文章搜尋：

文章搜尋使用 [Pagefind](https://pagefind.app/)，在預渲染完成後由 `scripts/build-search.ts` 對最終 HTML 建立索引。只有文章的標題區與正文（`data-pagefind-body`）會被收錄；導覽、頁尾、留言、相關文章、程式碼工具列不進索引。每種語言各自一份索引，建置會確認收錄筆數等於已發布的文章版本數。

Topic、type、Tag 以 ID 作為篩選值；多個 Tag 使用 Pagefind 的 `any`（符合任一），不同維度之間為 AND。`tags.json` 的別名會隨 Tag 連結一起被收錄，讓「量化」與 quantization 互相找得到。索引無法載入時，介面明示「只搜尋標題與摘要」並提供重試。

## 留言

留言設定在 `data/comments.json`，是三選一的公開設定：

- `{ "mode": "unconfigured" }`：文章明示留言尚未開放，不載入任何第三方服務。
- `{ "mode": "github-native", "repository": "DennySORA/<repo>" }`：顯示「在 GitHub 開啟討論」連結。**目前使用這個模式**，討論串在本 repository 的 Discussions。
- `{ "mode": "giscus", "repository", "repositoryId", "category", "categoryId", "theme", "inputPosition", "reactionsEnabled" }`：讀者按下「載入留言」後才從 giscus.app 載入元件，並保留 GitHub 原生連結作備援。

每篇文章的 `discussionNumber` 指向一個已存在的討論串，三種語言共用同一個編號；`mapping=number` 不會自動建立討論，不要填寫猜測的編號。目前三篇文章分別對應 [#1](https://github.com/DennySORA/dennysora.github.io/discussions/1)、[#2](https://github.com/DennySORA/dennysora.github.io/discussions/2)、[#3](https://github.com/DennySORA/dennysora.github.io/discussions/3)，放在 **Announcements** 分類：只有維護者能開新討論串，任何 GitHub 使用者都能留言。

新文章發布前，先建立討論串再填入回傳的 `number`：

```sh
gh api graphql \
  -f query='mutation($title: String!, $body: String!) { createDiscussion(input: { repositoryId: "R_kgDOT4fpCQ", categoryId: "DIC_kwDOT4fpCc4DGcnr", title: $title, body: $body }) { discussion { number url } } }' \
  -f title='〈文章標題〉留言討論' \
  -f body='三語文章連結與「請勿張貼憑證或私人資訊」提示'
```

改用 giscus 內嵌時，只剩一個需要在 GitHub 網頁上完成的步驟：只在本 repository 安裝 [giscus App](https://github.com/apps/giscus)。repository 根目錄的 [`giscus.json`](../giscus.json) 已把可嵌入的網站限制為 `https://dennysora.me`。安裝後把設定改為 `mode: "giscus"`，填入 `repositoryId: "R_kgDOT4fpCQ"`、`category: "Announcements"`、`categoryId: "DIC_kwDOT4fpCc4DGcnr"`、`theme: "transparent_dark"`、`inputPosition: "top"`、`reactionsEnabled: true`。既有的討論編號不需要改。這些都是公開 ID，設定中不放任何 token；隱私說明頁會依目前模式自動改寫。

## 自介與專案

各語言首頁（`/<locale>/`，以 `README.md` 呈現）由 [`content/profile/profile.json`](../content/profile/profile.json) 驅動：YAML 式的基本資料與大型 Logo，接著是能力、代表作品、經歷、目前探索、最近的文章、完整紀錄與聯絡。舊的 `/<locale>/about/` 只是轉址頁，會保留 `#exp-h` 等錨點轉到首頁。首頁不整頁渲染 Markdown。`content/profile/*.md` 保留為遷移來源；工作經歷、技能、技術深度、興趣、開源專案、社群與寫作的每個項目都逐字保存在 JSON 中，單元測試會比對兩者。舊章節的去向與刻意不公開的項目（版本號、未附查詢時間的星數、目前無法公開存取的 repository）記在 [`data/migration/about-sections.json`](../data/migration/about-sections.json)。

新增能力敘述時，每一項都要有真實證據（文章、專案或經歷），並只使用「工作實務／個人實作／學習探索」三種標記。

`content/projects/projects.json` 保留首頁能力證據所使用的真實 repository 連結。2026-10-03 依擁有者指示移除 Projects 清單、專案詳情與 Privacy 頁，舊網址回傳 404，不再進入 sitemap 或導覽。首頁另移除作品、探索、工程之外、完整紀錄及最後聯絡區塊。

## 品牌素材

tabline 使用 `assets/logo.png` 原檔，不重畫、不染色、不裁切。首頁的大型 Logo 是 `assets/logo-hero.webp`（1x）與 `assets/logo-hero@2x.webp`（2x）：由 3 MB 的 `logo_full.png` 只修掉左右透明欄、縮放並轉成 WebP，同一個人像，未改色或重繪。[`data/brand-assets.json`](../data/brand-assets.json) 記錄每個素材的 Git blob、大小、尺寸與衍生方式；建置時的產物檢查會確認發布的檔案與紀錄一致，也禁止引用 GitHub raw 連結。`logo_full.png` 本身只保留在 repo，不發布。

## 版面、圖示與插圖

新增頁面、元件、圖示或插圖前先讀 [設計系統](DESIGN.md)；它對所有 UI 新增與修改都有約束力。文章與筆記內容不寫行內樣式或顏色，版面交給既有元件。插圖採用星座線稿風格，必須通過透明度驗收，並記錄在 [`data/illustration-assets.json`](../data/illustration-assets.json)；沒有紀錄或 bytes 不符的插圖會讓建置的產物檢查失敗。

## 論文日報

論文日報是獨立網站 <https://paper.dennysora.me/>。主站的 buffer 分頁、檔案總管、首頁開始選單與 `/<locale>/research/` 導引頁都直接連過去，主站不再保存快照，也沒有匯入器或建置時的外部讀取。舊的 `/<locale>/papers/` 只是立即轉址的頁面（`noindex`，不在 sitemap）。

## 發布與回復

公開資料夾只有 `build/client`；不要發布 repo root、`build/server`、原始 content、政策、ZIP 或暫存資料。`build/server` 是預渲染中間產物，不是託管需求。

[workflow](../.github/workflows/site.yml) 是擁有者「不使用 GitHub CI」原則的個人網站例外，只負責 build 與 deploy。每次 push 到 `release`（包含 merge 到該 branch）都會建置該次 commit，並部署同一次建置通過檢查的 `build/client`。Main push、PR、tag、排程與人工 workflow dispatch 都不觸發。發布前在本機跑 `pnpm verify`；來源先提交到 `main`，獲得發布授權後，再從已驗證 commit 建立或 fast-forward `release`。若 branch 已分歧，先檢視並正常合併，不用 force push 覆寫歷史。建立或更新 `release` 本身就是發布動作。遠端只安裝 lockfile 所定依賴、執行含內容／產物檢查的 build，再部署該產物。Pages 必須使用 GitHub Actions；既有 `github-pages` 環境保護若不允許 `release`，需由擁有者按既有審批流程處理，不能自行放寬。現有 CNAME 保持 `dennysora.me`。

若部署後發現問題，停止後續部署，從擁有者確認的上一個正常 commit 重新驗證並發布；不要 reset 工作目錄、覆寫新內容或啟用第二個研究 writer。本次只提供此回復程序，未對遠端做回滾演練。舊版 profile 的來源 commit 與 checksum 已記在 [migration manifest](../data/migration/manifest.json)，可以透過 Git 歷史查閱；已刪除 blog 的五篇本文不在本機恢復範圍。
