## Engineering Principles

### Understand the Abstraction Below

Abstractions are useful, but debugging and optimization require understanding the mechanism underneath them.

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

### Deployment Is Part of Model Design

Architecture decisions affect memory, latency, throughput and deployment constraints.

```text
Architecture
    │
    ├── memory
    ├── compute
    ├── KV cache
    ├── quantization
    └── serving
```

### Measure Before Optimizing

Optimization should start from observable bottlenecks, not assumptions.

```text
latency
throughput
memory
GPU utilization
cost
failure rate
```

### Security Is Architectural

Security should be part of system design rather than a middleware added at the end.

```text
Security
├── identity
├── authorization
├── isolation
├── policy
├── data handling
└── observability
```

### Make Trade-offs Explicit

There is rarely a universally best architecture. The important part is knowing which constraints a design is optimizing for.

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

## How I Work

```text
$ dennysora --working-style

research_first       true
prototype_fast       true
benchmark_driven     true
production_aware     true
security_conscious   true

default_loop:

understand → implement → measure → refine → repeat
```
