> Historical draft checkpoint. For the subsequent authorized publication and current technical workflow, see [the publication record](DELIVERY-blog-publication-2026-10-25.md).

# Blog／網路與工具新稿整合（草稿）

日期：2026-10-25。手動交接紀錄 `bootstrap_manual`；檢查摘要為 `agent_reported`，
不是機器工作流程的 `runner_observed` 狀態。未提交、未推送、未發布。
既有專案未提供可呼叫的 project-workflow engine；本紀錄沿用 docs/process，
不建立第二套狀態資料庫或捏造 ticket revision。

## 範圍、來源與保存

- 依使用者要求新增 Blog → 網路／P2P 隱私與 Blog → 工具／翻譯系統架構。
  完整繁體中文、英文、日文本文；既有配色 token、Article／TOC／Explorer 邊界保留。
- 原始附件僅以文字解析，**從未執行其 HTML script**。來源是使用者上傳稿，
  不是臆測的 Git snapshot；工具稿沒有作者或 repo revision，兩者不補造。
- `p2p-privacy-blog (1).html`：115435 bytes，SHA-256
  `3ccb46b68985e1f4e635d5e6fab67ceb516c9c6ac19f960de32f9eb7f2432306`。
- `browser-script-manager-translation-v1(1).html`：139298 bytes，SHA-256
  `05f216991fa9d35b2897f034d95f1d834fb9b643f974d7ce95fa6d121b8ec945`。
- 隔離工作樹 `dennysora-new-blog`／`draft/new-privacy-tools-2026-10-25`，接續先前
  `imported-blog-drafts-final.patch`（SHA-256
  `bc4c35cb235e790d055e4ae84306a4980e759cbfb68f5dece395c31096f1555a`）。
  先前兩篇的 8 個本文／metadata 檔案逐 bytes 相同；全部既有 notes 逐 bytes 相同，
  包含原有 P2P privacy note，沒有擅自取代。
- 預定路徑：`/{locale}/blog/network/p2p-privacy-boundaries/` 與
  `/{locale}/blog/tools/browser-translation-architecture/`。工具分類有三語標題與說明；
  空分類不公開。四篇新增稿全部維持 `draft`；新英日譯稿仍是 `machine-draft`，
  `reviewEvidence: null`。獨立代理審閱不冒稱人工審閱或公開 immutable evidence。

## 內容保存與互動邊界

| 新稿     | 原稿唯一文字段 | 本文採用／其餘對應                          | 圖／表 | H2／H3 | SVG／SVG 文字 | 外部來源（唯一） |
| -------- | -------------: | ------------------------------------------- | ------ | ------ | ------------- | ---------------: |
| P2P 隱私 |            561 | 519／42 由 metadata、網站 TOC、受控互動承接 | 9／3   | 14／29 | 3／60         |               35 |
| 翻譯架構 |            957 | 942／15 由 metadata、受控互動承接           | 18／11 | 15／1  | 8／136        |                2 |

- 上傳稿的頁殼、重複導航、裝飾 icon 與全域 CSS 移除；教學內容、公式、數字、
  引用與可編輯 SVG 保留。所有圖解文字、title／desc／ARIA 都有三語版本。
- `privacy-demos.ts` 以網站持有的 DOM API 重建 VPN／多跳路徑、隧道中斷、
  40 個半秒取樣與 lag／相關係數、候選數／誤報率 Bayes 示意、三階段 mixing。
  固定原稿資料與公式在 `article-demo-models.ts`，不抓流量、不呼叫 API。
- `translation-demos.ts` 重建先讀區的狀態、方向、H／B 整數驗證、10000px 上限、
  0 邊距特殊情況與註冊領先 0.5H；並提供六張 SVG 的本機下載。
  圖表／文字在無 JS 時仍完整，靜態說明沒有偽裝成可操作控制項。
- 互動程式不使用 `innerHTML`／`eval` 或上傳 handler；控制項用 `textContent`。
  reduced motion、頁面隱藏、離開與個別圖離開 viewport 會停止動畫；teardown 清理
  listener／timer／object URL。這些為實作與靜態檢查，不宣稱真實瀏覽器行為已驗收。
- 靜態 sanitizer 仍拒絕 script、style、input、button、iframe、外部載入與事件屬性。
  新增的安全 ID／ARIA 與命名空間 class 必須通過原有 ID／連結驗證。
