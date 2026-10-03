# 2026-09-20 本機交付紀錄

> 2026-09-26 更新：介面、配色、搜尋與留言設定已依 UI／UX v2.1 改版，現況與驗收見 [DELIVERY-v2.1.md](DELIVERY-v2.1.md)。本文保留 2026-09-20 當時的紀錄。

本紀錄是 ZIP 計畫的執行狀態。使用者已授權完整重寫，並確認舊 blog repo 已刪除。原 SPEC 的 REQ-022「只做規劃」是历史階段限制，已由本次指示取代；远端操作仍需其明確範圍。

## 已交付

React/TypeScript/Vite/Tailwind/pnpm 靜態網站：三語首頁、自介、文章、專案、研究與隱私頁；3 篇既有 profile 整理筆記 × 3 語言、3 個專案 × 3 語言。38 個預渲染頁（包含 404），37 個 sitemap 路徑；另產生明確 legacy bridge 和 20 個缺失舊文章說明頁。正文與導覽在無 JavaScript 時仍可用。

每語系搜尋、篩選、RSS、canonical/hreflang、OG、JSON-LD；hash 驗證的翻譯發布規則；Markdown 清理；原生 GitHub Discussions 設定契約；固定研究快照、匯入器和來源標記；只發布 `build/client` 的 CI／手動部署 workflow。主站未上線，本紀錄不代表遠端驗收。

## 驗證

- **passed**：`pnpm install --frozen-lockfile`；`pnpm verify` 包含 formatter、零 warning ESLint、嚴格 TypeScript、23 個 unit tests、內容驗證、production build、artifact audit，以及 24 個 Playwright tests（其中 7 個 axe accessibility 案例）。
- **passed**：38 個深層路徑直接取得完整 HTML；本機真實 404、legacy 路徑／錨點、缺失文章說明；RSS/sitemap XML、已發布 alternate URL；所有產物內部檔案連結存在。
- **passed**：三語切換保留文章；搜尋斷詞、URL 篩選、空結果、503 retry；程式碼複製、no-JS、鍵盤操作、焦點循環／返回、快速連續開關、reduced motion；公開 loader 不帶其他語系草稿 metadata。
- **passed**：320/360/390/768/1280/1440/1920 CSS px 的實際頁面 geometry 與圖片載入；代表頁無全頁水平溢出。Production Research 頁沒有跨站請求、cookie 或 localStorage 寫入。
- **passed**：`pnpm audit --audit-level high` 回報 no known vulnerabilities；policy manifest 全部一致；`git diff --check`；文件相對連結、來源記錄與產物檢查。
- **passed**：日導讀 `.html`、研究首頁及 `/reports/` 的公開 HTTP 狀態為 200。此前 `/day/.../` 和 `/reports.html` 返回 404，已修正本站連結。
- **warning**：Playwright 子程序繼承的 `NO_COLOR` 與 `FORCE_COLOR` 產生色彩環境衝突提示；功能測試通過，未將這些提示說成零警告。
- **not run**：GitHub Actions 遠端 runner、Pages 發布、真實 Discussions 發文／管理、DNS/TLS 遷移、Nano 排程／資料庫備份與回復、實體手機與 Safari/Firefox。
- **blocked**：真正瀏覽器 200% zoom 的驗收。可用的隔離驗證是 headless Chrome；沒有以 DPR、CSS zoom 或窄 viewport 冒充真實 browser zoom。
- **unavailable**：共享 `tools project-quality` engine 未安裝；使用上列 repository-native gates，未安裝全域能力。Context7 三次查詢額度用於 React Router，其他元件以官方文件補足，見 IMPLEMENTATION。

## 瀏覽器與視覺證據

在 macOS 的獨立 Playwright CLI session `dennysora-rebuild` 與測試 runner 新 context 中驗證，不使用個人瀏覽器資料。使用系統 sans-serif/monospace、暗色；資料為本次三語 profile、2026-09-17 研究快照。

已檢視 1440×900 繁中首頁、1920×1080 英文首頁、1280×800 日文長文、320×844 繁中首頁、390×844 日文文章、1440×900 英文 About／長文中段、390×844 英文搜尋空結果與手機選單。觀察到並修復：導覽副標對比 4.44:1、ToC 的 `&amp;` 顯示、快速 Escape 後延遲解除背景捲動鎖。修正後 axe 和行為檢查重新執行。

截圖與過程紀錄只留在本機暫存 `dennysora-rebuild-evidence` 目錄；未加入 repo 或公開產物。效能證據限於產物 initial module graph gzip 123.6 KiB、低於 150 KiB gate；沒有以此宣稱 Lighthouse 分數或現場 Core Web Vitals。外站研究應用的完整閱讀旅程未測，不等同 HTTP 200 檢查。

## 需求對照與剩餘範圍

