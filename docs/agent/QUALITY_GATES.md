# Quality Gates

Load this playbook for every non-trivial implementation, dependency or tooling
change, public-interface or schema change, security- or release-sensitive task,
or requested commit. Validation follows the affected owner and actual risk; it
does not assume the repository is Rust, Python, or Nuxt.

## 1. Build the gate from evidence

Before running a check, inspect the affected owner's nearest instructions,
manifest, lockfile, scripts, workflows, test configuration, and changed files.
Prefer, in order:

1. a repository-owned verification or CI script;
2. the owning manifest's declared script or task;
3. an already-configured tool invoked through the owner's package/environment
   manager;
4. the representative greenfield commands below, but only for a project created
   under this prompt.

Do not invent commands, install global tools, switch package managers, create a
lockfile, broaden feature combinations, or rewrite configuration merely to make
a familiar checklist runnable. Start with the narrowest useful check, then
expand according to blast radius. Run every command from its owning project
root.

## 2. Select the quality profile from evidence

A quality profile changes the emphasis and depth of evidence; it does not select
the product type, replace an owning project's commands, or waive a configured
gate. Select it from the user's explicit request, the applicable repository
profile or scoped instructions, and repository-owned CI or release policy, in
that order. Existing commands, thresholds, and workflows remain authoritative
under every profile. Never infer a lower profile merely because a gate is slow,
inconvenient, or currently failing.

When no profile is evidenced for greenfield work, use `product` for durable
applications, services, libraries, and tools. Use `experiment` only when the
user or repository identifies the work as exploratory research or a disposable
prototype. Use `release` for external publication, an installer, deployment,
an externally distributed model/package artifact, or an explicitly
release-bound change. Resolve a materially ambiguous selection before
scaffolding configuration or weakening a default gate.

| Profile | Required emphasis |
|---|---|
| `experiment` | Preserve reproducibility and the fastest meaningful feedback loop: formatter and static checks for durable code, focused tests or smoke tests, deterministic configuration and seeds when applicable, numerical/data checks, and checkpoint/resume or baseline evidence when the experiment has those risks. |
| `product` | Apply the owning stack's strict static-analysis baseline, focused and broader tests, durable-behavior coverage, contract and integration checks, and the risk-specific rows below. This is the greenfield default. |
| `release` | Apply all `product` evidence plus every configured release/platform matrix, migration or upgrade check, artifact reproducibility and integrity check, audit/license gate, packaging/load test, and publication dry run applicable to the deliverable. |

`experiment` is not an escape hatch for unsafe, untyped, or untested production
paths. It may replace low-value blanket line-coverage work with stronger
experiment evidence, but it cannot bypass repository-owned gates, secret and
mutation safety, public contracts, data-loss checks, or tests for code that is
already used as a durable product dependency. An unavailable required
`release` result is blocked, not an inferred pass.

## 3. Minimum validation by change

For each affected owner, select all applicable rows:

| Change | Required evidence |
|---|---|
| Documentation or prompt only | Diff review, formatting/Markdown check if configured, relative-link/path validation, stale-name search, `git diff --check` |
| Source or behavior | Formatter check, lint/static analysis, type check, focused tests, then the owner's broader test suite |
| Bug fix | A deterministic regression test that fails on the defect when practical, followed by the relevant broader gates |
| Dependency or toolchain | Current official documentation, manifest/lock consistency, lockfile diff review, configured build/tests, and configured audit/license checks |
| Public API or generated contract | Producer tests, regeneration from its source, clean generated diff, consumer type/tests, and compatibility review |
| Database schema | Migration upgrade test against an isolated database, persisted-data behavior, query/invariant tests, and rollback/backup implications |
| UI or interaction | Frontend static gates, production build, changed-state tests, and real Chromium desktop inspection at the required viewports |
| CLI, TUI, or terminal output contract | Owning static gates and tests for TTY/non-TTY behavior, `stdout`/`stderr` separation, exit codes, cancellation, ANSI-disabled output, Unicode display width, and terminal-state restoration where applicable |
| Subprocess, installer, or host mutation | Normal gates plus timeout, cancellation, failure ordering, partial-output, and rollback tests using fakes or temporary roots |
| Release-sensitive | All configured release build/package checks and exact artifact evidence; never infer an unexecuted platform result |

Changed behavior needs proportionate coverage of the primary success path,
critical failures, and relevant edge conditions. Unit tests must not contact real
remote services or mutate real user/global state. Use fakes, fixtures, temporary
directories, and temporary SQLite databases. Never run real package-manager,
publish, reboot, cleanup, or privileged host mutations in tests.

## 4. Representative greenfield commands

