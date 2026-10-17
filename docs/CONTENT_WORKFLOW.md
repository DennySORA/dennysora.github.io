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

## 學習筆記與分類

筆記與部落格文章分開發布。`src/lib/medical-notes.ts`、`src/lib/network-notes.ts` 與 `src/lib/hardware-notes.ts` 保存筆記標題、摘要及實際內容對應的 `tagIds`；標籤須存在於受控 taxonomy，且至少一個，不可重複。筆記標題下的標籤由建置時加入，保留原有章節錨點，不在內容片段加入 script 或行內色彩。

筆記依一棵資料夾樹分類（2026-10-12 由作者重新分類）。[`note-tree.ts`](../src/lib/note-tree.ts) 是唯一的結構來源：每個資料夾的上層、圖示與插圖，以及每篇筆記放在哪個資料夾。網址就是資料夾路徑加上筆記 ID，Explorer、麵包屑、檔名、sitemap 與搜尋都從同一棵樹產生。[`note-tree.server.ts`](../src/lib/note-tree.server.ts) 保存每個資料夾的三語名稱與介紹，只以目前語言的 loader 資料送到頁面。資料夾頁先列子資料夾卡片，再列直接放在這一層的筆記與摘要。

- 軟體／網路／P2P：`/{locale}/note/software/network/p2p/`，P2P 下載器架構（`p2p-downloader`）與流量關聯研究（`p2p-privacy`）。
- 健康與醫學：原本的「醫學」與「健康」合併，分成三個子資料夾。
  - 藥物：`/{locale}/note/medical/drugs/analgesics/`。舊的 `/zh-hant/note/medical/analgesics/` 保留完整靜態正文與既有 fragment（canonical 指向新頁、noindex）；啟用 JavaScript 時帶原 fragment 轉址，無 JavaScript 時可直接閱讀原錨點。
  - 病理：`/{locale}/note/medical/pathology/brain-cns-tumors/`。
  - 日常照顧：`/{locale}/note/medical/daily-care/lumbar-spine-care/`。
- 硬體／電腦：`/{locale}/note/hardware/computer/140mm-case-fans/`。內容是由研究報告重整的 140 mm 風扇評估與前 10 推薦，並在 2026-10-10 逐項回查來源；正文的「核對紀錄」列出與原報告的差異。
- 日本／日語：`/{locale}/note/japan/japanese/<id>/`，七篇系列。
- AI／影片／數據比較：`/{locale}/note/ai/video/comparisons/<id>/`（2026-10-18 新增），目前是 H3 DiT 元件比較（`h3-dit-components`）。
- 其他：不再分子資料夾，筆記直接放在 `/{locale}/note/other/<id>/`，目前是 `landscape-photography`。

重新分類沒有替舊網址加轉址（作者決定）：`/{locale}/note/network/…`、`/{locale}/note/health/…` 與 `/{locale}/note/other/photography/…` 現在回傳 404。內容片段依資料夾路徑放在 `content/notes/<資料夾路徑>/<id>.html`；P2P 兩篇（`content/notes/<id>.html`）與止痛藥（`content/notes/medical.html`）維持原本的位置。新增資料夾時，在 `note-tree.ts` 登記上層、圖示與插圖，並在 `note-tree.server.ts` 同時寫好繁中、英文、日文的名稱與介紹；新增筆記時，在 `noteFolderOf` 指定資料夾。[`note-tree.test.ts`](../tests/unit/note-tree.test.ts) 確認每個資料夾與筆記在三種語言都有頁面且路徑能往返解析、舊路徑不是頁面、英文名稱與介紹沒有中日文字、日文沒有只屬於繁體中文的字形。

全部十五篇筆記均提供繁體中文、英文、日文全文，路徑使用 `/{locale}/note/…`；目錄、Explorer、標題摘要、標籤、互動結果及搜尋皆依目前語言呈現。中文 HTML 仍是結構與資料的來源；[`content/notes/translations/`](../content/notes/translations/) 每篇 JSON 逐段保存 `source`、`en`、`ja`，包含正文、表格、SVG 文字、無障礙標籤、程式註解及契約附錄中的說明文字。程式識別字、數值、連結、DOM ID 與 `data-*` 不隨翻譯改寫。截圖保留真實畫面，不假造已本地化的軟體。

[`note-translations.ts`](../src/lib/note-translations.ts) 在建置時只替換文字並進行 HTML 跳脫；缺漏、空值、重複或不再對應原文的譯文會讓 `content:check` 失敗，不靜默回退中文。新增或修改中文段落時，必須同步維護英日對照；原稿已有的英文節標、圖表標籤與說明也明確列入對照，`en` 保留原文、`ja` 翻譯，新增英文說明時同樣需要人工盤點；`pre` 區塊依行比對，保留縮排與非翻譯程式內容。所有原有章節錨點和來源 URL 都保持一致。翻譯不代表重新執行實驗、刷新價格或取得人工專業審查；醫學筆記保留教育用途聲明、適應症與劑量條件、可核對來源、統計範圍及推論限制。