| REQ / TODO                  | 狀態與證據                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 001 / 003 / 004 / 006 / 008 | 本機完成；完整旅程、SSG、三語、schema、暗色設計。                                                                                     |
| 002                         | 本機政策 checksum、載入 skills 和架構決策完成；私人 Ops-Tools 來源版本未遠端比對。                                                    |
| 005                         | 響應式、鍵盤、無 JS 與長文通過；真實 200% zoom 尚未驗收。                                                                             |
| 007                         | 發布／translationState/sourceRevision 規則完成；已刪除五篇的翻譯不適用。新編輯標題摘要未經使用者人工校閱。                            |
| 009                         | 本機連結元件、共用 discussion ID 契約完成；repository/null 與 number/null 明示不可用，尚無真實遠端討論。                              |
| 010                         | blocked：來源已刪除，5 篇本文未取得，匯入 0 篇。不產生假文章或通用 AST extractor。                                                    |
| 011                         | not run：未移轉 repo。研究來源已位於 DennySORA；舊 blog 已刪除。                                                                      |
| 012 / 017                   | not run：未碰 Nano、writer、state、資料庫、排程或備份系統。                                                                           |
| 013                         | 完成：三語 Research、3 筆固定 metadata、原論文／生成導讀與週月報入口。                                                                |
| 014                         | 本機 bridge/錨點/404/SEO 完成；DNS、跨 owner domain 與遠端 Pages 不在本次執行範圍。                                                   |
| 015                         | 本機 frozen install、完整 artifact 與測試完成；CI 遠端／部署未執行。                                                                  |
| 016                         | 三語 JSON 索引 + Intl.Segmenter、RSS、sitemap/metadata 完成；未使用原計畫候選 Pagefind，取捨見 IMPLEMENTATION。                       |
| 018                         | 現有 profile／研究 provenance 完成；已刪除五篇無法驗證原文日期與署名。                                                                |
| 019                         | 搜尋失敗／空結果／retry、選單恢復通過；研究匯入驗證後原子替換保留 last-good，顯示固定快照；無快照 UI 已實作，該分支瀏覽器測試未執行。 |
| 020                         | 寫作／審阅／發布文件和 CI 契約完成；未進行遠端 PR→deploy 演練。                                                                       |
| 021                         | 經歷與專案取自固定原站來源，保留既有工作技術，不虛構成效；最終文案尚可由作者校閱。                                                    |
| 022                         | 以本次使用者完整重寫指示取代原「只規劃」限制；沒有 commit/push/deploy/遠端移轉。                                                      |

## 維護入口

[README](../../README.md) 提供啟動與驗證命令；[寫作指南](../CONTENT_WORKFLOW.md) 說明草稿、翻譯、原生討論、快照更新、人工發布與回復。PROJECT_AGENT 保留歷史架構紀錄，以 [IMPLEMENTATION](IMPLEMENTATION.md) 說明本次授權遷移；受管政策未改寫。

清理結果：本次 Playwright CLI session 已關閉；4172 舊站比較 server 與 4173 production preview 均已停止，E2E 的 4174 server 已由 runner 清理。原始來源下載暫存已移除，保留本機截圖／驗證紀錄供交付檢視，未動個人瀏覽器或全域服務。

## 2026-10-03｜P2P 筆記整合（本機完成，發布驗收待續）

本次授權：整理兩份提供的 HTML，沿用個人網站風格加入筆記，驗證後 commit、push、部署。工作範圍限定網路與 P2P 筆記，不改其他專案或站台設定。

- 路徑：`/{locale}/note/network/` 分類頁；兩篇原稿僅建立 `zh-hant` 版的 `p2p-downloader/`、`p2p-privacy/`。分類介面保留既有三語，未製造文章翻譯。
- 設計：保留工作台外框、檔案總管、分頁、麵包屑與狀態列；正文使用既有語義暗色 tokens。章節目錄、正文、圖表、規則示例與折疊原稿依閱讀順序配置。頁面本身捲動；寬圖表有局部水平捲動。
- 內容：保留架構25份原文契約附錄、6張架構圖、134筆未探測候選；隱私研究保留12個重整主題、63節原稿與序文、24筆來源。來源檔名、SHA-256 與匯入範圍記於 `data/note-imports.json`。原文附錄文字（套用 HTML pre 首換行規則）和原有外部來源連結均逐項比對一致。
- 安全邊界：移除來源的獨立頂列、側欄、主題切換與可執行腳本。互動改為本站的離線漸進增強，不執行 P2P 連線、來源探測、HTTP 請求或瀏覽器持久儲存。原稿的查證與驗收日期明示為來源記錄，不當成本站重新驗證。
- 建置修正：原有 artifact gate 把契約中的 GitHub raw 文字 URL 誤判成外連資產；改為檢查 HTML 實際載入的資產屬性及 CSS URL，JS／CSS 等檔案仍保留原來的禁止規則，並新增回歸測試。
- 已通過：frozen-lockfile 安裝（未改 manifest／lock）、格式、ESLint、TypeScript、79項單元測試；41條 prerender 路由、28條 sitemap 路由、149個產物檔案的內部連結檢查，初始 JS gzip 142.6 KiB。
- 本機瀏覽器測試：blocked，設定的 `/opt/google/chrome/chrome` 不存在；未安裝全域瀏覽器。已新增網路筆記的互動／無 JS／可及性／320–1920px 測試，等待有 Chrome 的 runner 執行。雲端瀏覽器存取本機預覽回傳 `net::ERR_BLOCKED_BY_CLIENT`，所以發布前視覺驗收亦為 blocked；未改用 tunnel／proxy 繞過限制。
- 工具限制：`tools project-quality`／workflow engine 與 Context7 不可用；使用既有 repository-native gates 與 React／pnpm 官方文件。Git skill 的 companion resources 無法讀取；提交需按 repo `GIT_COMMITS.md` 人工核對完整 diff、身份、訊息和實際物件，不能宣稱 helper 已通過。
- 下一步：在既有明確授權下提交／推送，於有 Chrome 的 CI runner 執行完整 gate；部署須等待既有驗證與認證能力就緒，再核對 Pages 精確 commit 與實際公開頁面。不能以 source／build 通過替代瀏覽器驗收。
