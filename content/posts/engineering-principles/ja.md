## エンジニアリング原則

### 抽象化の下にある仕組みを理解する

抽象化は便利だが、デバッグと最適化にはその下にある仕組みの理解が必要。

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

### デプロイはモデル設計の一部

アーキテクチャの判断はメモリ・レイテンシ・スループット・デプロイの制約に直結する。

```text
Architecture
    │
    ├── memory
    ├── compute
    ├── KV cache
    ├── quantization
    └── serving
```

### 最適化の前に計測する

最適化は思い込みではなく、観測可能なボトルネックから始めるべき。

```text
latency
throughput
memory
GPU utilization
cost
failure rate
```

### セキュリティはアーキテクチャの一部

セキュリティは後付けのミドルウェアではなく、システム設計の一部であるべき。

```text
Security
├── identity
├── authorization
├── isolation
├── policy
├── data handling
└── observability
```

### トレードオフを明確にする

普遍的に最良のアーキテクチャは稀。重要なのは、どの制約に対して最適化しているかを知ること。

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

## 仕事の進め方

```text
$ dennysora --working-style

research_first       true
prototype_fast       true
benchmark_driven     true
production_aware     true
security_conscious   true

デフォルトループ：

理解 → 実装 → 計測 → 改善 → 繰り返し
```
