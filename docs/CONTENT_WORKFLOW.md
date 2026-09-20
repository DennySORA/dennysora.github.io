# 寫作、翻譯與發布

## 內容來源

文章的單一來源是 `content/posts/<id>/meta.json` 與同目錄 `<locale>.md`。語言值為 `zh-hant`、`en`、`ja`；完整欄位契約以 [schema](../src/lib/schema.ts) 為準。請從既有文章複製欄位結構，填入真實 id、slug、作者、日期、分類、來源，不要沿用另一篇文章的來源證據。

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

id 用於跨語系文章身份和 discussion 對照；slug 改名時必須補明確的舊路徑 bridge。正文支援 Markdown 標題、清單、連結、表格、程式碼；不執行 MDX、內嵌 script、iframe 或任意 HTML。若要擴充圖片，先在清理 allowlist、產物檢查、alt text 與大小限制建立對應契約。

草稿不產生文章 URL，也不進列表、搜尋、RSS、sitemap 或公開 loader payload。`archived` 目前同樣不公開；若需保留公開歷史文章，維持 published 並在內容中說明歷史狀態。語系切換只連到已發布的版本；未發布語系會顯示不可用提示。

## GitHub 討論

目前 `data/comments.json` 的 repository 為 null，頁面會明說未連結討論。建立或啟用遠端 Discussions 後，填入 `DennySORA/<repository>`，再為各文章填入真實 `discussionNumber`。三種語言共用該數字；不要用 pathname 當身份，也不要猜測討論號碼。開啟原生 GitHub 網頁才會連線至 GitHub，不放 provider token，不載入 giscus。遠端建 repo／發討論是獨立的擁有者操作。

## 研究快照

研究入口使用公開 metadata，文章與 AI 生成导讀分流，顯示來源真實時間與未逐篇審閱標記。網站建置及瀏覽時完全離線讀快照，不會啟動生成器或碰觸 Nano、state、資料庫或 credentials。

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
