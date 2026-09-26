# DennySORA — Engineering, writing & research

A trilingual static personal site for 李汶道 (DennySORA), targeting [dennysora.me](https://dennysora.me). Built with React, TypeScript, React Router prerendering, Vite and Tailwind CSS. The website supports 繁體中文, English and 日本語 on desktop and mobile. The design follows the UI/UX v2.1 package: the existing logo, a semantic dark palette that is the default for every visitor, and three task layouts (profile, library and reader) instead of an editor-style frame.

## Develop and verify

Use the Node version in [.nvmrc](.nvmrc) and the pnpm version pinned in [package.json](package.json). Dependencies are project-local.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server binds to `127.0.0.1`. Production preview and full validation:

```sh
pnpm verify
pnpm preview
```

`pnpm verify` runs formatting, lint, strict type checks, unit tests, static generation with the Pagefind search index, artifact checks and Playwright/axe checks. Browser tests require an installed Google Chrome, configured in [playwright.config.ts](playwright.config.ts). Preview serves `build/client` at `http://127.0.0.1:4173` with real 404 responses and no SPA fallback.

## Content and routes

- `/{zh-hant,en,ja}/`: home, About, Writing & research (`blog/`, with `blog/topics/<id>/`, `blog/tags/` and `blog/tags/<id>/`), Projects, Paper Daily (`papers/`) and Privacy. `research/` is a no-index bridge to research notes and Paper Daily.
- `content/posts/<id>/`: `meta.json` and language-specific Markdown. Only valid published editions become routes, feeds or search entries. Topic, content type and tags use the stable IDs in `content/taxonomy/`.
- `content/profile/profile.json`: the structured About page. The Markdown files beside it are the preserved source it was migrated from.
- `content/projects/projects.json`: source-backed project summaries, roles and repository links.
- `data/research/snapshot.json`: validated public metadata from a pinned research repository commit. Builds and visitors do not fetch the research service.
- `data/comments.json`: `unconfigured`, `github-native` or click-to-load `giscus`. It currently uses native threads in this repository's Discussions; each article's discussion number is shared across locales, and nothing loads from a third party until a reader chooses to.
- `data/brand-assets.json` and `data/migration/`: brand asset provenance, frozen heading anchors and the About section migration map.
- `scripts/`: content validation, build finalization, search indexing, artifact checks, public snapshot import and loopback preview.

The former blog repository was deleted, as confirmed by its owner. Its five known articles were **not recovered**. Their old URLs explain the missing source and are excluded from search and sitemap. The three current notes adapt the existing profile, with immutable provenance in [the migration manifest](data/migration/manifest.json).

## Publication

Only `build/client` is deployable. The [GitHub Actions workflow](.github/workflows/site.yml) validates pull requests and pushes; deployment runs only through a manual dispatch on `main` with `deploy=true`. Pages must use GitHub Actions, and the `github-pages` environment should require owner approval. The custom domain remains `dennysora.me`; deployment publishes the verified static artifact, never the repository root.

See [the writing and publication guide](docs/CONTENT_WORKFLOW.md), [the UI/UX v2.1 delivery record](docs/process/DELIVERY-v2.1.md), [the original implementation record](docs/process/IMPLEMENTATION.md) and [its delivery evidence](docs/process/DELIVERY.md). Maintainer documentation is English here and Traditional Chinese in the process guide; the public UI and content remain trilingual.
