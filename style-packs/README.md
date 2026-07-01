# Style Packs

**Composable design skillsets for LinkedIn visuals.** The core system is flat, idea-first, and colour/font-agnostic — it wears the client's brand and lets the *mechanism* (the analogy) carry the message. A **style pack** is an extra capability the assistant can reach for to design better: a named *treatment* (a way of handling borders, shadows, texture, layout, decoration, type-feel) that sharpens a visual for a brand.

Think of them as tools in the assistant's kit — not modes a user has to flip on.

## How they're used

Three ways, all valid:

1. **The assistant reaches for one (or blends a few) on its own** when it sharpens the visual for this brand/brief. You don't need to be told "use Doodle."
2. **The user names one** — *"do this in Doodle," "more of a bento layout."*
3. **The user sets one as their base style** — *"Doodle is my main style."* Record it (in `overrides/brand.css` / the brief) so every visual starts there, then layer extras on top.

When a pack applies, read `style-packs/<slug>/SKILL.md` and fold its treatment into the chosen archetype.

## Packs compose — mix & match

Packs are **layerable**, because they answer different questions:

- **Composition packs** decide *how the canvas is divided* — e.g. **Bento** (an asymmetric mosaic of tiles).
- **Skin packs** decide *how surfaces are treated* — e.g. **Doodle** (hand-drawn sketch borders + marks) or **Paper** (outline-only + grain, editorial restraint).

So you can run a composition pack **and** a skin pack together: *Bento blocks rendered in Doodle style* = the tile mosaic, drawn with sketchy borders and doodle marks. Blend freely whenever it serves the brand — the goal is to expand what the assistant can design, not to box it in.

## Every pack is colour- & font-agnostic

A pack defines the **treatment**, never a fixed palette or typeface. It **wears the brand layer**: text in `--brand-font`, `--brand-primary` as the accent. Each pack's named palette/font is only a **fallback** for when no brand is set, and any signature display font is **optional flavour**. What makes a pack *that pack* is its technique (sketch borders, tile mosaic, outline+grain…), which holds in any colour or font.

## The one hard boundary

A pack restyles. It **never** overrides the five hard rules or the gates in the root `SKILL.md`:

- Still **one Visual Board** — a styled visual is still a `<section class="visual">` block, never a separate file.
- Still **3 variants** per round.
- Still **analogy-led** (single/quote = one visual metaphor), still **safe margins**, still **vertically centred** (GATE 7).
- Still **1080×1350**.

If a pack's aesthetic ever fights a hard rule, the hard rule wins.

## How to add your own pack

One folder, two files:

```
style-packs/<slug>/
  SKILL.md              the treatment, written for the 1080×1350 canvas
  <slug>.card.html      a @dsCard group="Style Packs" preview (line 1 tag)
```

In `SKILL.md`, follow the existing packs: what it is + when it fits, the colour/font-agnostic note, whether it's a **composition** or **skin** pack (and how it composes with others), the foundations (canvas, type-feel, borders, shadow/outline, texture, decoration, motion), how it maps onto the archetypes (cover, big-stat, cards, quote, carousel), and a "what it does NOT change" section pointing back at the hard rules. Keep it LinkedIn-visual-first — drop any web-component scaffolding (accordions, dropdowns, tables); a post has none.

Tag the card's first line:

```html
<!-- @dsCard group="Style Packs" viewport="700x<height>" name="<Pack name>" subtitle="<one line>" -->
```

That's it — the pack shows up in the Design System tab under **Style Packs**, and the assistant can apply or blend it.

## Packs in this system

- **Doodle** (`doodle/`) — *skin.* Playful, hand-drawn: sketch borders, solid offset shadows, doodle marks from the Icon Library, slight tilt. *Live.*
- **Bento** (`bento/`) — *composition.* An asymmetric mosaic of hairline-bordered tiles, one emphasis tile, mono metadata. *Live.*
- **Paper** (`paper/`) — *skin.* Editorial & minimal: outline-only surfaces (no shadows), 6px radius, paper-grain texture, generous air. *Live.*
- Skeuomorphic / Neumorphic — not built yet; drop them in following the structure above.
