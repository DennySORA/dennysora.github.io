# API and Persistence Contracts

Load this playbook for frontend/backend request or response changes, REST/OpenAPI work, schemas, generated clients, shared types, validation, error envelopes, SQLite schema changes, or compatibility-sensitive persistence work.

## 1. Establish ownership

Before editing, identify the smallest authoritative contract owner. It may be a checked-in API schema, backend request/response model, shared schema package, generated specification, migration set, or repository generator. Follow the evidenced repository direction; do not create a parallel hand-maintained source of truth.

For each affected field and operation, define deliberately:

- name and semantic meaning;
- scalar or structured type;
- required, optional, nullable, and default behavior;
- validation constraints and normalization;
- success and failure status semantics;
- ordering, pagination, filtering, and idempotency where relevant; and
- compatibility and migration behavior for existing stored data and callers.

Frontend types must come from the authoritative schema or its generated artifact when the repository supports generation. Do not maintain a visually similar interface by hand and assume it remains compatible.

## 2. Local application boundary

For an application under the `local-single-user-desktop` profile, new frontend/backend contract behavior must not contain application identity or authentication machinery. Do not add account, password, login state, bearer/API token, authentication cookie, identity session, JWT, OAuth/OIDC, RBAC, role, permission, or authorization fields, endpoints, headers, middleware, generated models, fixtures, or examples.

External-provider credentials remain backend-only. The backend returns only the application result or a sanitized provider failure; it never forwards provider credentials, credential-bearing headers, raw secret-bearing payloads, or browser-usable provider sessions.

If an existing repository already has a security boundary or remote client contract, preserve it. Changing that contract requires explicit migration scope and does not inherit the no-auth default automatically.

## 3. Error contract

Use a stable, machine-readable error code plus a concise human-readable message. Add only context that helps the local operator recover, such as safe field details and an operation, request, or correlation identifier when the architecture already has one.

- Do not require a user identifier; this profile has no application identity.
- Do not expose stack traces, SQL text, local private paths, provider headers, secrets, or raw upstream response bodies.
- Keep validation, domain, persistence, transport, and external-provider failures distinguishable without leaking implementation details.
- Make retryability explicit where a caller can safely act on it.
- Keep frontend messages actionable and do not rely on status code or color alone.

## 4. SQLite schema changes

- Keep ordered migrations in the repository's authoritative migration location and use its existing migration runner.
- Make each migration deterministic from the same supported starting schema. Do not depend on workstation-specific files, wall-clock values, unordered query results, or external services.
- Apply related schema and data transformations atomically where SQLite and the migration tool support it. If atomicity is unavailable, define failure recovery before execution.
- Specify constraints, foreign-key behavior, uniqueness, defaults, indexes, and nullability deliberately. Verify any connection-level feature on which integrity relies.
- Preserve existing data or document and obtain approval for intentional loss. Destructive changes require a tested backup/restore or rollback path appropriate to their risk.
- Update query code, models, fixtures, exports, and generated artifacts in the same coherent change.
- Do not edit a user's live database during tests or routine validation.

Migration tests use isolated temporary SQLite databases. Cover a fresh schema, every supported upgrade path affected by the change, representative existing data, constraint failures, interrupted/failing migration behavior when material, and reopening the resulting database.

## 5. Contract synchronization

For every contract change:

1. Change the authoritative source.
2. Regenerate derived schemas, clients, validators, and types with repository-owned commands.
3. Review generated diffs; do not hide an unexpected broad rewrite.
4. Update backend implementation, frontend consumers, fixtures, and documentation together.
5. Search for stale field names, paths, enum values, and duplicate schemas.
6. Run a drift check that fails when committed generated artifacts no longer match their source.

If no generator exists, add focused compatibility tests around the evidenced manual boundary rather than silently introducing a new generation stack.

## 6. Verification matrix

Test at the real serialization and persistence boundaries, not only internal functions:

- primary request and response path;
- missing, null, empty, malformed, oversized, and boundary values that are relevant to the schema;
- stable error code and safe recovery message for each critical failure class;
- unknown or additional fields according to the declared compatibility policy;
- frontend parsing/rendering against representative backend responses;
- backend validation against representative frontend requests;
- generated artifact drift; and
- SQLite migration and persistence behavior in isolated temporary databases.

Do not call real external providers in unit or contract tests. Use deterministic fakes at that boundary and keep any explicitly requested integration test opt-in and credential-safe.

Report the authoritative contract source, compatibility decision, migrations run, generated outputs reviewed, tests executed, and any client or prior-schema path that remains unverified.
