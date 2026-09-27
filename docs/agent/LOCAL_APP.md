# Local Single-User Desktop Applications

Load this playbook for a new application, local backend, persistence change, frontend/backend communication path, listener, IPC channel, container publication, or deployment-scope change.

## 1. Scope and precedence

The default product profile for a new application is `local-single-user-desktop`: one trusted OS user operates one application on one machine. It also applies to new behavior in an existing application when the user or repository evidence explicitly identifies that same product boundary. This profile is a product requirement, not a shortcut that permits unsafe input handling, secret exposure, or arbitrary local process access.

Apply these defaults to greenfield applications and to new behavior inside an active profile; do not treat them as a retroactive migration. An existing repository's evidenced database, security boundary, remote deployment contract, and responsive UI remain authoritative. Removing or weakening any of them is a separate, explicit migration that requires user direction, compatibility analysis, and a reviewed security plan.

## 2. Hard application boundary

For the bundled frontend and local backend, do not create or retain speculative infrastructure for:

- application accounts, registration, login, logout, or passwords;
- frontend-to-backend bearer tokens, API tokens, or authentication headers;
- authentication cookies or identity-bearing sessions;
- JWT, application OAuth/OIDC login, RBAC, roles, or an application permission model;
- authentication or authorization middleware; or
- dormant identity code, schema fields, routes, configuration, or dependencies kept "for later."

Do not replace one forbidden mechanism with a renamed device identifier, shared secret, signed request, one-time code, or browser-stored credential. Local reachability is necessary but is not a complete browser request boundary; enforce the transport and browser-origin controls below without creating an identity system.

Authentication used by the backend when it calls an external provider is a separate concern. It never justifies adding frontend-to-backend authentication.

## 3. Local-only transport

- Prefer an existing local IPC mechanism when it fits the platform and repository architecture.
- If TCP is required, bind explicitly to loopback, such as `127.0.0.1` and, when supported and verified, `::1`. Do not rely on an ambiguous hostname or framework default.
- Never bind the unauthenticated service to wildcard, LAN, public, or externally routed interfaces. Do not expose it through a tunnel, public URL, externally published container port, or proxy that widens reachability. A same-origin proxy is acceptable only when its effective listener and upstream both remain verified loopback-only.
- For containers, bind any host publication explicitly to loopback and verify the effective host mapping. A container-only bind address is not proof that the host port is private.
- Prefer serving the browser UI and API from the same local origin. If cross-origin development is unavoidable, allow only the exact required loopback origins; never use wildcard CORS or reflect arbitrary origins.
- For browser-facing HTTP, allow only expected `Host` values including ports, validate `Origin` on state-changing requests, and use Fetch Metadata headers when the browser supplies them to reject cross-site traffic. Treat absent or unusual headers according to the explicitly supported native/CLI clients rather than accepting every request.
- Keep `GET`, `HEAD`, and `OPTIONS` free of state changes. Accept only the intended request methods and content types; reject unused simple form encodings so an unrelated website cannot trigger mutations with a basic form submission.
- CORS, a random port, and the word `localhost` are not authentication. These controls constrain browser reachability without introducing an application identity, token, account, role, or permission system.
- After configuration or packaging changes, inspect the effective listener or IPC endpoint. A source-code setting alone is not verification.

If a requested feature requires another device, remote user, LAN access, or public deployment, stop applying this profile as-is. Surface the product-scope change before designing a replacement trust boundary.

## 4. External-provider credentials

- Store provider credentials only in a backend-owned secret mechanism supported by the repository or operating system.
- Never place them in frontend source, public runtime configuration, browser storage, client bundles, URLs, screenshots, logs, fixtures, or frontend/backend payloads.
- Return only the minimum provider result needed by the UI. Redact upstream headers, raw error bodies, and identifiers that could expose credential or account context.
- Do not commit local secret files. Examples and documentation use placeholders and describe the owning path without including a value.

## 5. SQLite default

When an application under this profile newly needs structured persistence and has no established database contract, use SQLite unless the task demonstrates a requirement it cannot satisfy. Do not replace an existing database merely to enforce this default.

- Keep the database file in an application-owned local data directory, not source control, the package directory, or a temporary directory used for production state.
- Use one authoritative schema and ordered, checked-in migrations. Never rely on ad hoc startup DDL that can drift between machines.
- Define constraints, nullability, defaults, relationships, indexes, timestamps, and conflict behavior deliberately. Enable and verify database features on which integrity depends.
- Make multi-step writes transactional. Keep transactions bounded and do not hold them open across unrelated UI waits or remote-provider calls.
- Treat destructive schema or data changes as recoverability-sensitive: preview the affected state, define a backup or rollback path, and verify restoration before claiming safety.
- Keep SQL parameterized. Validate application-level paths, subprocess arguments, imported files, and provider responses even though the operator is trusted.

Detailed schema and contract rules live in [`API_CONTRACTS.md`](API_CONTRACTS.md).

## 6. Desktop-only interface scope

New UI work under this profile targets desktop Chrome and resizable desktop windows. Do not create phone/tablet layouts, mobile navigation, touch-only alternatives, mobile breakpoints, device emulation suites, or mobile acceptance criteria. Do not remove existing responsive behavior from an established application without an explicit migration.

Desktop-only does not relax accessibility: keyboard operation, focus visibility, semantic structure, text zoom, long content, and stable desktop resizing remain required. Apply [`UI_UX.md`](UI_UX.md) whenever UI is affected.

## 7. Verification

For each applicable change, verify and report:

- the effective listener or IPC endpoint is local-only;
- no prohibited identity/authentication mechanism or dependency was introduced;
- provider credentials remain backend-only and absent from built frontend artifacts and payloads;
- SQLite migrations apply deterministically to a fresh isolated database and to the supported prior schema;
- persistence tests use an isolated temporary database, never the user's live database;
- the packaged or production-like launch path preserves the same boundary as development; and
- existing broader contracts were preserved unless the user explicitly authorized a migration.
