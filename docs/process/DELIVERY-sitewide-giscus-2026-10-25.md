# 全站 giscus 留言

2026-10-25。`agent_reported`；基準 `320dbdcc29d9edc7efc69c5f7b6eedf3b19672d5`，開始時工作樹乾淨，fresh fetch 的 `main`／`release` 均為同一提交。

## 範圍與狀態

- 擁有者要求使用 GitHub Discussions 的 giscus，支援討論串回覆、表情反應、深色及多語介面，並放在每個頁面。程式沿用官方 script，不安裝 npm 套件，也不更動依賴、鎖檔、工作流程、CNAME 或安全設定。
- 所有 114 個正式語言頁（38 個固定內容識別 × 三語）都有且只有一個留言區：首頁、部落格索引／資料夾／文章／主題／標籤、筆記索引／資料夾／內頁、專案索引／分類／詳情、搜尋。根目錄語言導向、404、舊網址轉址及 JSON/XML/搜尋資源等非內容回應不放留言。
- `specific`＋`strict=1` 以有型別命名空間的內容 ID 共用三語討論，不依賴翻譯標題、語系路徑或查詢。原有數字映射保留，既有討論不搬移、不刪除、不複製。四篇正式文章僅將 `commentsEnabled` 設為 true，12 份 HTML 正文逐位元組與基準相同。
- 讀者按下載入前無第三方資源請求；載入後官方 script 可使用 giscus/GitHub 與登入階段儲存。三語說明已同步，GitHub 搜尋／原討論備援在無 JS、載入失敗與重試期間可用。`Discussion not found` 對新頁面是可留言空狀態，對既有討論編號仍是錯誤；訊息驗證 origin 與本次 iframe。
- 留言介面文字不進站內搜尋或 Pagefind。文章留言仍放在原本正文欄，前一次閱讀欄／側欄修正未變；其他頁面沿用 container、深色語意 token 與既有 comments-panel。
- 公開設定已切換為 `giscus`；官方唯讀 `https://giscus.app/api/discussions/categories?repo=DennySORA%2Fdennysora.github.io` 讀回 `repositoryId: R_kgDOT4fpCQ`，`Announcements` 分類為 `DIC_kwDOT4fpCc4DGcnr`。仍只使用原 repository 及既有 `giscus.json` 允許來源。部署狀態以此提交的工作流程與正式網址另核對，不能僅由本地建置推論上線。

## 檢查與限制

執行位置為 repository root，dot 雲端 Node 24.22.1，沿用既有相同鎖檔的依賴及套件 CLI 入口，未安裝工具。測試選擇先盤點：核心為路由識別／舊編號／lazy 初始 HTML／訊息來源／空與錯誤狀態／搜尋排除／既有文章與 SEO；沒有新增廣泛 snapshot 或移除核心測試，Playwright 保持 opt-in。

- Prettier、ESLint 零警告、React Router typegen、TypeScript：passed。
- 四個核心 Vitest 檔案：最初 18 passed／1 failed，原因為代理誤讀歷史資料後寫錯 fixture（不是產品錯誤）。依實際 `loadPosts()` 與 GitHub 標題校正為 `engineering-principles → #1`、`production-systems → #2`；相同選擇重跑 19 passed／4 files，1.19 秒；正式 giscus 設定加入後，相同四個檔案再驗證 19 passed，1.22 秒。不把第一輪說成通過。
- 內容驗證與完整正式建置：passed，116 routes、112 sitemap URLs、465 files、初始 JavaScript gzip 147.0 KiB。成品守護核對 114 留言區與讀者選擇前無 giscus script/iframe/link，原文章置中／獨立目錄 CSS 守護仍通過。
- `git diff --check`：passed。正式 `https://dennysora.me/en/` 只讀 HTTP 檢查為 200，未見 CSP 回應標頭；此為部署前現況，不是新版本上線證據。
- 未執行瀏覽器預覽、截圖、完整 Playwright 或真實帳號留言／表情反應：`not_run`，`user_opt_in_required`。使用者自行看上線外觀；如要求實際互動檢查另以已授權工具診斷。不建立測試用公開討論。

命令：

```text
node node_modules/prettier/bin/prettier.cjs --check src scripts tests content data '*.ts' '*.js' '*.json' '*.yaml' '.github/workflows/*.yml' README.md
node node_modules/eslint/bin/eslint.js . --max-warnings 0
node node_modules/@react-router/dev/bin.cjs typegen
node node_modules/typescript/bin/tsc --noEmit
timeout 55s node node_modules/vitest/vitest.mjs run tests/unit/comments.test.ts tests/unit/site-search.test.ts tests/unit/published-blog.test.ts tests/unit/seo-metadata.test.ts
node scripts/check-content.ts
node node_modules/@react-router/dev/bin.cjs build
node scripts/finalize-build.ts
node scripts/build-search.ts
node scripts/check-artifact.ts
git diff --check
```

下一步：依已驗證的正式設定重建／檢查 → 在既有授權範圍非 force 推進 `main`、`release` → 核對部署狀態、正式 HTTP/資源及無寫入的留言載入。不建立公開測試留言或表情反應。

## 後續修正：自動顯示與錯誤後恢復

基準 `f501cfe2db729a703154ebd72ebb03c3af56ab09`。擁有者回報 Android 首頁顯示「留言載入失敗／留言服務被封鎖或無法連線」，並要求預設顯示留言及輸入框，只有發言才需要登入。已實際檢視截圖；它不是逾時訊息。正式站英語首頁與繁中醫學筆記在匿名閱讀時可正常載入，未重現該裝置的上游連線問題，因此不把網路、登入階段或請求上限其中之一當成已證明的根因。

可由程式及回歸測試確認的缺陷是：先前 15 秒即標為失敗並隱藏 iframe，且錯誤後晚到的正常空討論回應只允許從 loading 恢復。官方 client 可在登入階段失效後重新載入，但外層可能永久留在 failed，即使內層已可顯示。

- 移除「載入留言」按鈕；留言區接近視窗時自動載入官方元件，預載距離 320px。倒數只在真正開始請求後啟動，長文章底部尚未接近時不計時。重試仍可立即執行。
- 15 秒改為非致命「載入較慢」提示，不隱藏、卸載或中斷 iframe。晚到且通過來源驗證的 empty／metadata 可從 slow／failed 回復；成功後的舊倒數不覆寫成功，真正後續服務錯誤仍顯示。
- 區分連線、既有討論缺失、登入階段失效及請求上限錯誤；三語明示閱讀不需登入，只有發言需要 GitHub 帳號。保留 GitHub 備援與無 JS 可用性；不把 iframe load 或計時經過當成服務成功。
- 仍嚴格驗證 origin 與本次 iframe source；清除觀察器、計時器、script error 及 message 監聽。既有 typed ID、討論設定、App 權限、內容、CSS、文章閱讀欄與所有圖片不變。
- 核心四檔 20 tests passed（1.26 秒）；Prettier、ESLint、typegen、TypeScript、內容／完整建置／成品檢查通過。ESLint 初次指出改寫 opt-in 測試後留下的 unused import，移除後重新通過。116 routes／114 個自動載入留言區／112 sitemap URLs／465 files，初始 JavaScript gzip 147.5 KiB。
- opt-in 瀏覽器測試改用本地攔截的 script fixture，不在單元或預設測試對真正第三方寫入。正式站匿名自動顯示、錯誤／慢速恢復與備援由部署後獨立診斷核對；沒有建立公開測試留言或表情反應。使用者裝置若仍遭網路阻擋，上游原因仍須具體錯誤證據，不能宣稱所有 Android 網路情境已修復。
