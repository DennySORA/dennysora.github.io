# AI／影片／數據比較：H3 DiT 元件比較

狀態：資料夾、筆記、影片託管、三語譯文與測試已完成；驗證結果見文末。擁有者要求整理後上架，所以這次變更提交到 `main` 後會推進 `release` 發布。

## 範圍

- 依 2026-10-18 指示，把作者本機的比較報告 `DiT比較_20261017`（`index.html` 與 `grids/`、`results/`、`audio/`、`strips/`、`evidence/`）重整成學習筆記，放進新的分類「AI／影片／數據比較」（英文 AI／Video／Data comparisons，日文 AI／動画／データ比較）。原始資料夾沒有修改，也沒有放進 repo。
- 新增三層資料夾 `ai`、`video`、`comparisons` 與筆記 `h3-dit-components`，三語各一版。初版放在筆記裡（`/{locale}/note/ai/…`）；同日依擁有者指示改成和筆記同一層的最上層區域，現在的網址是 `/{locale}/ai/video/comparisons/h3-dit-components/`（見「AI 改為最上層區域」）。
- 影片可以直接在頁面上播放：16 支 2×2 比較影片、37 個元件的原始輸出，以及 2×2 影片各格的音軌切換。

## 影片託管

- GitHub Pages 整站上限 1 GB，原始資料夾 261 MB，其中 2×2 影片約 140 MB，之後還會有其他比較。依擁有者指示（「幫我把重元素放到 hugging face 讓 github page 能讀」），影片與音軌放在擁有者的公開 Hugging Face 資料集 `DennySORA/dennysora-site-media`，commit `43901d943cf6685015e3c448decbc975456aa386`；本站只放封面與靜態畫格（63 個檔案，3.5 MB）。
- 這是「瀏覽不向第三方發出請求」的唯一例外，擁有者同意，已寫進 `PROJECT_AGENT.md`、`README.md`、`docs/CONTENT_WORKFLOW.md` 與 `docs/DESIGN.md`。範圍限制在：`<video>`、`<audio>` 一律 `preload="none"`、不 `autoplay`，網址固定在一個 commit，而且必須記錄在 `data/note-media.json`；`content:check` 拒絕其他寫法。所以載入頁面時不連任何第三方，讀者按下播放才向 Hugging Face 取用影片。
- CORS：`<video>` 與 `<audio>` 播放跨來源檔案不需要 CORS。實測 Hugging Face 的回應：`resolve` 先 302 轉到 `us.aws.cdn.hf.co`，再回 `206 Partial Content`、`content-type: video/mp4`、`accept-ranges: bytes`，兩段都帶 `access-control-allow-origin`，都沒有 `Set-Cookie`。上傳後逐一比對 90 個檔案的 `x-linked-size` 與 `x-linked-etag`（SHA-256），全部相符。
- 資料集內容：`grids/` 16 支、`outputs/` 37 個（原始輸出逐位元組上傳）、`audio/` 37 條（直接複製，未重新編碼），合計 259.6 MB；資料集說明寫明影片都是 AI 生成的測試輸出，版權屬於擁有者（© 2026 DennySORA），保留一切權利。

## 重整與修訂

- 原報告的 2×2 影片把中文標籤畫在畫面上（例如「左上｜FP8・PAI 8 步（現行）」），英文與日文版無法使用。本站改從 `results/*/final.mp4` 以 ffmpeg 重新組合：每格保持原始 768×448，格間 4 px，整支 1540×900、24 fps、124 幀、H.264 CRF 18；每格一條 AAC 音軌（直接複製，標題是元件 ID，左上為預設）。畫面上沒有文字，標籤寫在影片下方的 2×2 圖例。封面取第 62 幀。
- 參考圖貼上的證據圖原本也有中文標籤，改成 10 張單獨的圖：兩張參考圖從原圖裁出，8 張畫格直接從 FP8 的四個原始輸出擷取（第 62、74 幀），說明寫在圖下。
- 每個元件的 5 格畫格條沿用原檔位元組；原報告的 512 寬預覽沒有使用，改在摺疊裡播放原始輸出（768×448）。
- 圖表、表格與頁首數字都由報告內嵌的資料（recorder 與每秒取樣）產生；圖表沿用 `.hw-chart` 配方（現行元件以 `entity-file` 標出，其他 `border-strong`），每張圖都有資料表。原報告 32 欄的大表拆成設定、速度、記憶體、畫面指標四張表。
- 依資料重新核對原報告的每一個範圍，修正兩處：有參考與純文字的每步時間比是 3.2–4.5 倍（原寫 3.2–4.4，INT8 原版 4.54）；BF16 載入時間是 21–30 秒（原寫 21–29，最長 29.8 秒）。「唯一的有界載入」改為 FP8 · PAI 8 步走有界載入（四個 FP8 · PAI 8 步元件都是）。三組「輸出逐位相同」以解碼後的影像與聲音 MD5 重新驗證，對照組確實不同。這些都記在正文的「檔案與核對」。
- 寫給擁有者本人的內容改成給讀者：「要等你確認才改」等下一步改寫為「後續」，內部的 overlay 修正細節與「未簽章」的 sidecar 說明拿掉；元件、管線與硬體名稱（Video Console 4.0、te-gb10、vae-5080、audio-3060、SGLang）保留，run ID 與節點 UUID 沒有公開。
- 版權：有參考情境的兩張角色參考圖（1448×1086 的透明 PNG）照原報告收錄在證據圖與影片裡。擁有者確認（2026-10-18）參考圖與所有輸出都是擁有者生成的作品、版權屬於擁有者；筆記的「閱讀範圍」與「檔案與核對」、以及 Hugging Face 資料集說明都寫明「© 2026 DennySORA，保留一切權利」，不授權再利用。

