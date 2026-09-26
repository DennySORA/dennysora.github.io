# 2026-09-26 UI／UX v2.1 交付紀錄

依據：`DennySORA_UI_UX_v2.1_Package.zip`（`DennySORA_UI_UX_Spec_v2.1.md` 為唯一有效規格，`CODEX_HANDOFF.md` 為授權邊界）。網站變更在本機實作與驗證；GitHub 端的留言設定由擁有者明示指示後以 `gh` 完成（見〈GitHub 端設定〉）。未部署網站（[workflow](../../.github/workflows/site.yml) 只在手動觸發且 `deploy=true` 時發布），未改 DNS／Nano，未安裝 GitHub App，未發表任何留言。

## 基線（CP-00）

改版前在同一台機器執行：`pnpm verify` 全數通過（23 個 unit、24 個 Playwright）；首頁 initial JS gzip 123.6 KiB；CSS 34,015 bytes（gzip 8,688）。

## 已交付

- **品牌與配色**：v2.1 semantic-dark tokens 成為唯一 theme owner（[tokens](../../src/styles/tokens.css)）；兩個本案衍生值有標註。根元素與第一份 HTML 即帶 `data-theme="dark"` 與 `color-scheme: dark`。Header／Footer 使用 `assets/logo.png` 原檔：該圖是無字標的插畫，因此旁邊放文字名稱；可見像素範圍與透明邊界經量測，以負邊距對齊而不裁切（[brand-assets](../../data/brand-assets.json)）。
- **版型**：移除 Explorer、`.md` 分頁與狀態列；共用 Header（桌面導覽、搜尋、語言選單）、手機原生 dialog 選單與 Footer；Profile、Library、Reader 三種版型。
- **About**：由 [`profile.json`](../../content/profile/profile.json) 驅動的結構化頁面：定位與主要動作、三項核心能力（等級、代表工作、證據連結、工具）、代表作品、可展開的完整經歷、目前探索、工程之外與學歷、完整紀錄、聯絡。舊履歷逐項保存並有遷移對照。
- **文章與研究**：單一內容庫；Topic／type／Tag 三個維度；可分享的 URL 狀態；Pagefind 全文搜尋（命中標示、章節子結果、相關性／最新排序、索引失敗時的標題摘要模式）；靜態 Topic／Tag／Tag 索引頁。
- **Reader**：閱讀欄與條件式目錄、手機收合目錄、程式碼複製（成功與失敗都如實顯示）、複製文章連結、來源說明、作者短介、留言狀態、相關文章（明確關聯優先）。
- **Renderer**：建置時高亮（class 輸出、無 inline style）、KaTeX 公式、圖片與圖說、註腳、提示框、表格捲動區；作者 HTML 與產生器輸出分別清理；已發布錨點凍結並由建置檢查保護。
- **留言**：`unconfigured`／`github-native`／點擊載入 `giscus` 三態設定與狀態機。目前為 `github-native`：每篇文章連到本 repository 的一個 Discussions 討論串，三種語言共用；頁面不內嵌也不載入第三方內容。依規格第 13 節，原生連結是永久備援、不算完成內嵌留言；giscus 的服務決策與 App 授權仍待擁有者決定。
- **論文日報與舊 Research**：新增 `/papers/`；`/research/` 改為 noindex 的雙出口導引頁。
- **專案**：每張卡片具名連到真實 repository；無案例時不顯示「查看案例」，舊專案網址保留但 noindex。
- **建置**：Pagefind 索引步驟、產物檢查（深色根元素、品牌素材 blob、禁止 GitHub raw、搜尋語系、sitemap 與 robots 一致）。

## GitHub 端設定（2026-09-26，擁有者指示以 `gh` 執行）

