# Four-article trilingual publication

Date: 2026-10-25. Manual engineering delivery record (`agent_reported`), not
an automated deployment status. This record supersedes the publication and
preview gates in the three earlier same-day draft delivery records; their
source inventories and historical test results remain unchanged.

## Authorized scope and immutable evidence

The owner explicitly requested publication of all four articles and elected
to inspect the live presentation personally. This release publishes twelve
editions in Networking, Tools and Security. It does not publish research
papers, replace existing notes, restore removed content or change site colors.
This request authorizes this release; the technical workflow below is not an
independent grant of future commit, push or publication permission.

The source snapshot and independent reviews are immutable at
`9b1a75b3a89704b7612fcf0e0e8affce3516cb03`, on the nondeploy
`review/blog-articles-20261025` branch (tree
`f5dfd27715a16e4a4a1aa377f5631b11c9e25cac`). The three review files were read back
from GitHub and their blob hashes verified before their real HTTPS URLs were
used in metadata. English and Japanese editions are `reviewed` on the basis
of those independent agent reviews, not an invented human certification.
All twelve article bodies remain byte-identical to that reviewed snapshot.
Original source provenance, authorship and source revisions are unchanged.

## Technical workflow and checks

`pnpm verify` retains formatting, lint, type checks, unit tests, content checks,
production build, search and artifact checks. Browser previews, screenshots,
Playwright/axe and paid rendering are not routine publication blockers; the
owner performs post-release visual review. Existing browser diagnostics remain
available for a specifically requested UI investigation. No browser or visual
acceptance is claimed here.

The public-shaped candidate passed with existing dependencies and Node v24.22.1:

- Formatting, ESLint with zero warnings, React Router type generation and tsc.
- 33 unit-test files / 260 tests, including explicit twelve-edition publication,
  canonical, hreflang, schema, reviewed provenance and partial-publication gates.
- Content validation: 6 source posts, 4 published per language, 18 note editions.
- Full client/SSR build: 116 routes; sitemap: 112 URLs; Pagefind: 4+4+4 records.
- Artifact validation: 464 files, valid local references, initial JS gzip 145.8 KiB.
- Additional artifact checks: 12 article pages, 3 Blog indexes, 9 category indexes,
  navigation links, 3 four-item RSS feeds, retained P2P notes and retired routes.
- All twelve reviewed article body SHA-256 values still match; `git diff --check`.

Tests formerly assuming an empty blog now assert the exact published collection.
The isolated draft/partial-publication fixtures remain and the checks were not
weakened to admit unreviewed editions. No dependencies or lockfile were changed.

## Deployment boundary

The release workflow runs only on pushes to `release`; the source-review branch
cannot deploy. The publication commit must descend from the actual release head
`1d7db9848b608aa90822f9691567585073f0f0e1`, with compare-and-swap fast-forward updates
and no force push. At this record's creation, the production update, CI result
and live HTTP checks are pending; they must be observed separately, not inferred
from this local build. The final handoff records the resulting commit, workflow
run and HTTP evidence. Owner visual feedback remains a post-release activity.
