# Independent translation and integration review — P2P privacy boundaries

## Result

**Final recheck, 2026-10-25 09:29 UTC: all five findings below are resolved in the corrected integrated artifacts identified in the addendum. Content-fidelity review passes for those exact English/Japanese artifacts and the reviewed controlled-copy split. Browser/layout/runtime acceptance remains not run.** The frozen maps themselves were not edited; their small English issues are corrected by explicit integration overrides, not silently waived.

The complete English and Japanese translations preserve the Chinese article's technical meaning, qualifications, figures, formulas, numerical magnitudes, dates, and citation descriptions. **The initial integrated artifact needs the fixes below before a clean content-fidelity verdict**: notably, the dummy-packet hatch pattern was flattened during CSS conversion, and one English sentence boundary is missing a space. Three additional wording clarifications are recommended. No material Japanese mistranslation was found in the frozen 561-ID map.

This is an independent source-to-target review, not the translator's self-review, an external factual audit, a browser/layout acceptance test, or permission to publish. It supplies local review evidence only; it does not invent an immutable HTTPS `reviewEvidence` URL or change publication/review metadata.

## Reviewer, scope, and method

- Reviewer: `/root/review_p2p_blog_translations`, a separately dispatched review agent; assigned Astra / xhigh. The reviewer did not author the translation maps or integration code.
- Initial review: 2026-10-25, beginning 09:19 UTC; initial report prepared around 09:24 UTC.
- Source range: **IDs 1–561 inclusive**, all **561 Chinese–English pairs and 561 Chinese–Japanese pairs** read, **1,122 source–target comparisons** in total, not a sample. Output truncation around IDs 445–453 was remedied by rereading that range.
- Complete frozen controlled-copy module also read: **100 Chinese/English/Japanese literal triples**, comprising the subsequent 88 P2P triples and 12 translation-tool triples. P2P route, tunnel, and mixing copy was additionally compared with the original uploaded JavaScript as inert text, including every dynamic state; no uploaded code was executed.
- Reassembled English paragraphs were inspected for inline-fragment boundaries. Independent, read-only HTML parsing checked figures, headings, code tokens, numeric-only text, links, and ID/anchor structure. Converter and site-reader source were read, not relied on as a self-review certificate.
- No browsing was required for this pure source-fidelity review. The truth/currentness of the Chinese manuscript's research, provider, and legal-case assertions was not independently reverified. Their qualifications and dates were preserved.
- No repository edits, push, deployment, publication, package installation, or browser automation were performed by this reviewer. The report is the only review artifact authored here.

## Exact reviewed identities

All hashes are SHA-256, checked locally before review. File paths are relative to `/workspace/scratch/18c2ea5450a4/`.

| Artifact | SHA-256 |
|---|---|
| `new-blog-article-input/p2p-privacy-boundaries/source-strings.json` | `8e557f096339275e7afbdf616050a418cdb1a5087c17698ea784b658d212206f` |
| `new-blog-article-input/p2p-privacy-boundaries/en.json` | `662aa54b04274043b1c287b130f3a36a9981192c201dc08a6c2f0a8e5ab317df` |
| `new-blog-article-input/p2p-privacy-boundaries/ja.json` | `a87fd32b69b10e83fbfaa5f839719f645907bb918930f6f2cdb23fdbc5f556d2` |
| Original `dennysora-new-blog/src/lib/article-demo-copy.ts`, now preserved as `new-blog-article-input/p2p-privacy-boundaries/article-demo-copy-reviewed-source.ts` | `9ea7d7c0a6647d093f318bae7a4c0b30be8045f5c854ccd0e8f70207b4606948` |
| `new-blog-article-input/p2p-privacy-blog (1).html` (read as text only) | `3ccb46b68985e1f4e635d5e6fab67ceb516c9c6ac19f960de32f9eb7f2432306` |
| `new-blog-article-input/p2p-privacy-boundaries/zh-inert-source.html` | `129b9c0ce6983ac5fff44d3ca72ab8f840c077889892e05daafa152d10779b0b` |
| `new-blog-article-input/p2p-privacy-boundaries/integration-excluded-segments.json` | `3fca85af749b4f19c1f442051f434f13f78c2ab446403bfa868b524ccfa78520` |