## 結構與設計

- 媒體契約：`src/lib/note-media.ts`（資料集網址與固定網址的組法）、`data/note-media.json`（每個檔案的路徑、commit、bytes、SHA-256、尺寸、秒數與音軌數）、`src/lib/schema.ts` 的 `noteMediaSchema`。`content.server.ts` 的 `collectionNoteMedia` 檢查影片與音軌；`collectionNoteAssets` 回傳要發布的同源檔案（照片與封面），`finalize-build.ts` 依此複製；`check-artifact.ts` 的連結檢查加入 `poster`。
- 聲音切換：`collection-note-tools.ts` 為每支 2×2 影片同步該格的 `<audio>`（時間差超過 0.12 秒就校正，跟隨播放速度與音量）；選其他格時影片靜音，在播放器上取消靜音會回到影片自己的音軌，不會兩條聲音同時播放。按鈕是 `requires-js`，沒有 JavaScript 時原生控制列照常播放預設音軌。
- 樣式：`study-notes.css` 新增比較影片（`.sn-video`、`.sn-tiles`、`.sn-audio`）、證據圖（`.sn-evidence`）、元件卡片（`.sn-run`、`.sn-figures`、`.sn-run-error`）、名詞清單（`.sn-terms`）與行內程式碼；`hardware-notes.css` 的圖表規則同時套用到學習筆記。NF4 載入失敗是真的錯誤，所以用 `status-danger`。配方已寫入 `docs/DESIGN.md` §9。
- 圖示：新增 `film`、`chart`。插圖：`collection-ai-v1.webp`，依 DESIGN §7 以 Codex（codex-cli 0.163.0）生成一次、驗收通過（外框 alpha 最大 1，疊在 `#0c1118`、白色與洋紅色上沒有白邊或底板），記錄於 `data/illustration-assets.json`。
- 標籤：新增 `video-generation`（影片生成）與 `diffusion-transformer`（DiT），筆記另用既有的 `quantization`、`gpu`。

## AI 改為最上層區域（同日追加）

- 擁有者指示「這個 AI 應該要在最外層跟筆記同一層」。AI 仍是筆記樹裡的 `ai` 資料夾（資料夾頁、筆記格式、翻譯與媒體契約都不變），由 `note-tree.ts` 的 `noteArea()` 算成自己的區域：網址從 `/{locale}/note/ai/…` 改為 `/{locale}/ai/…`，`resolveNotePath()` 依區域解析，所以 `/{locale}/note/ai/…` 與 `/{locale}/ai/<筆記資料夾>/` 都不是頁面。
- 外框：Explorer 在「筆記」之後、「論文日報」之前列出 AI；tabline 多一個 `ai` buffer（README.md、blog、note、ai、projects、paper-daily），AI 資料夾頁是這個區域的首頁；麵包屑與檔名從 `ai/` 開始（例如 `ai/video/comparisons/h3-dit-components.md`）。筆記目錄 `/{locale}/note/` 不再列 AI 卡片。`docs/DESIGN.md` 的 buffers 規則、示意圖與守護測試同步改成六個區域。
- 舊網址沒有加轉址：沿用 2026-10-12 筆記重新分類的做法，初版只上線幾個小時，唯一已知的外部連結是 Hugging Face 資料集說明，已改成新網址。

## 內文分頁（同日追加）

- 擁有者指示「太長了，內部幫我分類後做成內文的 sub tab 讓其能切換，觀看重要數據」。14 個章節分到 7 個分頁：總覽（閱讀範圍、結論、建議組合）、比較影片、速度、記憶體、畫面指標（畫面指標與參考圖貼上）、各元件、方法與說明（實驗設計、其他觀察、NF4 載入失敗、限制、後續、檔案與核對）。頁首（標題、標籤、導言、數字卡、範圍晶片）留在分頁上方。章節眉標依新的閱讀順序重新編號，章節內容不變（以產生腳本重新產生後逐節比對，只有空白與編號不同）。
- 行為：靜態 HTML 顯示全部面板，分頁列是連到各面板的目錄；`collection-note-tools.ts` 在 JavaScript 下把它變成 ARIA tablist（`role="tab"`、`aria-selected`、`aria-controls`，方向鍵、Home、End），一次顯示一個面板，用 `history.replaceState` 把目前分頁寫進網址（保留 React Router 的 history state）；連到其他面板內容的錨點（例如 NF4 卡片的「看 NF4 載入失敗的原因」）會先切換分頁再捲動。列印時印出全部面板、隱藏分頁列。
- 樣式：分頁列 sticky 在 winbar 下方並延伸蓋住行號欄，選中的分頁用 `surface-selected` 加底部 2px `action-primary` 線；窄螢幕時在自身範圍橫向捲動。配方寫入 `docs/DESIGN.md` §9。