These commands define projects scaffolded under `STACKS.md`; they are not
fallback commands for an unrelated existing repository.

### Python owner

```bash
uv sync --locked
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
```

Run `uv run pyright` when Pyright is part of the owning project's checked tool
configuration. Run Bandit or another security scanner only when the repository
declares it; Ruff `S` findings are already part of the baseline lint gate. Adapt
`src` and `tests` only to the actual owner paths. A coverage threshold miss is a
failed test gate, not a warning to hide.

For a new scaffold, also inspect the resolved configuration and confirm that
`requires-python`, Ruff, mypy, configured Pyright, the uv lock, and CI target
compatible Python versions. Do not call the Python gate passed while one tool is
silently checking a different language level.

### Rust owner

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo test --workspace --all-targets --all-features --locked
cargo check --workspace --all-targets --all-features --locked
```

Use an existing project's documented feature matrix when all features are
intentionally incompatible. Use `--locked` only with its authoritative committed
lockfile. Do not claim Miri, sanitizer, coverage, benchmark, cross-compilation,
or target-platform success unless that exact configured gate ran.

For a new scaffold, confirm that Cargo edition, `rust-version`, the pinned
toolchain, workspace resolver, and CI agree before calling the toolchain gate
passed.

### Nuxt/TypeScript/Tailwind owner

A greenfield owner exposes repository scripts for prepare, formatting
verification, lint, type checking, unit tests, production build, and optional
browser tests. Run them through the locked package manager:

```bash
pnpm install --frozen-lockfile
pnpm run prepare
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Run `pnpm run test:e2e` when the changed behavior has a configured browser suite.
Do not invent `lint`, `test`, or `test:e2e` in an existing package: inspect its
scripts and CI, then report a missing gate if no equivalent exists. Tailwind CSS
is validated through the owning frontend's lint/build/browser path unless a
repository-specific style check exists.

## 5. Desktop browser gate

For new UI, a material redesign, or changed layout/interaction behavior, code
inspection and a successful build are insufficient. The three sizes below are
mandatory for the `local-single-user-desktop` profile. An existing owner with a
broader configured viewport matrix retains that matrix in addition to these
desktop checks.

1. Start the application with its documented local command and verified
   loopback binding.
2. Use Playwright's Chromium workflow for repeatable navigation and screenshots;
   use Chrome DevTools for live DOM, console, network, rendering, memory, or
   performance diagnosis when applicable.
3. Inspect `1280x800`, `1440x900`, and `1920x1080`. At every inspected size,
   check horizontal overflow, clipping, overlap, alignment, text readability,
   focus visibility, component sizing, and unexpected layout shift.
4. Exercise every changed state that exists: default, hover, focus-visible,
   active, disabled, loading/submitting, success, failure, retry, empty, and long
   content. Verify that async primary actions prevent duplicate submission and
   retain stable geometry.
5. Inspect console errors, failed requests, and relevant network payloads without
   exposing credentials. Fix observed defects and repeat the affected capture.

Do not substitute phone/tablet emulation for these desktop acceptance sizes.
List only screenshots and states actually inspected; an automated capture that
was never examined is not a visual pass.

## 6. Results and failure handling

Classify every relevant gate independently:

- **passed** — the exact command or manual check completed successfully and its
  evidence was inspected;
- **failed** — it ran and produced a defect, threshold miss, or unexpected diff;
- **blocked** — it was required but a concrete external condition prevented it;
- **not run** — it was relevant but intentionally omitted, with the reason and
  residual risk stated;
- **not applicable** — the affected owner or change does not activate the gate.

Do not relabel pre-existing failures as passes. Determine whether a failure is
introduced, exposed, or unrelated to the change; fix in-scope defects and report
unrelated blockers without rewriting user work. Never hide warnings, loosen a
threshold, delete a test, accept a snapshot blindly, or disable a rule solely to
obtain green output.

For multi-owner work, the final report should make the mapping auditable:

| Owner | Gate | Status | Evidence or reason |
|---|---|---|---|
| `<actual owner>` | `<actual check>` | `<classification>` | `<result, blocker, or residual risk>` |

## 7. Completion review

Before handoff:

- inspect the full diff and, if a commit was requested, the staged diff;
- confirm generated output came from its owning source and generator;
- run `git diff --check`;
- verify every touched relative link and file path exists;
- search for removed names, stale references, debug output, accidental generated
  artifacts, and credential-like material without searching protected secret
  paths;
- run `git status --short` and distinguish owned changes from pre-existing work;
- report exact commands, desktop sizes and states inspected, all gate statuses,
  blockers, and residual risk.

Do not claim production readiness, visual quality, security coverage, platform
support, or compatibility beyond the evidence actually executed.
