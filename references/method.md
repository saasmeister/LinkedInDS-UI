# The Bold Visual Method

*A playbook for designing strong, conceptual B2B SaaS LinkedIn visuals — flat, idea-first, theme-agnostic.*

> **Color is not part of this method.** The examples here happen to be grayscale, but that was one project's theme. Use whatever palette the current set uses. The only color *principle* is in §1: one ramp, focal element = the strongest tone. Read every "grey" / "dark" / "#2b2b2b" below as "your set's strongest tone" and every "#ffffff" as "your set's base."

This is the method behind the Bold Visual Method template library (archetypes B1 → I10). It is written so a person **or** an AI can reproduce the style at scale. Hand this whole file over as context and ask for "a visual in the Bold Visual Method about X."

---

## 0. The one rule

> **The idea is the design. The styling just gets out of its way.**

Every visual is built around a single *mechanism* — a shape, a metaphor, a fake interface, a chart — that makes one point land instantly. If you can't say the point in one sentence, the visual isn't ready. No decoration, no gradients-as-vibe, no stock icons standing in for thinking.

A good test: **screenshot it, shrink it to a thumbnail. If the concept still reads, it works.**

---

## 1. The fixed system

These never change. They are what makes 50 different visuals feel like one library.

### Canvas
- **Size:** `1080 × 1350` px (4:5 portrait — the LinkedIn feed sweet spot).
- **Backgrounds are flat.** Two canvases only:
  - **Base** — the set's lightest background (examples use `#ffffff`) with a `1.5px dashed` inset border 56px in (the "working draft" frame).
  - **Section** — the set's darkest/most saturated background (examples use `#2b2b2b`), no border.
- **No noise, no gradients on the background, no photos behind everything.** Alternate base/section for rhythm across a set.

### Color = one ramp (in whatever palette the set uses)
The color *system* matters; the specific hues do not. Build a **5-step ramp from lightest → strongest**, plus a muted-text tone and a label tone. That's the whole palette. It can be greys, a brand's tints/shades, or any theme:

| Token | Role | Grayscale example (swap for your set) |
|---|---|---|
| ramp-1 | lightest fills, empty states | `#ededed` |
| ramp-2 | secondary fills | `#cfcfcf` |
| ramp-3 | mid | `#a3a3a3` |
| ramp-4 | strong | `#767676` |
| ramp-5 / focal | dominant element, text, the "hero" segment | `#2b2b2b` |
| muted text | body / captions | `#6b6b6b` |
| label | identity bar, axis labels | `#9a9a9a` |

**The only rule:** in any chart or diagram, the element you want the eye to land on is the **strongest** ramp step; everything else is a lighter step. Contrast = hierarchy. Swap the whole ramp for a brand palette and every visual re-themes instantly — the structure never changes. Want an accent pop (one highlighted segment, a positive/negative)? Pull from the set's accent colors, but keep it to one or two and let the ramp do the heavy lifting.

### Type
- **Family:** Inter for everything (system-ui fallback). `ui-monospace, Menlo, monospace` only for "interface" moments (terminals, receipts, URLs, code).
- **Scale (at 1080×1350 — these are large on purpose):**
  - Big headline: `60–84px`, weight 700, `letter-spacing:-0.02em`, `line-height:~1.0`.
  - Hero numbers / statements: `120–340px`, weight 700–800.
  - Body / supporting line: `26–36px`, weight 400, `line-height:1.3`.
  - Eyebrow/kicker: `18px`, weight 700, `letter-spacing:0.14em`, UPPERCASE, `#bcbcbc`.
  - Identity bar + axis labels: `22px`, weight 600, muted.
- **Never** smaller than ~22px on this canvas.

### The chrome (repeat on most frames)
- **Identity bar** top: `Name` left, `Category / function` right, muted, at `top:48px`.
- **Caption** bottom (optional): one muted sentence that twists the knife or lands the takeaway, centered, `~26–32px`.
- **Footer strip** (for "infographic" types): `Helpful? Share it` left / `Want more? Follow →` right.
- **No swipe arrow** on singles — that's only for carousels.