- 編譯旗標依每篇實際 publication 決定 demo chunk；目前全為 false，公開 build
  不含兩篇草稿的互動 copy／JS chunk。私有預覽才另行編譯受控互動。
- 修正 artifact check 的文章媒體路徑，改由 `articlePath()` 產生分類網址。

## 獨立翻譯審閱

原始 source／EN／JA map 都凍結；修正只在明確的整合 override ledger，沒有暗改來源。
P2P 審閱核對全部 561 組、869 個 HTML 元素／每語言；Tools 核對全部 957 組、
2868 個文字／alt slot／每語言。最終版本完成獨立複查，數值／公式與 SVG 幾何保留。
發現並修正：P2P 英文保護方向、entropy 定義、句間空格、非色彩 hatching；
工具稿 Fig06 placeholder 還原日文語序、英文示例標點與四處文字邊界。
完整審閱與 frozen hash 見同目錄的兩份 REVIEW 紀錄；不是完整實作安全稽核或來源事實認證。
P2P 審閱時的受控 copy 為 88 + 12 組；後續 Tools 增加第 13 組原稿 local-only
提示（ID410），已由 Tools reviewer 獨立核對。P2P copy／本文未變；此後的 Tools copy
最終 hash 以 Tools REVIEW 為準，不將舊的跨稿檔案 hash 冒稱目前 hash。

## 實際檢查與限制

- **passed**：manifest 範圍 Prettier；ESLint 0 warning；React Router typegen；tsc；
  32 個 unit test files／258 tests；內容檢查；完整 client／SSR build；finalize；
  search gate；artifact check；`git diff --check`。使用既有專案依賴，沒有安裝；
  未宣稱使用精確鎖定的 pnpm executable。Node v24.22.1。
- 單一完整成功批次 log：`new-blog-article-input/integrated-gates-20261025.log`，SHA-256
  `5de41dd615dc7e6beb1a0b228f79d8a3b2376e5f426c86bbc527e276316ec3fe`。
  計數：6 posts、0 published editions、18 note editions、71 routes、64 sitemap URLs、
  326 artifact files、initial JS gzip 145.7 KiB。沒有草稿 demo chunk 出現在公開資產。
- 早先檢查先後發現 metadata 格式、誤用不存在的 CLI 檔名，以及預期 post 清單仍為四篇；
  已依實際六篇修正後重跑完整批次，不把分散的局部成功冒稱整批通過。
- 四篇 × 三語私有預覽已產生並逐 hash 複製到 task-owned allowlist 目錄，共 22 檔，
  `private-preview-manifest.json` 記錄來源與副本 hash。不是正式網站殼／導覽驗收。
- **blocked**：使用者已同意 dot 雲端瀏覽器檢查及截圖；目前未取得可到達的私有預覽。
  shell Chromium 在啟動時 IPC socket 被拒，未載入任何稿件；沒有停用 Chromium sandbox。
  managed cloud browser 只允許 HTTP(S)，拒絕 `file:`；任務預覽的 loopback URL 回報
  `ERR_CONNECTION_REFUSED`。同一程序中建立／讀取／關閉 ephemeral loopback server 的
  self-probe 成功（200，53161 bytes），後續以同一已 self-probe 成功且輸出 READY 的 listener 保持存活，managed cloud browser
  仍回報 `ERR_CONNECTION_REFUSED`；該 listener 已停止，沒有繼續重試。
- **not_run**：四篇 × 三語實際排版、1280／1440／1920 desktop、mobile、鍵盤與互動、
  no-JS／reduced-motion／forced-colors、axe、下載結果與 screenshot inspection。
  不宣稱任何圖片已驗收，也沒有以公開部署／隧道繞過私有預覽限制。

## 恢復膠囊／下一步

單一寫入者為本整合代理；翻譯與獨立審閱代理只寫 scratch maps／reports，不寫 repo。
下一個安全操作：由父任務提供支持且授權的私有 browser-reachable preview route，
核對 manifest 後完成四篇三語的視覺／互動驗收；若改動本文，重算 sourceRevision 並請
獨立 reviewer 複查新 hash。所有刊登、來源 commit、reviewEvidence URL、push／release
仍需父任務另行確認。Trello 普通文章卡保留未完成，等待審閱與預覽，不標成已發布。
