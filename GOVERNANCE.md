# Governance — master & branches

This design system is built to be **the master**. Every client runs a **branch** of it: a copy that keeps pulling the fundamentals from master, while owning its own brand and its own learned variants. This is what lets you push updates to everyone without ever overwriting a client's identity.

---

## The model

```
            ┌─────────────────────────────────────────┐
            │   MASTER  (this project — you own it)    │
            │   principles · components · templates    │
            │   token structure · canvas roles · kits  │
            └───────────────┬─────────────────────────┘
                            │  push updates (versioned)
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Client A│         │ Client B│         │ Client C│   ← branches
   │ brand   │         │ brand   │         │ brand   │
   │ +learned│         │ +learned│         │ +learned│
   └─────────┘         └─────────┘         └─────────┘
```

A branch is created by **binding this master** in the client's project. From then on, the client edits only their owned surface; master improvements flow in on update.

---

## Who owns what

| Layer | Owner | Pushed on update? | Where |
|---|---|---|---|
| Principles, posture, brief | **Master** | ✅ yes | `posture.md`, `BRIEF.md`, `principles/` |
| Component code & props | **Master** | ✅ yes | `components/**` |
| Master templates | **Master** | ✅ yes | `templates/**` |
| Token *structure* + defaults — canvas roles, type scale, spacing scale, signature shapes | **Master** | ✅ yes (defaults) | `tokens/**` |
| Kits (Brief Studio, Visual Library) | **Master** | ✅ yes | `ui_kits/**` |
| **Brand layer** — colours, fonts, tint, signature choice | **Branch** | ❌ never overwritten | `overrides/brand.css` |
| **Extras** — own margin / radius / extra accents | **Branch** | ❌ never overwritten | `overrides/extras.css` |
| **Learned variants** — promoted components, own templates, saved visuals | **Branch** | ❌ never overwritten | `client/**` |

Rule of thumb: **master ships the fundamentals; the branch ships the identity.** The override files win over master defaults because they're imported last (`styles.css`). The `client/` and `overrides/` folders are off-limits to updates.

---

## How an update flows

1. **You** change master — fix a component, add a template, ship new default spacing, refine a principle. Bump `VERSION` + add a `CHANGELOG.md` entry (MAJOR / MINOR / PATCH).
2. **The branch pulls** the update. Because everything client-specific lives in `overrides/` and `client/`, the pull replaces only master files.
3. The branch bumps `overrides/BRANCH.md` to the version it pulled and skims the changelog — only **MAJOR** entries need any action.
4. The client's colours, fonts and learned components are exactly as they were; they simply gained whatever master added.

### Versioning contract
- **MAJOR** — a token/prop rename or a change to the override contract. A branch must act. Rare.
- **MINOR** — new components, templates, principles, tokens. Safe to pull.
- **PATCH** — fixes, copy, docs.

---

## Enforcement & the daily check (this is real, not just docs)

**A push gate blocks bad commits.** `tools/check-branch.mjs` reads `governance/ownership.json` + `governance/master.lock` and **exits non-zero** (blocking the push) when a branch edits/adds/deletes a master-owned file, or a client name leaks into master. Wire it as a git **pre-push hook** or a **CI gate** (see `tools/README.md`). Master owner regenerates the baseline with `--write-lock` after legit changes.

**A daily check pulls updates.** The branch checks the published master `update-manifest.json` every 24h:
- **In-platform:** the **Update Center** (`ui_kits/update-center/`) auto-checks on open if it's been >24h, shows the pending version with its changelog + included templates, and applies **only after the user confirms** — `overrides/` and `client/` are never touched.
- **In CI:** a daily `cron` job runs `tools/check-update.mjs`, which exits 10 when the branch is behind, so the job can notify or open a PR.

> Honest scope: the *scheduling* (the actual daily trigger) and the *network sync* are owned by the host / CI runner — a static design-system file can't run a daemon by itself. These tools + the Update Center are how you attach the cadence; the enforcement gate genuinely blocks a bad push.

---

## Why it holds together

- **Single override surface.** A branch only ever edits `overrides/*` and adds to `client/*`. Nothing client-specific is buried inside master files, so a master file can always be replaced wholesale.
- **Defaults vs overrides.** `tokens/brand.css` (master defaults) and `overrides/brand.css` (branch values) are separate files declaring the same variables; the branch wins by import order. Master can change a default safely.
- **Learned stays put.** Promoted components and templates live under `client/` in the branch's own namespace, so a master update can add new things beside them without collision.

---

## Practical guidance for you (the master owner)
- Keep all client-specific assumptions OUT of master files — if you find yourself hardcoding a colour or a name, it belongs in a branch.
- Add, don't rename. New components/templates are MINOR and frictionless; renames are MAJOR and ripple to every branch.
- When a pattern recurs across many branches' learned variants, that's the signal to promote it INTO master (so every branch gets it) — that's how `BrowserMock` graduated.
