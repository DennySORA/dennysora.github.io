# 硬體／電腦分類與 140 mm 風扇評估筆記

狀態：內容、分類、工具與測試已完成；非瀏覽器 gates、Playwright（含 axe）與 Chrome 截圖檢視已執行，唯一失敗為既有的醫學筆記測試（見驗證）。使用者已知悉該既有失敗，並授權 commit 到 `main` 後推送 `release` 發布。

## 範圍

- 依 2026-10-10 指示，新增筆記分類「硬體／電腦」：`/{locale}/note/hardware/` 與 `/{locale}/note/hardware/computer/`（三語入口），筆記本文只提供繁體中文原文。
- 將使用者提供的 `140mm-fan-review-2026-10-10.html`（2.5 MB 自包含報告）深度分析、逐項核對後，重寫成 Moonlit Vim 靜態內容片段 `content/notes/hardware/computer/140mm-case-fans.html`。原始檔案沒有修改，也沒有放進 repo。
- 新增「前 10 推薦」：原報告只有 7 個情境建議。排序依證據、安靜時表現、日本可得性與價格、安裝門檻，明示為編輯判斷而非加權總分。
- 原稿中針對特定個人設備的描述改為一般情境；第一人稱判斷改為本筆記的判斷；保留「未購買、未自行量測」聲明。

## 結構與設計

- 路由、檔案樹、winbar、tabline、搜尋分類與 sitemap 依既有醫學分類的契約擴充：`src/lib/hardware-notes.ts`（分類與三語文字）、`route-manifest.ts`、`workspace.ts`、`Explorer.tsx`、`TabLine.tsx`、`content.server.ts`、`site-search.server.ts`、`page.tsx`。筆記目錄頁 `Notes.tsx` 改為以 `view` 參數渲染「全部／醫學／硬體」三種集合，醫學與硬體共用分類卡片。
- 新增標籤 `hardware`、`pc-cooling`、`case-fans`（三語名稱與受控別名）。
- 新增 `cpu` 圖示與 `collection-hardware-v1.webp`（DESIGN §7 的 Codex 流程，1 張，一次通過驗收，紀錄於 `data/illustration-assets.json`）。
- 圖表為內嵌 SVG，只用 `src/styles/hardware-notes.css` 的 class 取 token 色；長條圖改成「名稱＋數值、下方長條」的清單形式，在 320 px 不需橫向捲動，桌面兩張並排；每張圖都有資料表。色票依 dataviz 驗證：單一系列青綠、對照灰、假設線紫色虛線，類別一定附圖例與直接標籤。
- 互動工具（型號篩選、工作點滑桿、數量試算）在 `hardware-note-tools.ts` 本機重算，預設結果寫在靜態 HTML；沒有 JavaScript 時控制項以 `requires-js` 隱藏，內容照常可讀。載入器拒絕 script、style、img、`src`／`style` 屬性等標記。
- DESIGN.md 加入新插圖與兩個元件配方（筆記資料圖表、推薦卡片）；CONTENT_WORKFLOW.md 與 README 補上硬體分類與內容規則。

## 資料核對（2026-10-10）

5 組平行查核加上本機重算，結果與修正都寫進筆記的「核對紀錄」章節：

- Cybenetics：原報告 7 款的 25 dBA、Section D 極值、日期與 50%／100% PWM 掃描點全部相符；不確定度公式與 PHI 2.1 重新評級說明相符。
- 補入原報告遺漏、但 Cybenetics 已有的 4 款同台資料（UNI FAN TL 140、MEGACOOL、P14 PWM PST、Silent Wings 4 140 HS）與 11 款的 20 dBA 資料庫數值；TL 140 因此進入前 10。
- Tweakers 40 個數值、HWCooling 結論與方法全部相符；新增 HWCooling 薄冷排同噪風量表，並更正厚冷排阻力、T30 對 G2 領先幅度、NA-IS1 適用條件與 P14 Pro 電流的說法。
- 原廠規格：27 款主要數值（厚度、轉速、風量、靜壓、噪音、電流／功率、軸承、保固）全部與官方相符。修正：P14 Pro「七葉」無官方出處；BioniX 與 D30 的包裝內容；MACH140 官方型號為 R-MACH140-GYWPN1-GAS；Super Flower 官方頁（封存）其實列有 MEGACOOL 6 年保固與雙滾珠軸承；SilverStone 原廠頁可讀；RS140 MAX 的轉速矛盾出處；Fractal 日文 PDF 已失效改連封存。
- 日本價格：原報告 15 筆報價同日重讀全部相符（Bic 兩筆以價格比較網核對）；更新 TOUGHFAN 14 Pro ¥3,418、AL140 V2、TL 140、T30-140 的供貨狀態。
- 所有百分比、換算、不確定度、價格算術、dBA 疊加、拍頻、熱平衡與工作點都重新計算，與正文一致。

## 驗證

2026-10-10 在最終內容上執行：

- passed：`pnpm verify` 的 Prettier、ESLint（零警告）、typecheck、Vitest（16 files、121 tests）、build（43 routes、36 sitemap entries、161 artifact files、所有本地連結有效，initial JS gzip 146.7 KiB；改動前 144.0 KiB）。
- passed：新的 `tests/e2e/hardware-notes.spec.ts` 2 項（分類導覽、三個工具的重算與錯誤輸入、hash 開啟摺疊、無第三方請求／cookie／storage；320、390、768、1280、1440、1920 px 無水平溢出；axe WCAG 2.2 AA 零違規；無 JavaScript 可讀）。
- passed：其餘既有 Playwright 91 項中的 90 項（全套 93 項：92 passed、1 failed）。
- failed（既有問題）：`medical-notes.spec.ts` 的「brain guide … readable without JavaScript」。無 JavaScript 頁面在 1440×900 點擊目錄「來源」時，連結被固定的狀態列擋住。用 `git archive HEAD` 匯出未修改的版本另行建置後以同一測試重現相同失敗，與本次變更無關；未在本次範圍內修改。
- passed：Chrome（Playwright 隔離 profile）實際截圖檢視：筆記各章節 1440 px、390 px、320 px；筆記索引、英文硬體資料夾、日文電腦分類（390 px）。檢視時修正：表格首欄在窄寬度被 `overflow-wrap: anywhere` 壓成單字寬、長條圖在手機需橫捲、P–Q 小圖的軸標與 100% 標籤重疊、型號詳情欄過窄、價格表分組順序。
- `git diff --check` passed。

暫時的預覽伺服器（4180、4175）都已停止。插圖的 Codex 原始輸出與查核下載只留在本次工作階段的暫存目錄。
