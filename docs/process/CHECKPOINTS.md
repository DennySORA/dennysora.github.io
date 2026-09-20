> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 里程碑與依賴

依賴圖：CP-00 → CP-01 → CP-02；CP-00 與 CP-02 → CP-03；CP-01/02/03 → CP-04。CP-00 的 admin 阻擋不妨礙 CP-01 的隔離預覽；它只阻擋真正 transfer。CP-01 是第一個可運作交付，不把整套大設計當前置條件。

<a id="cp-00"></a>
## CP-00｜來源、政策、權限與安全邊界

狀態：todo。進入條件：無；只能先做唯讀與本地規劃。

範圍：[REQ-002](SPEC.md#req-002), [REQ-022](SPEC.md#req-022)。

輸出：來源 commit／URL／內容清册、實際 skill loading 檢查、SSG recipe 決策、移轉／DNS 權限清單；不改正式環境。

退出：有可審核的 policy 與架構決策；所有未知項有 owner 與 gate，不以預設掩蓋。

驗證：[E2E-002](E2E_CHECKLIST.md#e2e-002), [E2E-022](E2E_CHECKLIST.md#e2e-022)；實際執行結果與 artifact/ref 尚未建立，證據：not run。

<a id="cp-01"></a>
## CP-01｜可運作的三語垂直切片

狀態：todo。進入條件：CP-00；有效前端 owner 與經審查依賴。

範圍：[REQ-001](SPEC.md#req-001), [REQ-003](SPEC.md#req-003), [REQ-004](SPEC.md#req-004), [REQ-005](SPEC.md#req-005), [REQ-006](SPEC.md#req-006), [REQ-008](SPEC.md#req-008), [REQ-009](SPEC.md#req-009), [REQ-015](SPEC.md#req-015)。

輸出：首頁、About、單篇三語文章、GitHub 討論連結、深色手機 layout、production SSG、基本 CI。

退出：停用 JS 可閱讀；直接開／重整每個正式路徑成功；三語共用內容身份；鍵盤與手機核心流程可完成。

驗證：[E2E-001](E2E_CHECKLIST.md#e2e-001), [E2E-003](E2E_CHECKLIST.md#e2e-003), [E2E-004](E2E_CHECKLIST.md#e2e-004), [E2E-005](E2E_CHECKLIST.md#e2e-005), [E2E-006](E2E_CHECKLIST.md#e2e-006), [E2E-008](E2E_CHECKLIST.md#e2e-008), [E2E-009](E2E_CHECKLIST.md#e2e-009), [E2E-015](E2E_CHECKLIST.md#e2e-015)；實際執行結果與 artifact/ref 尚未建立，證據：not run。

<a id="cp-02"></a>
## CP-02｜完整內容與日常出版流程

狀態：todo。進入條件：CP-01；來源 extractor 與 schema 可用。

範圍：[REQ-007](SPEC.md#req-007), [REQ-010](SPEC.md#req-010), [REQ-013](SPEC.md#req-013), [REQ-016](SPEC.md#req-016), [REQ-018](SPEC.md#req-018), [REQ-019](SPEC.md#req-019), [REQ-020](SPEC.md#req-020), [REQ-021](SPEC.md#req-021)。

輸出：五篇文章來源對照、審閱翻譯、profile/project 案例、metadata、搜尋、RSS／sitemap、研究 gateway／快照。

退出：來源無遺漏；三語狀態真實；研究失敗不破壞主站；每個需求有明確對應內容／測試。

驗證：[E2E-007](E2E_CHECKLIST.md#e2e-007), [E2E-010](E2E_CHECKLIST.md#e2e-010), [E2E-013](E2E_CHECKLIST.md#e2e-013), [E2E-016](E2E_CHECKLIST.md#e2e-016), [E2E-018](E2E_CHECKLIST.md#e2e-018), [E2E-019](E2E_CHECKLIST.md#e2e-019), [E2E-020](E2E_CHECKLIST.md#e2e-020), [E2E-021](E2E_CHECKLIST.md#e2e-021)；實際執行結果與 artifact/ref 尚未建立，證據：not run。

<a id="cp-03"></a>
## CP-03｜來源 repo 與研究系統移轉

狀態：todo。進入條件：CP-00 及 CP-02 清冊；另有遠端移轉授權／admin／回滾準備。

範圍：[REQ-011](SPEC.md#req-011), [REQ-012](SPEC.md#req-012), [REQ-017](SPEC.md#req-017)。

輸出：兩個 repo 分開 transfer、refs／平台資源核對、Nano 設定更新、state 隱私檢查、一致性備份、受控發布。

退出：日／週／月語意保留；只有一個 writer；新 owner 的原網址可用；回滾實驗通過，無秘密進入產物。

驗證：[E2E-011](E2E_CHECKLIST.md#e2e-011), [E2E-012](E2E_CHECKLIST.md#e2e-012), [E2E-017](E2E_CHECKLIST.md#e2e-017)；實際執行結果與 artifact/ref 尚未建立，證據：not run。

<a id="cp-04"></a>
## CP-04｜網址切換與正式發布驗收

狀態：todo。進入條件：CP-01、CP-02、CP-03；DNS/Pages 控制權與發布授權。

範圍：[REQ-014](SPEC.md#req-014)。

輸出：逐 URL bridge、Pages settings／DNS／TLS、實際部署探測、a11y 與 artifact 安全清單、發布紀錄。

退出：已知舊文章與履歷入口有合理新目的地；所有核心 E2E 通過，未通過有明示阻擋，不能假稱發布完成。

驗證：[E2E-014](E2E_CHECKLIST.md#e2e-014)；實際執行結果與 artifact/ref 尚未建立，證據：not run。

## 正式交付後的明確後續

研究 reader React 改版、所有歷史報告全文三語翻譯、可選內嵌 giscus、跨站聯合搜尋與進階互動另立 owner-local scope。不直接把它們加入 CP-04 的必要清單，也不將「先保留」說成永久拒絕。

工作結束只更新真的做完項目。重新產生 artifact 或變更 spec 後，相關舊測試通過紀錄需要重新驗證；不要沿用不同版本的 pass。
