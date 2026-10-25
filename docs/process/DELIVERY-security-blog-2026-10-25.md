> Historical draft checkpoint. For the subsequent authorized publication and current technical workflow, see [the publication record](DELIVERY-blog-publication-2026-10-25.md).

# Blog／資安稿件轉製（草稿）

狀態：進行中；未提交、未推送、未發布。紀錄來源：`agent_reported`。

## 範圍與來源

- 依擁有者要求，將提供的〈密碼管理器推薦〉轉成 Moonlit Vim 網站風格，
  放在 Blog → 資安；不恢復空分類、不修改履歷／得獎內容。
- 整合基底：release `1d7db9848b608aa90822f9691567585073f0f0e1`，
  tree `f2504a13d2f0d8a951c4b5edff53e2f579b9e901`。在獨立目錄工作，
  不改正在發布的 checkout。
- 原始檔名：`password-manager-recommended-technical(1).html`。
- 原始 SHA-256：`1c31bc17e54a5d1deb0419a3c049551cf5a9f547dcfe77902645266b495c8731`。
- 原稿日期為 2026-10-25；署名未確認，作者欄位保持 `null`，不宣稱原創研究。

## 內容與設計

- 移除獨立頁面的 sidebar／header／全域 CSS，沿用 Article、Prose、TOC、
  Explorer、winbar、status line 與現有深色 token。
- 保留 10 個主章節、9 個圖解、9 個原生展開附註、22 個編號參考及 1 個延伸閱讀。
- 原文可見文字忽略排版空白後與附件一致；23 個外部 URL 與順序一致。
  僅修正重複的 references ID、來源的無效 `</br>`，並將圖示的本地 use
  引用展開為靜態幾何圖形。保留圖解內容，移除動畫及行內樣式。
- 英文與日文等義草稿已完成（355 組原文文字／ARIA 翻譯）；獨立逐段審閱
  已完成；一處日文流暢度修正已由獨立代理再次核對。詳見翻譯審閱紀錄。metadata 的所有 edition
  均維持 draft，英／日為 machine-draft，沒有填造 reviewEvidence。
- 預定 URL：`/{locale}/blog/security/password-manager-recommendations/`。
  真正資料夾有自己的清單頁；只有已公開文章的分類才顯示在 Blog 與 Explorer。
- 可用性範圍：既有響應式寬度、長中英日文、鍵盤焦點、原生 details、無 JS 閱讀。
  材質與圖示沿用網站，不新增字型、圖示套件、登入、追蹤或外部資源請求。

## 安全與發布契約

- 新增獨立 static-html renderer，沒有放寬 Markdown sanitizer。
  只允許審閱過的靜態 tag／attribute／class；拒絕 script、事件、style、src、
  外部 SVG 引用、foreignObject 與動畫，檢查 ID 衝突及頁內連結。
- imported-manuscript provenance 僅記原始檔名與 SHA-256，不公開私人檔案連結。
- 未確認作者不顯示作者卡，也不產生 `BlogPosting.author`。
- 部分語系誤標公開時，content validation 阻擋發布；須三語完整且原文 revision
  相符，翻譯完成獨立對照審閱並附可核對的真實 HTTPS review evidence。
- 草稿不進公開 route／loader／搜尋／RSS／sitemap，也不產生舊示範稿移除告示。

## 技術敘述回查

2026-10-25 比對以下官方來源，未發現需要實質改寫原稿的差異：

- [Bitwarden KDF](https://bitwarden.com/help/kdf-algorithms/)：原稿所列
  PBKDF2 600,000 與 Argon2id 32 MiB／6／4 參數符合目前文件。
- [Bitwarden whitepaper](https://bitwarden.com/help/bitwarden-security-white-paper/)：
  本機 KDF → HKDF → 解開 Protected Symmetric Key → Vault 解密的概念層次相符。
- [Bitwarden export](https://bitwarden.com/help/export-your-data/)：password-protected
  與 account-restricted 匯出的差異、附件 ZIP 與 JSON 的區別相符。
- [Bitwarden autofill](https://bitwarden.com/help/auto-fill-browser/)：page-load autofill
  預設停用，以及 untrusted iframe 的警告／阻擋敘述相符。
- [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)：共享秘密與時間窗、
  常見 30 秒、重放檢查與可選 HMAC 演算法的敘述相符。
- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)：
  手動 OTP 不具 phishing resistance；WebAuthn 的 domain binding 說明保留實作條件。
- [Twilio Multi-Device](https://help.twilio.com/articles/19753226891803--Multi-device-is-disabled-for-your-Authy-account-)：
  先建立備用裝置再停用新增裝置的建議相符。
- [Twilio backups](https://help.twilio.com/articles/19753636734619-What-if-I-Don-t-Backup-my-Authy-Account)：
  備份密碼不傳送給服務商、無法由服務商復原的說明相符。

這是對原稿主要技術敘述的文件比對，不是對產品重新進行安全稽核。

## 已觀察驗證與限制

環境：此工作階段的隔離 cloud workspace，Node 24.22.1；重用專案已鎖定的
node_modules，沒有安裝套件。系統 pnpm 為 11.25.0、manifest pin 為 11.6.0，
因此建置直接執行 manifest 指定的同一組專案 binary／scripts，未宣稱 pin 的
package-manager gate 已執行。

- Prettier、ESLint（0 warning）、TypeScript：已通過。
- `vitest run`：已觀察 30 files／248 tests 全過，已包含合併後的網路稿。
- `node scripts/check-content.ts && node_modules/.bin/react-router build && node scripts/finalize-build.ts && node scripts/build-search.ts && node scripts/check-artifact.ts`：
  已通過，71 routes／64 sitemap URLs，初始 JS gzip 145.5 KiB。
  這是所有新增稿件仍為 draft 的建置，不代表新文章公開頁面已完成驗收。
- `git diff --check`：已通過。
- 三語 sanitizer 無損比對：各 1,387 個結構事件、552 個文字節點皆與原始
  fragment 完全相符；三語的非語言屬性與結構一致。已產生不公開的三語草稿預覽。
- 新文章 Chrome、axe、實際寬度截圖：未執行；不以 source／build 代替視覺通過。
- 先前失敗已修復：source union 引發的 fixture 型別、references 重複 ID、
  原始無效 br 結尾、舊 fixture 文章數量假設。額外的 `prettier --check .`
  掃到 17 個未改動的歷史 docs 格式警告；依 manifest 的正式 format:check 範圍重跑
  已通過，沒有擴大改寫這些歷史文件。保留失敗歷程，不視為第一輪全過。

## 下一步

1. 網路稿已整合，英日獨立對照與合併後靜態 gates 已完成；等候父任務審閱。
2. 取得父任務 source／scope review；確認正式署名可否維持省略。
3. 完成新文章所需的公開形狀建置及 Chrome／視覺驗證，或由擁有者決定具體豁免。
4. 只有父任務確認發布授權與 gates 後才處理真實 source/review commit 與 release。
