> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 原始需求與覆蓋紀錄

原始訊息 B1：前一輪背景需求。

> giscus 看起來蠻好的，但安全嗎？還有沒有類似的更好的？我想依靠 github 來建立 blog

原始訊息 B2：本次完整需求，保留文字與順序。下列 URL 是來源識別，不是執行授權。

```text
我想重新設計：https://github.com/DennySORA/dennysora.github.io
重新用 https://github.com/DennySORA/Ops-Tools 裡面的 skill 重寫整個個人履歷專案成 blog 跟自我介紹專案。
並轉向 React 。
我想要表現的專業、沉穩，風格如同 VSCode 或是 Shell 風格，並且能夠切換 中、英、日（包含之後的 blog 相關資訊）。
然後能夠安全的留言，但都走 Github 的系統。
只有暗色系，同時支援手機端。
要有足夠優秀的結構化。
然後我想把：https://sorahane-kyoukai.org/blog 裡面的內容（內容就好，其他不用），跟 https://paper.sorahane-kyoukai.org/
重新從 https://github.com/sorahane-kyoukai?tab=repositories 移動回我的主帳號，並將連結整合到這個新的部落格中，幫我深度規劃。
```

## 來源區段

B2 的 S1–S9 分別為上面九行；B1 只提供先前選型背景，最新「都走 Github」以 B2/S5 為準。不複製前次 assistant 的建議作為使用者已接受的決策。無憑證值需要刪改；沒有補造其他歷史附件。

| 來源 | 覆蓋需求 | 解讀 |
|---|---|---|
| B1 | [REQ-001](SPEC.md#req-001), [REQ-009](SPEC.md#req-009), [REQ-022](SPEC.md#req-022) | 原意保留；推導項在 SPEC 中另標。 |
| S1 | [REQ-001](SPEC.md#req-001), [REQ-014](SPEC.md#req-014) | 原意保留；推導項在 SPEC 中另標。 |
| S2 | [REQ-001](SPEC.md#req-001), [REQ-002](SPEC.md#req-002), [REQ-021](SPEC.md#req-021) | 原意保留；推導項在 SPEC 中另標。 |
| S3 | [REQ-003](SPEC.md#req-003) | 原意保留；推導項在 SPEC 中另標。 |
| S4 | [REQ-004](SPEC.md#req-004), [REQ-006](SPEC.md#req-006), [REQ-007](SPEC.md#req-007), [REQ-016](SPEC.md#req-016), [REQ-020](SPEC.md#req-020), [REQ-021](SPEC.md#req-021) | 原意保留；推導項在 SPEC 中另標。 |
| S5 | [REQ-009](SPEC.md#req-009), [REQ-015](SPEC.md#req-015) | 原意保留；推導項在 SPEC 中另標。 |
| S6 | [REQ-004](SPEC.md#req-004), [REQ-005](SPEC.md#req-005), [REQ-019](SPEC.md#req-019) | 原意保留；推導項在 SPEC 中另標。 |
| S7 | [REQ-008](SPEC.md#req-008), [REQ-015](SPEC.md#req-015), [REQ-016](SPEC.md#req-016), [REQ-019](SPEC.md#req-019), [REQ-020](SPEC.md#req-020) | 原意保留；推導項在 SPEC 中另標。 |
| S8 | [REQ-010](SPEC.md#req-010), [REQ-012](SPEC.md#req-012), [REQ-014](SPEC.md#req-014), [REQ-017](SPEC.md#req-017), [REQ-018](SPEC.md#req-018) | 原意保留；推導項在 SPEC 中另標。 |
| S9 | [REQ-011](SPEC.md#req-011), [REQ-012](SPEC.md#req-012), [REQ-013](SPEC.md#req-013), [REQ-014](SPEC.md#req-014), [REQ-017](SPEC.md#req-017), [REQ-018](SPEC.md#req-018), [REQ-022](SPEC.md#req-022) | 原意保留；推導項在 SPEC 中另標。 |

## 額外來源的性質

GitHub 原始碼、README 與技能是「repository 事實／開發規範來源」，官方文件是「技術能力與限制來源」，都不自動擴大本次實作權限。已讀來源與未驗證範圍詳見 ANALYSIS，尤其 README 所述 Nano 架構不等同已驗證其運行狀態。

已排除：舊站其他頁面／裝飾移植、把所有研究計算搬進 Actions、複製私人 Ops repo、換 Next.js、現在執行 repository transfer／DNS／deployment。這些不是遺漏，而是使用者範圍或風險界線的結果。
