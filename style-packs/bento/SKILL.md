# Bento — a Style Pack for LinkedIn visuals

> Premium, dark-first, editorial. A near-black canvas, an asymmetric mosaic of bordered tiles, oversized value statements, hairline strokes, and a single warm accent that lights up the one thing that matters. Confident and outcome-oriented.

This is a **style pack**: a look you switch on for a visual. It does **not** change the system's rules — see "What Bento does NOT change" at the bottom. It restyles the archetypes you already use on the Visual Board.

The source of this pack was a web/landing-page design language (heroes, dropdowns, tables, sidebars…). That scaffolding is irrelevant to a 1080×1350 post — so what follows is the bento *aesthetic* translated to the canvas and the archetypes, nothing else.

## When to use it

- Premium / technical / B2B SaaS brands; founders selling a polished product.
- A post that wants to feel high-end, confident, "expensive" — dark and editorial rather than bright and flat.
- Multi-point visuals (a framework, a feature set, 3–4 proof stats, a comparison) where a **tile mosaic** beats a single statement.
- "Make it premium / dark / sleek / high-end."

Not for: warm, scrappy, hand-made voices (use Doodle), or brands whose identity is explicitly light/bright (ask first — Bento is dark-first).

## How it's used

**You don't need to be told to use this.** A style pack is a capability the assistant reaches for whenever it sharpens a visual for the brand — or the user names it (*"more of a bento layout"*) or sets it as their **base style**. Build the normal way (board, 3 variants, analogy-first); fold the bento treatment into the chosen archetype.

**Bento is a *composition* pack** — it decides how the canvas is divided (the asymmetric tile mosaic). It **composes** with a *skin* pack: run it with **Doodle** for sketchy bento tiles, or **Paper** for outline-only editorial tiles. The mosaic is the constant; the surface treatment comes from the skin.

### Colour & font — agnostic
Its identity is the **technique** — the asymmetric hairline-tile mosaic, one emphasis tile, oversized editorial type, mono metadata, one accent glow — **not** a fixed palette or typeface. It **wears the brand layer**: text in `--brand-font` (a tighter display weight for the focal line), `--brand-primary` as the single accent (the lit stat, active tile edge + glow). The near-black canvas named below is a **fallback** for when no brand is set; dark-first is Bento's default, but it can run on a light/brand-tinted canvas with the same hairline-tile logic. Inter Tight / JetBrains Mono are **optional defaults** — use the brand font, keeping a mono only for true metadata if the brand has none. What makes it Bento is the mosaic, which works in any palette.

---

## Visual foundations (the 1080×1350 canvas)

### Canvas
- **Background:** near-black `#0A0A0A` — flat and seamless. Tiles share this exact shade; **borders**, not fills, separate them (the premium tell).
- **Ambient light:** one massive, very soft radial bloom in the **brand accent** behind the focal area — ~10% opacity, heavily blurred. Optionally two ~3% accent radials in opposite corners to break the pure black. Keep it subtle; the canvas still reads black.
- **Texture (optional):** a very faint 60px grid (`rgba(255,255,255,0.02)`) or ≤3% noise behind the mosaic. Never competes with text.

### The bento mosaic — the core move
- Lay the visual out as an **asymmetric grid of tiles** of varying size — not a single centred block. Vary tile heights to create rhythm (a big primary tile + smaller supporting tiles).
- **Don't make every tile equal weight.** One **primary tile** (the headline / hero stat) dominates; the rest support.
- Avoid repeating identical tile sizes more than ~3 in a row; let the composition feel composed, not gridded.

### Tiles (cards)
- **Background:** same `#0A0A0A` as the canvas.
- **Border:** **1px hairline** `rgba(255,255,255,0.10)` (default) / `rgba(255,255,255,0.20)` (the emphasised/active tile). Crisp, subtle — this is what defines a tile.
- **Radius:** generous and uniform — `32px` (this pack is NOT hand-drawn; corners are clean and even).
- **Depth:** flat by default; lean on borders. A focal tile may get a soft accent **glow** (a faint accent ring + blur), never a heavy drop shadow.
- **Padding:** roomy — ~28px — content vertically balanced with clear top/bottom anchors.

