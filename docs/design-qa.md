# SciData design and browser QA

Checked on 2026-08-12 from `/Users/mayuanyuan/git/SciData`. This directory is not a Git
repository, so there is no branch or commit identifier to report.

## Evidence

The source concepts are visual direction references generated specifically for SciData.
The implementation captures were taken from the running React application, not from the
concept images.

| State | Design concept | Implementation capture |
| --- | --- | --- |
| Home, desktop | `docs/design/home-desktop.png` | `docs/design/home-implementation.jpg` |
| Explore, desktop | `docs/design/explore-desktop.png` | `docs/design/explore-implementation.jpg` |
| Dataset detail, desktop | `docs/design/dataset-desktop.png` | `docs/design/dataset-implementation.jpg` |
| Mobile navigation and filters | `docs/design/mobile-states.png` | `docs/design/mobile-filter-implementation.jpg` |

## Fidelity ledger

| Area | Verified implementation | Intentional deviation |
| --- | --- | --- |
| Header and hero | The required SciData name, four navigation items, hero headline, description, search placeholder, and five popular searches match the product copy. | The GitHub control is disabled until `VITE_GITHUB_URL` is configured because no repository URL has been verified. |
| Visual system | White background, ink text, muted slate metadata, a restrained teal accent, 1px neutral rules, open sections, and no decorative gradient or glass effect. | Native system sans-serif is used to avoid a network font dependency. |
| Home density | The search is the strongest control; twelve discipline entries and source-verified featured records sit directly below it. | Counts come from the 20-record verified catalogue instead of the large fictional counts shown in the concept. |
| Explore results | Desktop filter rail, compact result records, live result count, sorting, and shareable URL state reproduce the designed discovery workflow. | Pagination is omitted for the 20-record v0.1 catalogue; result count and record metadata always reflect the local JSON. |
| Dataset detail | Metadata hierarchy, source-verification state, article type, article/concept/version DOI distinctions, evidence links, variables, temporal/spatial coverage, formats, license, and citation dialog are implemented. | SciData labels observable source facts as provenance signals and does not claim independent scientific validation or suitability. |
| Mobile | 390 x 844 checks show a single-column result layout, 44px controls, working navigation drawer, scrollable filter drawer, and no horizontal overflow. | The dense desktop result table becomes stacked records, as required for readability. |

## Above-the-fold copy check

The home first viewport contains only the approved product name, navigation, hero copy,
search control, popular searches, and the beginning of the scientific discipline section.
No login, AI label, metric claim, secondary hero CTA, or invented research-source badge was
added.

## Browser acceptance checks

- Desktop viewport: 1536 x 1024.
- Mobile viewport: 390 x 844.
- Home search suggestions appear while typing.
- Search button and Enter navigate to `/explore`.
- `soil carbon`, `china climate`, `rice`, `disease`, `temperature`, `crop yield`, and
  `genomics` all return results in the verified catalogue.
- Search combines with discipline, access, region, format, and year filters.
- Filter, query, year, and sort state survive URL refresh.
- Dataset result records open `/dataset/:id` detail pages.
- Citation dialog opens and the copy action writes the citation text to the clipboard.
- Detail pages expose the checked journal and repository links, article type, license,
  article-cited dataset DOI, and distinct concept/version DOI when applicable.
- Mobile navigation and filter drawers open, scroll, apply state, and close.
- Disciplines, collections, about, and unknown routes render their own page state.
- Repository-subpath preview was exercised at `/SciData/` with working search and detail
  routes.
- No horizontal overflow was observed in the checked desktop or mobile states.
- Production-preview console showed zero errors and zero warnings after adding the local
  SVG favicon.

## Fixes made during QA

- Added ID extraction to the MiniSearch index after the first browser run exposed a
  duplicate-empty-ID runtime error.
- Made Enter submit the typed query even while the suggestion list is open.
- Moved dense result columns to the `xl` breakpoint so tablet widths use readable cards.
- Reduced hero and section height to keep the discovery path visible without losing white
  space.
- Replaced text-like filter expansion marks with Lucide chevrons.
- Replaced 32 demo records with 20 dual-source-verified open records (19 Data Descriptors
  and one Scientific Data Analysis article).
- Corrected cross-sectional, temporal-resolution, article-type, geographic-facet, and
  repository-version semantics exposed by independent metadata cross-audits.
- Renamed `Quality signals` to `Provenance signals` to avoid implying a scientific quality
  rating that SciData has not performed.

## Sign-off

No material visual or functional mismatch remains within the v0.1 scope. Automated
pixel-diff service authentication was unavailable, so fidelity was evaluated by direct
side-by-side image inspection plus browser interaction. This does not claim cross-browser
coverage beyond the browser and viewports listed above.
