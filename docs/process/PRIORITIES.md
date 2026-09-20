> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 優先序與延期理由

P0：第一條端到端旅程必要條件，或在任何階段不能跳過的安全、資料完整性與回復能力；不是要求所有 P0 同時開始。

P1：完整需求交付的重要內容、整合與上線工作；CP-01 的 MVP 不能被拿來取代這些正式交付條件。

P2：經量測確認的性能改良與視覺細節，例如非必要的快捷指令面板。只有基線可用後才考慮。

P3：需新決策的擴充，例如研究 reader 全面 React 化、全部歷史報告三語重生成、自架留言／新 OAuth backend、跨站搜尋。現在不自動實作。

## 目前排序

| 排序群組 | 需求與工作 | 理由 |
|---|---|---|
| 先盤點 | [REQ-002](SPEC.md#req-002) / [TODO-002](TODO.md#todo-002), [REQ-022](SPEC.md#req-022) / [TODO-022](TODO.md#todo-022), [REQ-010](SPEC.md#req-010) / [TODO-010](TODO.md#todo-010), [REQ-017](SPEC.md#req-017) / [TODO-017](TODO.md#todo-017) | 來源、政策、回復邊界先明確，避免一開始破壞現站。 |
| 端到端骨架 | [REQ-008](SPEC.md#req-008) / [TODO-008](TODO.md#todo-008), [REQ-003](SPEC.md#req-003) / [TODO-003](TODO.md#todo-003), [REQ-001](SPEC.md#req-001) / [TODO-001](TODO.md#todo-001), [REQ-006](SPEC.md#req-006) / [TODO-006](TODO.md#todo-006), [REQ-005](SPEC.md#req-005) / [TODO-005](TODO.md#todo-005), [REQ-009](SPEC.md#req-009) / [TODO-009](TODO.md#todo-009), [REQ-015](SPEC.md#req-015) / [TODO-015](TODO.md#todo-015) | 一次驗證路由、三語、閱讀、留言邊界和真正發布產物。 |
| 出版完整度 | [REQ-004](SPEC.md#req-004) / [TODO-004](TODO.md#todo-004), [REQ-007](SPEC.md#req-007) / [TODO-007](TODO.md#todo-007), [REQ-018](SPEC.md#req-018) / [TODO-018](TODO.md#todo-018), [REQ-021](SPEC.md#req-021) / [TODO-021](TODO.md#todo-021), [REQ-016](SPEC.md#req-016) / [TODO-016](TODO.md#todo-016), [REQ-020](SPEC.md#req-020) / [TODO-020](TODO.md#todo-020), [REQ-013](SPEC.md#req-013) / [TODO-013](TODO.md#todo-013), [REQ-019](SPEC.md#req-019) / [TODO-019](TODO.md#todo-019) | 沉穩設計和真實內容、翻譯、搜尋與失敗狀態一起落地。 |
| 移轉與切換 | [REQ-012](SPEC.md#req-012) / [TODO-012](TODO.md#todo-012), [REQ-011](SPEC.md#req-011) / [TODO-011](TODO.md#todo-011), [REQ-014](SPEC.md#req-014) / [TODO-014](TODO.md#todo-014) | 有備份與能力後再移轉，URL／域名最後切換。 |

初始優先序記錄：2026-09-20 依使用者 React／三語／深色手機／GitHub／內容遷移目標制定。後續變更保留日期、原因、受影響 ID 與舊驗收失效範圍。未提供工期或成本資料，不捏造工時與雲端費用。
