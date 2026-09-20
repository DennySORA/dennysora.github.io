## 技能

AI 與 LLM 工程

Transformer 架構
量化（FP8 · INT4 · W/A/KV）
vLLM · TensorRT-LLM
後訓練（SFT · DPO · GRPO）
可解釋性（SAE · SVD）

程式語言

Go (Gin)
Python (FastAPI · Asyncio)
Rust

雲端與基礎設施

AWS
Kubernetes (EKS)
Helm
Terraform

資料與訊息佇列

Apache Kafka
PostgreSQL
Redis

DevOps 與可觀測性

GitHub Actions
GitLab CI
OpenTelemetry
Prometheus
Grafana
Loki
Tempo

網頁與 API

Vue.js (Nuxt 4)
Tailwind CSS 4
RESTful API

## 經歷

### v4.0.0 日語留學 東京日本語學校（長沼スクール） 2026.04 – 至今 在學中

學習

- 於東京進行全日制日語學習。

### v3.0.0 資深雲端工程師 趨勢科技 TrendMicro 2022.07 – 2026.04

編排

### Companion-Orchestrator Agent Center

- 在 Google ADK 上設計並交付 Agent 編排平台，具備清晰的應用架構與模組邊界。

- 實作 Agent-to-Agent（A2A）通訊，協調遠端 Agent。

- 打造具備工具呼叫、狀態追蹤、重試與錯誤處理的 LLM Agent。

- 交付用於情境測試與提示詞／工具除錯的 Web Playground；前端以 AI 輔助工作流程獨立開發。

- 建立 CopilotKit adapter，並組合多步驟 LangGraph 流程。

- 透過資料庫驅動的設定實現動態 Agent 載入，支援零停機上線。

- 撰寫 ADK ↔ AGUI Middleware（Python 3.13+），提供 SSE 串流與 Human-in-the-Loop 工作流程，並與編排器整合。

- 達成端到端 pipeline（A2A → ADK → LangGraph → CopilotKit），並獲跨組織的其他團隊採用。

