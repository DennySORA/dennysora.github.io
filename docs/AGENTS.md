# Documentation Instructions

These instructions apply under `docs/`. The repository-root `AGENTS.md` remains authoritative for product boundaries, stack routing, safety, and validation.

## Sources of truth

For repository behavior, use this order:

1. User-requested behavior and acceptance criteria.
2. Executable source and tests.
3. The owning manifest, lockfile, schema, and generated configuration.
4. CI workflows and repository scripts.
5. Existing prose.

For third-party libraries, frameworks, SDKs, APIs, CLIs, and cloud services, follow the root Context7 gate before writing syntax, configuration, setup, migration, version, or library-specific debugging claims. Repository evidence establishes the version in use; current upstream documentation establishes that version's supported behavior.

Never copy versions, commands, paths, platform claims, or tool availability from memory. Link to the owning source instead of duplicating volatile constants when practical.

## Documentation work

- Keep documentation synchronized with executable behavior and delete superseded claims in the same change.
- Preserve the repository's existing language and localization set. Update every affected maintained locale, or state why a translation is intentionally deferred.
- Translate prose, not package names, commands, paths, configuration keys, protocol identifiers, or version strings.
- Use repository-relative links and verify every touched path.
- Keep examples directly executable, scoped to the evidenced stack, and free of secrets or private local paths.
- Do not add generated screenshots, logs, scanner output, archives, caches, or build artifacts unless the task explicitly requires a maintained artifact.

## Validation

Run `git diff --check` for documentation changes. Compare technical claims against source, manifests, workflows, current upstream documentation when applicable, and every maintained localized document affected by the change.
