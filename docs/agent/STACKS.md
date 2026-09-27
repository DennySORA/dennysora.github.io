# Stack Profiles

Load this playbook when scaffolding a project or changing Python, Rust, Nuxt,
TypeScript, Tailwind CSS, dependency, toolchain, or quality configuration. It is
a conditional profile, not evidence that every repository contains every stack.

## 1. Route by owning project

- Resolve each affected file to its nearest manifest, workspace boundary,
  lockfile, scoped instructions, source, and tests. Activate only that owner's
  stack profile.
- In a monorepo, validate every affected owner independently. A Python backend
  and Nuxt frontend do not inherit each other's commands, dependencies, or
  architecture.
- Existing manifests, lockfiles, repository scripts, workflows, and supported
  runtimes override the greenfield examples below. Do not switch package
  managers, editions, formatters, linters, databases, or test runners merely to
  match this playbook.
- Ignore vendored, generated, fixture, example, cache, and build-output manifests
  when identifying ownership unless the task explicitly targets them.
- Do not infer Nuxt from generic TypeScript, Rust from repository history, or a
  repository-wide language from GitHub's primary-language label.

The strict settings below are the greenfield `product` quality profile. Select
`experiment`, `product`, or `release` according to
[`QUALITY_GATES.md`](QUALITY_GATES.md). An existing owner's commands, CI,
thresholds, and scoped policy remain authoritative under every profile. The
`experiment` profile may redirect effort from blanket coverage to stronger
reproducibility, numerical, data, checkpoint/resume, or baseline evidence; it
does not relax durable production code or repository-owned gates. The `release`
profile adds release evidence to these strict baselines rather than replacing
them.

## 2. Versions and dependencies

For a new project, a newly required dependency, or an upgrade explicitly in
scope:

1. Use the mandatory Context7 workflow to verify the current official setup and
   compatibility constraints.
2. Select the highest stable release compatible with the chosen runtime,
   platform, peer dependencies, and supported targets. Do not select a preview,
   nightly, mutable branch, or floating VCS reference without explicit approval.
3. Record the resolved runtime and package versions reproducibly in the owning
   manifest/toolchain file and lockfile. Do not hard-code today's version into
   this reusable playbook.
4. Change only dependencies required by the task. Review transitive and lockfile
   churn before accepting it.

## 3. Python strict profile

### Project shape and environment

For greenfield Python owners:

- use uv, `pyproject.toml`, `uv.lock`, and a `src/<import_package>/` layout;
- declare the selected supported Python range in `requires-python` and keep
  Ruff, mypy, Pyright, CI, and packaging targets consistent with its minimum;
- keep runtime, development, and optional dependency groups explicit;
- prefer typed boundaries and concrete domain types over unstructured mappings
  or pervasive `Any`;
- do not add Pydantic, an async framework, or their plugins unless the project
  actually uses them.

The following is the greenfield Ruff baseline. Set `target-version` to the Ruff
token corresponding to the project's actual minimum Python version when the
project is created; it must not remain implicit or be copied from another
repository.

```toml
[tool.ruff]
line-length = 88

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
docstring-code-format = true

[tool.ruff.lint]
select = [
    "E",
    "W",
    "F",
    "UP",
    "B",
    "SIM",
    "I",
    "N",
    "C90",
    "ARG",
    "S",
    "T20",
    "RET",
    "ICN",
    "PIE",
    "PL",
    "TRY",
    "FLY",
    "PERF",
    "ANN",
    "D",
]
ignore = [
    "E501",
    "TRY003",
    "PERF203",
    "ANN204",
    "ANN401",
]

[tool.ruff.lint.isort]
combine-as-imports = true
force-single-line = false
lines-after-imports = 2

[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.ruff.lint.mccabe]
max-complexity = 10

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["D", "S101", "PLR2004"]
```

The test-only exceptions permit pytest assertions, literal expected values, and
descriptive test names in place of public-API docstrings. Narrow them further if
the owner's test style does not need all three.

Do not grow the global ignore list to make a check green. Fix the code first;
when a rule is genuinely inapplicable, use the narrowest per-file or inline
suppression with a reason. Generated code must be regenerated or excluded at
its generated boundary instead of weakening checks for handwritten code.

Use strict mypy for the greenfield CI type gate:

```toml
[tool.mypy]
strict = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
disallow_untyped_calls = true
disallow_any_generics = true
no_implicit_optional = true
warn_unused_ignores = true
warn_redundant_casts = true
show_error_codes = true
```

A greenfield scaffold must set mypy's Python version to the project's actual
minimum supported version. Add `plugins = ["pydantic.mypy"]` only when the
selected Pydantic version is a real project dependency and its current official
documentation requires or supports that plugin. Configure framework-specific
typing only under the same condition.

When the repository configures Pyright, keep it strict rather than treating the
language server as an editor-only, lower-assurance check:

```toml
[tool.pyright]
typeCheckingMode = "strict"
include = ["src", "tests"]
```

