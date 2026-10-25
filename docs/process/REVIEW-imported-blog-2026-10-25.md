# 匯入 Blog 稿件：翻譯對照審閱紀錄

日期：2026-10-25。證據類型：`agent_reported`。所有文章仍為草稿。
這是獲授權的獨立代理對照審閱，不是人工審閱，也不代表發布授權。

## 資安：密碼管理器推薦

- 原始附件：`password-manager-recommended-technical(1).html`。
- 附件 SHA-256：`1c31bc17e54a5d1deb0419a3c049551cf5a9f547dcfe77902645266b495c8731`。
- 原文 fragment：`content/posts/password-manager-recommendations/zh-hant.html`。
- 原文 revision：`ddd26e2c8a786b92e992656f41ffca982f4391c07d9f276bfe3537e79a05d31c`。
- EN：`5dc34579203de32c06684ec4df9f9251f266147ef7ce6e2ddfe9403f7967c7c5`。
- JA：`46bd7369021269eabe087773f9256a6b3abdec1b60fb6daa4cf0c56786436148`。
- 起草代理：`/root/adapt_security_blog_article`。
- 獨立審閱代理：`/root/adapt_network_blog_article`。

### 英文／日文：已逐項對照，未發現實質差異

獨立審閱代理回報讀取全部 566 組實際非空文字／accessible-label 三語節點，
包含 9 個圖解、9 個展開附註、數值範例、公式、例外與參考資料，並核對標題與摘要。
1,387 個解析結構事件及非語言屬性一致；71 次 href 引用保留。原文與附件文章
忽略排版空白並移除獨立頁首後完全一致，唯一連結殼層變更是 `#top` 改為
`#article-title`。

特別核對密碼唯一性與釣魚／端點風險的區別、本機鍵階層、KDF 與 MFA、離線
猜測、Secret Key 威脅模型、TOTP／WebAuthn 與復原限制、同步型與硬體固定型
Passkey、TOTP 分離、剪貼簿／自動填入，以及 JSON／附件備份的差異。沒有新增
安全建議或產品主張；20 字元、30 秒／6 位數、600,000、32 MiB／6／4、約
128 bits 等數值保持等義。

審閱發現一個日文流暢度問題：原草稿「詳しい鍵階層は技術補足。」改為
「詳しい鍵階層は技術補足にあります。」。起草代理接受後，獨立審閱代理核對
只有第 68 個文字節點由「。」改為「にあります。」；其餘 565 節點不變。
上方 JA hash 是修正後再次核對的實際檔案。

## 網路：P2P 下載器的架構與機制

- 原始附件：`p2p-downloader-architecture(1).html`。
- 附件 SHA-256：`6bf2d307959da366267b171e624da65cfc162e54dce56fafb9f55c7e8e3c6b92`。
- 原文 fragment：`content/posts/p2p-downloader-architecture/zh-hant.html`。
- 原文 revision：`0a8984d77b1e8afcfb6e08ce43b428ecfa57bcde320a43c8a5266603c9d0ec51`。
- EN：`3052b4e246eb43d4cac11425681a51a3b6bb5ea601e854dcac3ac0653d0c596c`。
- 起草代理：`/root/adapt_network_blog_article`。
- 獨立審閱代理：`/root/adapt_security_blog_article`。

### 英文：已逐項對照，未發現實質差異

讀取實際排版後 ZH／EN fragment 的全部 936 組非空文字與 accessible-label
節點，涵蓋 17 節、圖中文字、表格、8 種來源組合、技術算例、限制條件與參考來源；
並對照 metadata 標題與摘要。2,490 個解析結構事件及所有非語言屬性完全一致，
64 次 href 引用的內容與順序一致。

數值差異均為等義：SHA-1 因英文語序跨 inline 節點移動；16／150 的語序改變；
「9 片中 9 片」譯為 all 9；0 譯為 zero。沒有遺漏條件或改寫參數。

特別核對：架構提案與協定規定的區別、private torrent 邊界、算例非建議設定、
宣告資料與已驗證資料、allowed-fast 例外、未知與零、遠端與本機瓶頸、IP 封鎖與
單一連線範圍、來源身分非真人認證、SSRF 目的地限制、正常服務不能排除記錄行為，
以及傳輸完成與耐久保存的差異。英文均保留原意。

### 日文：已逐項對照，未發現實質差異

- JA：`65fce37befe89432a92d327beaca292e3e4993672c76e23e1571dc5984b5b009`。

依相同原文與實際日文檔案核對 936 組文字／accessible-label 節點，包含全部
17 節、SVG 圖文、算式、表格、8 種來源組合與參考資料，並核對 metadata。
2,490 個結構事件與非語言屬性完全相同，參考連結及幾何未改動。數值掃描的
差異來自中文數詞轉阿拉伯數字（九、二、五、十二、八、四）、「每個」轉為
1 件／1 要求，以及「9 片中 9 片」的等義表達；均逐項核對。

英文段落列出的重要限制與協定／架構區別，日文也保留。協定、API、公式與
元件名稱依原文保留，不將未翻譯的標準識別子誤報為遺漏。

## 交付與發布限制

- 此紀錄是翻譯等義審閱，不是新的產品／協定安全稽核或效能測試。
- Browser、視覺／寬度／axe 驗證尚未執行，不以靜態比對代替。
- `reviewEvidence` 必須在父任務接受審閱、實際建立可核對的提交／審閱頁後，
  填入該不可變證據的真實 HTTPS URL；目前保持 null，沒有預造 URL 或提交 SHA。
- 新 static-html 稿件不得以舊站繼承用途的 `source-published` 跳過審閱；公開時必須
  三語齊全、原文 original、譯文 reviewed、每語系 sourceRevision 均符合原文實際 hash。
- 是否發布及署名等 scope 決定仍由父任務處理。
