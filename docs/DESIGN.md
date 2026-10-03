# DennySORA 設計系統：Moonlit Vim

版本 3.0｜2026-10-04｜狀態：**生效中，所有 UI 新增與修改都必須遵守**

擁有者指示（2026-10-04）：網站要看起來像 vim，要有工程師的專業感；多用圖示與圖片；之後加入的東西都要依照這份設計風格。

這份文件是本站的設計契約。新頁面、新元件、新圖示、新插圖或任何樣式調整，都依照這裡的規則實作，並在交付前用 [§12 驗收清單](#12-驗收清單) 自查。交付紀錄見 [DELIVERY-v3.0.md](process/DELIVERY-v3.0.md)。

## 0. 效力與單一真相來源

- **優先順序**：擁有者當下的明確指示 → [PROJECT_AGENT.md](../PROJECT_AGENT.md) 的產品契約（三語、靜態、無追蹤、品牌圖不改、WCAG 2.2 AA、無 JavaScript 可讀）→ 本文件。本文件規定「長什麼樣子、怎麼做」，不放寬任何產品契約。
- **改規則要先問擁有者**：新增顏色、換字體、新增外框區塊（例如活動列、頁尾、浮動按鈕）、改變模式語意，都要擁有者明確同意，並在同一次變更裡更新本文件、tokens 與守護測試。
- **單一真相來源**：

| 項目 | 唯一來源 |
|---|---|
| 顏色、間距、圓角、外框尺寸、字體堆疊 | [`src/styles/tokens.css`](../src/styles/tokens.css) |
| 圖示 | [`src/components/Icon.tsx`](../src/components/Icon.tsx) |
| 檔案種類對應的圖示 | [`src/components/file-icons.ts`](../src/components/file-icons.ts) |
| 外框 | `TabLine.tsx`、`Explorer.tsx`、`WinBar.tsx`、`StatusLine.tsx`，由 `SiteLayout.tsx` 組合 |
| 插圖與生成圖片的紀錄 | [`data/illustration-assets.json`](../data/illustration-assets.json) |
| 品牌圖的紀錄 | [`data/brand-assets.json`](../data/brand-assets.json) |
| 所有介面文字（三語） | [`src/i18n/index.ts`](../src/i18n/index.ts) 與各功能的 copy 檔 |

元件裡不寫字面色碼、不另開一套變數。只有兩個例外，且數值必須與 tokens 一致：列印樣式 [`print.css`](../src/styles/print.css)（紙張用淺色），以及建置腳本產生、沒有載入站內 CSS 的轉址頁（[`scripts/finalize-build.ts`](../scripts/finalize-build.ts) 的內嵌樣式）。

## 1. 設計主張

**Moonlit Vim**：整個網站是一個設定精良的 Neovim 工作階段。上方 tabline 列出 buffers，左側是 neo-tree 檔案樹，視窗頂端的 winbar 顯示路徑，內容是帶行號的 Markdown buffer，底部是 lualine 式狀態列與 Vim 命令列。

色彩取自品牌 Logo「懷抱月亮的宇宙人像」：深夜藍的畫布、冷藍色的動作色，紫色與青綠色標示類型與檔案。唯一的暖色是月光金，只用在真實的警告狀態與插圖點綴。

三條底線：

1. **借用 vim 的元素，不模擬終端機。** 外框全是真的連結與按鈕，沒有假的命令輸入、閃爍游標、打字動畫或不能用的按鍵提示。
2. **閱讀優先。** 中文、日文、英文的正文與標題用系統無襯線字。等寬字只用在外框、路徑、程式碼、日期、鍵名與機器值。
3. **只顯示真實的事實。** 模式、捲動位置、分支、檔案路徑、數量、狀態色，都必須是當下頁面真的狀態。

## 2. 色彩

Dark only：不提供淺色主題、主題切換或跟隨作業系統的分支。`<html data-theme="dark">` 與 `<meta name="color-scheme" content="dark">` 必須出現在第一個 HTML 回應裡。數值來自 Noir Workbench 的 canonical 色票，對應到本站既有的 token 名稱；標為「本地」的是本站新增的編輯器語法角色。

| Token（`--color-*`） | 值 | 角色 |
|---|---|---|
| `chrome`、`sidebar`、`tab-inactive` | `#080c12` | 最深層：tabline 底、命令列、檔案樹、程式碼與輸入框 |
| `background` | `#0c1118` | 編輯器畫布（Vim 的 Normal） |
| `surface` | `#131c27` | 面板、狀態列、摺疊列、卡片 |
| `surface-raised` | `#1b2736` | hover、狀態列 b 段、次要按鈕 |
| `surface-overlay` | `#233246` | 選單、浮動視窗等覆蓋層 |
| `surface-selected` | `#233d59` | 目前項目、文字選取（Visual） |
| `border-subtle` | `#253141` | 內部分隔線、縮排導引線 |
| `border-decorative` | `#35465c` | 視窗分隔線、面板外框 |
| `border-strong` | `#526780` | 強調外框、捲軸 |
| `control-border` | `#8193ad` | 必要的控制項邊框（需 ≥3:1） |
| `text` | `#e6edf5` | 主要文字 |
| `text-secondary` | `#b8c5d6` | 次要文字、正文段落 |
| `text-muted` | `#a0b0c5` | 可讀的中繼資料 |
| `text-disabled` | `#748299` | 只用於停用的控制項 |
| `action-primary` / `-hover` / `-active` | `#8ab8f5` / `#a2cbff` / `#6ea0e4` | 唯一的動作色系：主要按鈕、NORMAL 模式、目前 buffer 標記 |
| `action-ink` | `#08111e` | 亮色填色上的深色字 |
| `link` | `#96c3ff` | 連結、區段圖示、目前樹節點標記 |
| `focus` | `#b2d5ff` | 焦點框 |
| `status-info` | `#91c6ff` | 資訊 |
| `entity-kind` | `#ccafff` | 類型與實體：front matter 的鍵、等級標籤、外部網站、VISUAL 模式 |
| `entity-file` | `#83d8cf` | 檔案與技術標籤：Markdown 檔圖示、front matter 的值、字串 |
| `entity-folder`（本地） | `#91c6ff` | 資料夾圖示 |
| `status-success` / `warning` / `danger` | `#9bd2ac` / `#edca8b` / `#ffa8a1` | 只給真實狀態 |
| `danger-fill` | `#ffaaa5` | 錯誤晶片的填色（例如 `E404`） |
| `gutter`（本地） | `#5f6f86` | 行號（裝飾，≥3:1） |
| `syntax-marker`（本地） | `#8593a8` | `#`、`---`、`//`、`:`、`-` 等 Markdown 標記（當文字讀，≥4.5:1） |
| `syntax-constant`（本地） | `#f2b48a` | 程式碼裡的常數與數字 |
| `overlay-scrim`（本地） | `#000000ad` | 對話框背景遮罩 |

規則：

- **狀態色只給真實狀態。** 綠色只出現在 INSERT 模式或真的成功結果；金色只出現在真的警告（例如醫學筆記的免責聲明）；紅色只出現在真的錯誤（例如 `E404`、複製失敗）。不要用狀態色做裝飾、分類或強調。
- **選取、目前位置與焦點是三件事。** 目前頁面用 `surface-selected` 加 2px 標記；文字選取用 `surface-selected`；鍵盤焦點用 `focus` 外框。三者不可互相替代。
- **不用 opacity 或 filter 做淡化**，要淡就換成較暗的 token。
- **對比**：所有文字角色在七種表面上都 ≥4.5:1（實測最低 5.05:1）；亮色填色上的深色字 ≥7:1；控制項邊框與焦點框 ≥3:1；行號 ≥3:1。由 [`tests/unit/design.test.ts`](../tests/unit/design.test.ts) 守護。
- **Vim 模式色**：NORMAL = `action-primary`，INSERT = `status-success`，VISUAL = `entity-kind`，字都是 `action-ink`。
- **程式碼語法**：註解 `syntax-marker`（斜體）、關鍵字 `entity-kind`、字串 `entity-file`、函式 `link`、型別 `action-primary`、常數 `syntax-constant`、diff 的新增與刪除用 success／danger。

## 3. 外框結構

每一頁都由 `SiteLayout` 包住，不可另做外框。文件本身是唯一的捲動者，外框用 sticky 與 fixed 固定，所以連結、頁內搜尋、上一頁與錨點都照常運作。

```text
+------------------+--------------------------------------------------------------------------+
| [=] (o) DennySORA| |README.md  [d] blog  [d] note  paper-daily^   [/ search  /] GH @ lang   |  <- tabline
+------------------+--------------------------------------------------------------------------+
| Explorer         | ~ dennysora > [d] note > [md] analgesics.md                              |  <- winbar
| ~/dennysora      |   1  ---                                                                 |
|   [md] README.md |   2  name: ...                                                           |
| v [d] blog       |   9  # DennySORA                                                         |  <- buffer
| |   (empty)      |      ...                                                                 |
| v [d] note       |      ~                                                                   |
+---------------------------------------------------------------------------------------------+
| NORMAL > main > [md] README.md            zh-Hant | utf-8 | markdown < Top                  |  <- status line
| "README.md"                                                                                 |  <- command line
+---------------------------------------------------------------------------------------------+
```

圖例：`[=]` 檔案樹收合鈕、`(o)` Logo、`[d]` 資料夾、`[md]` Markdown 檔、`|README.md` 為目前 buffer 的左側標記、`^` 為外部連結、`GH @ lang` 為 GitHub、Email 與語言、`>`／`<` 為 powerline 箭頭。實際畫面用 `Icon.tsx` 的 SVG 圖示與三語文字。

| 區塊 | 元件／class | 尺寸 | 規則 |
|---|---|---|---|
| Tabline | `TabLine.tsx`／`.tabline` | 38px，手機為 52＋44px 兩列 | 左段寬度等於檔案樹（放收合鈕與品牌）；中段是 buffers；右段是搜尋、快速連結、語言與窄螢幕的檔案樹按鈕 |
| Buffers | `.buffers`、`.tab` | 列高 | 每個區域一個 buffer，內頁以目前檔案 buffer（`.tab-preview`）插在所屬區域後。目前 buffer 用 `background` 底、粗體與左側 2px `action-primary` 標記 |
| 檔案樹 | `Explorer.tsx`／`.sidebar` | 248px，sticky | neo-tree 外觀：展開箭頭、資料夾與檔案圖示、縮排導引線、空資料夾顯示「（空）」。可收合，收合後內容置中 |
| Winbar | `WinBar.tsx`／`.winbar` | 28px，sticky | 路徑麵包屑，每段帶圖示；有頁面的段落才是連結 |
| Buffer | `main > .buffer`／`.container` | 行號欄 56px（≤1099px 為 48px，<768px 隱藏） | 見 §8 |
| 狀態列 | `StatusLine.tsx`／`.statusbar` | 26px，fixed | 模式 ▶ 分支 ▶ 檔案 … 語言 │ 編碼 │ 檔案類型 ◀ 位置；powerline 箭頭用各段自己的底色裁出 |
| 命令列 | `.cmdline` | 24px（<768px 隱藏） | NORMAL 時顯示 `"目前檔案路徑"`，INSERT／VISUAL 時顯示 `-- INSERT --`／`-- VISUAL --` |

寬度：≥1100px 為 tabline＋檔案樹＋視窗；768–1099px 隱藏檔案樹，改由 tabline 右側按鈕開啟左側抽屜（dialog）；<768px 的 tabline 分成品牌列與可橫捲的 buffer 列，winbar、行號、命令列隱藏，狀態列放在頁面最後。支援 320–1920px，不可出現頁面層級的水平捲動。

不要新增：活動列、全站頁尾、橫幅、浮動按鈕、第二條導覽列、分頁裡的關閉 ×（沒有作用的控制項）。

## 4. 字體

| 角色 | 字體 | 大小／行高 | 用途 |
|---|---|---|---|
| 首頁名稱 | sans 650 | 42px（手機 34px）／1.2 | 只在 README 的 `#` 標題 |
| 頁面標題 h1 | sans 650 | 30px（手機 26px）／1.35 | 每頁一個 |
| 區段標題 h2 | sans 650 | 21–23px／1.4，下方 1px `border-subtle` | Markdown 的 `##` |
| 小標 h3 | sans 650 | 17–19px | 能力、經歷、筆記項目 |
| 正文 | sans 400 | 15.5–17px／1.85–1.9（英文 1.78） | 中文約 30–40 字一行，英文 ≤72ch |
| 外框與標籤 | mono | 12–13px | tabline、檔案樹、winbar、狀態列、按鈕、篩選、`//` 註解 |
| 中繼資料 | mono | 12–12.5px | 日期、路徑、檔名、數量、鍵名 |
| 程式碼 | mono | 14px／1.7 | 程式碼區塊與行內 code |

- sans：`--font-sans`（日文頁面 `--font-sans-ja`）；mono：`--font-code`（系統等寬字，CJK 落到系統字體）。**不下載任何字型檔**，也不使用 Nerd Font 字元。
- Markdown 標記（`#`、`##`）用 mono 與 `syntax-marker` 色，標題文字仍是 sans。
- 中文不使用斜體、全大寫或字距；日文標題用 `word-break: auto-phrase`。

## 5. 間距、圓角與材質

- **4px 節奏**：`--space-1`…`--space-9` = 4／8／12／16／24／32／48／64／88。1–2px 的邊框與光學微調是允許的例外。
- **圓角**：`--radius-chip` 4px（晶片、摺疊列）、`--radius-control` 6px（按鈕、輸入框、程式碼區塊）、`--radius-card` 10px（面板、浮動視窗、卡片）。不用大膠囊、不做巢狀卡片。
- **材質預算**（只能用在指名的區域）：

| 區域 | 允許 | 限制 |
|---|---|---|
| 畫布、檔案樹、外框 | 實色 token | 不放背景圖、漸層、動態背景 |
| 一般分組面板（`.collection`、`.comments-panel`） | 1px 內緣高光 `--edge-highlight` | 不加陰影 |
| 凸起面板（目前只有首頁 Logo 浮動視窗 `.readme-logo`） | 頂部 3.5% 白光＋內緣＋`--panel-shadow` | 每個畫面最多 2 個 |
| 主要按鈕 `.button-primary` | `action-primary → action-active` 的兩段漸層＋內緣 | 每個區域只有一個主要動作 |
| 覆蓋層（語言選單、抽屜） | 不透明 `surface-overlay`＋`control-border`＋`--overlay-shadow` | 不用玻璃模糊 |

一律禁止：霓虹光暈、彩色模糊陰影、`text-shadow`、`backdrop-filter`、掃描線、雜訊、hover 時位移或浮起、逐列漸層。

## 6. 圖示

**圖示優先。** 每個導覽項目、buffer、檔案樹列、winbar 段落、狀態列段落、區段標題、按鈕與動作、內容類型、狀態、空狀態與錯誤狀態都要有圖示。正文、句中連結、長表單標籤與純數值格子不加圖示。

- **唯一來源**：`Icon.tsx`。24 單位網格、1.6 描邊、圓角端點、`currentColor`。新圖示直接在 `paths` 加一條原創路徑；不加圖示套件、不用 emoji、不用點陣圖做符號、不放 Nerd Font 字元。
- **尺寸**：12–14px（行內中繼資料、外部標記）、16px（buffer、檔案樹、按鈕、winbar）、18–20px（選單、區段標題）、26px（h1）。
- **顏色依角色，不另創色**：

| 對象 | 圖示 | 顏色 |
|---|---|---|
| Markdown 檔案 | `markdown` | `entity-file` |
| 資料夾 | `folder`／展開或目前時 `folder-open` | `entity-folder` |
| 外部網站（論文日報） | `newspaper`＋`arrow-up-right` | `entity-kind` |
| 搜尋 | `search`、提示字元 `prompt` | `link` |
| 錯誤／找不到 | `circle-x` | `status-danger`（真的錯誤時） |
| 區段標題與開始選單 | 依內容選（`briefcase`、`branch`、`pen`、`notebook`、`network`…） | `link` |
| 一般外框圖示 | 例如 `sidebar`、`globe`、`github`、`mail` | `text-secondary`／`text-muted` |
| 程式碼來源連結 | GitHub 網址用 `github`，其他用 `link`（`linkIcon()`） | `entity-file` |

- **無障礙**：旁邊有文字時圖示 `aria-hidden`（`Icon` 預設如此）；只有圖示的控制項必須有 `aria-label`，並以 `title` 提供提示；狀態圖示一定搭配文字。圖片裡的文字永遠不是真正的標籤。

## 7. 插圖與生成圖片

**風格：Constellation line art（星座線稿）。** 扁平的雙色調幾何形狀，以細而均勻的線連接圓形節點、像星圖，再點綴兩三顆四角星芒。安靜、精確、專業，與首頁 Logo 的宇宙與月亮主題呼應。調色盤只能用：`#526780`、`#8ab8f5`、`#b2d5ff`、`#e6edf5`、`#ccafff`、`#83d8cf`，以及少量的月光金 `#edca8b`。背景必須真正透明；畫面裡不得有文字、數字、Logo、外框、棋盤格或底板。

**用在哪裡**：空狀態、錯誤狀態、集合或工具的特徵圖示、頁首的特徵插圖。**不可以**當背景、放在文字或密集表格／表單／程式碼後面，也不能為了熱鬧而加。

目前的插圖（以紀錄檔為準）：

| 檔案 | 用途 | 顯示尺寸 |
|---|---|---|
| `collection-network-v1.webp` | 「網路與 P2P」筆記集合 | 88px |
| `collection-medicine-v1.webp` | 「醫學」筆記集合 | 88px |
| `search-telescope-v1.webp` | 全站搜尋頁首 | 112px |
| `empty-blog-v1.webp` | 部落格沒有文章時 | ≤320px 寬 |
| `not-found-v1.webp` | 404 | ≤360px 寬 |
| `medical-notes.webp` | 醫學資料夾與筆記的封面（既有，非透明） | 內容寬 |

**品牌圖**（`logo.png`、`logo-hero*.webp`、`avatar.png`、favicon）永遠不重畫、不改色、不加濾鏡、不裁切。可以放進浮動視窗外框裡，以 bytes 檢查守護。

**生成新圖片的流程**（透過 Codex，擁有者已核准的範圍化路徑）：

1. 先確認現有圖示或 CSS 無法表達。每個任務最多規劃 6 張，超過要先問擁有者。
2. 前置條件：`codex --version` 成功、`codex login status` 為已登入、不是在被委派的子代理裡（`OPS_TOOLS_ACPX_DEPTH` 未設定或為 0）。
3. 每次呼叫只生成一張，依序進行，不平行、不重試到滿意為止，每張最多修正一次。只送出 brief，不送原始碼、私人資料或螢幕截圖。在私人暫存目錄執行，並設 300 秒逾時：

   ```text
   codex exec --cd <scratch> --skip-git-repo-check --sandbox workspace-write --ephemeral --json -
   ```

4. Brief 範本（把主題換成實際用途）：

   ```text
   Create one original image.
   Subject: <功能與意義、畫面內容、在 <N> px 下可辨識的輪廓、畫布比例>.
   Style: an original flat vector-style illustration in a "constellation line-art"
   language … Palette strictly limited to: #526780, #8ab8f5, #b2d5ff, #e6edf5,
   #ccafff, #83d8cf and one warm moon-gold accent #edca8b used sparingly …
   No text, letters, numbers, logos, UI labels, watermark, frame, border,
   checkerboard pattern or background plate. The final background must be
   genuinely transparent with clean alpha edges …
   Use your built-in image_gen tool … copy only the final image into the
   current working directory as <name>.png.
   ```

5. **驗收**（看解碼後的像素，不看副檔名）：RGBA；四角與外框 4% 區域透明（alpha 最大值 ≤8）；主體四周有留白、未被裁切；分別疊在 `#0c1118`、白色、洋紅色上目視檢查，不得有白邊、髒光暈、底板或多餘矩形。
6. **處理**：依 alpha 主體加 6% 邊界裁切，在預乘 alpha 下用 Lanczos 縮放到顯示尺寸的 2 倍，再以 `cwebp -q 90 -alpha_q 100 -m 6 -sharp_yuv` 轉成 WebP，並對最終 bytes 重跑驗收。
7. **命名與紀錄**：放在 `assets/illustrations/<用途>-v<N>.webp`，不覆蓋既有檔（要改就升版號）。在 `data/illustration-assets.json` 記錄用途、顯示尺寸、寬高、bytes、SHA-256、透明度結果、來源（實際工具，模型未回報就寫 `unknown`）、brief 摘要與 brief 的 SHA-256。`scripts/check-artifact.ts` 會拒絕沒有紀錄或 bytes 不符的插圖。
8. 條件不成立時回報 `codex_image_unavailable` 與原因，改用圖示或 CSS，並留下 brief。

## 8. Buffer 語法：頁面內容怎麼寫

- **行號**：在一行內容的元素加上 `className="ln"`，數字由 CSS counter 產生，對輔助科技隱藏。所有行號以最近的 `.buffer`／`.container` 為定位基準，所以 `.ln` 元素本身與它到 buffer 之間的祖先都**不可以設定 `position`**。一個視覺列只能有一個行號；多欄並排的區塊（例如筆記集合卡片）把 `.ln` 加在整個容器上一次。行高與內容不同的列（例如開始選單）要讓列的 `line-height` 等於列高，數字才會置中。
- **頁首**：用 `PageHead`，產生 `// 註解` 眉標與 `# 標題`，可帶 `icon` 與已記錄的 `art`。h2 以下用 `MdHeading`，可帶區段圖示。
- **YAML front matter**：`---` 圍住，鍵用 `entity-kind`、值用 `entity-file`。只放真實資料。
- **清單**：用 `- ` 標記，標記為 `syntax-marker`。
- **摺疊**：可展開的細節用原生 `<details className="fold">`，`summary` 開頭放 `<span className="fold-mark" />`，關閉時顯示 `+--`、打開時顯示 `---`，像 Vim 的摺疊列。
- **結尾**：每個頁面最後放 `EndOfBuffer`（三行 `~`）。
- **浮動視窗**：圖片或預覽放在有標題列的框裡（`.float-title`：圖示＋真實檔名＋可選的真實尺寸），例如首頁 Logo 與醫學封面。
- **經歷**：`git log --graph` 樣式（`.git-log`），目前的項目以 `HEAD` 標示。
- **開始選單**（`.dashboard`）：圖示＋標籤＋提示。提示只能是目的地路徑或**真的能用的按鍵**（例如 `/`）。

## 9. 元件配方

| 元件 | class | 外觀 | 狀態 |
|---|---|---|---|
| 主要按鈕 | `.button.button-primary` | 藍色兩段漸層、深色字、mono 13px、6px 圓角 | hover 改純 `action-hover`；按下改 `action-active` |
| 次要按鈕 | `.button` | `surface-raised` 底＋`control-border` | hover `surface-overlay`；按下 `chrome` |
| 安靜按鈕 | `.button.button-quiet` | 透明底＋`border-decorative` | hover `surface-raised` |
| 文字動作 | `.text-action`、`.text-button` | mono 13px 連結色＋圖示 | hover 底線 |
| 圖示按鈕 | `.icon-button` | 30px（手機 44px）、透明 | hover `surface-raised`，必須有名稱與 `title` |
| 標籤 | `.label` | `entity-kind` 字＋12% 混入 `surface` 的底 | — |
| 標籤連結 | `.tag-link` | mono＋`#` 標記 | hover 底線 |
| 通知 | `.notice[data-status]` | 左側 3px 狀態色＋圖示＋文字 | 只用真實狀態 |
| 搜尋輸入 | `.search-field` | 凹陷 `chrome` 底、`/` 或 `>_` 提示圖示 | 聚焦時 `focus` 外框；狀態列切到 INSERT |
| 篩選 | `.filter-row button[aria-pressed]` | 透明底 | 選中：`surface-selected`＋底部 2px 藍線 |
| 檔案列表 | `.file-list`、`.collection-files` | 檔案圖示＋mono 檔名＋sans 標題 | hover 標題變連結色 |
| 集合卡片 | `.collection` | 88px 插圖＋資料夾標題＋說明＋檔案列＋語言資訊 | hover 邊框變強 |
| 搜尋結果 | `.site-search-results li` | 類型圖示＋中繼資料＋標題＋摘要＋路徑，每項只有一個連結 | hover／focus-within 左側 2px 標記 |
| 空狀態 | `.empty-state` | 插圖或圖示＋h2＋說明＋**下一步動作** | 不可只留一句「沒有資料」 |
| 錯誤晶片 | `.vim-error` | `danger-fill` 底、深色字、`circle-x`＋代碼 | — |
| 程式碼區塊 | `.code-block` | `chrome` 底、`surface` 標題列（語言或檔名）、自身橫向捲動 | 複製按鈕回報真實結果 |

## 10. 互動、狀態與動態

- **每個控制項都要有**：預設、hover、focus-visible、按下、目前／選中、停用（附原因）；非同步動作還要有進行中、成功、失敗與重試，並防止重複送出、保留使用者輸入。
- **焦點**：`outline: 2px solid var(--color-focus)`，offset 2px；在密集的外框（buffer、檔案樹、狀態列）用 -2px 內縮。不可移除焦點。
- **模式**：NORMAL 是預設；焦點在可輸入文字的欄位時為 INSERT（滑桿、核取方塊不算）；頁面有選取的文字時為 VISUAL。不得因為裝飾而切換模式。
- **鍵盤**：全站只有 `/` 與 Ctrl／Cmd＋K 兩個快捷鍵（開啟搜尋），且在輸入、輸入法組字或對話框開啟時不攔截。**不要新增單一字母的全站快捷鍵**（WCAG 2.1.4），除非同時提供關閉機制並經擁有者同意。
- **動態**：顏色、底色與邊框用 120–160ms 的 `ease-out` 過渡（`--motion`）；不使用 `transition: all`、hover 位移、循環動畫或動態背景。`prefers-reduced-motion` 時保留所有狀態、移除移動。
- **強制色彩模式**：保留使用者的配色，目前項目改用真正的外框，powerline 箭頭隱藏。
- **無 JavaScript**：所有內容與導覽都能讀。只在 JavaScript 下才有用的控制項加 `requires-js`；只給無 JavaScript 看的說明用 `no-js-only` 元素（由 head 裡的 noscript 樣式顯示）。**不要把內容放在 body 的 `<noscript>` 裡**，Chrome 的無 JavaScript 模擬會把它隱藏。
- **不使用 storage 與 cookie**：介面狀態（例如檔案樹收合）只存在記憶體裡。

## 11. 之後加入新東西時怎麼做

- **新頁面或路由**：在 `route-manifest.ts` 加入路由，在 `workspace.ts` 的 `crumbs()` 給它真實的路徑與檔名（檔名決定 winbar、buffer 與狀態列的顯示），內容用 `.buffer`／`.container`＋`PageHead`＋`.ln`＋`EndOfBuffer`。要出現在檔案樹，就在 `Explorer.tsx` 加一列，並給它正確的種類（markdown、folder、external）。
- **新元件**：先在 §9 找現成的配方；真的需要新元件時，只用 tokens、`Icon` 與 §5 允許的材質，補齊 §10 的所有狀態，並把配方加回本文件。
- **新文章或筆記**：依 [CONTENT_WORKFLOW.md](CONTENT_WORKFLOW.md) 撰寫，版面由既有元件負責，不在內容裡寫行內樣式或顏色。
- **新圖示**：在 `Icon.tsx` 加原創路徑，依 §6 的角色上色。
- **新插圖**：完整走一次 §7 的流程並更新紀錄檔。
- **新文字**：三種語言同時加入；沒有翻譯就明說，不要捏造。

## 12. 驗收清單

- [ ] 只使用 tokens，沒有新的字面色碼；狀態色只用在真實狀態；沒有用 opacity 或 filter 淡化。
- [ ] 導覽、動作、標題、類型、狀態與空狀態都有正確角色色的圖示；只有圖示的控制項有名稱與提示。
- [ ] 中文與日文正文、標題用 sans；mono 只用在外框與機器值。
- [ ] 行號：每一列一個數字，`.ln` 沒有被定位，多欄區塊只編一次號。
- [ ] 三語文字都存在；不可用的翻譯有說明。
- [ ] 新插圖已通過驗收並寫入 `data/illustration-assets.json`。
- [ ] 鍵盤可完成整個流程，焦點清楚可見；沒有 JavaScript 也能閱讀與導覽。
- [ ] 實際在 Chrome 檢視 320、390、768、1280×800、1440×900、1920×1080 寬度，沒有水平溢出、裁切或重疊；檢查 hover、焦點、INSERT／VISUAL、收合的檔案樹、語言選單、手機抽屜與空狀態。
- [ ] `pnpm verify` 全部通過（Prettier、ESLint 零警告、型別、Vitest、建置與成品檢查、Playwright＋axe）。
- [ ] 若改變了設計規則，本文件、tokens 與守護測試在同一次變更裡一起更新。

## 13. 不要做的事

- 做成假的終端機：假的命令輸入、閃爍游標、打字效果、ASCII 動畫、整頁等寬中文。
- 顯示沒有作用的 vim 元素：不能按的關閉 ×、不存在的快捷鍵提示、捏造的 git 狀態、診斷訊息或行數。
- 加入淺色主題、主題切換、霓虹或玻璃效果、漸層背景、hover 浮起。
- 為了裝飾使用 3D、擬物或高飽和的圖示，或任何點陣圖符號（這正是上一版活動列被移除的原因）。
- 修改、裁切或重新上色品牌圖。
- 在不改這份文件的情況下，另外發明新的顏色、字體、圓角或陰影。

## 14. 守護測試

| 檢查 | 守護內容 |
|---|---|
| [`tests/unit/design.test.ts`](../tests/unit/design.test.ts) | tokens 數值與單一來源、全部文字角色的對比、模式色與主要按鈕的對比、品牌圖 bytes |
| [`tests/unit/site-simplification.test.ts`](../tests/unit/site-simplification.test.ts) | buffers 是四個區域；快速連結的名稱包含可見標籤；外框不再有點陣圖符號 |
| [`tests/e2e/layout.spec.ts`](../tests/e2e/layout.spec.ts) | 語意色、狀態色只用於真實狀態、各狀態的對比、行號共用同一欄、外框內容、320–1920px 不溢出、檔案樹收合 |
| [`tests/e2e/site.spec.ts`](../tests/e2e/site.spec.ts) | 第一次載入就是深色（含無 JavaScript）、Logo 原檔、快速連結、無第三方請求 |
| [`tests/e2e/accessibility.spec.ts`](../tests/e2e/accessibility.spec.ts) | axe 的 WCAG 2.2 AA 檢查（各頁與各種狀態） |
| [`scripts/check-artifact.ts`](../scripts/check-artifact.ts) | 每張插圖都有紀錄，且 SHA-256 與紀錄相符 |
