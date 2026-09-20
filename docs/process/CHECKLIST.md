> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 完成條件

本清單回答「是否達到交付條件」，TODO 回答「接下來做什麼」。狀態均為 not run；規劃草案產生不構成產品條件通過。

| 檢核 ID | 需求／CP | 可驗證條件 | 狀態／證據 |
|---|---|---|---|
| <a id="chk-001"></a>CHK-001 | [REQ-001](SPEC.md#req-001) / [CP-01](CHECKPOINTS.md#cp-01) | 首頁→About／Projects／Blog／Research 有完整旅程，不再只有履歷單頁。 | not run；[E2E-001](E2E_CHECKLIST.md#e2e-001) |
| <a id="chk-002"></a>CHK-002 | [REQ-002](SPEC.md#req-002) / [CP-00](CHECKPOINTS.md#cp-00) | 辨別來源／安裝／實際載入版本；managed manifest 一致；既有 Git 與政策無被盲覆寫。 | not run；[E2E-002](E2E_CHECKLIST.md#e2e-002) |
| <a id="chk-003"></a>CHK-003 | [REQ-003](SPEC.md#req-003) / [CP-01](CHECKPOINTS.md#cp-01) | React/TS/Vite/Tailwind/pnpm；SSG 選型有紀錄；直接開啟文章為完整 HTML，不需常駐 API。 | not run；[E2E-003](E2E_CHECKLIST.md#e2e-003) |
| <a id="chk-004"></a>CHK-004 | [REQ-004](SPEC.md#req-004) / [CP-01](CHECKPOINTS.md#cp-01) | 語義色與長文層級清楚；無亮色模式、假終端輸入門檻、虛假 telemetry 或裝飾型重依賴。 | not run；[E2E-004](E2E_CHECKLIST.md#e2e-004) |
| <a id="chk-005"></a>CHK-005 | [REQ-005](SPEC.md#req-005) / [CP-01](CHECKPOINTS.md#cp-01) | 320–1440 CSS px、200% zoom 可用；無全頁水平溢出；focus、drawer、ToC、code 具有明確行為。 | not run；[E2E-005](E2E_CHECKLIST.md#e2e-005) |
| <a id="chk-006"></a>CHK-006 | [REQ-006](SPEC.md#req-006) / [CP-01](CHECKPOINTS.md#cp-01) | 三語核心 UI 可直接進入；locale 與 HTML lang 正確；切換保留同一內容身份。 | not run；[E2E-006](E2E_CHECKLIST.md#e2e-006) |
| <a id="chk-007"></a>CHK-007 | [REQ-007](SPEC.md#req-007) / [CP-02](CHECKPOINTS.md#cp-02) | 每語言標題摘要與狀態受 schema 驗證；機器草稿不當已審譯文；原文改動會標示 stale。 | not run；[E2E-007](E2E_CHECKLIST.md#e2e-007) |
| <a id="chk-008"></a>CHK-008 | [REQ-008](SPEC.md#req-008) / [CP-01](CHECKPOINTS.md#cp-01) | 內容、UI、schema、路由分權；穩定 content ID／taxonomy ID；不建立無需求的後端或複雜 monorepo。 | not run；[E2E-008](E2E_CHECKLIST.md#e2e-008) |
| <a id="chk-009"></a>CHK-009 | [REQ-009](SPEC.md#req-009) / [CP-01](CHECKPOINTS.md#cp-01) | native Discussions 預設；三語共用 discussion；瀏覽器沒有 secret；giscus 不偽稱原生 GitHub。 | not run；[E2E-009](E2E_CHECKLIST.md#e2e-009) |
| <a id="chk-010"></a>CHK-010 | [REQ-010](SPEC.md#req-010) / [CP-02](CHECKPOINTS.md#cp-02) | 五筆來源基線逐篇等價轉換；最新來源有增量則列入；Vue／裝飾／其他舊站分類不搬。 | not run；[E2E-010](E2E_CHECKLIST.md#e2e-010) |
| <a id="chk-011"></a>CHK-011 | [REQ-011](SPEC.md#req-011) / [CP-03](CHECKPOINTS.md#cp-03) | admin／名稱碰撞預檢；兩個 repo 分別移轉保留必要 refs 與資源，不覆蓋現存主站。 | not run；[E2E-011](E2E_CHECKLIST.md#e2e-011) |
| <a id="chk-012"></a>CHK-012 | [REQ-012](SPEC.md#req-012) / [CP-03](CHECKPOINTS.md#cp-03) | main/gh-pages/state 與一致性備份核對；單 writer；REMOTE_URL／PAGES_DOMAIN 正確；不發布完整原文或 secrets。 | not run；[E2E-012](E2E_CHECKLIST.md#e2e-012) |
| <a id="chk-013"></a>CHK-013 | [REQ-013](SPEC.md#req-013) / [CP-02](CHECKPOINTS.md#cp-02) | 三語 Research 入口、原論文／導讀清楚；僅接收驗證過的公開快照；與人工 blog 分流。 | not run；[E2E-013](E2E_CHECKLIST.md#e2e-013) |
| <a id="chk-014"></a>CHK-014 | [REQ-014](SPEC.md#req-014) / [CP-04](CHECKPOINTS.md#cp-04) | 逐路徑對照；不把 repo redirect 當 Pages redirect；保留已知文章與 detail 路由出口。 | not run；[E2E-014](E2E_CHECKLIST.md#e2e-014) |
| <a id="chk-015"></a>CHK-015 | [REQ-015](SPEC.md#req-015) / [CP-01](CHECKPOINTS.md#cp-01) | frozen lock／分離權限／production artifact 測試；無私有 Ops payload、secret、DB、危險 MDX 或整站錯誤發布。 | not run；[E2E-015](E2E_CHECKLIST.md#e2e-015) |
| <a id="chk-016"></a>CHK-016 | [REQ-016](SPEC.md#req-016) / [CP-02](CHECKPOINTS.md#cp-02) | 每語言只索引有效版本；中日斷詞 fixtures 通過；self-canonical 與 hreflang 對應真實頁。 | not run；[E2E-016](E2E_CHECKLIST.md#e2e-016) |
| <a id="chk-017"></a>CHK-017 | [REQ-017](SPEC.md#req-017) / [CP-03](CHECKPOINTS.md#cp-03) | 備份可實際還原；Git refs／LFS／平台留言各自盤點；回滾不啟用雙 writer 或默默覆寫新資料。 | not run；[E2E-017](E2E_CHECKLIST.md#e2e-017) |
| <a id="chk-018"></a>CHK-018 | [REQ-018](SPEC.md#req-018) / [CP-02](CHECKPOINTS.md#cp-02) | 原文署名與原日期保留；編輯更新另記；研究生成與審閱標記不誤導；migration manifest 可回指。 | not run；[E2E-018](E2E_CHECKLIST.md#e2e-018) |
| <a id="chk-019"></a>CHK-019 | [REQ-019](SPEC.md#req-019) / [CP-02](CHECKPOINTS.md#cp-02) | 快照失敗不令主站不可用；顯示實際資料時間；搜尋與 overlay 可恢復，無假最新狀態。 | not run；[E2E-019](E2E_CHECKLIST.md#e2e-019) |
| <a id="chk-020"></a>CHK-020 | [REQ-020](SPEC.md#req-020) / [CP-02](CHECKPOINTS.md#cp-02) | Git Markdown→草稿→翻譯→檢查→PR→已驗證產物發布；不把機器輸出當無需審查的執行碼。 | not run；[E2E-020](E2E_CHECKLIST.md#e2e-020) |
| <a id="chk-021"></a>CHK-021 | [REQ-021](SPEC.md#req-021) / [CP-02](CHECKPOINTS.md#cp-02) | 經歷與成果來源可核對，三語不誇大；website 技術遷移不竄改既有工作經驗。 | not run；[E2E-021](E2E_CHECKLIST.md#e2e-021) |
| <a id="chk-022"></a>CHK-022 | [REQ-022](SPEC.md#req-022) / [CP-00](CHECKPOINTS.md#cp-00) | 輸出可追蹤計畫與未驗證清單；不宣稱已在用戶 repo 套用 skill／轉移／部署／通過產品測試。 | not run；[E2E-022](E2E_CHECKLIST.md#e2e-022) |

## 發布前共同條件

文章 manifest 與實際產物一一對應；URL 與 locale 沒有碰撞；未知來源 block 不被吞掉；所有 translated copy 的審閱狀態真實；三語留言 ID 一致；原生模式沒有 giscus 請求；私人內容不在 Git/public artifact；Nano writer 數目只有一份；正式網址、TLS、Pages Settings、rollback tuple 可核對。

若某項不適用，必須寫出原因而不是直接打勾。browser／mobile／DNS／Nano 未執行時標 blocked 或 not run，不把 unit/build pass當作代替。新部署產物須重跑受影響與固定核心測試。