Initial integrated observations, **not a blanket approval of subsequent changes**:

| Artifact in `dennysora-new-blog/` | SHA-256 at observation |
|---|---|
| `content/posts/p2p-privacy-boundaries/en.html` | `d8275cf97dcf4b82592e19cffe3300985648f62a01689efdefa1289fb28a73eb` |
| `content/posts/p2p-privacy-boundaries/ja.html` | `08cf678dd95fbe20aed45bcfd9033a8db89f019817149b0129bb39dee87a0463` |
| `content/posts/p2p-privacy-boundaries/zh-hant.html` | `69f605cfde39b13394ef09e71f1b931a576c608c93f927b01b6670ee92ca0df3` |
| `src/styles/privacy-guide.css` | `6318682c14ea2e1f4dccd77a1736d4d4b73de8c052048446801890c533b514fc` |
| `src/lib/article-demos.ts` (additional dynamic copy inspection) | `02cb29b2d799b26654b2513347e196bbc520a4b8355f51e8b9f342d88413daad` |
| `content/posts/p2p-privacy-boundaries/meta.json` | `80db79e3ff3f07c3131436981fa6c04fe4ec029ad4077d068876e5519e1f7814` |

The integrator announced a structural split of the controlled-copy module during review. The byte-identical snapshot above was verified; any newly split artifacts require equality checks or a separately recorded delta review.

## Concrete findings and suggested fixes

### P2P-R1 — Diagram meaning regression: dummy hatching disappears

- **Priority:** required integration fix; affects all locales.
- **Source ID:** **293**, supported by 286–295, figure 07.
- Source meaning: solid-filled blocks contain real data; hatched blocks denote dummy data. Removing the obsolete blue/amber color names is permissible only if the non-color distinction remains true.
- Evidence: initial `src/styles/privacy-guide.css`, `.pg-packet.pg-dummy`, used:

  ```css
  background: repeating-linear-gradient(45deg,
    var(--color-surface) 0, var(--color-surface) 3px,
    var(--color-surface) 3px, var(--color-surface) 6px);
  ```

  Identical gradient stops cannot produce visible hatching. The multilingual legend still says hatching identifies dummy packets, so this is an actual diagram/legend mismatch, not a translation preference.
- Suggested fix: use distinct site-token stripe/background stops, keeping a real solid-versus-hatched distinction; maintain a distinguishable non-color alternative in forced-colors mode. Review the final CSS and, when separately authorized, render it visually.
- Initial status: reported immediately to integrator/root; integrator acknowledged and is correcting it.

### P2P-R2 — Missing English space at an inline fragment boundary

- **Priority:** required small copy fix.
- **Source IDs:** **123–124**.
- Frozen EN123 ends `...the same number.`; EN124 begins `Keeping only an ` with no leading separator. The integrated paragraph contains **`number.Keeping only an`** (confirmed by parsing rendered HTML text).
- Suggested fix: prepend a space to EN124 (` Keeping only an `), or add a boundary-safe explicit editorial override that yields `number. Keeping`. Do not globally insert spaces across every fragment, since punctuation/code boundaries differ.
- The similar scanner results around IDs45–46, 49–50, and 53–54 are **not** this defect: those pairs have actual `<br>` boundaries.
- Initial status: reported; integrator acknowledged.

### P2P-R3 — Clarify the direction of privacy protection in English

- **Priority:** recommended clarity fix, not a changed technical claim.
- **Source ID:** **69**.
- Current phrase: `which intermediate observers and which endpoint information you want protection from` incorrectly groups endpoint information with observers as something to protect *from*. The surrounding Chinese argument concerns protecting endpoint information from selected observers.
- Suggested replacement sentence: **`The real questions are which endpoint information to protect from which intermediate observers, and whether that information can be linked to other data.`**
- Japanese already expresses this relation clearly.
- Initial status: reported; integrator acknowledged.

