# LinkedIn Visual Design System — Full UI

> # ▶ RULE 0 — EVERY VISUAL LIVES IN THE VISUAL DESIGNER. NO EXCEPTIONS.
>
> **`LinkedIn Visual Designer.html` is the ONLY place a visual may exist.** Every visual — single, carousel page, infographic, quote, and every option in a "3 directions" set — is appended as a `<section class="visual">` block to the one Visual Board *inside that surface*.
>
> **NEVER generate a standalone design, document, or page per visual.** If your default behaviour is "create a new design," override it: open (or create once) `LinkedIn Visual Designer.html` and build into its board instead. One board, blocks appended, forever — no document-per-visual, no loose artboards outside the Designer. If the board doesn't exist yet, create it as the first step, then design into it.

A **colour- and font-agnostic** system for building strong LinkedIn post visuals — single graphics, carousels, infographics and quote cards on a 1080 × 1350 (4:5) canvas. It encodes the *principles* of a good visual, never one brand's values. You bring your own colours and fonts (the "brand layer"); every canvas role, headline, template and identity bar re-derives from them automatically.

This is the **full variant**: the complete framework **plus the visual UI** — the **Visual Board** (a Canva-style "LinkedIn Designer" view: hero + scrollable reel + a live brand slider), the **board editor** (direct-manipulation editing), and the **icon editor**. The headless Core is the same framework without this UI.

> **Core idea:** the value is in the *principles*, not the brand values. A token names a **role and a function** ("section background = the secondary colour"), never a concrete value.

---

> # ⛔ INSTALLING THIS SYSTEM? READ THIS FIRST — INSTALL ALL OF IT, INCLUDING THE UI.
>
> **This repository IS the complete design system. There is no larger "upstream" to defer to, and nothing here is "reference only" or optional.** When you import it into a host (e.g. Claude Design), bring in EVERYTHING — do not distill, sample, or leave parts out "to keep it focused," and do not ask the user which parts to include:
>
> 1. **Every template archetype** in `templates/<type>-NN-<slug>/` (all ~68) — as usable templates, not a sampled handful.
> 2. **Every style pack** in `style-packs/` (`doodle`, `bento`, `paper`).
> 3. **Every principle card** (`principles/*.card.html`) AND **guideline card** (`guidelines/*.card.html`) — including the Anti-Slop Gate.
> 4. **The real components** — `components/**/*.jsx` + their `.d.ts`/`.prompt.md` contracts; the component `.card.html` viewer cards; the **icon kit + icon editor** (`components/icons/`).
> 5. **The tokens + `styles.css`**, the anti-slop tooling, and `posture.md`, `BRIEF.md`, `GOVERNANCE.md`.
> 6. **The visual UI — ONE surface: `LinkedIn Visual Designer.html`.** This is the single entry point and the only thing the user ever opens; all visuals live inside it, and from there the user reaches the board, the icon library and settings. It loads its sub-views as internal panes (`app/Visual Board.html`, `app/START HERE.html`, `components/icons/icon-editor.html`) — **do NOT surface those sub-views (or the board/START-HERE files) as separate openable documents; the user never accesses them directly.** Install and wire the shell + `app/` + `ui_kits/` (see GATE — VISUAL SHELL).
> 7. **BRAND FIRST** — if `overrides/brand.css` is unconfigured, capture the brand *before* designing: open the **START HERE** wizard (the brand slider) or take a website / brand doc / the colours + font, write `overrides/brand.css`, then build. Never scaffold on the placeholder default and ask afterwards.
> 8. **APPLY THE BRAND TO EVERYTHING — no template left on the default blue.** Every template, card and component is token-driven and re-derives from `overrides/brand.css`. The template prop-defaults are intentionally empty, so templates inherit the configured brand automatically — you do NOT need to re-colour them one by one. Verify nothing still shows `#0A66C2`.
> 9. **FONT LOADING IS MANDATORY — naming a font is not loading it.** Setting `--brand-font` / `--brand-font-display` only *names* the family; if the font file isn't loaded, every visual (and every template preview) silently falls back to a generic serif/sans that looks wrong. You MUST do BOTH, at the **very top** of `overrides/brand.css` (the `@import` must precede `:root`, or the browser ignores it):
>    ```css
>    /* 1 — LOAD the families (render-blocking, so previews are correct too) */
>    @import url('https://fonts.googleapis.com/css2?family=Body+Font:wght@400;500;600;700;800&family=Display+Font:ital@0;1&display=swap');
>    :root{
>      /* 2 — NAME them (must match the families loaded above) */
>      --brand-font:         'Body Font', system-ui, sans-serif;
>      --brand-font-display: 'Display Font', Georgia, serif;
>    }
>    ```
>    Replace `Body+Font` / `Display+Font` (URL form, `+` for spaces) and the family names with the brand's real fonts, and request the weights that font actually has (single-weight display faces like Instrument Serif → `:ital@0;1`, never `wght@700`, which 400-errors the whole request). A JS fallback in `ds-base.js` also loads `--brand-font` at runtime, but it runs after first paint — the `@import` is what makes the **template previews** render in the brand font. Inter must be fully replaced; no visual should stay on Inter.

