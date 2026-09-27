# Process Execution and External Mutation

Load this playbook when code or agent work launches subprocesses, uses package managers, downloads or extracts artifacts, invokes installers, requests privilege, publishes output, or needs cancellation, timeout, cleanup, or rollback behavior.

## 1. Establish scope before execution

- Identify the exact owning project, command source, inputs, outputs, working directory, affected state, privilege level, expected duration, and failure policy.
- Prefer repository-owned scripts and the package manager selected by the nearest manifest and lockfile. Do not mix package managers or regenerate an unrelated lockfile.
- Inspect before mutating. A diagnostic, preview, dry run, or narrowly scoped focused command should precede a risky operation when available.
- Do not perform a destructive, system-global, privileged, externally visible, credential-changing, or costly operation unless the user explicitly authorized that scope.

## 2. Construct commands safely

- Represent a process as an executable plus an argument vector. Pass untrusted or variable values as individual arguments.
- Do not interpolate inputs into `sh -c`, `bash -c`, PowerShell command strings, `eval`, or another shell-evaluated layer.
- Use a shell only when an evidenced repository-owned script or an unavoidable platform interface requires it. Keep the command fixed, quote defensively, constrain inputs, and document why direct execution was insufficient.
- Use an explicit working directory and resolved, validated targets. Do not depend on a broad directory, unchecked glob, or unresolved environment variable for mutation.
- Capture only the output required for diagnosis. Redact credentials and avoid echoing environment variables, cookies, headers, private paths, or sensitive command arguments.

## 3. Bound process lifetime

Long-running and child-spawning processes must have behavior appropriate to their risk:

- a finite timeout or an explicitly supervised persistent lifetime;
- cancellation propagation from the caller;
- process-group or process-tree termination where children could outlive the parent;
- bounded stdout/stderr capture or streaming that cannot exhaust memory;
- explicit exit-status handling and actionable error context;
- cleanup that runs after success, failure, timeout, and cancellation.

Do not treat cancellation, timeout, or a signal as success. Do not launch dependent publication, cleanup, restart, or destructive steps after a prerequisite failure unless the operation's reviewed recovery design specifically requires it.

Tests must use fake executables, temporary roots, fixtures, and isolated state. They must not call a real package manager against the host, consume real credentials, publish releases, or mutate global/user configuration.

## 4. Package managers and dependencies

- Use the existing environment and lockfile from the owning project. For greenfield work, follow the matching stack playbook.
- Before adding or upgrading a third-party dependency, use the mandatory current-documentation workflow, confirm runtime and peer compatibility, and inspect the package's purpose and maintenance signal.
- Select a stable compatible release, record it reproducibly, and update the matching lockfile in the same change. Do not chase prereleases or mutable branches unless requested.
- Keep installation local to the project. Do not install a global package, toolchain, service, hook, plugin, Skill, or MCP server without an explicit request.
- Avoid unrelated dependency upgrades and broad lockfile churn. Review install scripts and new transitive capability in proportion to risk.
- Run lifecycle scripts only through the evidenced package manager and report any scripts that were blocked, skipped, or required trust.

## 5. Downloads, archives, and installers

The mandatory Context7 documentation gate is governed by [`TOOL_ROUTING.md`](TOOL_ROUTING.md). An ordinary lookup may use only a callable configured Context7 MCP or an already-installed, version-managed `ctx7` executable. It does not authorize installing, upgrading, or bootstrapping a documentation client, and it must not execute `npx ctx7@latest` or another mutable registry target. A compatible installed documentation Skill may guide the query semantics and budget, but a Skill or a particular Skill name is not required for a callable managed CLI. If a selected Skill prescribes a conflicting bootstrap wrapper, do not run the wrapper: report the drift and use the direct managed `ctx7` executable. Use another approved Context7 route or the explicitly labeled primary-source fallback only when the direct route cannot satisfy the query contract.

For manually acquired executables, installers, models, archives, or other runnable artifacts:

1. Resolve an immutable release and an official or otherwise reviewed source. Do not execute from a mutable branch or an unresolved `latest` URL.
2. Download over a verified transport into a private temporary staging directory.
3. Verify the publisher-provided digest or signature when available, before execution or publication.
4. Inspect archive entries before extraction. Reject absolute paths, `..` traversal, unsafe links, device files, surprising permission bits, and entries escaping the staging root.
5. Validate the staged artifact and its expected identity/version without exposing secrets.
6. Publish atomically where practical, preserve the previous usable state until validation succeeds, and provide a bounded rollback path.
7. Remove task-owned temporary data after completion. Never delete unrelated caches or user files as incidental cleanup.

Registry-managed dependencies may rely on their package manager and committed lockfile integrity rather than duplicating this manual-artifact workflow, unless the threat model requires stronger verification.

Do not run an installer merely to inspect it. Do not pipe a network response directly into a shell.

## 6. Privilege and system mutation

- Use the least privilege required and keep privileged steps narrow and visible. Never hide elevation inside a helper or retry automatically with greater privilege.
- Before an authorized risky action, state what will change, the exact target, likely interruption, and whether rollback exists. Confirm the resolved target again immediately before destructive execution.
- Never place passwords, tokens, private keys, or credentials in command arguments, source, logs, reports, or committed configuration.
- Explicit authorization for a credential operation does not override a stricter scoped secret-store policy. Establish the exact owner and storage mechanism, use a secret-safe input/output path, and keep values out of process arguments and captured output.
- Package-manager changes outside the project, service enable/disable or restart, reboot, permission/ownership changes, firewall/network exposure, database deletion, cleanup of shared state, and release publication require explicit authorization.
- A request to diagnose, audit, review, build locally, or edit code does not authorize any of those operations.

Prefer a recoverable action over permanent deletion. If an authorized operation removes or overwrites material data, report the exact scope and recovery status.

## 7. Publication and rollback

- Separate building an artifact from publishing it. A successful local build never implies permission to upload, deploy, tag, release, push, or change a remote service.
- Validate the complete staged result before switching a live pointer or replacing an existing artifact.
- Make multi-step state transitions fail closed. Record enough non-sensitive state to distinguish completed, partially completed, rolled back, and rollback-failed outcomes.
- Rollback must be tested or described honestly; the presence of a backup name alone is not proof that recovery works.

At completion, classify each relevant execution as passed, failed, blocked, cancelled, timed out, not run, or not applicable. Report commands at a useful level without reproducing secrets or excessive machine-specific detail.