### Layout primitives
- Position with **absolute coordinates inside the 1080×1350 frame**, or flex/grid with explicit `gap`. Either is fine; absolute is easier for diagram-like work.
- Generous margins: content lives inside the 56px inset.
- One focal element per frame. Negative space is allowed — even encouraged on statement visuals.

---

## 2. The copy system (B2B SaaS, English)

The visuals are templates, but they ship with **real example copy**, never grey "lorem" bars — because a metaphor dies without words. Tone:

- **Audience:** B2B SaaS operators — founders, PMs, UX, positioning/marketing, devs, consultants.
- **Voice:** plain, blunt, a little contrarian. Short sentences. One idea.
- **Patterns that work:**
  - Reframes: *"What you think they'll pay → what they'll actually pay."*
  - Confessions: *"We don't have a churn problem, we have an onboarding problem."*
  - Earned takeaways in the caption: *"The drop between ring 1 and 2 is where your revenue leaks."*
- **Swap-in slots:** write copy as a template with obvious blanks — `[outcome]`, `[metric]`, `[role]`, `[pain]` — so the user drops in their topic.
- Numbers must feel real (e.g. `72%`, `1 in 4`, `$150,000/yr`), never `00%` placeholder unless explicitly a wireframe.

---

## 3. How to invent a visual (the move)

1. **Write the one sentence.** The single point. ("Most trials never reach the aha-moment." / "Consistency compounds." / "Your positioning is unclear.")
2. **Find the mechanism that *is* that sentence.** Don't illustrate the sentence — *encode* it. "Almost there" → a progress bar stuck at 97%. "We're at capacity" → a fake system dialog. "Quitting right before it works" → a clock at 11:58 ringed with "I want to quit."
3. **Steal a form from the real world.** Interfaces (terminal, 404, receipt, boarding pass, loading bar), data viz (pie, funnel, gauge, treemap, heatmap), social/IRL objects (sticky notes, polaroids, tier list, dictionary entry, subway map), and pure typography (equations, giant statements).
4. **Render it in the fixed system** — flat canvas, one tight ramp, big Inter, one focal point in the strongest tone.
5. **Twist the caption.** End with a line that reframes or stings.
6. **Thumbnail test.** Shrink it. Concept still reads? Ship it.

**Be bold, not tame.** The strongest visuals (the whole B–I range) borrow a *non-design* object and bend it to a SaaS point. When in doubt, go more literal with the metaphor and more minimal with the styling.

---

## 4. The archetype catalog

Grouped by mechanism. Each is a reusable template — pick one, drop in your sentence.

### A · Metaphor singles (the shape carries the point)
- **Funnel** — narrowing trapezoid bands + annotation cards (`Awareness › Evaluation › Activation`).
- **Clock** — 12 ticks, 11 say the grind ("I want to quit"), 1 says the payoff ("It clicks"), hand at 11:58.
- **Loop / flywheel** — numbered nodes in a row + dashed return loop ("Measure → Learn → Improve → Repeat").
- **Iceberg** — small tip above a waterline ("Ship it"), dense dark chips of hidden work below, two annotation arrows.
- **Bullseye** — 3 concentric rings + callout cards with arrows ("why / what / how they buy").

### B · Reframes (flip an assumption)
- **Pricing ladder** — struck-through values stepping up to the real one.
- **Expectations / Reality / What works** — a long smooth arc, a short arc, a row of tiny hops.
- **Scale perception** — big circle → medium → dot ("what you fear they see → what they actually see").

### C · Charts (data, shadcn-flavored)
- Pie / donut-with-center-number / pie-with-leader-labels / radial.
- Bar (label, horizontal, stacked+legend).
- Line (default, dots, step, label) and **area with gradient fill** (single + stacked).
- **Nested-squares treemap** (where the week goes).
- **Compounding multi-line** (exponential vs wavy-flat vs flat).
- Chart conventions: dashed horizontal gridlines, no axis lines, muted ticks, bars `radius 6–8`, the hero series is the strongest tone.