### P2P-R4 — Preserve the explicit “not an anonymity score” statement

- **Priority:** recommended clarity fix.
- **Source ID:** **275**.
- Current English ends `it depends on the chosen candidate and probability models, not on an anonymity score read directly from a traffic plot.` This describes what entropy does not depend on rather than explicitly saying it is not such a directly readable score.
- Suggested ending: **`It depends on the chosen candidate and probability models; it is not an anonymity score read directly from a traffic plot.`**
- Japanese accurately retains the explicit distinction.
- Initial status: reported; integrator acknowledged.

### P2P-R5 — Avoid “training data” ambiguity in dynamic Japanese accessibility text

- **Priority:** recommended clarity fix in additional dynamic copy, not the frozen map.
- **Source anchors:** ID187/197/208 and the upload's dynamic `trace-svg-desc`; integrated `article-demos.ts` trace description.
- Current Japanese begins `合成した学習用データ`. In an article discussing machine learning, this may imply model-training data; the source `合成教學資料` means synthetic educational/demo data.
- Suggested replacement: **`教育用の合成データ`**, consistent with frozen JA187. Preserve the 40 × 0.5-second windows, 0–320 KiB/s scale, chosen mode, alignment value, and the disclaimer that correlation is not a matching probability.
- Initial status: reported to integrator.

## Coverage, references, and numerical anchors

- Source and both translation maps each have **561 IDs**, the same exact ID set, with nonempty strings.
- Independent inventory includes all prose, inline fragments, controls, table labels, 38 SVG text strings, 3 SVG titles, 3 SVG descriptions, 8 diagram/table region aria-labels, and the source navigation aria-label.
- Each initial integrated locale preserves **9 figures**, **14 H2 sections**, and the same **35 external citation hrefs in the same order**, including their exact URLs from the original uploaded HTML. No local citation anchor is broken; no duplicate IDs were found. The separate `#article-title` return link resolves through the site-owned header.
- All **10 code-element text occurrences** remain identical: `infohash`, `info`, `get_peers`, `announce_peer`, `IP:port`, `private`, `xₖ`, `yₖ`, `r = 0.91`, `3/m`.
- All **45 non-control numeric-only text nodes** match the original article, in order, in all three integrated locales. Removed numeric TOC prefixes and numeric control defaults are separately represented by site TOC / controlled inputs, not body-data loss.
- Formula strings retain the source operators, indices, symbols, and units: IDs217–219; 264–267; 274–276; 326–327; 334; 462–464.
- Explicit magnitude check: ID453 **`1.48 億` = `148 million`** and **`20 億` = `2 billion`**; Japanese retains `1.48 億` and `20 億`. The source's 2009-05-13 through 2009-08-23, 103 days, and 2010 publication context are unchanged. No 10× or 100× magnitude error was found.
- Other checked anchors include 20 bytes/SHA-1/SHA-256 (105); 40 windows × 0.5 s = 20 s and 1.5 s delay (197/208); 1,000,001 candidates, 90% TPR, FPR 10⁻⁵, 10 expected false positives, 8.26%/91.74% (249–267); FPR 10⁻⁵ / TPR 0.12 versus personal 12% risk (307); 10/7/3 MiB (325); 20 Mbit/s, 86,400 s, 216 GB, 10 GB, 206 GB, 2,060% (330–334); 50 ms versus an unbounded exponential delay (442–443); and 300,000 / 3/m / 10⁻⁵ (462–464).
- Citation/date/version language is retained, including the source access date 2026-10-25, 2026-07-28 CODA announcement, 2026-09-03 wiki update, 2026-06-17 provider policy, 2023 RAM-only migration, 2025-03-28 DAITA v2 announcement, libtorrent 2.1.0, old I2P 0.8.1/2010-11, and CCS 2026-11-15–19 being future as of the article date. These are fidelity checks, not independent factual verification.
- The translations preserve crucial limits: VPN trust shifts rather than disappears; no-log differs from RAM-only; observation capability differs from retained logs; a peer knows data it receives; correlation is not identity/probability; provider statements are not an independent audit; Tor/Loopix/DeTorrent results are not blanket BitTorrent guarantees; and the Nyaa announcement does not disclose a reconstructable method or prove VPN use or cryptographic compromise.

