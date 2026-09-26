# UI／UX v2.1 後續待辦

2026-09-26 建立。v2.1 已合併進 `main`，但尚未部署。以下是交付時留給擁有者處理的事項，完成一項就勾選或刪除。交付與驗收紀錄見 [DELIVERY-v2.1.md](DELIVERY-v2.1.md)。

## 需要擁有者決定

- [ ] **留言是否改用 giscus 內嵌。** 規格第 13 節要求明示接受 giscus 服務與 GitHub App 權限；目前的 GitHub 原生討論連結（[#1](https://github.com/DennySORA/dennysora.github.io/discussions/1)–[#3](https://github.com/DennySORA/dennysora.github.io/discussions/3)）只算備援，不算完成內嵌留言。
  - 接受：在 GitHub 網頁只為本 repository 安裝 [giscus App](https://github.com/apps/giscus)，依[寫作指南](../CONTENT_WORKFLOW.md#留言)把 [`data/comments.json`](../../data/comments.json) 改成 `giscus` 模式（設定值已列在指南；[`giscus.json`](../../giscus.json) 已限制只能內嵌在 `https://dennysora.me`），再人工驗收 C04、C06。
  - 不接受：維持 `github-native`。這表示放棄規格建議的內嵌目標，請在交付紀錄註明是擁有者的決定。
- [ ] **至少一篇專案完整案例。** 驗收 P03 卡在這裡。在 [`content/projects/projects.json`](../../content/projects/projects.json) 的專案填入 `caseStudy`（`publication`、`locales`、`contentPath: content/projects/<id>/`）並提供真實內容；沒有案例的專案不會顯示「查看案例」。
- [ ] **何時部署。** 線上網站仍是 `fb4c89f`（2026-09-20 部署）。push 到 `main` 只會跑驗證；要發布時執行 `gh workflow run site.yml --ref main -f deploy=true`，或在 GitHub Actions 手動執行「Verify and publish static site」並勾選 `deploy`。發布前可先處理下方的審閱項目。

## 需要擁有者審閱

- [ ] About 新文案（定位、簡介、能力說明、經歷摘要），在 [`content/profile/profile.json`](../../content/profile/profile.json)：繁中依交接包，英文與日文由既有公開譯文改寫。
- [ ] 各篇文章的 Tag 與寫作類型：`content/posts/*/meta.json` 的 `tagIds`、`contentType`；標籤名稱與別名在 [`content/taxonomy/`](../../content/taxonomy/)。
- [ ] Ops-Tools、Image-Tools、Auto-Video-Organize 是 private，未列入 About；若改為公開，依 [`data/migration/about-sections.json`](../../data/migration/about-sections.json) 恢復。

## 未 commit 的本機檔案

以下檔案只在本機工作目錄、未納入版本控制；v2.1 沒有修改也沒有 commit 它們。

| 路徑 | 內容 | 待決定 |
|---|---|---|
| `AGENTS.md`、`CLAUDE.md`、`docs/AGENTS.md`、`docs/CLAUDE.md`、`docs/agent/` | 程式代理的工作規則與 playbook | 是否納入版本控制 |
| `POLICY_VERSION`、`POLICY_MANIFEST.sha256` | 上列規則檔的版本與雜湊 | 與規則檔一起決定 |
| `PROJECT_AGENT.md` | repository 描述檔，仍寫著改版前的 `index.html`／`style.css`／`lang.js` 架構，以及「沒有套件管理、產生器、linter 或測試指令」 | 先改寫成現況（React Router、pnpm、`pnpm verify`），再決定是否 commit |
| `.serena/` | Serena 的專案設定；目錄內的 `.gitignore` 已排除 `cache/` 與 `project.local.yml`，加入時只會帶進 `project.yml` 與該 `.gitignore` | 是否共享 Serena 設定；不共享就在根目錄 `.gitignore` 排除 |
| `DennySORA_UI_UX_v2.1_Package.zip` | v2.1 規格包（2.0 MB：規格、交接說明、參考畫面） | 移到 repository 外保存或加入 `.gitignore`；建置不需要它 |

## 尚未完成的驗收

見交付紀錄的[第 19 節對照表](DELIVERY-v2.1.md#規格第-19-節驗收對照)：S02（真實作業系統輸入法）、S03（事先審閱的 golden query 語料）、X02（真實瀏覽器 200% 縮放），以及留言決定之後的 C04、C06。
