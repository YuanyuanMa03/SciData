# SciData visual specification

The generated concepts in this directory are design references only. All interface text,
controls, dataset records, navigation, search, filtering, and metadata are implemented as
native React components.

## Direction

- Background: true white (`#ffffff`), with neutral secondary surfaces only.
- Type: ink black, muted slate supporting text, modern sans-serif with editorial hierarchy.
- Accent: low-saturation deep teal-blue (`#075577`).
- Containers: open sections, horizontal rules, compact metadata rows, restrained cards.
- Borders: neutral 1px rules; shadows are exceptional rather than the default.
- Radius: small to medium; avoid pill-heavy or dashboard-like framing.
- Icons: Lucide outline icons, generally 1.5px stroke.
- Responsive: 44px minimum mobile controls; desktop filter rail becomes a drawer.

## Type scale

- Display: 56–64px desktop / 40px mobile, 700 weight, tight line height.
- Page title: 38–48px desktop / 32px mobile.
- Section title: 24–30px desktop / 22–24px mobile.
- Record title: 17–19px, 600 weight.
- Body: 15–18px, line-height 1.55–1.7.
- UI chrome: 13–15px, deliberate weight and line-height.
- Metadata labels: 12–13px; mono is used sparingly.

## Component families

- Header and responsive navigation.
- Large and compact search fields with suggestions.
- Open discipline rows with consistent icon treatment.
- Featured dataset cards and dense result rows.
- Checkbox filter groups, year range fields, sort select, mobile filter sheet.
- Metadata definition lists, section anchors, quick facts, dialogs and copy feedback.

## Allowed first-viewport copy

- SciData
- Explore
- Disciplines
- Collections
- About
- Find the data behind science.
- Explore open scientific datasets across climate, health, biology, agriculture, earth science and more.
- Search datasets, variables, regions, topics...
- Popular searches:
- Global climate
- Soil carbon
- Disease
- Crop yield
- Genomics

No hero eyebrow, product metric, secondary CTA, AI label, or login action is part of the
approved visual language.