## The 42 excluded inventory IDs

Independent parsing confirms exactly **519 used unique source IDs** and these **42 omitted from the inert body**:

`1–7, 12–27, 40–43, 155–156, 188–194, 252–254, 353–355`.

They are not 42 missing body paragraphs:

| IDs | Disposition independently checked |
|---|---|
| 2–3 | Combined into the site-owned multilingual article title in `meta.json`. |
| 4 | Site-owned multilingual lede is a shortened paraphrase. It preserves the VPN/rhythm distinction and download/protocol/path/cost framing; the detailed explanation remains in the body. It is not a verbatim relocation. |
| 5–6 | Author and dates move to metadata/site byline. Because published and updated dates currently match, the renderer displays one date rather than a redundant “Updated” label. |
| 1, 7 | Original eyebrow and promotional “diagrams, interactions, primary sources” chrome are omitted/replaced by site taxonomy. They are **not literally all relocated into meta.json**; their omission removes no factual body argument. |
| 12–27 | Standalone mobile TOC wording is replaced by the site's localized TOC built from the preserved headings. It is navigation/chrome replacement, not section loss. |
| 40–43 | Route selector labels exist in controlled copy. |
| 155–156 | Tunnel simulation control and explicit no-network-operation disclaimer exist in controlled copy. |
| 188–194 | Trace mode/alignment/play controls exist in controlled copy and owned input code; initial lag 0.0 s is represented dynamically. |
| 252–254 | Candidate count/FPR/TPR controls exist in controlled copy and owned input code with the source numeric options and default 90% TPR. |
| 353–355 | Next/play/reset mixing controls exist in controlled copy. |

No substantive prose paragraph, formula, data table, research limitation, or reference was lost through these exclusions. This conclusion concerns content retention and control-copy implementation, not proof of browser execution.

## Editorial style overrides

- **ID197:** removing “blue/amber” preserves the mathematical scales, 40 half-second windows, 20-second interval, entry **solid** line, exit **dashed** line, alignment direction, and exclusion of out-of-range values. The initial CSS retains the exit dash array; the shape-based rewrite is semantically acceptable.
- **ID293:** removing color names is acceptable only while retaining actual filled-versus-hatched packet distinction and dummy meaning. Preferred English: **`Solid-filled blocks contain real data; hatched blocks represent dummy data.`** This wording is acceptable, but P2P-R1 must be fixed in the diagram as well.

## Remaining acceptance boundary

The integrator owns fixes and final artifacts. Frozen map review findings and final integrated acceptance must not be conflated. Revised exact hashes and recheck results should be recorded below before claiming all findings resolved. Browser/layout testing remains **not run**; no visual overflow, reduced-motion behavior, or runtime accessibility certification is implied.

## Final correction recheck — 2026-10-25 09:29 UTC

The integrator supplied revised frozen artifacts. This independent reviewer verified their hashes, read the changes, and reran read-only structural/content checks. **P2P-R1–R5 are resolved in the inspected corrected integration.**

| Finding | Recheck evidence |
|---|---|
| R1, dummy hatching | `.pg-packet.pg-dummy` now alternates `--color-entity-kind` and `--color-surface` at the 3px boundary. These tokens resolve to distinct values (`#ccafff` / `#131c27`) in the inspected site tokens. `article-demos.css` supplies `border: 2px dashed CanvasText` for dummy blocks in forced-colors mode. This fixes the static style semantics; visual rendering has not been tested. |
| R2, sentence boundary | Parsed final English paragraph contains `...the same number. Keeping only an IP:port...`, with the missing boundary restored. |
| R3, protection direction | Final EN69 now says `which endpoint information to protect from which intermediate observers`. |
| R4, entropy definition | Final EN275 explicitly says `It is not an anonymity score read directly from a traffic plot.` |
| R5, Japanese dynamic accessibility wording | `privacy-demos.ts` now starts the dynamic trace description with `教育用の合成データ`; numerical values and probability disclaimer remain intact. |

