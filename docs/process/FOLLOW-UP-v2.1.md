# UI／UX v2.1 後續待辦

2026-09-26 建立。v2.1 已合併進 `main`，並於 2026-09-26 依擁有者指示部署（`8bed0f9`）。2026-09-27 的編輯器工作台改版（v2.2）已 commit（`fb70379`）並部署，見 [DELIVERY-v2.2.md](DELIVERY-v2.2.md)。以下是留給擁有者處理的事項，完成一項就勾選或刪除。v2.1 的交付與驗收紀錄見 [DELIVERY-v2.1.md](DELIVERY-v2.1.md)。

## 需要擁有者決定

- [ ] **留言是否改用 giscus 內嵌。** 規格第 13 節要求明示接受 giscus 服務與 GitHub App 權限；目前的 GitHub 原生討論連結（[#1](https://github.com/DennySORA/dennysora.github.io/discussions/1)–[#3](https://github.com/DennySORA/dennysora.github.io/discussions/3)）只算備援，不算完成內嵌留言。
  - 接受：在 GitHub 網頁只為本 repository 安裝 [giscus App](https://github.com/apps/giscus)，依[寫作指南](../CONTENT_WORKFLOW.md#留言)把 [`data/comments.json`](../../data/comments.json) 改成 `giscus` 模式（設定值已列在指南；[`giscus.json`](../../giscus.json) 已限制只能內嵌在 `https://dennysora.me`），再人工驗收 C04、C06。
  - 不接受：維持 `github-native`。這表示放棄規格建議的內嵌目標，請在交付紀錄註明是擁有者的決定。
- [ ] **至少一篇專案完整案例。** 驗收 P03 卡在這裡。在 [`content/projects/projects.json`](../../content/projects/projects.json) 的專案填入 `caseStudy`（`publication`、`locales`、`contentPath: content/projects/<id>/`）並提供真實內容；沒有案例的專案不會顯示「查看案例」。
- [x] **部署 v2.1。** 2026-09-26 依擁有者指示執行 `gh workflow run site.yml --ref main -f deploy=true`（run 36253709040），線上為 `8bed0f9`。
- [x] **部署 v2.2 編輯器改版。** 2026-09-27 依擁有者指示 commit 到 `main`（`fb70379`）、push，push 的驗證（run 36328980973）通過後以同一指令部署（run 36329145107），線上為 `fb70379`。之後的發布方式相同：push 到 `main` 只跑驗證，發布要手動執行「Verify and publish static site」並勾選 `deploy`。

## 需要擁有者審閱

- [ ] 首頁 README 的自介文案（定位、簡介、能力說明、經歷摘要），在 [`content/profile/profile.json`](../../content/profile/profile.json)：繁中依交接包，英文與日文由既有公開譯文改寫。
- [ ] 各篇文章的 Tag 與寫作類型：`content/posts/*/meta.json` 的 `tagIds`、`contentType`；標籤名稱與別名在 [`content/taxonomy/`](../../content/taxonomy/)。
- [ ] Ops-Tools、Image-Tools、Auto-Video-Organize 是 private，未列入首頁履歷；若改為公開，依 [`data/migration/about-sections.json`](../../data/migration/about-sections.json) 恢復。

## 本機檔案的處理（2026-09-27）

原本只在本機、未納入版本控制的檔案都已處理，工作目錄沒有未追蹤的檔案：

- 程式代理規則（`AGENTS.md`、`CLAUDE.md`、`docs/AGENTS.md`、`docs/CLAUDE.md`、`docs/agent/`，以及 `POLICY_VERSION` 1.2.0 與 `POLICY_MANIFEST.sha256`）：15 個檔案與 manifest 的 SHA-256 一致，原樣 commit（`28e1ce5`）。
- [`PROJECT_AGENT.md`](../../PROJECT_AGENT.md)：改寫成現況（React Router 預渲染、pnpm、`pnpm verify`、編輯器工作台、手動部署）後 commit（`28e1ce5`）。
- `.serena/`：Serena 的本機設定，不共享，加入根目錄 `.gitignore`。
- `DennySORA_UI_UX_v2.1_Package.zip`：已不在 repository 資料夾中。

## 尚未完成的驗收

見交付紀錄的[第 19 節對照表](DELIVERY-v2.1.md#規格第-19-節驗收對照)：S02（真實作業系統輸入法）、S03（事先審閱的 golden query 語料）、X02（真實瀏覽器 200% 縮放），以及留言決定之後的 C04、C06。
