# Project Agent Profile

## Product and quality profile

- Product: DennySORA's public personal site and technical blog, trilingual (Traditional Chinese, English, Japanese), prerendered to a static artifact and served by GitHub Pages at `https://dennysora.me`.
- Quality profile: `product`; use `release` evidence when publishing or changing the public domain, canonical URLs, routes, metadata or deployment behavior.
- This established public website overrides the generic local-application default. It is a static, responsive site for desktop and phone visitors, not a local desktop application: keep it static, with no server runtime, accounts, forms, analytics or tracking.
- Visual direction (owner, 2026-09-27): a code-editor workbench in the semantic dark palette. Every page sits in a title bar, activity bar, explorer, editor tabs, breadcrumbs and a vim-style status line, and reads as a Markdown buffer with line numbers. The chrome is real links and controls, never a simulated terminal.

## Owners and sources of truth

- Stack: React with React Router framework mode (prerendered, `ssr: false`), Vite, strict TypeScript, Tailwind CSS 4 (CSS-first), pnpm and Node. Versions live only in [`package.json`](package.json), [`pnpm-lock.yaml`](pnpm-lock.yaml) and [`.nvmrc`](.nvmrc).
- Routes: [`src/lib/route-manifest.ts`](src/lib/route-manifest.ts) is the single route contract; [`src/app/page.tsx`](src/app/page.tsx) loads each view and its metadata.
- Content: `content/posts/<id>/` (metadata plus per-locale Markdown), `content/profile/profile.json` (the home README résumé), `content/projects/`, `content/taxonomy/`. [`src/lib/content.server.ts`](src/lib/content.server.ts) and [`src/lib/schema.ts`](src/lib/schema.ts) load and validate them.
- UI: workbench chrome in `src/components/`, pages in `src/features/`, strings for all three locales in [`src/i18n/index.ts`](src/i18n/index.ts), design tokens in [`src/styles/tokens.css`](src/styles/tokens.css).
- Build: `scripts/` validates content, finalizes the prerender (feeds, sitemap, legacy bridges, 404), builds the Pagefind index and checks the artifact.
- Data: `data/comments.json` (comment mode), `data/brand-assets.json` (brand asset provenance), `data/migration/` (frozen anchors and migration maps).
- Documentation: [`README.md`](README.md) in English; [`docs/CONTENT_WORKFLOW.md`](docs/CONTENT_WORKFLOW.md) and `docs/process/` in Traditional Chinese.

## Critical contracts

- Every UI string exists in all three locales. Language links point only to published editions, and missing translations are stated, never invented.
- Browsing makes no third-party requests and sets no cookies or storage. Comments are GitHub-native links; Paper Daily is the external site `https://paper.dennysora.me/`.
- Existing URLs keep working: legacy paths and anchors are served by static bridges, published heading anchors are frozen, and unknown paths return a real 404.
- Brand images are the recorded repository files or their recorded derivatives, byte-checked against `data/brand-assets.json`; never recoloured, redrawn or filtered.
- Colour roles stay semantic: status colours only for real states, no opacity or filter dimming, WCAG 2.2 AA contrast.
- Pages remain readable and navigable without JavaScript, with keyboard access, visible focus and reduced motion.
- Public claims about the owner need repository evidence or explicit owner input.

## Validation and publication

`pnpm verify` runs the Prettier check, ESLint with zero warnings, type generation and `tsc`, Vitest, the full build with its content and artifact checks, and Playwright with axe in Google Chrome. Visual changes also need inspected Chrome screenshots at the affected widths (320–1920 px).

The owner commits directly on `main`, without feature branches. Pushes run verification only; publishing is a manual `workflow_dispatch` of [`.github/workflows/site.yml`](.github/workflows/site.yml) with `deploy=true` on `main`. Publishing, DNS or CNAME changes and GitHub Pages configuration are external effects that require an explicit request; this profile does not authorize them.
