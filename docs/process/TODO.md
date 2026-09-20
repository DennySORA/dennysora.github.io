> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# 工作清單

狀態初始為 todo。下一步先做 TODO-002（實際 skill／policy／SSG 決策），可平行進行 TODO-010 的唯讀來源清冊；沒有 admin 只阻擋 TODO-011/012/014 的遠端變更，不阻擋本地 schema 和預覽。

以下命令名稱與檔案路徑為待落實的 owner 契約，未在實際 manifest 查驗之前不能聲稱既有命令能執行。任何會寫 repo／DNS／Nano 的項目仍須其對應授權。

<a id="todo-001"></a>
## TODO-001｜個人履歷轉為自介、專案與 blog 主站

關聯：[REQ-001](SPEC.md#req-001)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：site；路徑：`src/app、content/profile`；狀態：todo。

依賴：TODO-002、TODO-003。

操作：定義五個主入口與首頁層級，用真實但經核對的 profile 填出垂直切片。

完成檢查：首頁→About／Projects／Blog／Research 有完整旅程，不再只有履歷單頁。 對照 [E2E-001](E2E_CHECKLIST.md#e2e-001)；證據：未執行。

<a id="todo-002"></a>
## TODO-002｜使用並核對 Ops-Tools skills 與共享政策

關聯：[REQ-002](SPEC.md#req-002)、[CP-00](CHECKPOINTS.md#cp-00)；優先：P0；owner：policy；路徑：`repo root、Ops skill 安裝位置`；狀態：todo。

依賴：無。

操作：唯讀核對本機 skill／共享 policy、Git top level 與現有檔案；寫出 SSG recipe 決策，不覆蓋受管原文。

完成檢查：辨別來源／安裝／實際載入版本；managed manifest 一致；既有 Git 與政策無被盲覆寫。 對照 [E2E-002](E2E_CHECKLIST.md#e2e-002)；證據：未執行。

<a id="todo-003"></a>
## TODO-003｜React／Vite 前端與靜態文章路由

關聯：[REQ-003](SPEC.md#req-003)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：site；路徑：`前端 manifest、router config、scripts/content`；狀態：todo。

依賴：TODO-002。

操作：核對官方相容 stable 候選及 peer ranges，stage 前端；列舉所有 published routes，驗證 SSG HTML/data 的 Pages 路徑。

完成檢查：React/TS/Vite/Tailwind/pnpm；SSG 選型有紀錄；直接開啟文章為完整 HTML，不需常駐 API。 對照 [E2E-003](E2E_CHECKLIST.md#e2e-003)；證據：未執行。

<a id="todo-004"></a>
## TODO-004｜專業沉穩的 VS Code／Shell 視覺、僅暗色

關聯：[REQ-004](SPEC.md#req-004)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P1；owner：design；路徑：`src/styles、layouts`；狀態：todo。

依賴：TODO-001。

操作：建立 token、字級、留白、三欄／單欄契約；以長篇中文日文 fixtures 檢視，而非單張首頁截圖。

完成檢查：語義色與長文層級清楚；無亮色模式、假終端輸入門檻、虛假 telemetry 或裝飾型重依賴。 對照 [E2E-004](E2E_CHECKLIST.md#e2e-004)；證據：未執行。

<a id="todo-005"></a>
## TODO-005｜手機、鍵盤與長內容可用

關聯：[REQ-005](SPEC.md#req-005)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：design/site；路徑：`layouts、drawer、ToC、tests/e2e`；狀態：todo。

依賴：TODO-004。

操作：實作單一正文捲動、手機抽屜、焦點回復與長內容溢出限制。

完成檢查：320–1440 CSS px、200% zoom 可用；無全頁水平溢出；focus、drawer、ToC、code 具有明確行為。 對照 [E2E-005](E2E_CHECKLIST.md#e2e-005)；證據：未執行。

<a id="todo-006"></a>
## TODO-006｜繁中／英文／日文 UI 與 URL

關聯：[REQ-006](SPEC.md#req-006)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：i18n/site；路徑：`src/i18n、route manifest`；狀態：todo。

依賴：TODO-003、TODO-008。

操作：定義 locale 映射和 content-ID 語言對照；快速切換不丟文章、不使用旗幟作唯一識別。

完成檢查：三語核心 UI 可直接進入；locale 與 HTML lang 正確；切換保留同一內容身份。 對照 [E2E-006](E2E_CHECKLIST.md#e2e-006)；證據：未執行。

<a id="todo-007"></a>
## TODO-007｜文章翻譯、metadata 與缺譯／過期狀態

關聯：[REQ-007](SPEC.md#req-007)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：content/i18n；路徑：`content/posts、schema、術語表`；狀態：todo。

依賴：TODO-006、TODO-010。

操作：分離 translationState/publication，原文 hash 對譯文；五篇內容先輸出草稿，經審閱再發布。

完成檢查：每語言標題摘要與狀態受 schema 驗證；機器草稿不當已審譯文；原文改動會標示 stale。 對照 [E2E-007](E2E_CHECKLIST.md#e2e-007)；證據：未執行。

<a id="todo-008"></a>
## TODO-008｜清晰 owner、schema 與單一資料來源

關聯：[REQ-008](SPEC.md#req-008)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：site/content；路徑：`content schema、src/lib`；狀態：todo。

依賴：TODO-002。

操作：落實穩定 id／slug／日期／tag／author／source schema，拒絕重複 id 與不安全連結。

完成檢查：內容、UI、schema、路由分權；穩定 content ID／taxonomy ID；不建立無需求的後端或複雜 monorepo。 對照 [E2E-008](E2E_CHECKLIST.md#e2e-008)；證據：未執行。

<a id="todo-009"></a>
## TODO-009｜安全且 GitHub 為核心的留言

關聯：[REQ-009](SPEC.md#req-009)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：comments；路徑：`comments 設定與 discussion map`；狀態：todo。

依賴：TODO-008；建 repo／發 discussion 另有授權。

操作：建立 native link 版型及穩定 discussion 對照；不放 provider secret；giscus 先不載入。

完成檢查：native Discussions 預設；三語共用 discussion；瀏覽器沒有 secret；giscus 不偽稱原生 GitHub。 對照 [E2E-009](E2E_CHECKLIST.md#e2e-009)；證據：未執行。

<a id="todo-010"></a>
## TODO-010｜只匯入舊 blog 內容

關聯：[REQ-010](SPEC.md#req-010)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：migration/content；路徑：`scripts/migration、migration manifest`；狀態：todo。

依賴：來源唯讀權限即可，匯入輸出依賴 TODO-008。

操作：固定來源 ref、列出五篇／最新增量與 block types，建立 AST extractor 及等價 fixtures。

完成檢查：五筆來源基線逐篇等價轉換；最新來源有增量則列入；Vue／裝飾／其他舊站分類不搬。 對照 [E2E-010](E2E_CHECKLIST.md#e2e-010)；證據：未執行。

<a id="todo-011"></a>
## TODO-011｜兩個來源 repo 回到主帳號

關聯：[REQ-011](SPEC.md#req-011)、[CP-03](CHECKPOINTS.md#cp-03)；優先：P1；owner：repo-admin；路徑：`兩個 source repo settings`；狀態：todo。

依賴：TODO-010、TODO-017；來源 admin／接收授權。

操作：檢查命名衝突／refs／GitHub 資源／collaborators，執行經授權 transfer，保留 source history。

完成檢查：admin／名稱碰撞預檢；兩個 repo 分別移轉保留必要 refs 與資源，不覆蓋現存主站。 對照 [E2E-011](E2E_CHECKLIST.md#e2e-011)；證據：未執行。

<a id="todo-012"></a>
## TODO-012｜保留論文生成、資料、排程與秘密邊界

關聯：[REQ-012](SPEC.md#req-012)、[CP-03](CHECKPOINTS.md#cp-03)；優先：P0；owner：paper/Nano；路徑：`daily-paper-report scripts／Nano config`；狀態：todo。

依賴：TODO-011、TODO-017；受控 Nano 存取與更動授權。切換前的唯讀配置盤點可在 TODO-011 前執行，真正更改發布目標與發布在移轉後執行。

操作：停止新 writer、備份、更新 remote/domain 等配置，驗證安全產物與原 UTC 排程；不順帶升級 pipeline。

完成檢查：main/gh-pages/state 與一致性備份核對；單 writer；REMOTE_URL／PAGES_DOMAIN 正確；不發布完整原文或 secrets。 對照 [E2E-012](E2E_CHECKLIST.md#e2e-012)；證據：未執行。

<a id="todo-013"></a>
## TODO-013｜主站整合研究連結與 metadata

關聯：[REQ-013](SPEC.md#req-013)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：research/site；路徑：`src/features/research、data/research`；狀態：todo。

依賴：TODO-008。

操作：定義只讀 metadata 快照契約與三語入口；只允許已知來源 URL，外站資料不當作可執行 HTML/MDX。

完成檢查：三語 Research 入口、原論文／導讀清楚；僅接收驗證過的公開快照；與人工 blog 分流。 對照 [E2E-013](E2E_CHECKLIST.md#e2e-013)；證據：未執行。

<a id="todo-014"></a>
## TODO-014｜舊 URL、既有域名與 SEO 遷移

關聯：[REQ-014](SPEC.md#req-014)、[CP-04](CHECKPOINTS.md#cp-04)；優先：P1；owner：migration/domain；路徑：`legacy bridge、Pages settings、DNS`；狀態：todo。

依賴：TODO-010、TODO-011；DNS／發布授權。

操作：逐 URL 對照新目的地，查驗跨 owner verified-domain；分清靜態 bridge 與 HTTP redirect。

完成檢查：逐路徑對照；不把 repo redirect 當 Pages redirect；保留已知文章與 detail 路由出口。 對照 [E2E-014](E2E_CHECKLIST.md#e2e-014)；證據：未執行。

<a id="todo-015"></a>
## TODO-015｜可重現 CI 與公開產物安全

關聯：[REQ-015](SPEC.md#req-015)、[CP-01](CHECKPOINTS.md#cp-01)；優先：P0；owner：ci/site；路徑：`.github/workflows、artifact audit`；狀態：todo。

依賴：TODO-003、TODO-008。

操作：配置最小權限 CI／deploy、受信來源、frozen locks；檢查 HTML/data/JS/assets 中的禁用內容。

完成檢查：frozen lock／分離權限／production artifact 測試；無私有 Ops payload、secret、DB、危險 MDX 或整站錯誤發布。 對照 [E2E-015](E2E_CHECKLIST.md#e2e-015)；證據：未執行。

<a id="todo-016"></a>
## TODO-016｜三語搜尋、RSS、sitemap 與語義 metadata

關聯：[REQ-016](SPEC.md#req-016)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：search/seo；路徑：`scripts/seo、search、feed`；狀態：todo。

依賴：TODO-006、TODO-007。

操作：Pagefind extended 與語系測試，產出每語系 RSS/OG/sitemap；hreflang 只指向 published。

完成檢查：每語言只索引有效版本；中日斷詞 fixtures 通過；self-canonical 與 hreflang 對應真實頁。 對照 [E2E-016](E2E_CHECKLIST.md#e2e-016)；證據：未執行。

<a id="todo-017"></a>
## TODO-017｜搬遷可回復與備份不遺失

關聯：[REQ-017](SPEC.md#req-017)、[CP-03](CHECKPOINTS.md#cp-03)；優先：P0；owner：migration/paper；路徑：`私有備份位置／遷移證據`；狀態：todo。

依賴：CP-00 清冊；備份系統授權。

操作：驗證一致性 DB 備份與隔離還原；盤點 public state 的內容分類，不下載或記錄無關 secrets。

完成檢查：備份可實際還原；Git refs／LFS／平台留言各自盤點；回滾不啟用雙 writer 或默默覆寫新資料。 對照 [E2E-017](E2E_CHECKLIST.md#e2e-017)；證據：未執行。

<a id="todo-018"></a>
## TODO-018｜原作者、日期與研究來源可追溯

關聯：[REQ-018](SPEC.md#req-018)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：content/paper；路徑：`author records、provenance`；狀態：todo。

依賴：TODO-010。

操作：保留原日期、空羽ノ境署名與來源 checksum；原文等價匯入和編輯修訂分開。

完成檢查：原文署名與原日期保留；編輯更新另記；研究生成與審閱標記不誤導；migration manifest 可回指。 對照 [E2E-018](E2E_CHECKLIST.md#e2e-018)；證據：未執行。

<a id="todo-019"></a>
## TODO-019｜載入、空白、錯誤與資料過期狀態

關聯：[REQ-019](SPEC.md#req-019)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：site/research；路徑：`search/research/overlay states`；狀態：todo。

依賴：TODO-005、TODO-013。

操作：定義 empty/loading/error/stale/retry fixtures；失敗保留已驗證快照，不顯示 build time 為更新時間。

完成檢查：快照失敗不令主站不可用；顯示實際資料時間；搜尋與 overlay 可恢復，無假最新狀態。 對照 [E2E-019](E2E_CHECKLIST.md#e2e-019)；證據：未執行。

<a id="todo-020"></a>
## TODO-020｜長期寫作與發布審查流程

關聯：[REQ-020](SPEC.md#req-020)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：content/ci；路徑：`content workflow、PR templates`；狀態：todo。

依賴：TODO-007、TODO-015。

操作：將寫作、翻譯、驗證、審閱、發布與 sourceRevision 更新列為可重現操作，不執行原文中的指令。

完成檢查：Git Markdown→草稿→翻譯→檢查→PR→已驗證產物發布；不把機器輸出當無需審查的執行碼。 對照 [E2E-020](E2E_CHECKLIST.md#e2e-020)；證據：未執行。

<a id="todo-021"></a>
## TODO-021｜個人介紹與專案案例有可信證據

關聯：[REQ-021](SPEC.md#req-021)、[CP-02](CHECKPOINTS.md#cp-02)；優先：P1；owner：profile；路徑：`content/profile、content/projects`；狀態：todo。

依賴：TODO-008。

操作：整理來源支持的個人介紹與案例，再做三語審閱；避免自行補造雇主、年資或成效。

完成檢查：經歷與成果來源可核對，三語不誇大；website 技術遷移不竄改既有工作經驗。 對照 [E2E-021](E2E_CHECKLIST.md#e2e-021)；證據：未執行。

<a id="todo-022"></a>
## TODO-022｜本次為深度規劃，不越權實作或移轉

關聯：[REQ-022](SPEC.md#req-022)、[CP-00](CHECKPOINTS.md#cp-00)；優先：P0；owner：planning；路徑：`docs/process`；狀態：todo。

依賴：無。

操作：合併本草案前檢查現有文檔；保留原需求、已有 ID／歷史證據；標明何者只做了來源檢視。

完成檢查：輸出可追蹤計畫與未驗證清單；不宣稱已在用戶 repo 套用 skill／轉移／部署／通過產品測試。 對照 [E2E-022](E2E_CHECKLIST.md#e2e-022)；證據：未執行。
