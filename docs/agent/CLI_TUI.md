# CLI and Terminal UX

Load this playbook for command-line interfaces, terminal menus, prompts,
progress displays, status or error output, machine-readable output,
localization, terminal accessibility, or TUI behavior. Also apply
[`PROCESS_EXECUTION.md`](PROCESS_EXECUTION.md) when commands launch child
processes or mutate host state.

## 1. Establish the interface contract

Before editing, inspect the actual entry points, argument parser, output layer,
exit-code behavior, localization system, tests, and documented automation
contract. Preserve existing flags, output formats, exit codes, and scripting
behavior unless the user explicitly requests a breaking change.

Keep interactive and non-interactive modes distinct:

- Interactive mode may use prompts, progress rendering, and terminal-aware
  layout only when the relevant stream is attached to a TTY.
- Non-interactive mode must never hang waiting for an implicit prompt. Require
  explicit flags or input, or fail with an actionable diagnostic and a stable
  non-zero exit code.
- Machine-readable output must have an explicit mode and a documented schema.
  Do not mix progress, decoration, or diagnostics into that data stream.
- Send primary requested output to `stdout`; send diagnostics and human-facing
  progress to `stderr` unless the established CLI contract says otherwise.
- Treat exit codes as public API. Use success only when the requested operation
  completed; distinguish usage errors, controlled cancellation, unsupported
  operation, and runtime failure when the existing architecture supports it.

## 2. Prompts, navigation, and risky actions

- State what a prompt changes, its scope, the default choice, and whether the
  action can be reversed. Destructive or privileged actions require an explicit
  confirmation at the final safe boundary.
- Defaults must be visible and safe. Do not interpret empty input, EOF, or a
  parsing failure as consent to a risky operation.
- Treat Ctrl-C, Escape/back, EOF, and prompt cancellation as controlled
  outcomes. Restore terminal state, stop dependent work, and avoid a panic or
  partial success claim.
- Keep keyboard commands discoverable and consistent. Do not require a mouse,
  color perception, or timing-sensitive input.
- Provide non-interactive equivalents for workflows expected in scripts or CI.
  An automation flag must not silently bypass a safety invariant.

## 3. Rendering and accessibility

- Detect TTY capability before emitting ANSI styling, cursor movement, spinners,
  or in-place updates. Emit stable plain text for pipes, redirected output,
  `TERM=dumb`, and environments where styling is unavailable.
- Honor `NO_COLOR` when the owning project supports color output. Never rely on
  color alone; pair status colors with text, symbols, or structure.
- Measure layout by terminal display width, not UTF-8 byte count or Unicode
  scalar count. Cover CJK wide characters, combining marks, emoji, and localized
  text where they can affect alignment.
- Adapt to narrow terminals by wrapping, stacking, or eliding non-essential
  decoration. Preserve the action, status, and recovery instruction before
  alignment or ornament.
- Sanitize or escape untrusted control characters in filenames, child-process
  output, remote text, logs, and errors so they cannot alter terminal state or
  forge trusted status output.
- Keep symbols optional and readable with basic terminal fonts. Provide a plain
  text fallback when a glyph cannot be assumed.

## 4. Progress, state, and failure feedback

- Distinguish pending, running, success, partial success, failed, skipped,
  cancelled, timed out, unsupported, and update-available states in words, not
  color alone.
- Progress must reflect real work. Use an indeterminate indicator when total
  work is unknown and never display completion before dependent steps succeed.
- Bound refresh frequency and output retention. Long-running tasks must not
  flood logs, consume unbounded memory, or make earlier diagnostics inaccessible.
- Preserve useful partial output while clearly marking the overall result.
  Include safe operation context and the next recovery action without exposing
  credentials or excessive local-path detail.
- Never let progress rendering corrupt prompts, structured output, redirected
  logs, or child-process output. Serialize writes through the owning output
  abstraction when concurrent tasks report status.

## 5. Full-screen TUI lifecycle

Apply this section only when the program actually owns a full-screen terminal
interface.

- Enter raw mode, alternate-screen mode, cursor hiding, or mouse capture only at
  a narrow lifecycle boundary and restore every changed terminal setting on
  success, error, cancellation, panic, and signal-driven shutdown where the
  platform permits.
- Recompute layout after terminal resize. Keep the focused control visible and
  prevent zero-width, underflow, clipping, or stale-buffer assumptions.
- Define focus order, modal behavior, scroll boundaries, and key conflicts.
  Escape must close only the nearest dismissible layer before leaving the
  application.
- Make background work cancellable and ensure stale task results cannot update a
  newer screen state.
- Avoid destructive work in draw or input handlers. Route mutations through an
  explicit operation layer with the same confirmation, timeout, and rollback
  policy as non-TUI execution.

## 6. Validation

Use repository-owned test helpers and pseudo-terminal fixtures when available.
Cover the affected behavior proportionately:

- TTY and non-TTY output;
- `stdout`/`stderr` separation and machine-readable output validity;
- stable exit codes for success, invalid input, failure, and cancellation;
- Ctrl-C, Escape/back, EOF, timeout, and interrupted child processes;
- ANSI-disabled and `NO_COLOR` behavior;
- narrow and resized terminals;
- CJK, combining-character, emoji, long-text, empty, and error cases; and
- restoration of raw mode, cursor state, and alternate screen after every exit
  path used by a full-screen TUI.

Run the owning formatter, linter/static analysis, type check, focused tests, and
broader suite required by [`QUALITY_GATES.md`](QUALITY_GATES.md). When practical,
inspect the real interactive flow in a PTY as well as captured test output.
Report any platform, terminal emulator, screen-reader, localization, or signal
path that was not actually exercised; do not infer it passed.