Adjust include paths to the actual owner. Do not claim Pyright references,
rename, or completion validation unless a callable LSP client was used; its CLI
type-check result is still valid evidence for the type gate.

Set Pyright's Python version from the same resolved project minimum. Before a
greenfield scaffold is accepted, verify that `requires-python`, Ruff's target,
mypy's Python version, Pyright's Python version when configured, the uv lock,
and CI all describe a compatible target rather than relying on tool defaults.

Use pytest with deterministic strict discovery and coverage for greenfield
`product` projects:

```toml
[tool.pytest.ini_options]
addopts = [
    "-ra",
    "--strict-markers",
    "--strict-config",
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=xml",
    "--cov-fail-under=90",
]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

The `90` percent threshold is the default for a new Python `product` owner, not
a universal threshold for every repository or research experiment. Preserve an
existing owner's configured threshold. For a greenfield `experiment`, select
coverage targets from durable module risk and report coverage when it provides
useful feedback, but do not copy `--cov-fail-under=90` automatically. Replace no
required test with coverage arithmetic: exercise the experiment's primary
execution path and its material failure, reproducibility, numerical, data, and
resume boundaries. A `release` owner retains the product threshold unless its
repository policy requires a stronger one and adds its release-specific gates.

- Declare only markers the suite uses. Add pytest-asyncio settings only when
  pytest-asyncio is installed and async tests require them.
- Do not disable warnings or blanket-ignore `DeprecationWarning`,
  `RuntimeWarning`, or `UserWarning`. Filter a proven third-party warning as
  narrowly as possible, with an owner and removal condition.
- Ruff's `S` rules are the default static security gate. Add Bandit only when the
  repository selects and configures it; do not duplicate checks or globally skip
  findings without evidence.
- Every public behavior change needs typed tests for the primary path, critical
  failures, and relevant boundaries. Use temporary SQLite databases for real
  persistence behavior and test doubles for remote systems.

## 4. Rust strict profile

For a greenfield Rust owner:

- use Cargo, the current stable compatible toolchain, and the latest stable
  edition supported by that toolchain after official verification;
- record the selected edition and minimum supported Rust version in Cargo,
  record the exact resolved stable channel in `rust-toolchain.toml`, and keep
  both consistent with CI;
- set an explicit edition-compatible resolver for a virtual workspace instead
  of inheriting an older resolver implicitly;
- commit `Cargo.lock` for applications and binaries;
- keep modules cohesive, public APIs minimal, errors typed and source-preserving,
  and platform behavior explicit;
- prefer the standard library or an existing dependency for small needs. Review
  feature flags, default features, licenses, and unsafe/native build impact
  before adding a crate.

For a new workspace, apply these lints at the workspace root:

```toml
[workspace.lints.rust]
warnings = "deny"
unsafe_code = "forbid"

[workspace.lints.clippy]
all = { level = "deny", priority = -1 }
pedantic = { level = "deny", priority = -1 }
nursery = { level = "deny", priority = -1 }
cargo = { level = "deny", priority = -1 }
multiple_crate_versions = "allow"
```

```toml
[lints]
workspace = true
```

Each workspace member uses the second block. A standalone package uses the same
entries from the first block under `[lints.rust]` and `[lints.clippy]` instead of
the `workspace.lints` tables.

`multiple_crate_versions` is allowed because transitive version convergence is
not always locally controllable; still inspect unexpected duplication. Any
other allow must be narrow, justified beside the code or owning manifest, and
reviewed when the toolchain changes. New Clippy findings are defects to assess,
not a reason to weaken a whole lint group.

Use stable rustfmt settings only. Preserve a repository's existing style; for a
new owner, make the selected edition explicit in `rustfmt.toml`, retain the
standard 100-column width unless the user chooses another house style, and
avoid nightly-only formatting options.

Production code is safe Rust by default. If `unsafe` is materially required,
replace `forbid` with the narrowest enforceable policy, document each safety
invariant, isolate the boundary, and add focused tests. Do not relax the rule for
an entire workspace merely because one dependency contains unsafe internally.

The strict greenfield Cargo gate is:

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo test --workspace --all-targets --all-features --locked
cargo check --workspace --all-targets --all-features --locked
```

Design greenfield feature flags so `--all-features` is valid. Existing projects
with intentionally incompatible features must use their documented CI feature
matrix instead. Use `--locked` only where the owner has an authoritative lockfile;
never generate or rewrite one incidentally during a review. Run audit, deny,
coverage, Miri, sanitizer, benchmark, or cross-platform gates only when the
repository configures them or the task's risk explicitly calls for them.

## 5. Nuxt 4, TypeScript, and Tailwind CSS 4 strict profile

### Greenfield structure and package policy

For a new frontend owner:

- use pnpm with its exact resolved package-manager version recorded by the
  project, and commit the lockfile;