→ [ADK-AGUI Middleware (GitHub)](https://github.com/trendmicro/adk-agui-middleware)

平台

### 平台開發與 API 管理

- 打造以 plugin 為基礎的 API 平台，讓團隊不需修改核心即可交付整合功能；提供生命週期 hooks、驗證與流量限制。

- 開發 Collector Manager，支援可設定的日誌路由、背壓與重試控制。

- 建立 Mini-Companion 系統，以 GitHub 同步支援宣告式工作流程。

- 實作 Companion Proxy，強制執行 PII 遮蔽與基於政策的請求過濾。

基礎設施

### 雲端基礎設施最佳化

- 重新架構 EKS node groups：將監控移至 ARM 節點以節省成本，並導入專用的 CPU／記憶體最佳化資源池。

- 解決 Stream Lake 環境中的 Kubernetes 相容性缺陷。

- 撰寫模組化 Helm charts，標準化各服務的部署。

- 修復 CNI IP 耗盡與路由問題，穩定多租戶叢集。

AI 與資安

### AI 整合與資料安全

- 打造 AWS Comprehend PII 管線，成本降低約 99%，同時維持偵測品質。

- 建立 AI Proxy Adapter，整合 Amazon Bedrock 並執行政策管控。

- 開發 Kafka → Neptune 管線，建置符合 MITRE 框架的知識圖譜。

- 實作細緻的 AI 存取控制，具備可稽核性與租戶隔離。

領導

### 技術領導

- 為 CEO 的 NVIDIA 簡報製作高階主管層級 AI 展示。

- 主辦 AI 工具與最佳實踐的內部工作坊。

- 獲頒本季最佳員工（Employee of the Quarter）。

- 透過可重複使用的平台元件，推動跨部門賦能。

### v2.0.0 後端工程師 KKStream 2021.06 – 2022.07

DevOps

### DevOps 與基礎設施

- 最佳化 GitLab CI/CD 管線，部署時間縮短 40%。

- 使用 Helm 部署 Kubernetes 叢集。

- 以 Terraform 實作基礎設施即程式碼。

- 使用 Kops 管理 Kubernetes 叢集。

架構

### 系統架構與開發

- 設計以 Kafka 為基礎的 consumer 服務架構。

- 建立 Docker Compose 開發環境。

- 整合多個後端服務與資料庫。

- 以 Golang 開發低延遲串流伺服器。

研究

### 研究與實作

- 評估 WebRTC Mesh 與 SFU 技術。

- 整合 Pydantic，強化資料驗證。

- 重構單體專案以提升可維護性。

- 實作 CI/CD 管線測試整合。

### v1.0.0 後端工程師 （實習） 天堂遊戲有限公司 2019.01 – 2019.07

API

### API 開發與最佳化

- 使用 Golang PProf 最佳化 RESTful API。

- API 回應時間縮短 30%。

- 重構程式碼以改善模組化。

研究

### 研究與評估

- 實作 Apache Spark 資料處理。

- 展示 GraphQL API 能力。

- 評估新興技術的導入可行性。

## 學歷

東京日本語學校（長沼スクール）

2026.04 – 至今 · 日本留學

台北科技大學 National Taipei University of Technology

2016 – 2020 · 電子工程系

## 技術深度

### LLM 架構

核心

- Transformer 架構

- Decoder-only 語言模型

注意力機制

- MHA · GQA · MQA

- latent-attention 變體

位置編碼

- RoPE · NoPE

- 混合式位置設計

前饋層

- SwiGLU · GEGLU

正規化

- RMSNorm

殘差設計

- 標準殘差路徑

- 實驗性 attention-residual 變體

分詞器

- SentencePiece · Unigram

### 訓練與後訓練

預訓練

- token／資料管線

- 最佳化器

- 學習率排程

- 檢查點機制

- 驗證 loss／困惑度

- 吞吐量監控

後訓練・已實作

- SFT · DPO · GRPO

研究／比較過

- PPO · TRPO · DAPO

### 推論與量化

精度

- FP16 · BF16 · FP8 · INT8 · INT4

量化概念

- W／A／KV 精度

- PTQ · E4M3

- W8A16KV8 型配置

執行環境／服務

- vLLM · TensorRT-LLM · Ollama

效能

- KV cache

- 批次處理

- 上下文長度

- VRAM 估算

- 吞吐量／每秒 tokens

探索中

- MXFP8 · NVFP4

### 模型可解釋性

學習中

- 稀疏自動編碼器（SAE）

- SVD

- 激活分析

- 激活修補

- 電路層級解釋概念

### 代理式 AI

生產環境

- Google ADK

- Agent-to-Agent（A2A）

- LangGraph · CopilotKit

- AG-UI 整合

- 工具執行

- 狀態管理

- Human-in-the-Loop

- 串流（SSE）

- 重試與錯誤處理

- 動態 Agent 設定

### 後端與分散式系統

語言

- Go · Python · Rust

後端

- REST · FastAPI · Gin · Asyncio

分散式系統

- Kafka · Redis · PostgreSQL

- 事件驅動系統

- 非同步處理

設計

- 模組化架構

- plugin 架構

- 微服務

- 低延遲系統

### 雲端與平台

基礎設施

- AWS · Kubernetes / EKS

- Terraform · Helm

CI/CD

- GitHub Actions · GitLab CI

可觀測性

- OpenTelemetry · Prometheus · Grafana · Loki · Tempo

生產經驗

- EKS node-group 架構設計

- ARM 遷移

- CPU／記憶體最佳化資源池

- CNI 問題排解

- 多租戶叢集穩定性

- 可重複使用的 Helm 模組

### 資安

- PII 保護與遮蔽

- 政策強制

- 租戶隔離

- 存取控制

- 可稽核性

- 資安架構

## 工程之外

日語

目前在東京的東京日本語學校（長沼スクール）學習日語。

鋼琴

以鋼琴為長期興趣，目前著重視譜、和聲與流暢的讀譜能力。

水肺潛水

對日本各地特色潛點感興趣，特別喜歡沉船、大型海洋生物與具有在地特色的水下環境。

## 開源專案

### [dgxtop](https://github.com/DennySORA/dgxtop)

NVIDIA DGX 系統的高效能互動式監控器——在漂亮的 TUI 中呈現 GPU、CPU、記憶體、磁碟與網路狀態。

Rust ★ 69 github.com/DennySORA/dgxtop

### [DLsite-Classification-Manager](https://github.com/DennySORA/DLsite-Classification-Manager)

高效率非同步 DLsite 作品分類與管理工具：現代網頁介面、自動 metadata 爬取與智慧搜尋。

Python ★ 36 github.com/DennySORA/DLsite-Classification-Manager

### [Chinese_Convert](https://github.com/DennySORA/Chinese_Convert)

批次轉換多檔案、多類型的簡體與繁體中文。

★ 14 github.com/DennySORA/Chinese_Convert

### [Ops-Tools](https://github.com/DennySORA/Ops-Tools)

DevOps CLI 工具箱：Terraform／Terragrunt 輔助、AI 工具、MCP server、資安掃描與 clean-code 自動化。

Rust ★ 9 github.com/DennySORA/Ops-Tools

### [Image-Tools](https://github.com/DennySORA/Image-Tools)

互動式批次去背工具，支援綠幕與多種去背選項。

Python ★ 1 github.com/DennySORA/Image-Tools

### [Auto-Video-Organize](https://github.com/DennySORA/Auto-Video-Organize)

極速 CLI 影片整理工具：批次 HEVC 編碼、檔案去重、縮圖總覽與智慧排序。

Rust github.com/DennySORA/Auto-Video-Organize

### [httpulse](https://github.com/DennySORA/httpulse)

即時 HTTP 延遲與網路品質監控的互動式 TUI——DNS、TLS、TTFB、RTT、抖動等指標。

Rust github.com/DennySORA/httpulse

## 社群

### 硬核 AI 交流社 — Facebook 社團管理員

社團管理員，負責 AI 論文交流與討論。

[facebook.com/groups/915613384421068](https://www.facebook.com/groups/915613384421068)

### AI 論文日報 — paper.dennysora.me

- 每日收集 arXiv（11 個分類＋關鍵字查詢）、Hugging Face Daily Papers 與 AI 部落格論文。

- 以 LLM 評分排序，精選論文翻譯為台灣繁體中文。

- 自動發布日報／週報／月報至 GitHub Pages。

[paper.dennysora.me](https://paper.dennysora.me)

## 技術筆記

[無趣的密碼學，有趣的加密！](https://ithelp.ithome.com.tw/users/20130205/ironman/3517)
ithelp.ithome.com.tw

[WebRTC 介紹](https://docs.google.com/presentation/d/1nrHkMwLe7SLEI3aPvYRaDyRPn18H2lghtUKnmVrkoWU)
Google Slides
