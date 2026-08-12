# SciData metadata verification policy

SciData's production catalogue contains discoverability metadata, not copies of dataset
files. A record is marked `verified` only when a reviewer has checked both sides of the
publication chain:

1. the Nature Portfolio `Scientific Data` article page, including its article type; and
2. the original repository landing page named in the article's data-availability section.

## Required evidence

Each production record must include:

- the exact article title, type, listed authors, publication year, article DOI, and
  `nature.com` article URL;
- a stable repository landing URL and dataset DOI;
- an explicit repository name, access status, and license;
- formats and research variables only when supported by the article or repository;
- a calendar date recording the latest manual source check;
- one `journal` and one `repository` item in `verification.evidence`;
- the article-cited dataset DOI in `datasetDoi`, with distinct concept or current-version
  DOIs recorded separately when the repository exposes them.

If a metadata field cannot be confirmed, it must be omitted or described as not provided.
It must not be inferred from the article title, abstract, file extension guess, or a search
result snippet.

## What verification means

`verified` means that SciData's descriptive metadata and outbound links matched the two
authoritative pages on the stated date. It does not mean that SciData has independently
reproduced the study, audited every file, guaranteed long-term repository availability, or
determined fitness for a particular scientific analysis.

Repository license and access terms remain authoritative. Users should re-check them before
redistribution or publication.

## Automated gate

`npm run validate:data` checks production invariants before every build: unique IDs and
DOIs, supported article types, required evidence, Nature article URLs, non-Nature
repository URLs, open access, license presence, supported filter facets, and valid verification dates. This structural
gate complements manual source review; it does not replace it.
