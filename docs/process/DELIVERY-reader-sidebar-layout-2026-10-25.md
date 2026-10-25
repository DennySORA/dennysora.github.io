# 文章閱讀欄與側欄修正

2026-10-25。`agent_reported`；本紀錄描述已觀測的本地成品，部署狀態另核對本次提交的工作流程與正式網址。

- 目標：修正擁有者截圖中的文章靠左、收合檔案樹後仍未放大置中，以及目錄右方大片空白。
- 原因：`.reader-shell` 同時限制正文與目錄的總寬；一般 buffer 的收合置中規則不涵蓋文章。
- 變更：文章外框改為全寬，目錄使用 editor 最右側的獨立格線欄；只有 `.reader-main` 限寬並置中。正文上限展開時 960px、收合時 1120px；返回連結移入正文欄。手機內文目錄、行號、英文 72ch、既有圖解適寬／原尺寸控制不變。同步設計規則與寬度 tokens。
- 回歸守護：`scripts/check-artifact.ts` 檢查實際建置 CSS 的外框全寬、正文置中限寬、收合放寬與獨立目錄欄，防止再把上限放回外框。
- 檢查：使用既有相同鎖檔的依賴，執行 Prettier、ESLint 零警告、React Router typegen、TypeScript；四個相關 Vitest 檔案 13 項通過（1.08 秒）；內容驗證、正式建置、finalize、搜尋與成品檢查通過。116 路徑、112 sitemap URL、464 個成品檔案、初始 JavaScript gzip 146.6 KiB。
- 成品 CSS：`root-C7m4RhUd.css`，SHA-256 `de09dddf334fa93987b57b72b83e2adfc408c4a7a7cecce733b9ff1d52da0813`。全部十二份文章 HTML 與基準 `cd9a797` 逐位元組相同；沒有修改內容、依賴、鎖檔、工作流程或安全設定。
- 執行環境：dot 雲端、Node 24.22.1。沿用先前已驗證的套件 CLI 入口，沒有安裝工具。首次 Prettier 檢查指出新增成品守護的格式，已修正；首次 CLI 路徑誤用 `bin.js`，依套件宣告改為 `bin.cjs`；成品守護初版未接受壓縮器保留的空白，已改為容許語法空白後通過。
- 限制與下一步：未執行整套 Playwright／視窗矩陣。已實際檢視擁有者兩張截圖，並用隔離 managed cloud browser 量測原站 1180×757；不把本地建置當成視覺驗收。發布後核對 CI、正式 CSS 與反覆收合行為，由擁有者自行查看外觀並回報問題。

執行目錄為此 repository root；命令：

```text
node node_modules/prettier/bin/prettier.cjs --check src scripts tests content data '*.ts' '*.js' '*.json' '*.yaml' '.github/workflows/*.yml' README.md
node node_modules/eslint/bin/eslint.js . --max-warnings 0
node node_modules/@react-router/dev/bin.cjs typegen
node node_modules/typescript/bin/tsc --noEmit
timeout 55s node node_modules/vitest/vitest.mjs run tests/unit/article-diagrams.test.ts tests/unit/static-article.test.ts tests/unit/published-blog.test.ts tests/unit/workspace.test.ts
node scripts/check-content.ts
node node_modules/@react-router/dev/bin.cjs build
node scripts/finalize-build.ts
node scripts/build-search.ts
node scripts/check-artifact.ts
git diff --check
```
