# VPN Manager 三語工具文章轉製核對

## 範圍與來源

- 使用者要求：保留提供稿件的內容，只改為本站風格與重新排版，放入 Blog「工具」，提供繁體中文、英文、日文。
- 來源：`vpn-manager-blog-zh-with-screenshots (1).html`，Library `libfile_3adfe16a96dc819181b3efea6af56781`，實際回傳版本 0，913,062 bytes。
- 基準：遠端 main／release 的 `94436ad61e4220a05de388caa40841e72de5ca51`。使用獨立工作目錄，不含另一份尚未核准的 SEO 修補。
- 新路徑：`/{locale}/blog/tools/vpn-manager-architecture/`。
- 原稿是架構／開發筆記，不是可執行的 VPN 工具。未啟動 VPN、修改網路、操作帳號或執行附件腳本。

## 內容保留與三語

- 靜態解析來源後，保留 579 個獨立原文文字與可存取標籤；原有 h1 移至本站標題欄，獨立站外框與目錄由本站導覽取代。
- 每版保留 9 張 SVG、332 個 SVG 文字節點、13 個 figure、1 張表格與 3 張介面截圖。沒有以摘要替代正文或刪減架構條件。
- 截圖由來源 data URI 解碼為 PNG，原始位元組不變。三語共用原截圖，只翻譯 alt 與圖說；未偽造英文／日文產品畫面。
- 中文逐片段核對；英日文依原意翻譯，保留「我想」「傾向」「目前暫定」等規劃語氣，不將設計要求改寫成已驗證的實作能力。
- 翻譯另行核對：55 個元件、10 分鐘／60 秒、3 秒／2 秒、無 host fallback、DNS／IPv6 封閉、Watchdog 權限、人工 Stop 優先及 unknown 後先對帳等條件。
- 英文初稿的兩處「VPN platform controller」改為「VPN platform control coordinator」，保留控制協調器與 Platform Manager 的分工。
- 中文圖文內容與數字不改。英日圖表僅加寬水平配置，保留節點、箭頭方向與順序；箭頭標記使用原始幾何。

## 設計與安全邊界

- 沿用 Moonlit Vim 外框、字體、token、文章閱讀欄、原生目錄、三語切換及既有圖表適寬／原尺寸控制。
- 圖表與截圖各有具鍵盤焦點的水平捲動區；不新增全站橫向溢出、外部字體、追蹤、依賴或登入功能。
- 原稿的 inline SVG presentation 屬性轉成文章範圍的 token 樣式；沒有保留附件的全站 CSS、script 或動態內容。
- 新增的本機文章圖片支援只接受同篇目錄內的安全檔名，驗證 realpath、實際圖片尺寸與 alt；拒絕遠端 URL、data URI、路徑穿越及未綁定資產。
- 封面是原創無字幾何概念圖，表示獨立路徑；不是實測狀態，也不取代任何原稿圖表或截圖。已查看封面及來源截圖。
- 新稿使用實際 Library 版本＋明確轉製版本，不新增 digest。中文 reviewed-source 與正文逐位元組相等，改動後未重新核對即停止載入；舊稿版本流程維持原樣。

## 驗證

- 原文 579 片段與所有圖表／表格／圖片數量檢查通過；英文正文未殘留中文字。
- 靜態圖片拒絕與尺寸契約測試通過。
- Vitest：38 個檔案、277 個測試通過。
- Prettier、ESLint（零警告）、TypeScript 通過。
- 依 package.json 的既有建置階段完成 content check、React Router production build、finalize、搜尋與 artifact check：140 條預先呈現路徑、136 條 sitemap 路徑、559 個檔案；本機連結與頁面有效。
- 預設 pnpm 包裝器遇到環境目錄錯誤，未安裝套件；以上使用同一既有 node_modules 中的專案執行檔執行對應命令。
- 瀏覽器、Playwright、axe、頁面截圖驗收：not_run，依擁有者流程由使用者查看上線外觀，不將建置結果宣稱為視覺驗收。
- 遠端提交與上線 HTTP 結果另於交付訊息報告，不由本紀錄預先宣稱完成。
