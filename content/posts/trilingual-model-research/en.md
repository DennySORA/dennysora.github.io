## Selected R&D

ACTIVE RESEARCH

### TriLingual Language Model from Scratch

Chinese / English / Japanese · Decoder-only Transformer · SentencePiece · FP8 deployment research

An experimental decoder-only language model trained from scratch for Chinese, English and Japanese. The project is used to study the complete language-model stack: tokenization, Transformer architecture, pre-training, post-training, quantization and efficient inference.

```text
$ model.inspect
# experimental architecture snapshot
type          decoder-only dense transformer
languages     zh / en / ja

hidden_size   1280
heads         16
kv_heads      16

position      RoPE + NoPE (hybrid layout)
activation    SwiGLU + GEGLU (experimental hybrid)
normalization RMSNorm
tokenizer     SentencePiece Unigram
```

Attention Research

- MHA / GQA / MQA trade-offs

- experimental latent-attention design

- KV-cache implications

- memory / throughput trade-offs

```text
# historical experiment snapshot
# values represent one experimental run,
# not the latest model checkpoint
step           1,597
tokens         418,541,760
validation     4.6082 loss
ppl            100.31
throughput     4,021 tokens/sec
grad_norm      0.93
```

Deployment Research

```text
BF16 training
      │
      ↓
     PTQ
      │
      ↓
 FP8 inference
      │
 ┌────┴──────────┐
 ↓               ↓
vLLM       TensorRT-LLM
```

E4M3 · PTQ · KV precision
TensorRT-LLM · vLLM
VRAM optimization
throughput optimization

RESEARCH CONCEPT

### Adaptive & Growing Transformer

Exploring whether a Transformer can adapt its model capacity and computational depth rather than relying on a fixed layer stack. Topics include parameter growth, structured pruning, sequence-level layer routing, variable depth and routing constraints for preventing pathological loops.

```text
traditional
L1 → L2 → L3 → L4 → L5 → OUT

adaptive routing (concept)
        ┌─────────┐
        ↓         │
L1 → L3 → L1 → L6 → OUT
     │
     └────→ L5 ─────→
```

Research Questions

- How should routes be selected?

- How can loops be prevented?

- How should computation be penalized?

- How can capacity grow safely?

- When should layers be pruned?

Model Growth

```text
small model
    ↓
capacity expansion
    ↓
continued training
    ↓
larger model
```

Research target: progressively grow toward multi-billion parameters.

IN DEVELOPMENT

### Japanese Pronunciation & Prosody Evaluation

Evaluate Japanese speech beyond transcription accuracy — pronunciation correctness, phoneme / mora accuracy, pitch accent, intonation, fluency and rhythm.

```text
Microphone / Audio
        │
        ↓
 Speech Encoder
        │
        ↓
Forced / Learned Alignment
        │
        ├───────────────┐
        ↓               ↓
Phoneme / Mora        F0 / Pitch
Accuracy              Contour
        │               │
        └───────┬───────┘
                ↓
        Fluency / Rhythm
                │
                ↓
          Scoring Model
                │
                ↓
        Learner Feedback
```

Planned Stack

- Frontend: Nuxt 4 + Tailwind CSS 4

- Backend: Python · Storage: SQLite

- ML: PyTorch / speech models

## Currently Exploring

LLM Architecture

efficient attention
adaptive computation
dynamic depth
parameter growth
structured pruning

Efficient Inference

FP8 · MXFP8 · NVFP4
KV-cache optimization
TensorRT-LLM
serving efficiency

Interpretability

Sparse Autoencoders
activation analysis
circuits
activation patching

Post-training

preference optimization
DPO · GRPO
PPO / TRPO family
reward design

Speech AI

Japanese phoneme / mora evaluation
pitch accent
prosody modeling
fluency evaluation