### D · Infographics (dense, readable working docs)
- **"How to beat X" blueprint** — badge + complaint headline + setup cards + numbered thumbnail row + 2×3 step grid (each card: number, title, `(x screens)` tag, body, `→` takeaway) + footer strip.
- Case-study grid, matrix/table, numbered zigzag flow with elbow connectors.

### E · Fake UI & teardowns
- **System dialog** — "Maximum capacity reached" + segmented capacity bar + two buttons.
- **Evolution teardown** — pill-labelled timeline of a positioning statement bloating into jargon and snapping back.

### F/G/H/I · Bold & experimental (the heart of the method)
Borrow an object, bend it to a SaaS truth:
- **Heatmap** (contribution grid = consistency; gaps = lost momentum).
- **Fake terminal** (a ship-log as the visual).
- **Tier list** (S/A/B/C ranking of channels/features).
- **Spectrum slider** (where your pricing/positioning sits, "you are here").
- **404 screen** ("Positioning not found").
- **Typographic equation** ("Clarity × Consistency = Pipeline").
- **Venn wedge** (3 circles, "your niche" in the overlap).
- **Gauge / speedometer** (one KPI, needle + big %).
- **Chat conversation** (the DM that closed the deal).
- **Diagonal before/after split** (feature factory → outcome engine).
- **Metro / subway map** (the road to PMF, with a "premature scaling" detour line).
- **Polaroid stack** (3 launches, 1 worked).
- **Kanban board** (the smallest column grows revenue).
- **Receipt / invoice** (the real cost of cheap churn).
- **Maze vs straight line** (same destination, 18 months apart).
- **Dictionary entry** (`churn, noun: a marketing problem disguised as a retention problem`).
- **Vertical timeline** (0 → $1M ARR milestones).
- **Approved stamp** (the one test every feature must pass).
- **Report-card scorecard** (grade your onboarding, big letter grades).
- **Progress rings** (funnel as 3 rings, the drop between them is the leak).
- **Sticky-notes wall** (real interview quotes).
- **Weather forecast** (the startup forecast: hype → reality → grind → sun).
- **Stuck loading bar** ("Almost there" at 97%, ETA "since last quarter").
- **Decision tree / fork** (one signup, two paths, the fork is the first 5 minutes).
- **Slot machine** (stop gambling on growth — pick one tactic, repeat).
- **Boarding pass** (NOW → PMF, gate: Activation, no layovers in feature-land).

> The list is a launchpad, not a fence. The method *is* "find a new object and bend it." Keep adding.

---

## 5. Production notes (for building in HTML)

- Each visual is one `1080×1350` block. To show many side by side, scale each into a card with `transform: scale(0.42)` (singles) or `0.46` (dense infographics) and `transform-origin: top left`.
- Give every frame a `data-screen-label` so it's identifiable.
- Keep all content **inside** the frame: target `scrollHeight === 1350` (no overflow with `overflow:hidden`).
- Build repetitive geometry (clock ticks, heatmap cells, ring arcs, funnel clips) programmatically, not by hand.
- SVG for shapes/arcs/arrows/connectors; HTML+flex/grid for cards, chips, legends, text.
- Markers for arrowheads; `stroke-dasharray` for waterlines/axes; `clip-path: polygon()` for funnels and diagonal splits; `conic-gradient` for pies, `linear-gradient` only *inside* a chart element (area fills, spectrum bars) — never on the page background.

---

## 6. Checklist before shipping a visual

- [ ] One sentence point, stated or implied.
- [ ] A real-world mechanism encodes it (not just illustrates).
- [ ] Flat canvas (base + dashed border, or section background) in the set's palette.
- [ ] One ramp (any palette); the focal element is the strongest tone.
- [ ] Big Inter type; nothing under ~22px; mono only for "interface" bits.
- [ ] Real B2B SaaS example copy with obvious swap-in slots.
- [ ] Identity bar; caption that twists; footer if it's an infographic.
- [ ] Fits 1080×1350, no overflow.
- [ ] Passes the thumbnail test.

---

*Method distilled from the Bold Visual Method template library. Keep it flat, keep the ramp tight, keep the idea loud — in whatever colors the set calls for.*
