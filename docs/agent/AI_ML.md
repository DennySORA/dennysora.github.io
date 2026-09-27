# AI and Machine-Learning Workloads

Load this playbook for model training or fine-tuning, dataset or tokenizer work,
checkpoint/resume behavior, evaluation, precision or quantization, GPU/CUDA or
distributed execution, model conversion, or artifact release. Apply only the
sections activated by the affected boundary and risk. An internal refactor does
not require a training run merely because it lives in an ML repository.

## 1. Experiment boundary and identity

Before editing or executing, identify the owning project, authoritative config,
model/tokenizer and data sources, artifact destination, expected hardware, cost
and duration, and whether the result is exploratory, compared, resumable, or
released. Existing repository conventions remain authoritative.

For a result that will be compared, resumed, or retained, capture:

- source revision and relevant dirty-tree state;
- resolved config or canonical config hash, including overrides;
- dependency/runtime environment and actually observed accelerator;
- random seeds and the libraries/processes to which they apply; and
- immutable dataset, tokenizer, base-model, and checkpoint identities.

Declare whether the target is bitwise determinism or statistical
reproducibility. Record known nondeterminism and tolerance instead of claiming
more than the framework, kernel, and hardware proved. Keep credentials, private
samples, and secret-bearing launch configuration out of experiment metadata.

## 2. Data provenance and split integrity

When data is introduced, transformed, relabeled, or redistributed, retain a
manifest with its source, license/terms, permitted use and redistribution,
immutable snapshot/version/hash, and transformation lineage. Synthetic data also
records the generator/model revision and material settings when disclosure is
permitted.

Validate relevant schema, encoding, counts, required fields, corrupt records,
duplicates, labels, and distribution changes without exposing sensitive
examples. Treat train/validation/test separation as a contract:

- preserve the split method and seed or immutable split manifest;
- prevent relevant near-duplicates, entities, documents, speakers,
  conversations, or future time periods from crossing splits;
- check contamination at the domain's semantic unit, not only exact rows; and
- exclude benchmark/evaluation data from training and tuning unless the run
  explicitly measures the contaminated condition.

Unresolved provenance, license, privacy, or contamination is a release blocker
and an explicit limitation on internal results, not a fact to infer away.

## 3. Model, tokenizer, and configuration compatibility

Treat weights, model config, tokenizer/processor assets, special-token maps, and
generation config as one versioned contract when the runtime consumes them
together. For tokenizer/vocabulary changes, compare normalization,
pre-tokenization, vocabulary ordering/size, special tokens and IDs, padding and
truncation, and embedding/output-head dimensions.

Never silently reassign a token ID, resize embeddings, discard weights, or swap
in a similarly named tokenizer. An intentional incompatibility needs an
explicit conversion, tests, and new artifact identity. Use the strictest load
behavior the intended format supports; review missing, unexpected, renamed,
reshaped, and newly initialized parameters. Add small encode/decode and
load/inference fixtures when compatibility could otherwise fail only after an
expensive run.

## 4. Training and numerical safety

For a new or materially changed training path, make the resolved effective
batch, micro-batch/accumulation, optimizer, scheduler, learning-rate/warmup,
clipping, precision, and evaluation/stopping cadence inspectable. Record
automatic OOM or recovery changes rather than silently changing the experiment.

Detect and handle non-finite losses, gradients, weights, and metrics. Monitor
the risk-relevant signals, such as loss continuity, gradient norm,
overflow/scale, learning rate, memory, throughput, and skipped steps. A
precision-sensitive change must exercise its actual forward, backward,
optimizer, and reduction path; importing a model does not validate BF16, FP8,
mixed precision, or a custom kernel.

Use a bounded smoke or small overfit run when it can catch broken data flow,
labels, optimization, or numerics before expensive execution. Do not launch a
long, distributed, externally billed, or otherwise costly run without user
authorization. Follow [`PROCESS_EXECUTION.md`](PROCESS_EXECUTION.md) for
timeouts, cancellation, child cleanup, and mutation safety.

## 5. Checkpoint completeness and resume equivalence

Activate this gate when interruption recovery matters, checkpoint format
changes, training is expensive, or a resume claim will be made. Save every state
element the actual trainer needs, as applicable:

- weights, optimizer, scheduler, scaler, counters, and resolved config;
- CPU/accelerator RNG state for every participating process;
- sampler/dataloader position or another deterministic data cursor;
- dataset, tokenizer, base-model, and prior-checkpoint identities; and
- distributed topology, sharding, and reconstruction metadata.

Write to private staging, validate completeness, then publish atomically or with
a completion marker. Never replace the last known-good checkpoint with a
partial save. Coordinate ranks so shards cannot mix steps or report completion
before every required part is durable.

Test that a checkpoint loads. For changed resume behavior, compare a bounded
uninterrupted run with an interrupted-and-resumed run from the same state, using
exact equality where promised or a justified tolerance. Deserialization alone
does not prove equivalence. Do not infer compatibility across world size,
device, precision, optimizer, tokenizer, or framework versions.

## 6. Evaluation and regression decisions

Fix the evaluation contract before using it for acceptance: dataset snapshot
and split, preprocessing/tokenizer, prompt/template, generation or decoding
settings, seed policy, metric implementation, and baseline artifact. Compare
candidate and baseline under the same material conditions.

Use multiple seeds, confidence estimates, or another variance measure when
random variation could change the decision. Set acceptance criteria before
selecting a favorable result. Report absolute score, baseline delta, variance,
sample size, and contamination/domain limits; do not hide failed runs.
Evaluation-code changes need known-outcome fixtures. Human evaluation records
its rubric, sampling, relevant blinding/randomization, and adjudication instead
of presenting impressions as an automatic metric.

## 7. Conversion, quantization, and release artifacts

A converted, quantized, or distributable artifact has a manifest binding its
source to weights, config, tokenizer/processor, conversion settings, intended
runtime, and checksums. Validate it through a clean load path representative of
the consumer, not only the converter.

Quantization evidence records the method, applicable weight/activation/KV
precision, calibration-data identity, material runtime settings, and
fallback/unsupported operators. Measure quality delta against the unquantized
baseline. Claim memory, latency, or throughput gains only under the same
declared hardware, runtime, batch/concurrency, warmup, and measurement method;
file size alone proves none of them.

Before release, verify checksums, required files, strict load behavior,
representative finite inference, output schema, license/provenance, and
configured model-card metadata. Validation does not authorize upload, registry
mutation, or publication of data or weights.

## 8. GPU, CUDA, and distributed evidence

Hardware-sensitive results record the observed device and material
architecture/capability, driver/runtime stack, framework/kernel/backend,
precision, visible-device mapping, and memory or power constraint. A config or
compatibility table is not evidence that this machine executed the path.

Distributed changes make rank/world-size ownership, rendezvous/timeout, data
sharding/seeding, reduction, checkpoint coordination, and partial failure
explicit. One failed rank must not leave peers hanging, publish incomplete
success, or leak children. Single-process checks cannot prove multi-rank
correctness, communication performance, or cross-node recovery.

Do not claim an unexecuted GPU architecture, runtime, topology, world size,
precision, or backend. When required hardware is unavailable, report its gate as
blocked or not run; CPU/single-device checks cover only the paths they exercised.

## 9. Risk-driven validation and reporting

Combine [`QUALITY_GATES.md`](QUALITY_GATES.md) with only the activated rows:

| Boundary | Required evidence |
|---|---|
| Data/split | Provenance manifest, schema/count checks, relevant leakage/contamination checks |
| Model/tokenizer | Compatibility diff, encode/decode fixture, strict representative load |
| Training/numerics | Bounded smoke/overfit run and finite-value/precision-path evidence |
| Checkpoint/resume | Completeness/load check and bounded uninterrupted/resumed comparison |
| Evaluation/metric | Known-outcome metric tests and fixed-protocol baseline comparison |
| Conversion/quantization | Clean-runtime load/inference, checksums, measured quality delta |
| Performance | Repeated same-environment measurement with variance |
| Distributed | Representative multi-rank run and controlled failure/cancellation evidence |
| Release artifact | Consumer load, artifact/provenance review, authorized publication gate |

Classify each relevant gate as passed, failed, blocked, not run, or not
applicable. Report artifact/config identities, environment, executed commands,
metrics/tolerances, and residual risk without secrets or private data. Never
infer reproducibility, resume equivalence, numerical stability, hardware or
distributed support, performance, compatibility, or release readiness from a
check that did not exercise that property.