- resolve and pin a Node.js runtime supported by the selected Nuxt release, and
  keep local development, package-manager metadata, and CI on that compatible
  runtime line;
- use the current stable mutually compatible Nuxt 4, Vue, TypeScript, Tailwind
  CSS 4, and official integration packages after Context7 verification;
- follow Nuxt 4 conventions: application pages, components, composables,
  middleware, plugins, and assets live under `app/`; server routes live under
  the root `server/`; truly shared code lives under `shared/` only when both
  sides own the same contract;
- keep client-only APIs behind explicit client boundaries and keep server-only
  secrets and code out of public runtime configuration and the client bundle;
- install the compatible TypeScript and `vue-tsc` development tooling required
  by the selected Nuxt documentation;
- enable Nuxt's TypeScript strict mode and build-time type checking:

```ts
export default defineNuxtConfig({
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
```

Run `nuxt prepare` before standalone type checking when generated types are not
current.

Preserve Nuxt's generated TypeScript configuration and its project references.
For handwritten code, enforce the equivalents of:

- `strict` and `useUnknownInCatchVariables`;
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`;
- `noImplicitReturns`, `noImplicitOverride`, and
  `noFallthroughCasesInSwitch`;
- `forceConsistentCasingInFileNames`, `allowUnreachableCode: false`, and
  `allowUnusedLabels: false`.

Do not use explicit `any` or `@ts-ignore` as an escape hatch. Prefer `unknown`
plus runtime narrowing at untrusted boundaries. A necessary
`@ts-expect-error` must identify the expected diagnostic and why it is safe, and
must fail once the diagnostic disappears. Keep component props, emits, exposed
APIs, server responses, and shared discriminated unions explicitly typed.

Verify every compiler option against the selected Nuxt and TypeScript versions
before writing it. Do not replace Nuxt's module resolution, aliases, generated
types, or composite project layout with a generic `tsconfig.json` copied from a
non-Nuxt project.

Tailwind CSS 4 is CSS-first. The greenfield stylesheet starts from the current
official form:

```css
@import "tailwindcss";
```

Define reusable design values with CSS variables and Tailwind 4 `@theme` tokens,
and keep global CSS registered through the owning Nuxt configuration. Do not
create `tailwind.config.*`, a legacy `content` array, or JavaScript token
duplication unless a verified integration genuinely requires it. Keep arbitrary
values exceptional; repeated values belong to semantic tokens or reusable
components.

For linting and formatting:

- use the repository's existing ESLint, Nuxt ESLint, Prettier, Stylelint, or
  equivalent scripts and configuration when present;
- for greenfield work, select the current official Nuxt-compatible lint path
  after documentation lookup, make warnings fail CI, and avoid overlapping
  formatter rules;
- make the greenfield type-aware lint policy enforce equivalents of no explicit
  `any`, banned `@ts-ignore`, and no floating or misused promises. Prefer a
  reason-bearing `@ts-expect-error` only for a verified exceptional boundary;
- do not introduce Prettier or Stylelint into an existing owner solely because
  this playbook names them. A formatter/linter change is a deliberate project
  configuration change, not incidental cleanup.

For tests:

- use the repository's selected unit/component runner; Vitest is the greenfield
  default when compatible with the selected Nuxt toolchain;
- add Playwright only when browser behavior, screenshots, or an end-to-end flow
  needs it; use Chromium desktop projects at `1280x800`, `1440x900`, and
  `1920x1080` for this desktop-only product profile;
- cover loading, empty, failure, success, disabled, focus-visible, and async
  duplicate-submission behavior when those states exist;
- never treat a build or a DOM snapshot as visual browser verification.

A greenfield `package.json` must expose stable project scripts with these
contracts:

- preparation runs `nuxt prepare`;
- formatting verification runs the selected formatter in check-only mode; when
  the type-aware linter deliberately owns all formatting rules, expose a stable
  `format:check` script that documents and enforces that same zero-warning gate;
- type checking runs `nuxt typecheck`;
- lint runs the selected type-aware Nuxt-compatible linter and fails on any
  warning;
- unit/component tests run once and exit rather than entering watch mode;
- build runs `nuxt build`;
- browser tests run `playwright test` when Playwright is part of the owner.

Use those scripts rather than bypassing them with ad hoc CLI invocations.

## 6. Mixed-stack and generated boundaries

- For frontend/backend work, validate both owners and the shared contract. A
  passing frontend type check cannot prove the backend schema, and a passing
  backend test cannot prove client rendering.
- Generated clients, schemas, ORM artifacts, Nuxt types, and bindings belong to
  their generator. Change the source, regenerate, inspect the diff, and run both
  source-owner and consumer gates.
- Native Python extensions activate both Python and Rust gates. A Python helper
  script inside a Rust repository activates Python only for that helper's owner;
  it does not convert the product to Python or excuse the Rust gate.
- Add a new abstraction only when it creates a real stable boundary. Strictness
  is not a license for speculative layers, duplicate tooling, or unrelated
  rewrites.
