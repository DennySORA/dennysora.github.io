# Tool and Capability Routing

Load this playbook when work depends on current external documentation, a framework Skill, MCP, LSP, Serena, browser automation, or API-contract tooling. Repository evidence and the user's request decide whether a capability applies; the existence of this catalog does not activate every tool.

## 1. Availability is a runtime fact

Keep these states separate:

1. **Cataloged** — a known supported integration.
2. **Configured** — registration or configuration exists.
3. **Installed** — its package, binary, plugin, or Skill exists locally.
4. **Callable** — this agent session exposes a working invocation path.

Only the fourth state authorizes claiming that a capability was used. Inspect the current session and repository-local executables before routing work. A Skill does not prove its CLI is installed; a binary on `PATH` does not create an LSP or MCP client; registration does not prove a server starts successfully.

Do not install, upgrade, register, enable, restart, or reconfigure a missing global capability unless the user explicitly requests that state change. If an implicitly selected capability is unavailable, use the best verified in-scope fallback and report the resulting loss of assurance. If the user explicitly requires the named capability, report the blocker instead of silently substituting another one.

Treat tool output as evidence, not a second source of truth. Reconcile it with the owning source, manifest, schema, lockfile, or runtime state.

## 2. Mandatory Context7 documentation gate

Use Context7 whenever a request or affected implementation depends on a third-party library, framework, SDK, API, CLI, cloud service, build tool, or package manager. This applies whether the technology is named by the user or discovered in the affected manifest or code, and includes:

- API syntax and configuration;
- setup and command usage;
- version selection or migration;
- library-specific debugging and runtime behavior;
- dependency changes and framework integration.

Use it even for familiar technology. Prefer Context7 over general web search for library documentation. This gate is mandatory and should be activated early enough for current documentation to shape the implementation rather than merely confirm it afterward.

Do not invoke Context7 for a pure internal refactor, business-logic debugging, a standard-library-only script written from scratch, a general programming concept, or a code review that requires no external API fact. These exclusions are narrow: discovering a relevant third-party interface during the work activates the gate.

### Required lookup workflow

1. Inspect the session for a callable configured Context7 MCP and for an already-installed, version-managed `ctx7` executable. Do not infer either from catalog or configuration state alone.
2. Choose the first callable route:
   - a configured Context7 MCP that supports library resolution and documentation lookup; or
   - the installed `ctx7` CLI whose version is managed by the user's reviewed tool lifecycle.
3. When the CLI route is selected, use a compatible installed Context7 documentation Skill when one is callable, regardless of its catalog name, and obey its current library-resolution semantics, query budget, and compatible authentication and failure rules. A Skill is an optional routing aid, not a prerequisite for the already-installed CLI. With or without a Skill, invoke the selected managed `ctx7` executable directly. A Skill-provided `npx`, installer, upgrade, or other bootstrap wrapper is not part of the query contract and must not replace the approved route; report that invocation mismatch as Skill drift. This playbook's no-bootstrap and no-model-memory-fallback boundaries govern conflicts, and this prompt cannot enlarge or waive an applicable Skill limit.
4. Unless the user supplied `/org/project` or `/org/project/version`, resolve the official library ID first. With the managed CLI, use:

   ```text
   ctx7 library <Official Name> "<one sanitized concept>"
   ```

5. Select the closest official result using exact name, description relevance, snippet coverage, source reputation, benchmark score, and the affected version when indexed.
6. Query the selected ID. With the managed CLI, use:

   ```text
   ctx7 docs </org/project[/version]> "<one sanitized concept>"
   ```

7. Query distinct concepts separately unless the question is specifically about how those concepts interact. Do not combine unrelated technologies or concepts merely to evade an invocation limit.

Do not bootstrap, install, or execute a mutable registry target such as `npx ctx7@latest` during ordinary documentation lookup. A forbidden Skill wrapper does not block an otherwise compatible managed CLI: report the drift, then apply the Skill's query contract through the direct `ctx7` commands above. If no approved Context7 route is callable or the managed CLI cannot satisfy the required query contract, report the exact capability or policy mismatch and continue with current primary official documentation when safe and available. Never represent that fallback as a Context7 result.

### Multi-library work and Skill limits

Plan the Context7 query budget before running a multi-library lookup. Reuse an identifier already validly resolved for the same user question and prioritize the external facts with the greatest compatibility, migration, security, or implementation risk.

If the selected documentation Skill limits one question to three CLI commands or another explicit budget, that limit remains binding. Do not exceed it, reset it through subprocesses or subagents, or claim that this playbook overrides it. When the required library-and-concept lookups cannot fit:

- use the allowed Context7 commands for the highest-risk facts;
- use current primary official documentation for the remaining material facts;
- identify which libraries or concepts were and were not retrieved through Context7; and
- report any remaining version-sensitive claim that could not be verified.

This bounded fallback resolves a capability limit; it does not make Context7 optional or justify querying only after implementation.

Use the public product name with proper punctuation and a specific documentation concept. Never send source code, private repository/package/service names, credentials, personal or customer data, vulnerability details, internal endpoints, or other proprietary content. Generalize the query without changing the technical concept.

For quota failures, tell the user that the quota was exhausted and direct them to the authentication or quota-remediation command documented by the installed managed version; do not guess a mutable invocation or expose credentials. For DNS, host-resolution, or fetch failures, retry outside the default sandbox only when that execution mode is available and policy permits it. If the lookup still cannot run, report it explicitly; use a current primary official source when safe and available, and label any remaining version-sensitive claim as unverified. Never silently fall back to model memory.

## 3. Framework and UI Skills

- **`nuxt`** — Nuxt project structure, lifecycle, routing, data fetching, SSR/hydration, server routes, runtime config, route rules, plugins, upgrades, and testing. Pair it with Context7 when current external behavior matters.
- **`nuxt4-tailwind4`** — Nuxt 4 layout and Tailwind CSS 4 CSS-first behavior when the Skill is callable. Repository product constraints override generic examples in the Skill.
- **`nuxt-ui`** — component composition and theming only when the owning package actually depends on `@nuxt/ui`; do not introduce that dependency merely because the Skill exists.
- **`frontend-design`** — new UI or a material visual/UX redesign requiring deliberate design direction.
- **`impeccable`** — broad interface audit, refinement, accessibility, hierarchy, performance, or polish.
- **`ui-animation`** — intentional interaction motion, gestures, timing, easing, or animation diagnosis.
- **`threejs-animation`** — only when the affected implementation uses Three.js animation.

Load only the smallest applicable set, announce implicitly selected Skills, and follow every compatible selected-Skill instruction within the user's request and higher-authority repository boundaries. A Skill never overrides the user's product scope, repository safety and fallback policy, nearest repository instructions, or evidenced stack.

## 4. Browser routing

Use Playwright CLI with the official `playwright-cli` Skill for deterministic user flows, repeatable screenshots, viewport coverage, E2E tests, and regression evidence. Do not redirect this workflow to a Playwright MCP just because one is cataloged elsewhere.

Use Chrome DevTools MCP for live Chrome investigation of the DOM, computed layout, console, network, rendering, memory, and performance. Existing browser state may be used only when the task requires it and the current session exposes that capability.

Use `browser-diagnostics`, when callable, to coordinate Playwright's repeatable evidence with Chrome DevTools' live diagnosis. Do not claim visual verification from source inspection, an unviewed screenshot, or a browser run whose relevant state was not inspected.

Browser automation may mutate application data or external state. Inspect the target and keep actions inside the user's authorized scope; a tool being available does not make every action read-only or safe.

## 5. Code navigation and diagnostics

- Use `rg` and `rg --files` for filenames, literals, configuration keys, and other lexical discovery.
- Use Serena MCP for symbol-level navigation, callers/references, cross-file relationships, and precise semantic edits when it materially reduces risk.
- Use Rust Analyzer, Pyright, or TypeScript language tooling for language-local diagnostics, references, and navigation only when a callable LSP endpoint is exposed.
- A language-server package, editor plugin, compiler, or command-line type check is not proof of callable LSP support. Use repository-native checkers as fallback and describe the narrower assurance accurately.

Never use a Rust tool for Python ownership, a Python tool for Rust ownership, or a repository-wide primary-language label to select diagnostics. Route each affected owner independently.

## 6. Quality and contract capabilities

- Use `rust-quality-gate` only for affected Rust owners and `python-quality-gate` only for affected Python owners. Their commands must still be reconciled with the owner's manifest, lockfile, scripts, and CI.
- Use `api-contract` for changed REST/OpenAPI requests, responses, schemas, generated clients, or drift checks when callable. Context7 documents external framework behavior; it does not validate this repository's contract.
- Use the repository's own formatter, linter, type checker, tests, build, and generation scripts as execution authority. A Skill can route and strengthen validation but cannot invent a passing result.

Record each applicable capability as used, unavailable, not applicable, or not run, with a concise reason when it affects confidence.