## 翻譯

中文片段與英日對照由同一個產生腳本（任務暫存目錄）輸出，每個文字節點在產生時就和譯文成對，共 326 組；相同原文只能有一種譯文，腳本在衝突時停止。英文節標依慣例列入對照（英文保留、日文翻譯），接在行內元素前後的譯文保留邊界空格。翻譯不代表重新量測或第三方審閱。

## 驗證

在最終工作樹上執行（2026-10-18）：

- `pnpm verify`：通過。依序包含 `format:check`（全部符合 Prettier）、`lint`（0 warnings）、`typecheck`、`test`（20 個檔案、155 個測試全部通過，含新增的媒體契約測試：只接受記錄在案、固定 commit、`preload="none"` 的影片與音軌，封面與影片同尺寸、沒有未引用的檔案）、`build`（`content:check` 驗證 45 個筆記版本與 119 個預先產生的路徑；112 個進 sitemap；`check-artifact` 確認 499 個檔案、所有本機連結與封面有效，首頁初始 JS gzip 143.4 KiB，上限 150 KiB）、`test:e2e`（Chrome，111 個測試全部通過，含新增的 2 個：從筆記目錄經 AI、影片、數據比較進入筆記，53 支影片都沒有預先載入、聲音切換可用、沒有第三方請求與 cookie；三種語言的 axe、320–1920px 不溢出、無 JavaScript 可讀）。
- 另以本機 `127.0.0.1` 預覽與 Chrome 檢查：三種語言的筆記在 320、390、768、1280、1440、1920 px 都沒有水平溢出，沒有 console 錯誤；載入頁面時只有本站請求，16 張封面載入，影片停在 `NETWORK_IDLE`／`HAVE_NOTHING`。人工檢視截圖：筆記目錄的 AI 卡片、Explorer 的 AI › 影片 › 數據比較 › H3 DiT 元件比較、頁首數字卡、2×2 影片視窗與圖例（1440 與 390 px）、速度與 denoise_av 長條圖（日文 320 px）、證據圖、元件卡片與 NF4 錯誤卡。
- 實際播放（會連到 Hugging Face，不在 e2e 測試內）：按下播放後只連 `huggingface.co` 與 `us.aws.cdn.hf.co`，沒有失敗的請求與 cookie；2×2 影片以 1540×900 播放，切到左下格時影片靜音、該格音軌同步（4.70 對 4.74 秒），靜音全部停止；摺疊裡的原始輸出以 768×448 播放。
- 初版發布後（commit `dae7522`、`2353850`）在公開網址上檢查過：三種語言的筆記頁、資料夾頁與封面都回 200，53 支影片都固定在 commit 且 `preload="none"`；在 dennysora.me 上實際播放成功。另外發現 Cloudflare 在每一頁載入 `static.cloudflareinsights.com` 並設定 `cf_clearance` cookie，這不是本站 HTML 的內容，已告知擁有者，沒有更動 Cloudflare 設定。

追加變更（AI 改為最上層區域、內文分頁）的驗證（2026-10-18）：

- `pnpm verify`：通過。`format:check`、`lint`（0 warnings）、`typecheck`、`test`（20 個檔案、155 個測試，含 AI 區域的路徑、麵包屑、區域狀態與六個 buffer）、`build`（45 個筆記版本、119 個路徑；`check-artifact` 499 個檔案、所有本機連結有效，首頁初始 JS gzip 143.5 KiB）、`test:e2e`（112 個測試全部通過；新增或改寫：從 tabline 的 `ai` buffer 進入 AI 區域與筆記、筆記目錄不再列 AI；分頁一次顯示一個面板、點擊與方向鍵切換、網址與重新整理保留分頁、連到其他分頁的錨點會切換；三種語言與每個分頁的 axe、320–1920px 不溢出、無 JavaScript 時全部面板顯示）。
- 另以本機預覽與 Chrome 截圖檢查：Explorer 的 AI 與筆記同一層、tabline 的 `ai` buffer、麵包屑與狀態列的 `ai/video/comparisons/h3-dit-components.md`、AI 區域首頁、分頁列（1440 px 與日文 390 px），以及捲動時分頁列固定在 winbar 下方、蓋住行號欄。
