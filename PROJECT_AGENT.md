# Project Agent Profile

## Product and quality profile

- Product: DennySORA's public personal site and technical blog, trilingual (Traditional Chinese, English, Japanese), prerendered to a static artifact and served by GitHub Pages at `https://dennysora.me`.
- Quality profile: `product`; use `release` evidence when publishing or changing the public domain, canonical URLs, routes, metadata or deployment behavior.
- This established public website overrides the generic local-application default. It is a static, responsive site for desktop and phone visitors, not a local desktop application: keep it static, with no server runtime, accounts, forms, analytics or tracking.
- Visual direction (owner, 2026-10-04): Moonlit Vim, a Neovim-style workbench in the semantic dark palette. Every page sits in a tabline of buffers, a neo-tree explorer, a winbar, a lualine-style status line and Vim's command line, and reads as a Markdown buffer with line numbers. The chrome is real links and controls, never a simulated terminal.
- Design system: [`docs/DESIGN.md`](docs/DESIGN.md) is binding for every UI addition or change (tokens, shell structure, typography, icons, generated illustrations and their acceptance, component recipes and the review checklist). Changing one of its rules needs owner approval and updates the document, tokens and guarding tests together.

## Owners and sources of truth

- Stack: React with React Router framework mode (prerendered, `ssr: false`), Vite, strict TypeScript, Tailwind CSS 4 (CSS-first), pnpm and Node. Versions live only in [`package.json`](package.json), [`pnpm-lock.yaml`](pnpm-lock.yaml) and [`.nvmrc`](.nvmrc).
- Routes: [`src/lib/route-manifest.ts`](src/lib/route-manifest.ts) is the single route contract; [`src/app/page.tsx`](src/app/page.tsx) loads each view and its metadata.
- Content: `content/posts/<id>/` (metadata plus per-locale Markdown), `content/profile/profile.json` (the home README résumé), `content/projects/`, `content/taxonomy/`. [`src/lib/content.server.ts`](src/lib/content.server.ts) and [`src/lib/schema.ts`](src/lib/schema.ts) load and validate them.
- UI: workbench chrome in `src/components/` (`TabLine`, `Explorer`, `WinBar`, `StatusLine`, composed by `SiteLayout`), pages in `src/features/`, strings for all three locales in [`src/i18n/index.ts`](src/i18n/index.ts), design tokens in [`src/styles/tokens.css`](src/styles/tokens.css), icons in [`src/components/Icon.tsx`](src/components/Icon.tsx).
- Build: `scripts/` validates content, finalizes the prerender (feeds, sitemap, legacy bridges, 404), builds the Pagefind index and checks the artifact.
- Data: `data/comments.json` (comment mode), `data/brand-assets.json` (brand asset provenance), `data/illustration-assets.json` (every shipped illustration with provenance and SHA-256), `data/migration/` (frozen anchors and migration maps).
- Documentation: [`README.md`](README.md) in English; [`docs/DESIGN.md`](docs/DESIGN.md), [`docs/CONTENT_WORKFLOW.md`](docs/CONTENT_WORKFLOW.md) and `docs/process/` in Traditional Chinese.

## Critical contracts

- Every UI string exists in all three locales. Language links point only to published editions, and missing translations are stated, never invented.
- Browsing makes no third-party requests and sets no cookies or storage. Comments are GitHub-native links; Paper Daily is the external site `https://paper.dennysora.me/`.
- Existing URLs keep working: legacy paths and anchors are served by static bridges, published heading anchors are frozen, and unknown paths return a real 404.
- Brand images are the recorded repository files or their recorded derivatives, byte-checked against `data/brand-assets.json`; never recoloured, redrawn or filtered. Generated illustrations pass the transparency acceptance and are recorded in `data/illustration-assets.json` (DESIGN.md §7).
- Colour roles stay semantic: status colours only for real states, no opacity or filter dimming, WCAG 2.2 AA contrast.
- Pages remain readable and navigable without JavaScript, with keyboard access, visible focus and reduced motion.
- Public claims about the owner need repository evidence or explicit owner input.

## Validation and publication

`pnpm verify` runs the Prettier check, ESLint with zero warnings, type generation and `tsc`, Vitest, the full build with its content and artifact checks, and Playwright with axe in Google Chrome. Visual changes also need inspected Chrome screenshots at the affected widths (320–1920 px).

The owner commits directly on `main`; the `release` branch is the publication branch. This personal website is the owner's explicit exception to the general no-GitHub-CI policy: retain only the build-and-deploy workflow in [`.github/workflows/site.yml`](.github/workflows/site.yml). Every push to `release`, including a merge into it, builds and deploys that exact branch commit. Main pushes, pull requests, tags and manual dispatch do not trigger it. Run the repository's quality gates locally before creating or advancing `release`; the remote workflow installs locked dependencies, builds/checks the static artifact and deploys that same artifact with the existing Pages permissions and environment protection. Prefer a non-force fast-forward from verified `main`; inspect and resolve any branch divergence without overwriting history. Creating or advancing `release` is publication. Publishing, DNS or CNAME changes and GitHub Pages configuration remain external effects requiring an explicit request; this profile does not authorize them.