### Type — editorial, oversized
- **Display / focal:** `Inter Tight` (or Inter), **huge**, tight tracking (`-0.03em`), weight 650–700. The value statement / big number is the loudest thing on the canvas.
- **Body / support:** Inter, compact, 2–4 lines max per tile. One clear promise per line.
- **Metadata / labels:** a **mono** face (`JetBrains Mono`) in small uppercase with letter-spacing — the "technical" signal (tags, units, "01 / 04", timestamps).
- **Text colour:** white `#FFFFFF` primary, `#A1A1AA` secondary, `#71717A` muted. The **brand accent** colours only the one stat/word/CTA you want the eye to hit.

### Accent & glow
- **One accent family per visual** — the client's brand colour. Use it for: the single hero stat, one highlighted word, the CTA chip, an active tile's edge/glow, a thin progress/ratio bar.
- Glow = `0 0 0 1px <accent>/25%, 0 0 24px <accent>/16%` on the focal tile only.

### Motion / imperfection
- Bento is **clean and still** — no tilt, no sketch. Precision is the aesthetic. (Any entrance motion lives in the board, not the static export.)

---

## Mapping onto the archetypes

- **Cover / headline (single):** black canvas + accent bloom; oversized Inter-Tight headline with one accent word; a mono eyebrow ("01 / INSIGHT"); the analogy still leads — bento frames it as one premium primary tile, optionally with 1–2 small supporting tiles (a stat, a logo).
- **Big-stat:** the number huge in the brand accent inside the primary tile; a mono label above; supporting context in a smaller neighbouring tile. The accent bloom sits behind the number.
- **Cards / comparison / framework:** the natural bento fit — a mosaic of hairline tiles, one primary + several secondary, varied sizes; the "winning"/active tile gets the `border.strong` edge + accent glow; mono labels number them.
- **Quote:** big editorial quote in white with one accent word, set in a single primary tile on black; attribution in mono; optional small portrait tile (1px border, 32px radius).
- **Carousel:** cover = full bento treatment (bloom + primary tile); interior slides each a calm 1–2 tile composition on the same black canvas so the rail feels like one premium set; mono page marker ("02 / 06") as the technical through-line; keep the swipe-arrow footer. Per-slide content still vertically centred (GATE 7).

---

## Condensed token sheet

| Role | Value |
|---|---|
| Canvas | `#0A0A0A` (tiles share it) |
| Tile border | `rgba(255,255,255,0.10)` · emphasis `rgba(255,255,255,0.20)` |
| Tile radius | `32px` (clean, uniform) |
| Text | `#FFFFFF` primary · `#A1A1AA` secondary · `#71717A` muted |
| Accent | the **client's brand colour** (one stat / word / CTA / active edge + glow) |
| Ambient bloom | accent radial, ~10% opacity, heavy blur, behind focal |
| Focal glow | `0 0 0 1px accent/25%, 0 0 24px accent/16%` (focal tile only) |
| Display font | Inter Tight, weight 650–700, tracking -0.03em |
| Body font | Inter |
| Metadata font | JetBrains Mono, small uppercase, +letter-spacing |
| Texture | 60px grid `rgba(255,255,255,0.02)` or ≤3% noise (optional) |
| Motion | none on the static visual (clean & still) |

---

## What Bento does NOT change

Bento is a skin. The root `SKILL.md` still governs everything:

- **One Visual Board** — a bento visual is still a `<section class="visual">` block on the single board, never a separate file.
- **3 variants** per round; the user picks one and you iterate into 3 more.
- **Analogy-led** — a single/quote visual is still built on one visual metaphor, never a stack of text. (A bento *mosaic* of tiles is a layout, not a substitute for the idea.)
- **Safe margins** (the 24px band) and **GATE 7** vertical centring still hold.
- **1080×1350**, brand layer respected (folded in as the single accent).

If the bento aesthetic ever conflicts with a hard rule, the hard rule wins.
