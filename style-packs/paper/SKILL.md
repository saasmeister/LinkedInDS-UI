# Paper — a Style Pack for LinkedIn visuals

> Warm, editorial, and minimal. A paper/cream canvas, **Montserrat** throughout, a tight 6px radius, **thin outlines instead of shadows**, a single restrained blue accent, and a faint paper-grain texture. Clean, spatial, intentional — like good stationery.

This is a **style pack**: a look you switch on for a visual. It does **not** change the system's rules — see "What Paper does NOT change" at the bottom. It restyles the archetypes you already use on the Visual Board.

The source of this pack was a web/UI design language (buttons, dropdowns, tables…). That scaffolding is irrelevant to a 1080×1350 post — so what follows is the Paper *aesthetic* translated to the canvas and the archetypes, nothing else.

## When to use it

- Editorial, considered, "quiet-premium" brands; thought-leadership and long-form-adjacent posts.
- A visual that should feel calm, warm and grown-up — minimal, no drama, lots of air.
- "Make it clean / editorial / minimal / warm / paper-like."

Not for: loud hype posts or maximal data dumps (the restraint will fight you), or brands whose identity is dark/neon (Paper is light & warm by default).

## How it's used

**You don't need to be told to use this.** A style pack is a capability the assistant reaches for whenever it sharpens a visual for the brand — or the user names it (*"make it editorial / paper-like"*) or sets it as their **base style**. Build the normal way (board, 3 variants, analogy-first); fold the Paper treatment into the chosen archetype.

**Paper is a *skin* pack** — a surface treatment. It **composes** with a *composition* pack like **Bento**: Bento's tile mosaic rendered Paper-style = outline-only tiles on warm paper, no shadows. Layer freely.

### Colour & font — agnostic
Its identity is the **technique** — outline-only surfaces (no shadows), tight 6px radius, paper-grain texture, generous air, editorial restraint — **not** a fixed palette or typeface. It **wears the brand layer**: text in `--brand-font`, `--brand-primary` as the single accent. The warm paper canvas named below is a **fallback** for when no brand is set (a brand-tinted warm neutral is just as valid), the blue accent defers to the brand colour, and **Montserrat** is an **optional default** — use the brand font, just keep headings at a medium (not bold) weight to preserve the editorial feel. What makes it Paper is the outline-first, grainy restraint, which works in any colour or font.

---

## Visual foundations (the 1080×1350 canvas)

### Canvas
- **Background:** warm paper — `#FCFCF9` (paper-50) or `#EFEFE4` (cream). Never a cool/blue-tinted grey; the whole palette is warm.
- **Texture (signature):** a faint **paper-grain** overlay on every visual — a very subtle noise/grain at ~5–7% opacity (multiply). It's what makes it feel like stationery. Keep it well under the safe margin.
- **Optional ruler pattern** for blueprint/wireframe-flavoured visuals: faint horizontal ruled lines (24px) + one thin **red margin line** (`rgba(190,60,60,0.18)`), ~7% opacity — like real ruled paper. Use sparingly, only when the concept is "notebook / plan".

### Type — Montserrat, editorial
- **One typeface: Montserrat** (Google Fonts), everywhere — headlines, body, labels. It is the defining signal of Paper; don't mix in another face.
- **Headlines use medium weight (500), not bold** — that's the warm, editorial tell. Reserve 600 for a single hero word, 700 almost never.
- **Body:** 400, foreground at ~90%. **Secondary text:** foreground at 50–60%.
- **Uppercase micro-labels:** 500, `0.06em` letter-spacing (eyebrows, "01 / 04").
- Ink: `#222222` foreground on paper; muted `#909090`.

### Outlines, not shadows — the core move
- **Surfaces are defined by thin 1px outlines, never drop-shadows.** A card/stat block = a 1px hairline at `foreground/6–8%` (≈ `rgba(34,34,34,0.07)`), flat on the paper. This flat, outlined look is the whole aesthetic.
- **Radius: 6px** on every frame — small, even, consistent. (Pills/avatars stay fully round.) No big rounded corners, no sketch radius.
- Interactive/emphasis: strengthen the outline (`foreground/12–20%`), don't add a shadow or a fill.
- Shadows are reserved for almost nothing — at most a single soft hero shadow on a photo. Default is outline-only.

### Accent — restrained blue
- One accent: **soft blue** (`#81ADEC`, light `#A4C6F7`). Use it for **one** thing — a highlighted word, a key stat, a link, an active tile's edge. Everything else stays paper + ink.
- Links/underlines: a thin underline in `foreground/20%`, not the accent fill.
- If the client's brand colour is strong and non-blue, you may substitute it as the single accent — but keep the same restraint (one accent moment per visual).

### Motion / feel
- Calm and still. No tilt, no bounce. Any entrance lives in the board (Paper's signature is a soft translateY + blur fade), never baked into the static export.

---

## Mapping onto the archetypes

- **Cover / headline (single):** paper canvas + grain; a Montserrat-medium headline with generous air, one word in the blue accent; an uppercase micro-eyebrow; the analogy still leads. Lots of white space — Paper breathes.
- **Big-stat:** the number in Montserrat (medium/semibold), large but not shouting, on paper; a 6px outlined block around the supporting context; the unit/label in muted ink. Accent only on the number if it's THE point.
- **Cards / comparison / framework:** a calm grid of 6px **outlined** cards on paper (no shadows, no fills); the active/winning card gets a stronger outline (or a thin accent edge); uppercase labels number them. Keep generous gutters.
- **Quote:** large Montserrat-medium quote in ink on paper, one accent word; a thin rule or small outlined portrait frame (6px); attribution in muted small caps.
- **Carousel:** every slide on the same paper canvas + grain, 6px outlined frames, Montserrat throughout; an uppercase page marker ("02 / 06") as the editorial through-line; keep the swipe-arrow footer. Per-slide content vertically centred (GATE 7).

---

## Condensed token sheet

| Role | Value |
|---|---|
| Canvas | `#FCFCF9` (paper-50) / `#EFEFE4` (cream) — warm, never cool |
| Surface outline | 1px `rgba(34,34,34,0.07)` (foreground/6–8%) · emphasis `…/0.16` |
| Radius | **6px** everywhere (pills/avatars full) |
| Ink | `#222222` foreground · `#909090` muted · body at ~90% |
| Accent | soft blue `#81ADEC` (light `#A4C6F7`) — one moment only; or the brand colour, same restraint |
| Shadows | none by default (outline-first); at most one soft hero shadow on a photo |
| Font | **Montserrat** everywhere; headings weight **500** (not bold) |
| Micro-labels | uppercase, weight 500, `0.06em` tracking |
| Texture | paper-grain ~5–7% (multiply); optional ruler (24px lines + red margin) |
| Motion | none on the static visual (calm & still) |

---

## What Paper does NOT change

Paper is a skin. The root `SKILL.md` still governs everything:

- **One Visual Board** — a Paper visual is still a `<section class="visual">` block on the single board, never a separate file.
- **3 variants** per round; the user picks one and you iterate into 3 more.
- **Analogy-led** — a single/quote visual is still built on one visual metaphor, never a stack of text.
- **Safe margins** (the 24px band) and **GATE 7** vertical centring still hold.
- **1080×1350**, brand layer respected (folded in as the single accent if non-blue).

If the Paper aesthetic ever conflicts with a hard rule, the hard rule wins.
