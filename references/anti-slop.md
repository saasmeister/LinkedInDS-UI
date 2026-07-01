# Anti-slop — the QA pass before you deliver

*Adapted for 1080×1350 LinkedIn visuals from the [Impeccable](https://github.com/pbakaus/impeccable) anti-pattern system (Apache-2.0). Impeccable targets web UI; this file keeps only what transfers to flat social graphics and retranslates it to the canvas.*

> **Advisory, not an overlay.** This is guidance for *your own* judgement during the QA pass — use it to rewrite weak elements before you show variants. **Never render lint badges, leader-lines or "low contrast / overused font" markers onto the visuals themselves.** (If you're seeing such badges in Claude Design, that's its native *Mark up / Show tweaks* review layer — toggle it off; it isn't part of the visual or its export.)
>
> **Contrast is web-oriented — treat WCAG flags as advisory here.** Bold brand visuals deliberately use brand-on-brand (e.g. coral headline on a cream canvas, or light text on a loud panel). That's authorized voice, not a defect. Judge legibility at scroll size with your eyes; do **not** auto-darken or "fix" intentional brand combinations to satisfy a WCAG ratio meant for body-text web UI.

## What this is

A **gatekeeper checklist**, not a style. Before you show the three variants (GATE 8), run every visual through this. If a visual trips a check, rewrite that element — don't ship it and hope.

The governing test (Impeccable's): **if someone could look at this and say "AI made that" without doubt, it failed.** Slop is the cross-project monoculture — the move that shows up regardless of brief.

## The style-pack exemption (read first)

A **deliberately invoked style pack is authorized voice, not slop.** Impeccable bans "hand-drawn / sketchy SVG", "paper-grain filters" and "cream/sand default backgrounds" — exactly what **Doodle** and **Paper** use *on purpose*. The reconciliation is Impeccable's own rule: *"one named kicker is voice; an eyebrow on every section is grammar."* So:

- A pack chosen by the user (or by you, named and on purpose) = **voice**. Don't flag its signature treatment.
- The same treatment reached for **by reflex, unnamed, on every visual** = slop. Flag it.
- Everything in "Always applies" below holds **even inside a pack** — a pack restyles, it never excuses unreadable contrast or a default-font headline.

## Always applies (brand-agnostic — never exempt)

- **Contrast.** Body/sub text ≥ 4.5:1 against its canvas; large display ≥ 3:1. The #1 failure: muted grey text on a tinted near-white. On a coloured canvas, never grey text — use a darker shade of the canvas hue or a transparency of the ink. <!-- low-contrast, gray-on-color -->
- **No default-font headline.** A focal headline set in the raw UI/system font (Inter/Roboto/Arial/system-ui) with no intent is the loudest tell. Use the brand display font; if none, commit to a real pairing on a contrast axis (serif+sans, geometric+humanist) — never two similar sans. <!-- overused-font, single-font -->
- **Real type hierarchy.** Eyebrow, headline and any sub-line must differ clearly in size/weight — not three near-equal sizes. <!-- flat-type-hierarchy -->
- **No gradient text.** `background-clip:text` over a gradient is decorative, never meaningful. Solid colour; emphasis via weight/size. <!-- gradient-text -->
- **No purple→blue "AI gradient"** as the default accent, and no decorative blurred orbs / glassmorphism unless the brand truly calls for it. <!-- ai-color-palette, glassmorphism -->
- **Not pure #000 on #fff.** Tint both ends slightly (the canvas tokens already do). <!-- pure-black-white -->
- **No tiny text.** Nothing below ~24px rendered on a full 1080×1350 visual. <!-- tiny-text -->
- **Body sits at a readable measure** when a visual does carry a sentence: ~30–46 characters per line on this canvas, leading ≥ 1.3, never justified, never all-caps for a full line. <!-- line-length, tight-leading, justified-text, all-caps-body -->
- **No real readable text below the safe margin / off the canvas** as a delivered state (GATE 7 + the safe-margin zone).

## Social-specific slop (the tropes to refuse)

- **The hero-metric template.** Big number + tiny uppercase label + three supporting stats + gradient accent. The SaaS cliché. A big stat is fine (`single-NN-big-stat`) — the *template* with its label-and-three-stats scaffold is not. <!-- hero-metric-layout -->
- **Eyebrow on every variant by reflex.** A tiny tracked all-caps kicker above every headline, every time, is AI grammar. One named kicker as brand voice is fine; the reflex is not. Vary the cadence across A/B/C. <!-- ban-eyebrow-on-every-section -->
- **01 / 02 / 03 section markers** used as decoration when the content isn't actually an ordered sequence. <!-- ban-numbered-section-markers -->
- **Side-stripe / left-border accent cards.** A thick coloured border on one side of a rounded card — the single most recognizable AI tell. Full border, background tint, or nothing. <!-- side-tab, border-accent-on-rounded -->
- **Identical card grids.** Three same-size cards = icon + heading + text, cloned. If you use cards, vary size/role; never nest cards. <!-- identical-card-grids, nested-cards -->
- **Icon-tile stacks.** A rounded gradient tile with a glyph above every label. <!-- icon-tile-stack -->
- **Everything centered** by default. Centering is a choice for one focal frame, not the reflex for all text on all variants. <!-- everything-centered -->
- **Sketchy/doodle SVG or paper-grain filters reached for by reflex** (not as an invoked pack), and **generic rounded-rect + soft drop-shadow** as the only treatment. <!-- generic-drop-shadows -->
- **Over-rounding.** Card radius tops out ~16px; full-pill is for tags/chips only. 24/32/40px on a card is a tell. <!-- codex-over-round -->
- **Redundant copy.** A sub-line that restates the headline, or a kicker that repeats the topic. Say it once. <!-- redundant-headers -->

## The three variants must genuinely differ (ties into GATE 4 + GATE 6)

A/B/C that are three tints of one layout is itself slop — the "copy-paste layouts" trope. Across the three, vary the **mechanism/archetype**, not just the colour. If you can guess all three from the topic alone, rework until you can't (Impeccable's first- and second-order category-reflex check).

## Optional: run the deterministic detector

`tools/anti-slop/detect-antipatterns.js` is Impeccable's bundled browser detector (no network). On the board, you can run it against an exported artboard's HTML to get machine hits for the CLI-layer rules above (gradient-text, side-stripe, overused-font, low-contrast, etc.). Treat hits as a backlog to fix, then re-audit. The judgment calls (hero-metric, eyebrow-reflex, sameness across A/B/C) are yours — the detector can't see them. `tools/anti-slop/critique-reference.md` is Impeccable's full critique flow if you want the deeper review.