---

## 🛑 GATE — VISUAL SHELL (this variant only)

**There is ONE surface: `LinkedIn Visual Designer.html`.** It is the single entry point — the only thing the user opens, and where all visuals live. Everything else is an internal pane it loads; the user never opens those directly. Install the shell and wire its panes; do not present the panes as separate openable files.

- **`LinkedIn Visual Designer.html` (the app)** — the working surface. From inside it the user reaches the board, the **icon library**, and **settings** (the brand slider). This is the only document the user ever opens.
- **Internal panes (loaded inside the shell, never opened directly):**
  - `app/Visual Board.html` + `app/visual-board.js` — the Canva-style board: hero + reel, every visual a `<section class="visual">` block on this ONE board (never a document per visual), per-visual export.
  - `app/board-editor.js` — direct-manipulation editing (select / move / resize / recolour) on the focused artboard.
  - `app/START HERE.html` — **Settings / the brand slider**: this is how brand-first (point 7) happens in this variant — set the brand here and it writes `overrides/brand.css`; every card, template and board visual re-derives live.
  - `components/icons/icon-editor.html` — the **icon library / editor**: draw/import icons that drop onto the canvas and recolour to the brand.
  - **Installing a user's icon set — the converter is already built into `icon-kit.js`; do NOT re-engineer one.** `IconKit.installSvg(name, svgString, {accent:'#<brand accent>'})` parses an SVG to editable anchors at runtime. To install an uploaded icon set, write `components/icons/icon-library.js` with one `IconKit.installSvg('<filename>', '<raw svg>', A)` per icon (see `tools/icons/README.md`); it auto-loads after `icon-kit.js`, so the icons appear in the **Icon Library** (node-editable) AND the **Visual Designer** (droppable, recolourable to the brand). The colour matching `accent` becomes `var(--brand-primary)`. **Important:** the host import may skip `tools/` (it copies only some files), so write the `installSvg` calls directly into `icon-library.js` — never hand-build an SVG→anchor pipeline.
- **Do not strip, rename, or expose the panes.** The standalone root copies of these files are intentionally absent from this variant; the shell uses the `app/` versions. Keep the user inside `LinkedIn Visual Designer.html`.

## ⛔ Core design rules (when designing)

1. **ASK BEFORE YOU BUILD** — first reply is questions + pushback + 2–3 directions, never a finished visual. (Intake: `BRIEF.md`. Behaviour: `posture.md`.)
2. **ALL VISUALS ON THE VISUAL BOARD — never a document per visual.** Append one `<section class="visual">` block per visual to the same board.
3. **BRAND FIRST** — no brand set? Capture it (START HERE wizard / slider) before designing; never build on the default.
4. **Three variants, analogy-led, anti-slop** — see `SKILL.md` for the full flow and all gates.

## How the system is layered

| Layer | Lives in | You touch it? |
|---|---|---|
| **Brand layer** | `tokens/brand.css` (defaults) → `overrides/brand.css` (yours, via the slider) | **Yes** — the only file you normally edit; the slider writes it. |
| **Canvas roles** | `tokens/canvas.css` | Rarely — loud / light / section, derived from the brand via `color-mix`. |
| **Type, spacing, headline** | `tokens/*.css` | Rarely. |
| **Components + icons** | `components/**` | Build with them — React primitives + the icon kit/editor. |
| **Templates** | `templates/**` | The full numbered archetype library — inherit the brand by default. |
| **Style packs** | `style-packs/**` | Doodle / Bento / Paper. |
| **Visual UI** | `LinkedIn Visual Designer.html` (the only surface) + its internal panes (`app/Visual Board.html`, `app/START HERE.html`, `components/icons/icon-editor.html`) + `ui_kits/` | One surface; panes load inside it (GATE — VISUAL SHELL). |

Read `SKILL.md` for the full operating flow, `posture.md` for how to behave, and `BRIEF.md` for the intake.
