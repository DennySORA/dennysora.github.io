## 工程原則

### 理解抽象層之下的機制

抽象層很好用，但真正的除錯與最佳化，仍需要理解 abstraction 底下實際發生的事情。

```text
LLM API
  ↓
Inference Runtime
  ↓
KV Cache
  ↓
Attention / GEMM
  ↓
Memory / Precision
  ↓
GPU
```

### 部署是模型設計的一部分

架構決策直接影響記憶體、延遲、吞吐量與部署限制。

```text
Architecture
    │
    ├── memory
    ├── compute
    ├── KV cache
    ├── quantization
    └── serving
```

### 先量測，再最佳化

最佳化應從可觀測的瓶頸開始，而不是假設。

```text
latency
throughput
memory
GPU utilization
cost
failure rate
```

### 資安是架構性的

資安應內建於系統設計，而不是最後才補上的中介層。

```text
Security
├── identity
├── authorization
├── isolation
├── policy
├── data handling
└── observability
```

### 明確化取捨

很少有放諸四海皆準的最佳架構，重點是知道自己為哪些限制在最佳化。

```text
performance
    ↕
cost
    ↕
complexity
    ↕
reliability
    ↕
maintainability
```

## 工作方式

```text
$ dennysora --working-style

research_first       true
prototype_fast       true
benchmark_driven     true
production_aware     true
security_conscious   true

預設迴圈：

理解 → 實作 → 量測 → 精煉 → 重複
```
