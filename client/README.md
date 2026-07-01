# client/ — your learned design system (branch-owned)

This folder holds everything **your branch learned** that master didn't ship: components you promoted from approved visuals, your own templates, saved visuals. **Master updates never touch `client/`.**

This is the other half of the branch contract: `overrides/` holds your *brand*, `client/` holds your *learned variants*. Together they're your identity on top of the master fundamentals.

## What lands here
- **Promoted components** — when a pattern recurs across approved visuals (via the Visual Library's "Add to design system"), it gets built as a real component here, e.g. `client/components/<Name>/`.
- **Your own templates** — `client/templates/<slug>/`, alongside the master templates.
- **Approved/saved visuals** — exported HTML kept as proof or as a starting point.

## How it stays yours
- Put learned components under your own sub-namespace so they never collide with master component names.
- A master update may add a *new* master component or template; it will not rename, move or delete anything in `client/`.
- If master later ships an official version of something you'd promoted, you choose whether to switch to it or keep yours — master won't force it.

> Empty for a fresh branch. The Brief Studio and Visual Library are where these get created and approved.