日語系列、腰椎保護、風景攝影（2026-10-12 新增）與 H3 DiT 元件比較（2026-10-18 新增）是學習筆記格式，共用一份契約：[`note-collections.ts`](../src/lib/note-collections.ts) 只放 ID，[`note-collections.server.ts`](../src/lib/note-collections.server.ts) 放三語標題、短名稱、摘要與標籤，原文路徑由資料夾樹推得。文字只以目前語言的 loader 資料送到頁面，不進入每一頁的 JavaScript bundle；首頁初始 JS 有 150 KiB gzip 上限。新增這類筆記時：在兩個檔案登記 ID 與文字、在 `note-tree.ts` 指定資料夾、把片段放在 `content/notes/<資料夾路徑>/<id>.html`，再依下方規則建立對照檔。

- 日語：七篇依原手冊的分組串成系列（`japanese-structure` 到 `japanese-review`）。由 43 個主題的學習手冊重編；原手冊的個人測驗分數、手寫筆記照片、原頁影像與舊版全文都沒有公開，來源頁碼保留在第 7 篇的對照表。系列之間的連結一律用相對路徑（`../japanese-clauses/#nominal`），三種語言版本才會各自連到同語言的頁面。
- 腰椎保護（健康與醫學／日常照顧）：原稿中的個人症狀改寫為一般情境；2026-10-12 逐項回查 9 個來源，就醫警訊依 NHS 分成急診、當天就醫與門診三級，沒有來源支持的建議明確標為原稿的補充。
- 風景攝影（其他）：照片是作者本人的實拍，放在 `assets/notes/landscape-photography/`，沿用原稿內嵌的位元組、不重新壓縮；只有筆記實際引用的檔案才會在建置時複製，單元測試確認每張圖的宣告尺寸與檔案一致、資料夾內沒有未引用的檔案。疊圖依每張照片的實際比例重畫，只用 token class 上色。04A 章另有 21 張 GPT 生成的構圖示意圖（其中 5 張由作者提供），也放在同一個資料夾，檔名以 `gpt-` 開頭、沿用原稿的位元組；每張圖在視窗標題列寫「GPT 生成」、替代文字以生成來源開頭，章首說明它們不是實拍，圖中的地點、人物、招牌與相機參數都不是真實資料。圖上的中文標註是圖片的一部分，三種語言都一樣，圖下的文字負責說明。這些是筆記內容，不是 DESIGN §7 的站內插圖，不套用插圖風格與 Codex 生成流程；單元測試確認每張生成圖都有標示、實拍照片都沒有。
- H3 DiT 元件比較（AI／影片／數據比較）：由作者本機的比較報告（2026-10-18 產生）重整，40 個 DiT 元件、16 支 2×2 比較影片與 37 個元件的原始輸出。原報告的 2×2 影片把中文標籤畫在畫面上，本站改從各元件的原始輸出重組成沒有文字的畫面，標籤寫在影片下方，三種語言共用同一支影片。圖表沿用硬體筆記的 `.hw-chart` 配方，數字與表格都由報告內嵌的資料產生；重整時修正的兩處範圍與一處措辭記在正文的「檔案與核對」。

這些學習筆記的片段可以有 `<img>`，但 `src` 必須是 `/assets/notes/<id>/` 下的同源檔案，並且附 `width`、`height` 與非空的 `alt`；其他 `src`、`srcset`、`style`、script 與事件屬性一律會讓 `content:check` 失敗。標上 `lang="ja"` 的元素是日文本身（例句、文法形式、讀音），對照工具在每個版本都逐字保留，不需要也不會產生對照條目；英日譯文只處理周圍的中文。因此這類元素裡不能放中文標籤、中文釋義或中文占位詞（例如「外層：」「／離開家」「傳聞：」），它們要放在元素外面，才會進入對照並被翻譯；帶編號的標題（`34｜について／…`）也不整個標成日文，英文版統一寫成 `34 | …`。句子裡沒有標記的日文，由 `markJapanese` 在輸出中文版與英文版時補上 `lang="ja"`：英文版沒有中文，所有假名與漢字段落都是日文；中文版和日文共用漢字，因此依該句英文譯文逐字保留的日文來劃界，再補標剩下的假名（例如「た形」的「た」）。日文版整頁已是日文，不另外標記。單元測試確認中文版與英文版沒有未標記的假名，讓讀屏軟體與字型都能切換成日文（WCAG 3.1.2）。例句的中文釋義用 `sn-gloss`，日文版以樣式隱藏，因為例句本身就是日文；對照檔仍需提供有意義的日文值。

