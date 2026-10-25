> Historical draft checkpoint. For the subsequent authorized publication and current technical workflow, see [the publication record](DELIVERY-blog-publication-2026-10-25.md).

# Blog／網路稿件轉製（草稿）

日期：2026-10-25。來源：`agent_reported`。未提交、未推送、未發布。

## 範圍與保存

- 將提供的 `p2p-downloader-architecture(1).html` 轉為網站既有深色 Article／TOC／
  Explorer 風格，放在 Blog → 網路，不修改既有 P2P note、履歷或得獎內容。
- 附件 SHA-256：`6bf2d307959da366267b171e624da65cfc162e54dce56fafb9f55c7e8e3c6b92`。
  原始檔明示作者 DennySORA，因此保留署名。沒有捏造 Git provenance 或公開 Library URL。
- URL：`/{locale}/blog/network/p2p-downloader-architecture/`。
- 保留 17 主節、52 小節、6 圖、3 SVG、87 SVG 文字節點、43 引用及 21 外部參考。
  原有 14 表完整保留，另加一個經父任務確認的靜態組合比較表。
- 移除獨立頁首／導航／側欄／頁尾、裝飾性 symbol/use、全域樣式及上傳稿的 JavaScript。
  從未執行上傳的程式。H2 anchor 移到標題；參考 ID 統一小寫，H3 加入穩定 anchor。
- 原核取方塊示例改為原生 details，呈現 A/B/C 全部 8 種可用組合；本機已驗證的
  1–3 片、初始矩陣、公式及限制保留。唯一改動原文是將「取消來源 C，可以看到…」
  改為「當來源 C 不可用時…」；不再顯示已不存在控制項的操作／停用 JS 指示。
- 所有 CSS 限於 network-guide／np-*，沿用現有 token。圖中的文字與 ARIA 均有
  等義 EN／JA 版本；幾何與參考連結不變，不新增外部字型、圖庫或執行程式。

## 審閱與靜態驗證

- 稿件代理 `/root/adapt_network_blog_article` 的獨立工作區有 9 項測試，核對原稿
  文字保存、來源 SHA／署名、三語結構、幾何、引用、ID／ARIA、8 組集合與 CSS token，
  全部通過。這份外部測試有其原稿路徑依賴，不偽稱已原封不動整合成 repo 測試。
- Repo 測試 `tests/unit/static-article.test.ts` 現在直接檢查三語實際渲染的結構數量、
  引用數、無可執行內容、路由與草稿邊界；重新計算全部 8 種集合並比對實際表格數值。
- 獨立英日翻譯審閱、實際檔案 hash 與限制見
  [翻譯審閱紀錄](./REVIEW-imported-blog-2026-10-25.md)。不冒稱人工審閱。
- 嚴格 renderer 與類別路由由資安稿整合代理單一寫入；兩篇稿的原文與譯文均保持 draft，
  reviewEvidence 為 null。Browser／視覺／axe 均未執行，須依父任務後續授權驗收。

## 主要技術敘述回查

以下是稿件代理回報的有界 primary-source 比對；不是完整實作稽核、P2P 實測或架構
認證。沒有因此改寫技術主張。未列入的引用保留原貌，但沒有宣稱全部重新稽核。
原稿查閱日期屬於原稿內容，不代表本次重新執行過所有驗證。

| Manuscript claim                                                                               | Primary source inspected                                                                                                                                   | Finding                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Private torrent discovery is bounded by private tracker sources                                | [BEP 27](https://www.bittorrent.org/beps/bep_0027.html)                                                                                                    | Its `private=1` rules require announcements and initiated peer connections to use the private tracker; the manuscript's DHT/PEX caveat is supported.                         |
| Metadata exchange carries the info dictionary rather than every top-level torrent field        | [BEP 9](https://www.bittorrent.org/beps/bep_0009.html)                                                                                                     | Supported by the metadata section.                                                                                                                                           |
| v2 infohash uses SHA-256 over encoded info; files use Merkle roots; paths require sanitization | [BEP 52](https://www.bittorrent.org/beps/bep_0052.html)                                                                                                    | Supported by its infohash, file-tree and path sections. The manuscript does not claim the BEP has a particular standards status.                                             |
| Allowed-fast does not guarantee service; cancelled requests can still receive responses        | [BEP 6](https://www.bittorrent.org/beps/bep_0006.html)                                                                                                     | Supported by modified message semantics and allowed-fast rejection conditions.                                                                                               |
| `connecting`, `handshake` and parole have distinct meanings                                    | [libtorrent Core API](https://libtorrent.org/reference-Core.html)                                                                                          | `connecting` is half-open; `handshake` waits after opening; parole requests whole pieces from involved peers. Matches the manuscript's limited description.                  |
| qBittorrent's cited ban action has IP scope                                                    | [Pinned TransferController](https://github.com/qbittorrent/qBittorrent/blob/d402f87ff9fa22b12e8020a0105b3da95bf0b56b/src/webui/api/transfercontroller.cpp) | The specified `banPeersAction()` parses each address and calls `banIP(addr.ip.toString())`. No claim about other versions added.                                             |
| AICH can preserve intact sub-blocks when trusted root/recovery data exists                     | [aMule AICH documentation](https://amule-org.github.io/docs/p2p-networks/ed2k/aich)                                                                        | Supported; the manuscript correctly retains the trust and recovery-data conditions.                                                                                          |
| WAL allows readers with one writer; long readers may stall checkpoints                         | [SQLite WAL](https://www.sqlite.org/wal.html)                                                                                                              | Supported by its concurrency section. No new claims about durability configuration added.                                                                                    |
| Atomic rename and cross-mount limitations differ from durability                               | [rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html), [fsync(2)](https://man7.org/linux/man-pages/man2/fsync.2.html)                           | Atomic name replacement, EXDEV across mount points, and the need to sync directory entries separately support the manuscript's distinction.                                  |
| URL appearance alone cannot establish destination safety                                       | [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)                            | The DNS-pinning/address-validation discussion supports the stated risk. The article presents public/allowed-LAN scopes separately, not a universal ban on private addresses. |
