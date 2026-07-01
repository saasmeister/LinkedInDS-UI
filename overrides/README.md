# overrides/ — this folder is YOURS (the branch)

Everything in `overrides/` belongs to your client/branch. **Master updates never overwrite it.** This is where your identity lives while you still pull the fundamentals from master.

| File | What you own here |
|---|---|
| `brand.css` | Your colours, fonts, tint, headline signature. The main override surface. |
| `extras.css` | Optional: your own spacing / radius / extra-accent tweaks. |
| `BRANCH.md` | Records which master VERSION you last pulled (so updates are trackable). |

## The rule
- **You set** a variable here → it wins, forever, across every master update.
- **You leave** it alone → you inherit the master default, including new defaults future updates ship.

Set only what you actually want to own. The less you override, the more you benefit from master improvements.
