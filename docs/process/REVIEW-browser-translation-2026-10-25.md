# Independent translation and static-integration review

- **Article:** Browser Script Manager / `browser-translation-architecture`
- **Reviewer:** Agent 4, independent review role (Astra / xhigh)
- **Completed:** 2026-10-25 09:39 UTC
- **Result:** **PASS for source fidelity, EN/JA wording, and the inspected static integration only**, at the exact hashes below. No unresolved findings in this scope.
- **Sole implementation owner:** `/root/adapt_new_blog_articles`. The reviewer did not modify the original manuscript, raw translation maps, rendered article, or demo implementation.

## Work actually performed

1. Read all **957 source IDs against both EN and JA: 1,914 complete pairs**, including the header and controls later replaced by the site shell/owned UI. This was not a keyword-only or sampled review.
2. Parsed the original uploaded HTML as data, without executing its JavaScript. Independently reproduced the complete 957-item source inventory, exactly equal in IDs, source strings and contexts. The original SHA-256 matches the imported-manuscript metadata. The original provides no author metadata; `author: null` correctly avoids inventing authorship. No commit-based provenance or hosted review evidence was fabricated.
3. Checked meaning, negation, qualifications, request/result identities, generations, cancellation versus actual termination, local-read failures versus misses, persistent quota debits versus concurrency release, optional sync/privacy boundaries, and the distinction between ready-to-display and saved results.
4. Checked all numeric/formula differences and literal examples, including UTF-16 ranges, thresholds and unit distinctions; preload/EMA/direction formulas; glossary matching order; batch thresholds; quota-window cases; token estimation; retries; persistence limits; rendering budgets; HTTP error categories; and encryption identifiers. Digit-token differences were legitimate language conversions/reordering (for example 20 萬 → 200,000), not changed values. All 11 original table texts and all 45 number-only text nodes survive into the inert source.
5. Read assembled mixed-node prose and sample output, rather than only the JSON maps. Independently reconciled **2,868 text/attribute slots per locale, including whitespace-only slots**, against the inert source, raw maps, and correction ledger. Exactly **942 distinct IDs** occur in each article body. The only normalized content deviations outside those maps are two explicitly scoped EN full-stop localizations described below.
6. Checked all final SVG title/description texts, diagram/region labels, ID references, source links, nontext SVG attributes, and numbers outside the translation inventory. Both locales retain **18 figures, 15 H2 sections, 11 tables, 14 links**, **6 SVG title/description pairs**, **5 `aria-label` values**, and **2 decorative connector SVGs with `aria-hidden="true"`**. SVG geometry, IDs and nonlocalized attributes are invariant. ARIA references resolve; fragment links resolve locally except `#article-title`, deliberately owned by the site shell. Both original external reference URLs are retained.
7. Read the complete owned `translation-demo-copy.ts`, `translation-demos.ts` and the `lookaheadMargins` model. Reviewed all localized control labels, validation/zero-margin descriptions, direction-dependent labels, status interpolation, local-only notice, and SVG-download accessible-name construction. The source formula and static 800px/1000px example agree with the owned model and displayed values. This was source inspection, **not execution or runtime acceptance**.

## Retained versus replaced IDs

`integration-excluded-segments.json` is accurate: the body omits exactly **1–4, 8, 410–419**.

- **1–4, 8:** standalone-page header/title/subtitle/date material, replaced by site metadata/shell presentation. Localized title and summary metadata were also inspected for fidelity.
- **410–419:** original controls replaced by owned interactive UI. Their meanings are present in the owned copy; the original local-only/no-translation-service disclosure (410) was initially missing and was restored by the integrator during review. Its three-language copy and insertion into the controls are independently confirmed.
- Every other source ID is present. No article-body section was silently omitted.

The Chinese result values **661–662 (`再見。`, `你好。`) remain intentionally Chinese in both languages**, because the example explicitly targets Taiwan Traditional Chinese. The Japanese ruby/source examples `漢（かん）字` and `漢字` are also intentionally preserved as data, not untranslated prose. The source sentence and placeholders in the glossary example remain code/data literals.

## Findings and independently confirmed corrections

All changes below were reported to and made by the sole integrator, then re-read in the final assembled article. Raw `en.json` and `ja.json` remain byte-identical to the handed-off maps.

| Finding | Location | Original problem | Final correction and recheck |
|---|---|---|---|
| F1 — algorithm-example fidelity | JA 496–497, Figure 06 | Marker reply `⟦1⟧で使われるのは⟦2⟧。` restored into a different grammatical construction, implying a rewrite rather than just placeholder substitution. | JA 497 override is `→ ラストベルトで使われるのは Rust 言語。`. The restored construction now matches the marker reply. |
| F2 — unsegmented sample punctuation | EN Figure 06, after the second placeholder beside 496 | Marker response ended in inherited `。`, while the localized restored result ended in `.`. | Exact marker-sentence tail localized to `.`. Renderer has a one-occurrence assertion; no global punctuation replacement. |
| F3 — mixed-node boundary | EN 299–300 | Link and access date joined as `service worker lifecycle(accessed …)`. | Leading space in EN 300 override; assembled output is `service worker lifecycle (accessed 2026-10-25).`. |
| F4 — unsegmented prose punctuation | EN 404 link tail | `Browser text segmentation。` retained the standalone Chinese punctuation. | Exact link tail localized to `.` with a one-match renderer assertion. |
| F5 — mixed-node boundary | EN 441–442 | Original source whitespace caused `max(120px, 0.35H) .`. | Renderer strips inherited leading whitespace for EN 442 only; assembled text is `max(120px, 0.35H).`. |
| F6 — mixed-node boundary | EN 956–957 | Footer sentence and link joined as `individual SVGs.Back to article top`. | Trailing space in EN 956 override; both are now separated in the assembled text. |