`translation-corrections.json` records only the reviewed EN69/124/275 clarifications and EN293's shape-based legend rewrite. The rewritten ID293 retains horizontal time direction, rectangle height/packet size, real-data/dummy distinction, and waiting until the next time slot. The reviewed source maps remain byte-identical to the original frozen hashes.

### Exact final artifacts

Paths below are relative to `/workspace/scratch/18c2ea5450a4/`.

| Artifact | SHA-256 |
|---|---|
| `dennysora-new-blog/content/posts/p2p-privacy-boundaries/en.html` | `1d2763e6f37dd8ed6397e362ed27fc6456eb70a82f7033996ff6a97b09a81a5f` |
| `dennysora-new-blog/content/posts/p2p-privacy-boundaries/ja.html` | `77018ed727bb982177b0d792a50a79a1807d7e9025718105b48c293611f3641d` |
| `dennysora-new-blog/content/posts/p2p-privacy-boundaries/zh-hant.html` | `ecd385241ceef11e4186beb93d0489b331d914ac26469361381a426d49e320b3` |
| `dennysora-new-blog/src/lib/privacy-demo-copy.ts` | `417f1d3200833916d52624b3a953b50723267316ba6138dc96cf6ff788cf008e` |
| `dennysora-new-blog/src/lib/translation-demo-copy.ts` | `c0e404e6c009fcbaadf66ca94f1376da452e88ce453321a4e4d8a5137d4efa2c` |
| `dennysora-new-blog/src/lib/privacy-demos.ts` (copy inspection only, not a complete runtime/code review) | `233c8e2c089af4ac1db08279671359645c0e4f7c178b4f740a08ab02e5e31c24` |
| `dennysora-new-blog/src/styles/privacy-guide.css` | `9d868986689bf2829dea84b8eddd0d35320559c311c4e55453d5965a2a4ff16d` |
| `dennysora-new-blog/src/styles/article-demos.css` (forced-colors fallback) | `4e4b7380154ca5b4b618dd89f3f73c9559993bd418f5ee84b44b420455133f9d` |
| `new-blog-article-input/p2p-privacy-boundaries/translation-corrections.json` | `d3aab9809aa22c457044b88f9fe13d06a6088e988e37cd2ca6909adddd067379` |

### Final independent consistency checks

- Literal-triple multiset comparison: the original **100** reviewed Chinese/English/Japanese triples equal the final **88 privacy + 12 translation-tool triples**, exactly, with no lost, added, or changed triple. The structural split does not invalidate the copy review.
- An independently reconstructed expected DOM used the frozen source strings/maps plus the explicit reviewed overrides, without importing or running the integrator's renderer or uploaded code. For **both final EN and JA**, all **869 HTML elements** have the same tag sequence as expected; comparison of every normalized text/tail yielded **zero differences**. All localized aria-label/title attributes also match exactly after whitespace normalization. This covers all **519 retained unique source IDs**.
- The final EN and JA each still contain **9 figures, 14 H2 sections, and 35 external source links**. Earlier full source-to-translation review covers the remaining 42 metadata/navigation/control inventory IDs as described above.
- Source, EN map, and JA map hashes were rechecked after integration and remain unchanged. Their unmodified contents must not be substituted for the corrected final HTML without also applying the reviewed correction file.
- Final acceptance is limited to translation/content fidelity and the specific static diagram corrections above. No deployed artifact, browser screenshot, live DOM behavior, independent source fact-check, or immutable HTTPS review evidence was established by this review.
