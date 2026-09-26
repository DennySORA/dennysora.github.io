# 寫作、翻譯與發布

## 內容來源

文章的單一來源是 `content/posts/<id>/meta.json` 與同目錄 `<locale>.md`。語言值為 `zh-hant`、`en`、`ja`；完整欄位契約以 [schema](../src/lib/schema.ts) 為準。請從既有文章複製欄位結構，填入真實 id、slug、作者、日期、分類、來源，不要沿用另一篇文章的來源證據。

「文章與研究」是同一個人工內容庫，以三個互不混用的維度整理，定義在 [`content/taxonomy/`](../content/taxonomy/)：

- `topics`：主要領域（`engineering`、`systems`、`ai`），ID 固定，只調整顯示名稱。
- `contentType`：寫作形式（`essay`、`tutorial`、`research-note`、`case-study`）。人工研究筆記用 `research-note`，不另開目錄。
- `tagIds`：最多 4 個具體技術或概念，只標注文章真正討論的內容。新 Tag 先加入 `tags.json`（穩定 kebab-case ID、三語名稱與受控搜尋別名）；未知 Tag、關聯 ID 或保留字 slug（`tags`、`topics`）會讓建置失敗。
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

## 搜尋

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

About 頁由 [`content/profile/profile.json`](../content/profile/profile.json) 驅動，不再整頁渲染 Markdown。`content/profile/*.md` 保留為遷移來源；工作經歷、技能、技術深度、興趣、開源專案、社群與寫作的每個項目都逐字保存在 JSON 中，單元測試會比對兩者。舊章節的去向與刻意不公開的項目（版本號、未附查詢時間的星數、目前無法公開存取的 repository）記在 [`data/migration/about-sections.json`](../data/migration/about-sections.json)。

新增能力敘述時，每一項都要有真實證據（文章、專案或經歷），並只使用「工作實務／個人實作／學習探索」三種標記。

專案在 `content/projects/projects.json`；卡片一律連到真實 repository。只有 `caseStudy` 為 `published` 且對應語言內容存在時才顯示「查看案例」，也才讓專案頁進入索引；尚無案例的專案頁保留舊網址但設為 `noindex`。

## 品牌素材

Header／Footer 使用 `assets/logo.png` 原檔，不重畫、不染色、不裁切。[`data/brand-assets.json`](../data/brand-assets.json) 記錄每個素材的 Git blob、大小與尺寸；建置時的產物檢查會確認發布的檔案與紀錄一致，也禁止引用 GitHub raw 連結。3 MB 的 `logo_full.png` 只保留在 repo，不發布。

## 論文日報快照

「論文日報」頁（`/<locale>/papers/`）介紹外站並顯示一份固定快照；舊的 `/<locale>/research/` 改為不進索引的導引頁，分別連到研究筆記與論文日報。快照使用公開 metadata，顯示來源真實時間與「自動生成・未逐篇人工審閱」標記。網站建置及瀏覽時完全離線讀快照，不會啟動生成器或碰觸 Nano、state、資料庫或 credentials。

更新時先唯讀核對 `DennySORA/daily-paper-report` 的 `gh-pages` 固定 commit；下載該 commit 的 `api/daily.json` 至本機暫存，然後執行：

```sh
pnpm research:import /tmp/public-daily.json VERIFIED_40_CHARACTER_COMMIT
pnpm verify
```

第二個參數需替換為實際核對的 40 字元 SHA。匯入器只投影前三筆 top5 的核准 metadata，拒絕無效 schema、非核准 URL、空資料與超過 5 MB 的輸入。驗證完成後才原子替換快照；失敗保留前一份檔案。外部摘要或文章內的指令都只是資料。匯入器不自行確認來源檔案與 SHA 的關係，下載來源的核對是維護者責任。

導讀使用已驗證存在的 `/day/YYYY-MM-DD.html`；週報／月報入口為 `/reports/`。下載失敗時保留舊快照，不把 build time 當更新日期。刪除快照檔可顯示無資料狀態；格式錯誤則阻止新建置，不能以未驗證資料覆蓋公開版本。

## 發布與回復

公開資料夾只有 `build/client`；不要發布 repo root、`build/server`、原始 content、政策、ZIP 或暫存資料。`build/server` 是預渲染中間產物，不是託管需求。

[workflow](../.github/workflows/site.yml) 將驗證與部署權限拆開。PR/push 只驗證；正式發布需 main 的人工 workflow dispatch 且 `deploy=true`。先由擁有者設定 Pages 使用 GitHub Actions，並設定 github-pages environment reviewer／branch protection，之後發布同一次 job 已測試的 Pages artifact。現有 CNAME 保持 `dennysora.me`。

若部署後發現問題，停止後續部署，從擁有者確認的上一個正常 commit 重新驗證並發布；不要 reset 工作目錄、覆寫新內容或啟用第二個研究 writer。本次只提供此回復程序，未對遠端做回滾演練。舊版 profile 的來源 commit 與 checksum 已記在 [migration manifest](../data/migration/manifest.json)，可以透過 Git 歷史查閱；已刪除 blog 的五篇本文不在本機恢復範圍。
