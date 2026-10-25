# Note／Blog 文章橫幅與分享預覽

2026-10-25。`agent_reported`；基準 `230f470d0c5c559b061002b3a9a30c0dcf9208e9`，開始整合時工作樹乾淨。擁有者要求所有已發布 Note／Blog 內頁在正文前加入無文字、能象徵主題的橫幅，並讓網址分享使用文章專屬圖片。

## 範圍與實作

- 清冊為 6 篇 Note 與 4 篇 Blog，共 10 個內容識別、30 個繁中／英文／日文內頁。兩篇草稿與已移除的內容不納入；不改動文章 HTML 正文、頁面路徑或原有閱讀欄／目錄版型。
- 每篇有一張原創主題插圖：P2P 資料池、流量混合、止痛藥與神經訊號、腦部與細胞分類、腰椎支持、攝影鏡頭、下載片段組合、通道與時間關聯、翻譯稜鏡，以及密碼保險庫。三語共用相同圖片，替代文字依語言描述實際畫面；醫療圖明示為象徵／概念插圖，不是診斷或精確解剖圖。
- 使用內建 `image_gen` 分別生成 10 張，不使用程式繪圖佔位。保留無字、無數字、無 Logo 的深色月光風格；不覆蓋文字、不改動品牌 Logo／favicon／avatar。文章橫幅是擁有者新增要求的局部例外，不更改透明特徵圖示規範。
- `data/article-covers.json` 記錄每張圖的 brief、生成來源、原始／最終 SHA-256、尺寸、格式、位元組數、處理方式及三語 alt。來源 registry 只由 server module 使用；loader 僅傳當頁需要的公開路徑與描述，不將完整 brief 隨頁面送入瀏覽器。
- 站內使用 1200×630 與 640×336 的 WebP `srcset`；分享使用獨立 1200×630 JPEG。寬高屬性和固定比例預留空間，首屏圖片 eager／high priority，不等 JavaScript；圖片與文章內容均同源，不新增外部圖片服務或執行期依賴。
- 預渲染 head 只有一個 `og:image`，附絕對 HTTPS URL、type、width、height、alt；Twitter 為 `summary_large_image` 並指向同一 JPEG，結構化資料也使用該圖。其他頁面保留品牌 avatar。建置依正式路由選擇圖片，成品守護核對 30 頁的橫幅位置、三語分享 metadata 與檔案完整性。

## 分享卡問題判讀

修改前的正式文章與 `/assets/avatar.png` 均回應 HTTP 200；一般與 `facebookexternalhit` User-Agent 都取得正確文章標題、描述及 canonical。既有頁面只有共用的 256×256 avatar，Twitter 類型為 `summary`，沒有每篇專屬橫幅或完整圖片屬性。

因此這次修正可以確定的站內缺口，但不把它誤稱為已證明的 Threads 抓取失敗原因。User-Agent 模擬不是 Meta 真實來源 IP 的抓取；截圖中的「僅網域、沒有標題與圖片」也可能涉及過往抓取失敗或平台快取，目前無平台抓取紀錄可確認。新版本會以公開 HTTP 回讀檢查；既有貼文的預覽快取與實際平台卡片仍需平台重新抓取，不能由本機測試保證即時刷新。不變更 CDN、安全設定或權限。

官方契約：[Open Graph structured properties](https://ogp.me/#structured)、[React Router route metadata](https://reactrouter.com/start/framework/route-module)。

## 檢查與限制

原圖與縮圖已逐張檢視，30 個輸出均為實際 raster；JPEG 約 153–217 KB、1200px WebP 約 85–147 KB、640px WebP 約 29–51 KB。瀏覽器截圖／視覺驗收依擁有者流程不作發布前提；不建立測試貼文或更改既有社群貼文。

- Prettier、ESLint 零警告、React Router typegen／TypeScript：passed。
- 核心 Vitest：cover／SEO／published-blog／comments 四個檔案，17 tests passed，原封面候選 1.38 秒，納入留言精簡後的最終候選 1.49 秒；兩輪均未失敗、未跳過。此次新增測試驗證 10 個識別／30 路由、共享三語圖片、各語言 alt、30 個 raster 的尺寸與 hash／bytes 預算、唯一 OG 圖片與 Twitter／schema 一致性，以及初始圖片的響應式、eager／priority、保留空間與 null fallback。
- 內容驗證、完整正式建置、搜尋及成品檢查：passed；116 routes、112 sitemap URLs、495 files，最終 initial JavaScript gzip 146.7 KiB（留言精簡前為 147.7 KiB），維持 150 KiB 上限。成品檢查已實際核對 30 頁封面在第一個 h1 前、響應式來源與 head metadata，不以只有元件單元測試代替。
- 27 份原有 HTML／Markdown 來源逐位元組 SHA-256 比對：全部不變；留言自動載入／訊息來源驗證／錯誤分類與復原邏輯、品牌資產、依賴／鎖檔、工作流程及安全設定均未改動。
- `git diff --check`：passed。完整單元測試套件、瀏覽器／Playwright 與實際社群貼文刷新：not_run；依目前核心驗證及擁有者自行查看上線外觀的流程，不作額外瀏覽器驗收。未把實際平台預覽快取標為已驗證。

執行位置為 repository root，沿用既有 Node 24.22.1 及鎖定依賴的 CLI 入口，未安裝軟體：

```text
node node_modules/prettier/bin/prettier.cjs --check src scripts tests content data '*.ts' '*.js' '*.json' '*.yaml' '.github/workflows/*.yml' README.md
node node_modules/eslint/bin/eslint.js . --max-warnings 0
node node_modules/@react-router/dev/bin.cjs typegen
node node_modules/typescript/bin/tsc --noEmit
timeout 70s node node_modules/vitest/vitest.mjs run tests/unit/article-covers.test.ts tests/unit/seo-metadata.test.ts tests/unit/published-blog.test.ts tests/unit/comments.test.ts
node scripts/check-content.ts
node node_modules/@react-router/dev/bin.cjs build
node scripts/finalize-build.ts
node scripts/build-search.ts
node scripts/check-artifact.ts
git diff --check
```

發布依擁有者明示授權，使用非 force 的 `main`／`release` 更新；部署成功及正式 HTTP／所有圖片回應另以該提交的 workflow 和已上線產物回讀確認，不能僅由本地建置推論。

## 同批納入的留言文字精簡

擁有者在本批發布前另行要求刪除留言區的歡迎、長版自動連線／登入說明、重複「尚無留言」狀態，以及 host 的 GitHub 討論搜尋連結。三語同步刪除對應字串；原生 giscus 的留言數、輸入框與登入控制保持原樣，host 不再重複顯示空狀態／數量。真實慢速／失敗時仍保留精簡訊息和重試，不刪除來源驗證、錯誤處理或晚到成功訊息的恢復路徑；不存取 iframe 跨來源 DOM。giscus 模式不再提供 host 搜尋連結，無 JavaScript 的原生 widget 不會載入；獨立 native-discussion 模式仍保留其直接連結。

正常初始 HTML 的核心測試改為確認沒有 host 外連、歡迎／空狀態字樣或 click gate，同時保留可見 iframe host、來源驗證／復原與搜尋排除的功能斷言。留言字串精簡後，以同一四檔核心及靜態／正式建置重新驗證，不將先前候選的結果當成新候選證據。

最終候選重新通過上述全部靜態與核心／正式建置命令；三語首頁預渲染 HTML 的 host 留言區均無外連與已移除字樣。
