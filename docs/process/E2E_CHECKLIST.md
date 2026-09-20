> 2026-09-20 更新：這份文件保留 ZIP 的原始規劃與 ID。當前實作、已刪除來源、驗收結果和未執行範圍以 [DELIVERY.md](DELIVERY.md) 為準；原始 todo／not run 不代表本次執行結果。

# E2E 驗收規格

這些是可執行驗收的計畫，初始結果全部 `not run`。文件包鏈結檢查成功也不會把下面產品案例變成 passed。正式執行記錄需包含日期、commit/artifact hash、裝置/瀏覽器、指令與結果證據。

共同清理規則：優先使用測試 repo／branch／DB／discussion；只刪自己建立且能證明身份的測試資料；不移除真實文章、留言、Git refs 或正式備份。需 admin／DNS／Nano 的案例若沒有能力或授權，標 blocked。

<a id="e2e-001"></a>
## E2E-001｜個人履歷轉為自介、專案與 blog 主站

關聯：[REQ-001](SPEC.md#req-001)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：首次來訪者／首頁。

前置／fixture：具已核對 profile 與一篇三語文章的 production artifact。

步驟：開首頁→About→Project→Blog→Research→回主頁。

預期：主要入口可見、有意義內容、普通連結可分享與返回。

方法：Playwright；人工內容層級檢視。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-002"></a>
## E2E-002｜使用並核對 Ops-Tools skills 與共享政策

關聯：[REQ-002](SPEC.md#req-002)／[CP-00](CHECKPOINTS.md#cp-00)。

Actor／入口：Agent／既有 repo root。

前置／fixture：有既有檔案、Git 與可讀 skills；不需要私有 secret。

步驟：核對 skill source/installed/loaded→manifest→root→SSG recipe。

預期：政策來源可追溯；managed bytes 未偷改；無 nested Git／第二套政策。

方法：唯讀檢查／manifest helper 於另行授權導入後執行。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-003"></a>
## E2E-003｜React／Vite 前端與靜態文章路由

關聯：[REQ-003](SPEC.md#req-003)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：讀者／文章直接 URL。

前置／fixture：完整 route manifest 與不支援 SPA fallback 的靜態 server。

步驟：逐路徑直接開啟與reload→停用 JS重跑→client navigation。

預期：HTTP200 的有效內容、完整 title/text；.data 正確；不存在文章真404，不回空殼首頁。

方法：Playwright＋HTTP／產物清冊。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-004"></a>
## E2E-004｜專業沉穩的 VS Code／Shell 視覺、僅暗色

關聯：[REQ-004](SPEC.md#req-004)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：讀者／長文。

前置／fixture：正常、focus、selected、資訊提示等設計 fixtures。

步驟：檢查桌面與手機長文→鍵盤操作→reduced motion。

預期：只有暗色；無 fake telemetry／終端輸入門檻；語義色、正文與互動層級清晰。

方法：實際渲染、computed styles、contrast與人工視覺。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-005"></a>
## E2E-005｜手機、鍵盤與長內容可用

關聯：[REQ-005](SPEC.md#req-005)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：手機／鍵盤讀者。

前置／fixture：320/360/390/768/1280/1440 viewport、長 code/table/URL。

步驟：開 drawer→Tab→Escape→開 ToC→跳段落→200% zoom。

預期：focus 回到觸發點；正文單 scroll；全頁無水平溢出，長表格僅局部滾動。

方法：Playwright 與真實手機觀察。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-006"></a>
## E2E-006｜繁中／英文／日文 UI 與 URL

關聯：[REQ-006](SPEC.md#req-006)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：三語讀者／同一文章。

前置／fixture：同 content ID 的 zh-Hant/en/ja 發布版本。

步驟：直接開任意語言→快速來回切語→browser back。

預期：不丟失文章；HTML lang與UI一致；瀏覽歷史、focus和地址可預期。

方法：Playwright／router fixtures。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-007"></a>
## E2E-007｜文章翻譯、metadata 與缺譯／過期狀態

關聯：[REQ-007](SPEC.md#req-007)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：作者／譯文審查。

前置／fixture：原文、machine-draft、reviewed、stale 四種 fixtures。

步驟：嘗試發布草稿→審查發布→修改原文hash→切語。

預期：草稿不公開；原文變更標 stale；缺譯有說明、不送回首頁也不偽裝成翻譯。

方法：schema unit＋build＋browser。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-008"></a>
## E2E-008｜清晰 owner、schema 與單一資料來源

關聯：[REQ-008](SPEC.md#req-008)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：建置器／內容 schema。

前置／fixture：重複id、重複slug、不合法日期、未知topic、危險URL fixtures。

步驟：執行內容驗證及 routes生成。

預期：無效內容阻擋建置；有效 manifest一一對應檔案；錯誤位置與原因明確。

方法：unit／schema property tests。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-009"></a>
## E2E-009｜安全且 GitHub 為核心的留言

關聯：[REQ-009](SPEC.md#req-009)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：讀者／文章留言。

前置／fixture：已另行授權建立的測試 discussion；native模式。

步驟：開三語同文→檢查network→點留言→在GitHub做測試回覆。

預期：同一討論串；沒secret／giscus自動請求；發文、刪除測試留言在GitHub原生處理。

方法：Playwright network＋隔離測試repo人工驗收。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-010"></a>
## E2E-010｜只匯入舊 blog 內容

關聯：[REQ-010](SPEC.md#req-010)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：移轉者／五篇原始文章。

前置／fixture：固定來源ref與完整block清單。

步驟：匯入→逐block比較→再次匯入→注入unknown block。

預期：五筆內容完整；重跑無重複；未知block阻擋；不搬其他舊站元件與分類。

方法：parser單元測試＋semantic diff。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-011"></a>
## E2E-011｜兩個來源 repo 回到主帳號

關聯：[REQ-011](SPEC.md#req-011)／[CP-03](CHECKPOINTS.md#cp-03)。

Actor／入口：來源與目標管理員／transfer。

前置／fixture：admin、無同名碰撞、全部refs與平台資源清冊、操作授權。

步驟：比對移轉前清冊→經授權transfer→比對移轉後。

預期：兩個來源仍是獨立repo；主站未被覆寫；必要history/resources保留，權限差異列出。

方法：受控管理操作與read-back核對。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-012"></a>
## E2E-012｜保留論文生成、資料、排程與秘密邊界

關聯：[REQ-012](SPEC.md#req-012)／[CP-03](CHECKPOINTS.md#cp-03)。

Actor／入口：維運者／Nano發布。

前置／fixture：一致性備份、單writer、隔離輸出、授權。

步驟：停新排程→更新配置→dry-run→受控發布→重啟唯一schedule。

預期：REMOTE_URL/PAGES_DOMAIN正確；無舊值覆蓋；daily/weekly/monthly區間與原UTC語意一致。

方法：隔離pipeline fixtures＋實際受控運行。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-013"></a>
## E2E-013｜主站整合研究連結與 metadata

關聯：[REQ-013](SPEC.md#req-013)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：讀者／Research入口。

前置／fixture：已固定ref且schema有效的公開metadata快照。

步驟：三語查看→選日/週/月入口→前往原導讀／論文。

預期：區分原論文和生成導讀；不把JSON當script；卡片語言與來源正確。

方法：schema／URLallowlist＋browser。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-014"></a>
## E2E-014｜舊 URL、既有域名與 SEO 遷移

關聯：[REQ-014](SPEC.md#req-014)／[CP-04](CHECKPOINTS.md#cp-04)。

Actor／入口：舊讀者／書籤。

前置／fixture：來源 URL manifest、bridge、新站已發布、DNS授權。

步驟：開每個/blog/slug與detail路徑→帶anchor重試→未知路徑。

預期：每個已知頁有合理新目的地；未知404有用；靜態bridge不偽稱301；無任意open redirect。

方法：HTTP／Playwright＋DNS/TLS受控檢查。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-015"></a>
## E2E-015｜可重現 CI 與公開產物安全

關聯：[REQ-015](SPEC.md#req-015)／[CP-01](CHECKPOINTS.md#cp-01)。

Actor／入口：PR作者／CI與產物。

前置／fixture：合法和惡意內容fixtures、無secret的PR環境。

步驟：建置→檢查HTML/data/JS/source maps→嘗試script URL／外部MDX。

預期：惡意輸入被拒絕或安全渲染；沒有敏感payload；未受信PR無部署憑證。

方法：unit、workflow審查、artifact／network掃描。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-016"></a>
## E2E-016｜三語搜尋、RSS、sitemap 與語義 metadata

關聯：[REQ-016](SPEC.md#req-016)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：讀者／搜尋與feed。

前置／fixture：三語標題正文、中文斷詞、日文複合詞、Rust/LLM詞fixtures。

步驟：本語言搜尋→快速換語→讀RSS→檢查canonical/hreflang。

預期：索引與語系一致；無草稿／重複頁；字詞查詢可重現，metadata對應實際頁面。

方法：Pagefindfixture＋XML/HTML checks＋browser。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-017"></a>
## E2E-017｜搬遷可回復與備份不遺失

關聯：[REQ-017](SPEC.md#req-017)／[CP-03](CHECKPOINTS.md#cp-03)。

Actor／入口：維運者／回復實驗。

前置／fixture：隔離DBbackup與對應source/public/domain配置。

步驟：還原到隔離位置→驗證資料→模擬新發布失敗→關新writer→回復。

預期：還原可讀且hash／筆數一致；不啟用雙writer；未覆蓋真實最新資料；損失範圍明示。

方法：隔離restore drill，禁止用正式資料庫作破壞測試。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-018"></a>
## E2E-018｜原作者、日期與研究來源可追溯

關聯：[REQ-018](SPEC.md#req-018)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：編輯／来源metadata。

前置／fixture：五篇原文與譯文、研究metadata。

步驟：比對日期／署名／引用／內容checksum→檢視編輯修訂。

預期：原署名與日期保留；技術修訂獨立記錄；AI生成／人工審閱標記不誤導。

方法：semantic diff＋編輯人工審查。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-019"></a>
## E2E-019｜載入、空白、錯誤與資料過期狀態

關聯：[REQ-019](SPEC.md#req-019)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：讀者／失敗恢復。

前置／fixture：無快照、舊快照、下載失敗、空搜尋、快速點擊fixture。

步驟：阻斷來源→載入頁→retry→切語→關閉overlay。

預期：文章仍可讀；保留last-good；真實updatedAt；無focus丟失／無限spinner／假資料。

方法：網路故障注入＋Playwright。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-020"></a>
## E2E-020｜長期寫作與發布審查流程

關聯：[REQ-020](SPEC.md#req-020)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：作者／一次完整發布。

前置／fixture：未發布Markdown與翻譯草稿、獨立測試branch。

步驟：新增原文→翻譯→審查→CI→受控部署同一artifact。

預期：不能略過檢查；上線內容與reviewed commit一致；草稿／秘密不進產物。

方法：測試repo端到端PR與deploy驗收。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-021"></a>
## E2E-021｜個人介紹與專案案例有可信證據

關聯：[REQ-021](SPEC.md#req-021)／[CP-02](CHECKPOINTS.md#cp-02)。

Actor／入口：讀者／About與專案。

前置／fixture：經核對resume來源與三語案例。

步驟：比較經歷／日期／成果與來源→閱讀三語→開repo證據。

預期：無捏造技能熟練度或成效；網頁用React不改寫過往工作技術；聯絡入口可用。

方法：編輯核對＋連結驗證。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。

<a id="e2e-022"></a>
## E2E-022｜本次為深度規劃，不越權實作或移轉

關聯：[REQ-022](SPEC.md#req-022)／[CP-00](CHECKPOINTS.md#cp-00)。

Actor／入口：規劃接收者／文件包。

前置／fixture：九份Markdown與可讀工具操作紀錄。

步驟：檢查完整原需求→追蹤REQ/TODO/E2E→檢視未驗證声明。

預期：無孤立需求或broken anchors；未把計畫當部署；無私有原文／secret多餘公開。

方法：文件腳本＋人工審核；不是產品測試。清理：遵循共同清理規則；實際執行前列出將建立的隔離資源。

狀態：not run。證據：尚無產品執行紀錄。