影片與音軌不放在本站（擁有者 2026-10-18 決定）：GitHub Pages 整站只能放 1 GB，影片改放在擁有者的 Hugging Face 資料集 [`DennySORA/dennysora-site-media`](https://huggingface.co/datasets/DennySORA/dennysora-site-media)，每篇筆記一個 `notes/<id>/` 資料夾。片段裡 `<video>`、`<audio>` 的 `src` 必須是 `…/resolve/<commit>/notes/<id>/…`，而且記錄在 [`data/note-media.json`](../data/note-media.json)（路徑、commit、bytes、SHA-256、影片尺寸）；兩者都要 `preload="none"`、不可 `autoplay`，影片另需 `controls`、`playsinline` 與和紀錄相符的 `width`／`height`，`poster` 只能是 `/assets/notes/<id>/` 下的同源圖片；`<source>` 與 `<track>` 一律拒絕。因此載入頁面時不會連到第三方，讀者按下播放才向 Hugging Face 取用影片；`<video>` 播放不需要 CORS，Hugging Face 的回應仍帶 CORS 標頭並支援 byte range（可以拖曳進度）。影片畫面上不要畫文字，說明都寫在片段裡，三種語言才能共用同一支影片。新增影片時，以 `hf upload <repo> <資料夾> . --repo-type dataset` 上傳成新的 commit，逐檔比對回應的 `x-linked-size` 與 `x-linked-etag`（即 SHA-256）後寫入紀錄檔，再在片段引用那個 commit 的網址；已發布的網址不要改指到別的 commit。2×2 比較影片的聲音切換由 `collection-note-tools.ts` 在本機同步各格的 `<audio>`；沒有 JavaScript 時，影片照常播放自帶的預設音軌（左上），其他音軌可用 VLC 或 mpv 切換。

硬體筆記的圖表是內嵌 SVG，只用 `src/styles/hardware-notes.css` 的 class 取 token 色，不寫 `style`、字面色碼或 script；每張圖都要有可展開或並列的資料表。載入器拒絕 script、style、img、`src`／`style` 屬性等標記。互動工具（型號篩選、工作點滑桿、數量試算）由 `src/features/notes/hardware-note-tools.ts` 在本機重算，靜態 HTML 先寫好預設結果，沒有 JavaScript 時仍可讀；工具用到的報價放在 `data-*` 屬性，改價格時只改內容檔。性能數字分平台標示（Cybenetics、Tweakers、HWCooling 不混用絕對值），價格與庫存註明觀測日。

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

2026-10-11 依擁有者指示新增「專案／工具」：`/{locale}/projects/` 與分類資料夾 `/{locale}/projects/tools/` 三語都有；專案頁只在實際撰寫的語言發布。目前 dgxtop 的架構與設計說明已具備繁體中文、英文、日文全文：`/zh-hant/projects/tools/dgxtop/`、`/en/projects/tools/dgxtop/`、`/ja/projects/tools/dgxtop/`。三語都包含圖表文字、表格、截圖說明及替代文字，原有截圖保持不變。頁面後半是依實作撰寫的技術章節（一筆資料的路徑、adapter 隔離、來源仲裁、分層歷史、程序歷史、各程序的 GPU 記憶體、程序操作、資源上限、磁碟上的檔案與程式碼結構），每節附一張 GPT 生成的技術圖，三種語言各有自己的一張；dgxtop 的 README 連到這些章節。舊的扁平網址 `/<locale>/projects/dgxtop/` 與 Privacy 仍回傳 404。

新增專案頁的方式：

- 在 [`src/lib/project-pages.ts`](../src/lib/project-pages.ts) 登記分類、`editions`（實際寫好的語言）、`tagIds`、標題、摘要與截圖清單（檔名與真實像素尺寸）。
- 正文放在 `src/features/projects/<id>/`：文字集中在 copy 檔，每個語言一份；圖表用 `src/styles/projects.css` 的 `.dg` 配方畫成真正的文字，只用 token class，不寫字面色碼。
- 截圖放在 `assets/projects/<id>/`，只有頁面列出的檔案才會發布；截圖裡的序號、UUID、權杖等可識別資訊先打碼。生成的插圖照 [設計系統 §7](DESIGN.md#7-插圖與生成圖片) 處理，不拿來當內容圖。GPT 生成的含文字技術圖則照 §7「含文字的技術圖」生成與驗收，放在 `assets/projects/<id>/diagrams/`，每種語言一張並在 `project-pages.ts` 登記，頁面用 §9 的「專案技術圖」呈現。
- 專案頁的程式碼是獨立 chunk，只在專案網址載入；預先渲染會先等它載好，所以靜態 HTML 有完整內容，沒有 JavaScript 也能讀。

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