**Additional integration correction:** ID 410 is restored through `demoLabels.localOnly` and a paragraph at the top of the owned controls. It accurately states that inputs are only for the page's formula illustration and do not call a translation service. This was verified after the integrator's proactive restoration; it is not counted as an additional reviewer-originated finding.

## Hash-bound evidence

Paths are relative to `/workspace/scratch/18c2ea5450a4`. The JSON companion `independent-review-audit.json` records the same final artifacts and check counts.

### Input and initial output hashes

- Original manuscript: `05f216991fa9d35b2897f034d95f1d834fb9b643f974d7ce95fa6d121b8ec945`
- Source inventory: `5cf0cd27681b0982c71867247486991afaa2a757b65845107ea62d805f0ff9be`
- Raw EN map: `2b6a481e10d4d7944e1065910bb5e6e8e819b9f1fe5502da88ae004218ea3413`
- Raw JA map: `49992f022c48815cdef2b68d68bdb2fb5ba9d4578be33fc9cbc3413b3c5e9647`
- Initial reviewed EN HTML: `d5855f793ca1c5b1b22b1cdf54b323818d9ac096273d70128e6965dd281acb43`
- Initial reviewed JA HTML: `0bbf80a6c1df27e1a1b14036beba58a474521e775b5b330d5bb72d5c0e7851ab`

### Reviewed final files

- `new-blog-article-input/browser-script-manager-translation-v1(1).html`
  - SHA-256: `05f216991fa9d35b2897f034d95f1d834fb9b643f974d7ce95fa6d121b8ec945`
- `new-blog-article-input/browser-translation-architecture/source-strings.json`
  - SHA-256: `5cf0cd27681b0982c71867247486991afaa2a757b65845107ea62d805f0ff9be`
- `new-blog-article-input/browser-translation-architecture/en.json`
  - SHA-256: `2b6a481e10d4d7944e1065910bb5e6e8e819b9f1fe5502da88ae004218ea3413`
- `new-blog-article-input/browser-translation-architecture/ja.json`
  - SHA-256: `49992f022c48815cdef2b68d68bdb2fb5ba9d4578be33fc9cbc3413b3c5e9647`
- `new-blog-article-input/browser-translation-architecture/zh-inert-source.html`
  - SHA-256: `be47f9b9968ccc79dc88a93772a8c171ed54769d25d2ee192464e2b733a6baf1`
- `new-blog-article-input/browser-translation-architecture/translation-corrections.json`
  - SHA-256: `f0516ab7dd75a4f462d83286b99faa54b506e9c8616e4cf7cf57ce4760f4f48e`
- `new-blog-article-input/browser-translation-architecture/integration-excluded-segments.json`
  - SHA-256: `d9cb6b53ebe27eda649e13ca68287af539e5b7848636866d12e51fcd8e43a2bd`
- `new-blog-article-input/render-translations.py`
  - SHA-256: `3f0c5aeb76cade2f48218a5d2470ebf89a3773dc9c21625dcf0d6de99965e135`
- `dennysora-new-blog/content/posts/browser-translation-architecture/zh-hant.html`
  - SHA-256: `3fe6609e5c23387564220239f2bc024b3a87a2fd7092698fb6bc804cc4328594`
- `dennysora-new-blog/content/posts/browser-translation-architecture/en.html`
  - SHA-256: `df2ee0ca2602c47ad9152b8975293a179472ae197841c7694df0d39776bbba2a`
- `dennysora-new-blog/content/posts/browser-translation-architecture/ja.html`
  - SHA-256: `a6e4005cb9faf6f59ac602c1b2a32eca9ab770c3abd033a647fa56ab727964ff`
- `dennysora-new-blog/content/posts/browser-translation-architecture/meta.json`
  - SHA-256: `9705aa87e1b077b156e36c10c4f55ab362d0804b25b2e613b5521e31d9f93c38`
- `dennysora-new-blog/src/lib/translation-demo-copy.ts`
  - SHA-256: `0fc479dec46524418db6910308c3254b2ca9bcb2a96160abac895f1485cef350`
- `dennysora-new-blog/src/lib/translation-demos.ts`
  - SHA-256: `cb165ca5cbdd3a8dfae2a6150cb20b8e899d4c3bd4fdcdcd078aa92634104e2d`
- `dennysora-new-blog/src/lib/article-demo-models.ts`
  - SHA-256: `5b6cf5c1a2b8306f5d2fe2b850b24dfd67ee11423a3775519d9effe329453231`

## Limitations and publication boundary

- This report is **not browser, visual, responsive-layout, screen-reader, accessibility-conformance, download, offline-operation, network, security, or performance acceptance**. No screenshot or runtime behavior was inspected. Static accessibility labels/references were checked only as stated above.
- The source's project-specific architecture claims were reviewed for translation fidelity, not revalidated against the extension's implementation or third-party documentation. Linked external pages were preserved, not independently fact-checked.
- No source HTML script was executed; no packages were installed; no browser, push, deployment, or publication was performed by this reviewer.
- Metadata remains `draft`; EN/JA remain `machine-draft`, and `reviewEvidence` remains `null`. This local hash-bound review does not manufacture an HTTPS review-evidence URL or authorize publication.
- Any subsequent content, correction-ledger, generator, metadata, or demo-copy changes require a relevant recheck; this sign-off applies to the hashes recorded here, not future revisions.
