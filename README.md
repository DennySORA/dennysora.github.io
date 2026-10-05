# DennySORA — Engineering, writing & research

A trilingual static personal site for 李汶道 (DennySORA), targeting [dennysora.me](https://dennysora.me). Built with React, TypeScript, React Router prerendering, Vite and Tailwind CSS. The website supports 繁體中文, English and 日本語 on desktop and mobile. Every page sits in a Neovim-style workbench, **Moonlit Vim**: a tabline of buffers with search and language, a neo-tree file explorer, a winbar path, a lualine-style status line with real NORMAL/INSERT/VISUAL modes and Vim's command line, all on the semantic dark palette. Each page reads as an open Markdown buffer with line numbers; the chrome is made of real links and controls, and the document itself scrolls. The binding design system for every UI change is [docs/DESIGN.md](docs/DESIGN.md).

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

- `/{zh-hant,en,ja}/`: the profile as `README.md` (logo, introduction and résumé), the blog (`blog/`, with `blog/topics/<id>/`, `blog/tags/` and `blog/tags/<id>/`), and the note directories. Paper Daily is its own site, [paper.dennysora.me](https://paper.dennysora.me/), linked directly. `about/` and `papers/` are forwarding stubs (to the home page with its anchor, and to Paper Daily); `research/` is a no-index bridge to research notes and Paper Daily.
- `content/posts/<id>/`: `meta.json` and language-specific Markdown. Only valid published editions become routes, feeds or search entries. Topic, content type and tags use the stable IDs in `content/taxonomy/`.
- `content/profile/profile.json`: the structured profile shown on each language's home page. The Markdown files beside it are the preserved source it was migrated from.
- `content/projects/projects.json`: repository references used by the home résumé’s competency evidence. Projects and Privacy are no longer published pages.
- `data/comments.json`: `unconfigured`, `github-native` or click-to-load `giscus`. It currently uses native threads in this repository's Discussions; each article's discussion number is shared across locales, and nothing loads from a third party until a reader chooses to.
- `data/brand-assets.json` and `data/migration/`: brand asset provenance (including the home page's logo derivatives), frozen heading anchors and the profile section migration map.
- `scripts/`: content validation, build finalization, search indexing, artifact checks and loopback preview.

The former blog repository was deleted, as confirmed by its owner. Its five known articles were **not recovered**. Their old URLs explain the missing source and are excluded from search and sitemap. The former three profile adaptations are now unpublished, and the blog is empty until real posts are ready. Their former URLs show a no-index notice. Their source and immutable provenance remain in [the migration manifest](data/migration/manifest.json).

Study notes live separately under `/{locale}/note/`. The Medicine folder links to the supplied Traditional Chinese pharmacology reference under `/zh-hant/note/medical/drugs/analgesics/`; unavailable translations are stated explicitly. The brain/CNS tumor guide is filed under Medicine / Pathology at `/zh-hant/note/medical/pathology/brain-cns-tumors/`. Medicine now has Medicines and Pathology subfolders in all three interface languages, with Traditional Chinese source notes only. The old analgesics URL forwards with its anchor preserved when JavaScript is enabled; without JavaScript, a complete no-index copy keeps every original section readable. Content fragments in `content/notes/medical.html` and `content/notes/medical/pathology/brain-cns-tumors.html` contain no scripts. Reference scenarios use native details controls so they also work without JavaScript. Every article and note shows subject tags directly below its title. Header tags open exact global tag-search results, combinable with keywords and content type; localized labels and controlled aliases are searchable. The desktop Explorer can be collapsed and restored from the tabline; below 1100 px it opens as a dialog. There is no shared footer.

## Publication

Only `build/client` is deployable. This personal website is the explicit exception to the owner's no-GitHub-CI policy. The [GitHub Actions workflow](.github/workflows/site.yml) runs **build and deployment only** on pushes to `release`, including merges into that branch. It builds the exact pushed commit and deploys the checked artifact from that run. Main pushes, pull requests and tags do not trigger it, and there is no scheduled or manual-dispatch trigger. Run `pnpm verify` locally before publishing. Commit source changes on `main`, then create or fast-forward `release` from the verified commit when publication is authorized; do not force-push over a diverged release branch. Pages must use GitHub Actions, and any `github-pages` environment protection must permit `release` through the owner's existing approval process. The custom domain remains `dennysora.me`; deployment publishes the checked static artifact, never the repository root.

See [the design system](docs/DESIGN.md), [the Moonlit Vim redesign record](docs/process/DELIVERY-v3.0.md), [the writing and publication guide](docs/CONTENT_WORKFLOW.md), [the editor workbench redesign record](docs/process/DELIVERY-v2.2.md), [the UI/UX v2.1 delivery record](docs/process/DELIVERY-v2.1.md), [the original implementation record](docs/process/IMPLEMENTATION.md) and [its delivery evidence](docs/process/DELIVERY.md). Maintainer documentation is English here and Traditional Chinese in the process guide; the public UI and content remain trilingual.

The language-neutral `/` entry chooses the first supported browser language (Traditional Chinese, English or Japanese), with English for unsupported preferences. Explicit localized URLs and manual language links take precedence. No preference is stored. Without JavaScript, the root keeps its complete Traditional Chinese fallback and three-language navigation. The home front matter names 李汶道 as `name` and DennySORA as `alias`.
