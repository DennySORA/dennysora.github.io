> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 正規化規格

狀態：規劃草案。明示需求來自 SPEC_SOURCE；推導與提案不是假裝使用者逐項批准。每項至少有一個工作項與驗收案例。

## 發布原則

主站內容靜態輸出，部署只上傳驗證過的產物；讀者沒有站內自建帳號或資料庫。手機和三語是核心，不作「桌面完成後再說」的附加項。新需求或例外以穩定 ID 追加，不重編已存在 ID。

<a id="req-001"></a>
### REQ-001｜個人履歷轉為自介、專案與 blog 主站

來源：S1–S2（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`site`；優先序：P0；狀態：planned。

驗收：首頁→About／Projects／Blog／Research 有完整旅程，不再只有履歷單頁。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-001](TODO.md#todo-001)；測試：[E2E-001](E2E_CHECKLIST.md#e2e-001)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-002"></a>
### REQ-002｜使用並核對 Ops-Tools skills 與共享政策

來源：S2（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`policy`；優先序：P0；狀態：planned。

驗收：辨別來源／安裝／實際載入版本；managed manifest 一致；既有 Git 與政策無被盲覆寫。

里程碑：[CP-00](CHECKPOINTS.md#cp-00)；工作：[TODO-002](TODO.md#todo-002)；測試：[E2E-002](E2E_CHECKLIST.md#e2e-002)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-003"></a>
### REQ-003｜React／Vite 前端與靜態文章路由

來源：S3（[原文](SPEC_SOURCE.md)）；性質：React 明示；SSG 提案；owner：`site`；優先序：P0；狀態：planned。

驗收：React/TS/Vite/Tailwind/pnpm；SSG 選型有紀錄；直接開啟文章為完整 HTML，不需常駐 API。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-003](TODO.md#todo-003)；測試：[E2E-003](E2E_CHECKLIST.md#e2e-003)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-004"></a>
### REQ-004｜專業沉穩的 VS Code／Shell 視覺、僅暗色

來源：S4,S6（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`design`；優先序：P1；狀態：planned。

驗收：語義色與長文層級清楚；無亮色模式、假終端輸入門檻、虛假 telemetry 或裝飾型重依賴。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-004](TODO.md#todo-004)；測試：[E2E-004](E2E_CHECKLIST.md#e2e-004)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-005"></a>
### REQ-005｜手機、鍵盤與長內容可用

來源：S6（[原文](SPEC_SOURCE.md)）；性質：手機明示；a11y 推導；owner：`design/site`；優先序：P0；狀態：planned。

驗收：320–1440 CSS px、200% zoom 可用；無全頁水平溢出；focus、drawer、ToC、code 具有明確行為。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-005](TODO.md#todo-005)；測試：[E2E-005](E2E_CHECKLIST.md#e2e-005)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-006"></a>
### REQ-006｜繁中／英文／日文 UI 與 URL

來源：S4（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`i18n/site`；優先序：P0；狀態：planned。

驗收：三語核心 UI 可直接進入；locale 與 HTML lang 正確；切換保留同一內容身份。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-006](TODO.md#todo-006)；測試：[E2E-006](E2E_CHECKLIST.md#e2e-006)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-007"></a>
### REQ-007｜文章翻譯、metadata 與缺譯／過期狀態

來源：S4（[原文](SPEC_SOURCE.md)）；性質：明示＋推導；owner：`content/i18n`；優先序：P1；狀態：planned。

驗收：每語言標題摘要與狀態受 schema 驗證；機器草稿不當已審譯文；原文改動會標示 stale。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-007](TODO.md#todo-007)；測試：[E2E-007](E2E_CHECKLIST.md#e2e-007)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-008"></a>
### REQ-008｜清晰 owner、schema 與單一資料來源

來源：S7（[原文](SPEC_SOURCE.md)）；性質：明示＋推導；owner：`site/content`；優先序：P0；狀態：planned。

驗收：內容、UI、schema、路由分權；穩定 content ID／taxonomy ID；不建立無需求的後端或複雜 monorepo。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-008](TODO.md#todo-008)；測試：[E2E-008](E2E_CHECKLIST.md#e2e-008)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-009"></a>
### REQ-009｜安全且 GitHub 為核心的留言

來源：S5（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`comments`；優先序：P0；狀態：planned。

驗收：native Discussions 預設；三語共用 discussion；瀏覽器沒有 secret；giscus 不偽稱原生 GitHub。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-009](TODO.md#todo-009)；測試：[E2E-009](E2E_CHECKLIST.md#e2e-009)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-010"></a>
### REQ-010｜只匯入舊 blog 內容

來源：S8（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`migration/content`；優先序：P1；狀態：planned。

驗收：五筆來源基線逐篇等價轉換；最新來源有增量則列入；Vue／裝飾／其他舊站分類不搬。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-010](TODO.md#todo-010)；測試：[E2E-010](E2E_CHECKLIST.md#e2e-010)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-011"></a>
### REQ-011｜兩個來源 repo 回到主帳號

來源：S9（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`repo-admin`；優先序：P1；狀態：planned。

驗收：admin／名稱碰撞預檢；兩個 repo 分別移轉保留必要 refs 與資源，不覆蓋現存主站。

里程碑：[CP-03](CHECKPOINTS.md#cp-03)；工作：[TODO-011](TODO.md#todo-011)；測試：[E2E-011](E2E_CHECKLIST.md#e2e-011)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-012"></a>
### REQ-012｜保留論文生成、資料、排程與秘密邊界

來源：S8–S9（[原文](SPEC_SOURCE.md)）；性質：移轉必要推導；owner：`paper/Nano`；優先序：P0；狀態：planned。

驗收：main/gh-pages/state 與一致性備份核對；單 writer；REMOTE_URL／PAGES_DOMAIN 正確；不發布完整原文或 secrets。

里程碑：[CP-03](CHECKPOINTS.md#cp-03)；工作：[TODO-012](TODO.md#todo-012)；測試：[E2E-012](E2E_CHECKLIST.md#e2e-012)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-013"></a>
### REQ-013｜主站整合研究連結與 metadata

來源：S9（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`research/site`；優先序：P1；狀態：planned。

驗收：三語 Research 入口、原論文／導讀清楚；僅接收驗證過的公開快照；與人工 blog 分流。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-013](TODO.md#todo-013)；測試：[E2E-013](E2E_CHECKLIST.md#e2e-013)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-014"></a>
### REQ-014｜舊 URL、既有域名與 SEO 遷移

來源：S1,S8–S9（[原文](SPEC_SOURCE.md)）；性質：必要推導；owner：`migration/domain`；優先序：P1；狀態：planned。

驗收：逐路徑對照；不把 repo redirect 當 Pages redirect；保留已知文章與 detail 路由出口。

里程碑：[CP-04](CHECKPOINTS.md#cp-04)；工作：[TODO-014](TODO.md#todo-014)；測試：[E2E-014](E2E_CHECKLIST.md#e2e-014)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-015"></a>
### REQ-015｜可重現 CI 與公開產物安全

來源：S5,S7（[原文](SPEC_SOURCE.md)）；性質：必要推導；owner：`ci/site`；優先序：P0；狀態：planned。

驗收：frozen lock／分離權限／production artifact 測試；無私有 Ops payload、secret、DB、危險 MDX 或整站錯誤發布。

里程碑：[CP-01](CHECKPOINTS.md#cp-01)；工作：[TODO-015](TODO.md#todo-015)；測試：[E2E-015](E2E_CHECKLIST.md#e2e-015)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-016"></a>
### REQ-016｜三語搜尋、RSS、sitemap 與語義 metadata

來源：S4,S7（[原文](SPEC_SOURCE.md)）；性質：文章三語推導；owner：`search/seo`；優先序：P1；狀態：planned。

驗收：每語言只索引有效版本；中日斷詞 fixtures 通過；self-canonical 與 hreflang 對應真實頁。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-016](TODO.md#todo-016)；測試：[E2E-016](E2E_CHECKLIST.md#e2e-016)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-017"></a>
### REQ-017｜搬遷可回復與備份不遺失

來源：S8–S9（[原文](SPEC_SOURCE.md)）；性質：必要推導；owner：`migration/paper`；優先序：P0；狀態：planned。

驗收：備份可實際還原；Git refs／LFS／平台留言各自盤點；回滾不啟用雙 writer 或默默覆寫新資料。

里程碑：[CP-03](CHECKPOINTS.md#cp-03)；工作：[TODO-017](TODO.md#todo-017)；測試：[E2E-017](E2E_CHECKLIST.md#e2e-017)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-018"></a>
### REQ-018｜原作者、日期與研究來源可追溯

來源：S8–S9（[原文](SPEC_SOURCE.md)）；性質：必要推導；owner：`content/paper`；優先序：P1；狀態：planned。

驗收：原文署名與原日期保留；編輯更新另記；研究生成與審閱標記不誤導；migration manifest 可回指。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-018](TODO.md#todo-018)；測試：[E2E-018](E2E_CHECKLIST.md#e2e-018)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-019"></a>
### REQ-019｜載入、空白、錯誤與資料過期狀態

來源：S5–S7（[原文](SPEC_SOURCE.md)）；性質：可用性推導；owner：`site/research`；優先序：P1；狀態：planned。

驗收：快照失敗不令主站不可用；顯示實際資料時間；搜尋與 overlay 可恢復，無假最新狀態。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-019](TODO.md#todo-019)；測試：[E2E-019](E2E_CHECKLIST.md#e2e-019)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-020"></a>
### REQ-020｜長期寫作與發布審查流程

來源：S4,S7（[原文](SPEC_SOURCE.md)）；性質：後續 blog 推導；owner：`content/ci`；優先序：P1；狀態：planned。

驗收：Git Markdown→草稿→翻譯→檢查→PR→已驗證產物發布；不把機器輸出當無需審查的執行碼。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-020](TODO.md#todo-020)；測試：[E2E-020](E2E_CHECKLIST.md#e2e-020)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-021"></a>
### REQ-021｜個人介紹與專案案例有可信證據

來源：S2,S4（[原文](SPEC_SOURCE.md)）；性質：明示＋推導；owner：`profile`；優先序：P1；狀態：planned。

驗收：經歷與成果來源可核對，三語不誇大；website 技術遷移不竄改既有工作經驗。

里程碑：[CP-02](CHECKPOINTS.md#cp-02)；工作：[TODO-021](TODO.md#todo-021)；測試：[E2E-021](E2E_CHECKLIST.md#e2e-021)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

<a id="req-022"></a>
### REQ-022｜本次為深度規劃，不越權實作或移轉

來源：S9（[原文](SPEC_SOURCE.md)）；性質：明示；owner：`planning`；優先序：P0；狀態：planned。

驗收：輸出可追蹤計畫與未驗證清單；不宣稱已在用戶 repo 套用 skill／轉移／部署／通過產品測試。

里程碑：[CP-00](CHECKPOINTS.md#cp-00)；工作：[TODO-022](TODO.md#todo-022)；測試：[E2E-022](E2E_CHECKLIST.md#e2e-022)。依賴：CP-00 的來源與政策盤點；具體前後序以 CHECKPOINTS/TODO 為準。

## 範圍外與可逆預設

目前新主站採既有 dennysora.me；paper.dennysora.me 僅是日後品牌統一候選，不是已存在設定。留言採 native；giscus 需要接受額外第三方。研究 reader 先保留 Vue／既有 API，只建立新 React 主站整合；將它整個重寫不是主站改版的隱含結果。

全站只有暗色，不放 light mode 開關。第一批完整上線建議五篇原文和經審閱英日版；未來文章可以先發原文，但網站明示缺譯，不製造「三語皆已完成」的假象。對研究歷史全文不預設一次全部翻譯。

禁止事項：刪 .git 重開歷史、初始化巢狀 Git、偷偷公開 private policy、搬有 secrets 的 state、import 不受信任 MDX 後直接執行、把任意404轉首頁、giscus 與 native 身份混淆、未跑測試就填 passed。
