# Visual Library — the delivery surface

A Canva-style gallery for browsing, exporting and approving the LinkedIn visuals you generate from this design system. This is how a set of visuals is presented to a client and kept as proof.

## What it does
- **Hero + reel.** One large visual on the stage, a horizontal scrollable rail of every visual beneath. Click any thumbnail to bring it to the hero.
- **Per-visual ⋯ menu** (on the hero toolbar and on each rail item):
  - **Download as PNG** — rasterises the artboard at its true **1080 × 1350** and downloads a `.png`.
  - **Download as HTML** — exports a **standalone, editable** `.html` file: the artboard markup plus the resolved brand-layer tokens and headline-signature CSS inlined, with the webfont linked. Opens and renders on its own.
  - **Add to design system** — the approval → learn step (below).
- **Approve → learn loop.** When a client approves a visual, *Add to design system* marks it (a green ✓ "In design system" badge) and records it in `localStorage` (`li-vds-approved-v1`). The header shows how many are *feeding the system*. Approved visuals are the queue the design system grows from — the design agent folds recurring approved patterns into real components and templates. (The `BrowserMock` component is exactly that: the "catalog of homepages" pattern, learned and promoted into a reusable primitive.)

## Files
- `index.html` — loader + mount. Loads `styles.css`, `_ds_bundle.js`, React, `html-to-image`, then the two JSX files.
- `sampleVisuals.jsx` — six sample visuals built from the DS components (single, infographic/catalog, quote, carousel cover, section result, case study). Replace these with your own `{ id, label, type, render() }` entries.
- `VisualLibrary.jsx` — the gallery shell: hero, reel, ⋯ menu, export logic, approve/persist, toasts.

## Plugging in real visuals
Each visual is `{ id, label, type, render() }` where `render()` returns a `1080 × 1350` `<Canvas>` tree built from the design-system components. The Library scales it for preview and exports it at true size — so a visual added here is automatically browsable and exportable.

## Notes
- PNG export uses `html-to-image`; webfonts are fetched at export time — if a custom (non-Google) font is set in the brand layer, make sure it's reachable or it falls back.
- HTML export inlines the `:root` tokens (including any live Tweaks overrides) so the file is self-contained and recolourable.