- 啟用本 repository 的 Discussions（`gh api -X PATCH repos/DennySORA/dennysora.github.io -F has_discussions=true`）。
- 以 GraphQL `createDiscussion` 在 **Announcements** 分類為每篇文章建立一個討論串：[#1](https://github.com/DennySORA/dennysora.github.io/discussions/1) 工程原則、[#2](https://github.com/DennySORA/dennysora.github.io/discussions/2) 生產系統、[#3](https://github.com/DennySORA/dennysora.github.io/discussions/3) 三語模型研究。這個分類只有維護者能開新串，任何 GitHub 使用者都能留言。三串皆未關閉、未鎖定，未登入的 HTTP 讀取回應 200；編號已寫入各文章的 `meta.json`。
- [`data/comments.json`](../../data/comments.json) 改為 `github-native`；新增 [`giscus.json`](../../giscus.json)，日後啟用 giscus 時只允許 `https://dennysora.me` 內嵌。
- 以擁有者的 `gh` 登入確認 Ops-Tools、Image-Tools、Auto-Video-Organize 是 private repository。
- 確認 GitHub Pages 採 workflow 發布：push 與 pull request 只執行驗證，不會部署。
- 依交接包不自行安裝 GitHub App：giscus App 的安裝與授權留給擁有者在 GitHub 網頁完成。

## 驗證

| 指令 | 結果 |
|---|---|
| `pnpm verify`（format、lint、typecheck、unit、build、e2e） | passed：64 個 unit、53 個 Playwright（含 14 頁 axe 與互動狀態 axe），build 產生 74 條路由、61 條進 sitemap，搜尋索引三語各 3 篇 |
| initial JS gzip | 137.0 KiB（基線 123.6 KiB，預算 150 KiB） |
| CSS | 54,819 bytes（gzip 10,717；基線 34,015／8,688） |
| `gh api graphql` 查詢 Discussions | passed：#1–#3 存在、位於 Announcements、未關閉、未鎖定 |
| 未登入 `curl` 讀取 #1–#3 | passed：皆為 HTTP 200 |

Chrome 實際檢視（production build，loopback 預覽）：1280×800、1440×900、1920×1080、768×1024、390×844、320×720 的 About、Reader、文章庫、專案、論文日報、首頁；以及手機選單、搜尋命中、索引失敗、多重篩選、語言選單、404、Tag 索引、Research 導引、鍵盤焦點。檢視時發現並修正：清單標記消失、雙重分隔線、無 JS 提示在有 JS 時出現、次要按鈕外連圖示顏色錯誤、手機選單貼齊左上角、Tag 數量對齊錯位、日文標題在詞中換行、搜尋摘要混入程式碼工具列文字、與文章標題重複的章節子結果、768px 段落標題被擠成兩行。

## 規格第 19 節驗收對照

| ID | 狀態 | 證據或原因 |
|---|---|---|
| A01–A05 | passed | e2e 首屏內容（1440／390）、結構化資料、鍵盤展開；unit 比對舊履歷每一項 |
| P01、P02、P04 | passed | e2e 真實 repository、外連圖示皆在連結內、工作專案標明角色與組織 |
| P03 | **blocked** | 至少一篇完整案例需要作者提供內容；結構與顯示條件已完成 |
| L01–L05 | passed | unit 篩選語意與 URL 狀態；e2e 篩選、重整、返回、無 JS Tag 頁 |
| S01、S04、S05 | passed | 建置斷言索引筆數；e2e 索引失敗與重試；過期回應在 effect cleanup 後忽略，e2e 驗證後輸入者勝出 |
| S02 | passed（事件層級） | e2e 以合成 composition 事件驗證；未以真實作業系統輸入法實測 |
| S03 | partially | 真實內容的中英日關鍵查詢已驗證；尚未建立事先審閱的 golden query fixture 語料 |
| R01–R08 | passed | 各尺寸截圖、fixture 渲染（390／1440）與安全 unit、錨點回歸、目錄不寫 history、複製、列印與無 JS |
| C01 | passed | 設定指向本 repository；#1–#3 以 `gh` 建立並查詢確認存在，未登入讀取 HTTP 200；unit 檢查編號不重複且網址正確 |
| C02 | passed | 編號放在與語言無關的 `meta.json`；e2e 驗證英文與日文頁連到同一串 #1 |
| C03 | passed | e2e 各頁（含文章留言區）無第三方請求；目前模式不內嵌元件，giscus 模式點擊前維持 dormant（unit） |
| C04 | partially | 原生討論串公開可讀，登入與發文走 GitHub 原生流程；內嵌讀寫需安裝 giscus App 後由擁有者人工驗收；未代為發表測試留言 |
| C05 | passed（unit＋真實備援連結） | 狀態機與訊息驗證（origin、source、資料形狀）；備援連結指向已確認存在的討論串；尚無真實 iframe 可測 |
| C06 | not run | 需真實 giscus；已固定官方深色主題並對應 zh-TW／en／ja |
| D01、D02 | passed | e2e 首屏外站入口與生成標記；瀏覽時不向外站請求 |
| N01、N02 | passed | 產物檢查與 e2e（舊 slug、RSS、sitemap、bridge、四段路由、真 404） |
| I01、I02 | passed | 語言連結只來自已發布版本；三語介面文字齊全。現有文章皆有三語，缺譯介面尚未以真實內容觸發 |
| X01、X03、X04、X05 | passed | e2e 320–1920 無溢出、computed 對比、dialog 焦點與捲動；手機只有文件本身捲動 |
| X02 | partially | reduced motion 與鍵盤已驗證；真實瀏覽器 200% zoom 未執行 |
| V01 | passed（附差異） | 與交接包預覽逐頁比對，差異見下 |
| B01–B04 | passed | 原檔 blob 比對、尺寸與透明範圍量測、同源產物、圖片失敗時保留文字品牌 |
| T01–T05 | passed | unit token 值與對比；e2e 語意色、狀態色只用於真實狀態、OS 亮色首訪仍為暗色 |

## 與參考畫面的差異

- Header 顯示真實 Logo（參考截圖為文字備援）。
- 桌面目錄與文章標題區對齊，而非與正文第一段對齊。
- About 首屏的定位句採用規格 6.2 的「後端、雲端與 AI 系統工程」。
- 能力區塊依規格 6.3 加上代表工作與工具列；專案卡片加上角色說明。
- 論文日報頁保留一份標示日期與生成狀態的固定快照。
- 留言區目前只有「在 GitHub 開啟討論」連結，沒有參考畫面的「載入留言」按鈕；giscus 授權完成並切換設定後才會出現。

## 需要擁有者決定或審閱

- 是否接受 giscus 服務與 App 權限（規格第 13 節的服務決策）。接受的話，在 GitHub 網頁只為本 repository 安裝 giscus App，再依[寫作指南](../CONTENT_WORKFLOW.md#留言)把設定切成 `giscus`，之後人工驗收 C04、C06。
- 至少一篇專案完整案例的內容。
- About 新文案（定位、簡介、能力說明、經歷摘要）：繁中依交接包；英文與日文由既有公開譯文改寫，尚未經作者審閱。
- Tag 與寫作類型的標注。
- Ops-Tools、Image-Tools、Auto-Video-Organize 已確認是 private，未列入新 About；改為公開後可依[遷移對照](../../data/migration/about-sections.json)恢復。
- `PROJECT_AGENT.md` 仍描述改版前的單頁 HTML 架構，未由本次修改。
