## 生產實績

### Agent 編排平台

生產環境

```text
Google ADK
     ↓
   A2A
     ↓
LangGraph
     ↓
CopilotKit
```

- 遠端 Agent 協調

- 工具使用 · 狀態追蹤

- 重試／故障處理

- SSE 串流 · Human-in-the-Loop

- 動態 Agent 載入

- 零停機設定上線

- 跨團隊採用

→ [ADK-AGUI Middleware (GitHub)](https://github.com/trendmicro/adk-agui-middleware)

### 雲端基礎設施最佳化

生產環境

```text
EKS
├── ARM monitoring nodes
├── CPU optimized pools
├── memory optimized pools
├── Helm modules
└── CNI / networking fixes
```

- 成本／效能／可靠性／可維護性

- 多租戶叢集穩定性

### AI 資安與資料保護

生產環境

- PII 管線（AWS Comprehend）— 成本降低約 99%

- 政策強制

- AI proxy · Bedrock 整合

- 存取控制

- 租戶隔離

- 可稽核性

### 平台工程

生產環境

```text
Plugin 基礎 API 平台

Core
 │
 ├── lifecycle hooks
 ├── authentication
 ├── rate limiting
 └── integration plugins
```

- 可重用／可擴充／跨團隊／面向生產
