# Changelog — LinkedIn Visual Design System (master)

Semantic versioning. **MAJOR** = a breaking change to a token name, component prop or the override contract (a branch must act). **MINOR** = new components, templates, principles or tokens (safe to pull). **PATCH** = fixes, copy, docs.

A branch records the master version it last pulled in `overrides/BRANCH.md`.

## 1.22.0 — Anti-slop QA gate (GATE 8), adapted from Impeccable
- **New hard gate (GATE 8):** before the three variants are shown, each is self-audited against `references/anti-slop.md` — readable contrast, no default-font headline, no gradient text, and the social-slop tropes (hero-metric template, eyebrow-on-every-variant, side-stripe cards, identical card grids, three-tints-of-one-layout) are refused. Wired into the SKILL description as a 6th hard rule and the RUNBOOK as step 6.
- **`references/anti-slop.md`** — the checklist, retranslated from web UI to 1080×1350 social visuals, keeping only what transfers. Includes the **style-pack exemption**: a deliberately invoked pack (Doodle/Paper hand-drawn, cream, grain) is authorized *voice*, not slop; the never-exempt checks (contrast, hierarchy, no default font) still hold inside a pack.
- **`tools/anti-slop/`** vendors [Impeccable](https://github.com/pbakaus/impeccable)'s deterministic browser detector (`detect-antipatterns.js`) + critique flow (`critique-reference.md`) under Apache-2.0 (`IMPECCABLE-LICENSE`) — the heavy 700KB live-browser tooling was left out. Optional machine pass over an exported artboard; judgment calls stay with the agent.
- **New Principles card:** "Anti-Slop Gate".

## 1.21.0 — Unattended daily auto-update from a private GitHub repo
- Added the **real** daily-sync mechanism the master↔branch model only documented before: a scheduled **GitHub Action** (`.github/workflows/daily-update.yml`, cron ~12:00 Europe/Amsterdam) that runs on GitHub's servers — **whether or not the project is open or anyone asked** — clones the private master repo, and on a new version installs it and commits.
- Shipped the two scripts the docs referenced but were missing: **`tools/check-update.cjs`** (exit 10 when behind master) and **`tools/apply-update.cjs`** (copies master-owned files, honouring `governance/ownership.json` — `overrides/` + `client/` + `.github/` are never overwritten — and stamps `overrides/BRANCH.md`). Written as Node CommonJS so the in-browser bundler skips them.
- **`tools/CONNECT.md`** documents the one-time setup: set `MASTER_REPO`, add a fine-grained read-only PAT as the `DS_SYNC_TOKEN` repo secret (the "secret key" — stored in GitHub, never pasted anywhere). Honest scope: a static design system can't run a daemon itself; a scheduled Action is the only true unattended daily scan.

## 1.20.0 — Single entry point: only the app shell is openable
- Moved the app's sub-views into **`app/`** — `Visual Board.html`, `visual-board.js`, `board-editor.js`, and `START HERE.html` — so they're no longer loose openable pages at the project root. **`LinkedIn Visual Designer.html`** is now the only page a user opens; it loads the three views (Visual Board · Icon Library · Settings) as panes from `app/` + `components/icons/`.
- Relative paths in the moved files corrected (`../styles.css`, `../overrides/…`, `../ui_kits/…`, `../_ds_bundle.js`); `board-editor.js` icon-library/icon-kit base-guesses gained a `../` depth so the library still auto-loads from `app/`. App-shell iframe sources + the start-here template links updated. Verified all three views load and the board picks up tokens + brand.

## 1.19.0 — Paper style pack + packs reframed as composable, agnostic skillsets
- Added **`style-packs/paper/`**: editorial & minimal — outline-only surfaces (no shadows), tight 6px radius, paper-grain texture, generous air, restrained accent. Translated from a web/UI language to the 1080×1350 archetypes. Includes a preview card.
- **Style packs reframed as composable design skillsets**, not modes a user flips on. The assistant reaches for them proactively (or the user names one / sets one as their **base style**), and they **mix & match**: *composition* packs (Bento = tile mosaic) layer with *skin* packs (Doodle, Paper) — e.g. "Bento blocks in Doodle style."
- **Every pack is now explicitly colour- & font-agnostic**: it supplies the *treatment* (technique), never a fixed palette/typeface, and wears the brand layer (`--brand-font`, `--brand-primary` as accent); each pack's named palette/font is a fallback, any signature display font optional flavour. Doodle, Bento and Paper all updated; root `SKILL.md` + `style-packs/README.md` rewritten to match.

## 1.18.0 — Bento style pack
- Added **`style-packs/bento/`**: a premium, dark-first, editorial pack — near-black `#0A0A0A` canvas, an asymmetric mosaic of 1px-hairline tiles (clean 32px radius, flat — borders not fills), oversized Inter-Tight value statements, JetBrains-Mono metadata, and one warm **accent** (the brand colour) lighting the focal stat/word/CTA with a soft glow. Translated from a web/landing-page language to the 1080×1350 archetypes (cover / big-stat / cards / quote / carousel). Includes a preview card. Same boundary as every pack: restyles the look, never the gates.

## 1.17.0 — Style Packs (optional aesthetic layers) + Doodle pack
- New **`style-packs/`** section: opt-in aesthetic layers a user switches on by name (*"3 variants in the Doodle style"*). A pack changes the **look** of a visual — borders, shadows, texture, decorative marks, sometimes the headline font — without touching the hard rules. `style-packs/README.md` documents the one-folder format (`SKILL.md` + a `@dsCard group="Style Packs"` card) so users can drop in their own (skeuomorphic, neumorphic, bento…).
- **Doodle pack** (`style-packs/doodle/`): the hand-drawn design language **translated from web-UI to LinkedIn visuals** — sketch borders (3px ink + asymmetric hand-drawn radius), solid offset shadows (zero blur), hand-lettered headline (Delius Swash Caps), warm-cream canvas + dot-grid, doodle marks pulled from the Icon Library, subtle tilt. Mapped onto the cover / big-stat / cards / quote / carousel archetypes. Includes a preview card.
- Wired into `SKILL.md` (a Style Packs section after GATE 6) and the readme index. **A pack never overrides the gates** — one board, 3 variants, analogy-led, safe margins, GATE 7 still win; the brand colour folds in as the pack accent.

## 1.16.2 — Board editor: Icon Library is now a drag source
- The board's **My library** panel now auto-surfaces icons from the **Icon Library** (`icon-kit.js`): built-in marks, the user's own drawn/imported icons (`localStorage('icon-custom')`), and illustrations appear under a **"From the Icon Library"** caption, ready to drag onto the canvas — no re-upload. Renders inline so each icon recolours to the brand (`--brand-primary`/`--icon-ink`); dropped icons carry `data-shape="icon"` so resize keeps aspect. Refreshes live on the `icon-changed`/`storage` events. Empty kit → graceful empty state (unchanged).

## 1.16.1 — Settings: editable profile (name · role · photo)
- Added a "Your profile" card to Settings: name, role/function, @handle and an optional profile photo (uploaded, persisted). All feed into the live preview header and the visual's @handle — so the in-feed mock shows the user's real identity, not placeholder text.

## 1.16.0 — Settings: one page with a live in-feed preview
- Rebuilt the brand Settings (the wizard) into a **single page**: left column = all options (primary/secondary/accent + tint, font, headline signature, optional Figma/GitHub/.fig source, and the assistant hand-off / copy-brand.css); right column = a **live LinkedIn feed preview** (post header + the visual recolouring as you change settings) plus the three canvas roles. No more 5 steps. Choices still persist and inject the live brand layer app-wide. Copy now uses the reliable execCommand path.

## 1.15.1 — App nav: light floating dock (less "app chrome")
- Replaced the heavy 236px left rail with a small **floating dock at bottom-center** — icon-only (Visual Board · Icon Library · Image Library "soon" · Settings), token-driven neutrals + brand active state, hover tooltips. Dropped the app title and the "most work happens in chat" line. Views are now full-bleed; chat stays the primary surface and this reads as a tool, not an application shell.

## 1.15.0 — One workspace: LinkedIn Visual Designer app shell
- New `LinkedIn Visual Designer.html` wraps the whole system in one app with a **left rail** to switch views: **Visual Board** (the canvas), **Icon Library** (the icon/illustration editor), and **Settings** (the brand setup — colours, font, signature). Image Library is stubbed as "Soon". Each view is the existing file loaded as a pane (lazy-loaded, state preserved, active view persists) — so `Visual Board.html`, `START HERE.html` and the icon editor keep working standalone too; nothing was renamed. The rail chrome stays Inter/neutral; only the views carry the brand. Chat remains the primary way to work — this is the visual interface alongside it.

## 1.14.0 — Icon & illustration library added to the core
- Added the hand-drawn **icon/illustration engine + editor** to the core as `components/icons/` (`icon-kit.js`, `icon.css`, `icon-editor.html` — renamed from the doodle build). Brand-agnostic: lines draw with `--icon-ink` (→ `--brand-secondary`), accents with `--brand-primary`, so it recolours to the brand with no config. Ships with an **empty set** — populate per project, or draw/import (incl. image-trace & SVG/Figma import) in the editor; edits persist. Web components `<icon-mark name="…">` / `<icon-ill name="…">` and `IconKit.mark('…')`. New "Icon Library" card in the Design System tab.

## 1.13.1 — Editor: upload moved into "My library"
- The "Upload images / an icon set" button now sits **under the My library heading** (above the library tiles), where it belongs — it previously trailed the Shapes group and read as part of it.

## 1.13.0 — Board buttons open a prepare-prompt modal
- "+ New visual" and "Iterate" now open a small **modal that prepares the prompt**: paste your post + optional direction (New visual) or describe what to change (Iterate). "Copy prompt" assembles the full `/linkedin-visual` instruction (rules baked in) and copies it; paste it into the chat and attach any screenshots/sketches there. The modal can't auto-send into the chat — the artifact runs in an isolated preview frame with no access to the host chat input (a hard cross-origin boundary), so copy-and-paste is the path; the AI still leads the brief.

## 1.12.2 — Board buttons: reliable copy in sandboxed previews
- The agent-prompt copy on "+ New visual" / "Iterate" failed in sandboxed previews (async Clipboard API blocked → "Couldn't copy"). Now it tries `execCommand('copy')` first, then the async API, and if both are blocked it pops a small **pre-selected box** with the prompt so you can always copy it by hand (⌘C / Ctrl+C) and paste to the assistant.

## 1.12.1 — Board buttons hand a prompt to the agent (agent-first)
- "+ New visual" and "Iterate" no longer just nudge you to the chat — they **copy a ready-made `/linkedin-visual` prompt** to the clipboard (rules baked in: ask the brief first, 3 variants, stay on `Visual Board.html`, never a separate file). Paste it and the agent takes over. No side panel, no second assistant — the AI stays in the lead; the buttons are just a shortcut into the flow.

## 1.12.0 — Always-on enforcement + Visual Board as a one-click Template
- **Always-on rules.** The SKILL `description` now states the flow + five hard rules apply whenever the system is connected and the user asks to make ANY LinkedIn visual — even with no slash command. (`/linkedin-visual` and `/ds-setup` remain as explicit triggers.)
- **Visual Board is now a Template.** `templates/visual-board/` carries an `@template` header, so consuming projects get a one-click "Visual Board — make LinkedIn visuals" entry in their Templates picker (alongside "Start here — set up your brand" and the 65 archetypes). This is the closest thing to an in-app "start the flow" button — the design system can't add buttons to Claude's own UI, but Template entries are the native equivalent.

## 1.11.0 — Editor: multi-select (marquee + shift-click)
- **Marquee select.** Drag across empty canvas/pasteboard to rubber-band select every element the box touches.
- **Shift-click** adds/removes individual elements from the selection.
- The whole selection **moves together** (snapping anchored to the primary element), and the toolbar's **Delete / Duplicate / Colour / Bring-to-front** act on all selected at once. Each selected element shows its own outline; the selection box spans the group (resize handles hide for multi — resize one element at a time). ⌫ deletes the whole selection; Esc clears it.

## 1.10.3 — Editor: drop outside the canvas + toolbar tracks the element
- New elements (palette items, library icons, images) can now be **dropped onto the pasteboard outside the canvas**, not just on it — the whole stage is a drop zone and off-canvas drops resolve to off-canvas positions.
- The element toolbar now **follows the selected element everywhere**, including when it's parked outside the canvas (it was previously clamped to the card).

## 1.10.2 — Editor: off-canvas elements stay clickable + smoother parking
- **Parked elements are selectable again.** Selection was gated on the pointer being inside the artboard rect, so anything dragged *outside* the canvas couldn't be re-clicked or moved. Selection now tests DOM containment, so off-canvas elements grab normally.
- **Smoother edge-crossing.** The magnetic grid now only snaps *inside* the canvas; crossing the edge to park releases the snap (hold Alt to free everywhere) so dragging out and back no longer sticks to the boundary.
- Clicking the empty stage/pasteboard around the card now clears the selection.

## 1.10.1 — Editor: small/zoomed-out elements are grabbable again
- Resize handles are fixed-size on screen, so on a zoomed-out (e.g. Fit/10%) or genuinely small element they covered the whole body and you could only resize, never drag. Handles now hide when the selection is under ~44px on screen, leaving the whole box a move target; zoom in and they return for resizing.

## 1.10.0 — Editor: pasteboard (park elements off-canvas)
- In edit mode the canvas is now a **pasteboard**: drag any element *outside* the 1080×1350 artboard and it stays visible in the surround (handy for staging/parking while you compose). Off-canvas elements are clipped on export and in thumbnails — they never appear in the final visual. The artboard clips as before everywhere outside edit mode.

## 1.9.0 — Editor: colour picker + magnetic 12-col grid
- **Colour swatch picker.** The element toolbar's colour button now opens a popover of the design system's actual colours (Primary, Secondary, Accent, Ink, Muted, Soft, White, Ink 900 — brand entries stay theme-linked). A native colour input adds a custom colour, applies it, and saves it to a reusable per-board palette (right-click a custom swatch to remove); a note points to `overrides/brand.css` for baking a colour into the system itself.
- **Magnetic 12-column grid.** Dragging snaps elements to a 12-column grid (72px safe margin, 24px gutters) and a 78px vertical rhythm — always magnetic, hold **Alt/Option** to place freely. Two rail toggles show/hide the **Grid** (blue columns) and **Margins** guides; the margin guide fills the unsafe zone *outside* the content area in **red** with a crisp red boundary, so dragging past the safe margin reads as "in the red". Snapping stays on regardless of view. State persists.

## 1.8.0 — Editor: icon palette, auto-detected library, Inter-locked chrome
- **Palette items now carry icons.** Every "Add to canvas" tile (Heading, Subhead, Eyebrow, Body text, Big stat, Quote, Swipe, Avatar, all shapes) shows a board-standard line glyph above its label — these are the editor's own UI icons, distinct from the user's icon set.
- **"My library" auto-detects the design system's own icons.** The board reads a manifest — `assets/library-manifest.json` (or `assets/icons/manifest.json`): a JSON array of paths or `{"icons":[{name,src}]}`, paths relative to project root. Any icons listed there appear in every visual's library under "In this design system", ready to drag in — no re-upload. User uploads still persist under "Your uploads". Absent → the section shows uploads only.
- **UI chrome is locked to Inter.** The toolbar, rail, dock and reel always render in Inter regardless of the client's brand font; only the artboard canvas adopts `--brand-font`. (The board now loads Inter explicitly.)

## 1.7.0 — Hard rule: fill the canvas (vertical centering)
- Added **GATE 7** to SKILL.md: content on every frame (single, quote, AND each carousel slide / infographic panel) must be vertically balanced — center a short block, never top-pin it leaving the bottom half empty. Referenced from the runbook step 4.
- Fixed `carousel-04-steps` to center its content block between header and footer as the canonical example.

## 1.6.1 — Slash-command reliability
- Front-loaded both slash commands into the SKILL `description` (the part always loaded in a consuming project) so `/linkedin-visual` and `/ds-setup` fire even when the body isn't weighed heavily. Made explicit that a pasted post + `/linkedin-visual` is NOT build permission — the first reply must be questions only.

## 1.6.0 — Slash-command triggers
- **`/ds-setup`** (hard rule): opens the `START HERE.html` brand-setup wizard from the design system instead of designing or asking questions — copies it to the project root if missing, then surfaces it to the user.
- **`/linkedin-visual`** (hard rule): enters the full design RUNBOOK with all five hard rules enforced harder than usual — questions + pushback first, never build immediately. Both documented at the top of SKILL.md as highest-priority overrides.

## 1.5.0 — One unified, numbered template library (dedupe + rename)
- **Merged the old "Reference ·" set and the "Bold ·" set into ONE library** — removed 15 overlapping reference templates (their concepts live in the Bold archetypes). Kept testimonial (no Bold equivalent) and a full-rail carousel reference.
- **Every template renamed to a consistent, sortable scheme:** `templates/<type>-NN-<slug>/` with PascalCase entry + `@template name="<Type> NN · <slug>"`. Types: `single-01…48`, `quote-01…04`, `infographic-01…06`, `carousel-01…09` (67 archetypes). `start-here` + `visual-board` stay as named tooling.
- **Carousels are explicitly free to use ANY archetype per slide** (single metaphor, quote, chart, infographic) — not locked to the carousel-* set. SKILL.md GATE 6 rewired to the new scheme + `references/method.md` as the catalog.

## 1.4.0 — Bold Visual Method + 65 archetypes + content layer
- **65 named archetype templates** added (`templates/bold-*`, `single-1*`, `quote-*`, `carousel-0*`, `infographic-4*`, `layers-5*`, `metaphor-a*`, `reframe-c*`, `chart-f*`, `teardown-*`, `ui-*`) — the full A1→I10 catalog as theme-agnostic `.dc.html` (each recolours live from primary/secondary/accent/tint/font; `overrides/brand.css` themes all 65 at once). Brings the Templates picker to 83.
- **The Bold Visual Method** as a Principles card + the full playbook in `references/method.md` — wired into SKILL.md GATE 6 as the build philosophy (idea = design → find the mechanism → steal a form → render flat, focal = strongest tone → thumbnail test).
- **Content layer:** `overrides/voice.md`, `overrides/icp.md`, `overrides/offer.md` (branch-owned) so example copy lands in the client's voice / ICP / offer instead of generic filler. Referenced from the brief's brand-layer step.
- Spot-check note: the grey→token mapping is rule-based; a handful of chart/accent frames may want a manual Tweaks nudge after theming.

## 1.2.0 — Archetype templates, editor & carousels-on-board
- **9 new reference templates, each 3 variant compositions (A/B/C):**
  - Singles: `pictograph-visual`, `trajectory-visual`, `testimonial-visual`, `layered-visual` (funnel/pyramid/stack), `data-visual` (chart-led).
  - Infographics: `infographic-tree`, `infographic-flow`, `infographic-annotated`, `infographic-matrix`, `infographic-roadmap`.
  - Carousels: `carousel-listicle`, `carousel-story`, `carousel-framework` (full multi-slide arcs).
- **Carousels live on the Visual Board** — a `.artboard[data-carousel]` with `.cslide` slides. The board shows a carousel as a scrollable **filmstrip** (all slides side-by-side), pages one slide at a time in edit mode, marks it in the reel as a **stack + "Carousel · N slides"**, and exports the current slide. Carousel reference templates are now labelled SLIDE-CONTENT ONLY so the agent never ships a standalone file.
- **Board editor (`board-editor.js`)** — Canva-style direct manipulation on the focused artboard: select the smallest element, drag to move, side handles (width-only / height-only) + corner (uniform scale), double-click to edit text, a left **library rail** (drag-in brand elements + reusable image/icon uploads), delete/duplicate/recolour, zoom controls, per-variant edit persistence.
- **Choose a winning variant** directly via the hero **★ Chosen / ☆ Choose** pill (works for singles and carousels). Iteration history pinned to a bottom dock; "+ New visual" / "Iterate" route back to the chat brief.
- **GATE 5 (analogy-led) + GATE 6 (rotate archetypes)** added to SKILL.md, wired to the real templates; language-match + ask-first rules tightened. Removed the old Brief Studio and First-run setup kits (superseded by chat + START HERE).
- **START HERE is a guided 5-step wizard** — brand source (Figma link / GitHub repo / .fig file / manual) → colours → type & signature → hand-off, with a one-click "Copy for the assistant" message and live preview. Headlines now use `text-wrap: balance`.

## 1.1.0 — Visual Board & two hard behaviour gates
- **Visual Board** (`Visual Board.html` + `visual-board.js` at the project root): one Canva-style board per project — hero + horizontal scrollable reel, per-visual ⋯ menu (Download PNG · Download HTML · Add to design system). Plain HTML + vanilla JS; add a visual by appending one `<section class="visual">` block. Copy both files into a consuming project once.
- **The four type-templates are now "Reference ·"** layouts, not per-post deliverables — read them to build an artboard, then paste it as a block on the board.
- **GATE 1 — ask before you build:** the assistant must open with questions, pushback and 2–3 directions before producing any visual (no more straight-to-design).
- **GATE 2 — all visuals on one board:** never a separate file per visual; every visual is a block on the Visual Board.
- README opens with three non-negotiable rules; BRIEF.md §6 + SKILL.md route delivery through the board. Setup confirmed out-of-chat via `START HERE.html`.
- Setup screen fixes: starts at step 1, live preview reflects font/colour changes, input focus retained while typing.

## 1.0.0 — Foundation
- Colour- & font-agnostic token system: brand defaults → canvas roles (loud/light/section) → type, spacing, headline signature.
- 24px hard safe band on all visuals; content margin = band + gutter.
- Components: Canvas, Chrome/SwipeArrow, Headline/Mark/Eyebrow/Subhead, Stat/StatBox/StatRow, Quote/Avatar/Attribution, InfoCard/Chip, Cta, BrowserMock, FeedPost.
- Templates: Single, Quote, Carousel, Infographic.
- Kits: Visual Library (browse + export PNG/HTML + approve-to-learn). Brand setup lives in START HERE.html.
- Principles, BRIEF.md (intake + fillable starter), posture.md (senior-designer behaviour).
- **Master → branch model**: master owns fundamentals; branches own `overrides/` + `client/`.
