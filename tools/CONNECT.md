# Connecting this design system to a private GitHub repo (auto-updates)

Goal: this design system stays connected to your **private master repo** and
**installs updates automatically — every day, on GitHub's servers, whether or
not anyone has the project open or asked for it.**

## The honest architecture (read this first)

A design system is a folder of static files. It has **no background process** —
its own code only runs when a page is open in a browser. So "scan daily at 12:00
regardless of whether it's open" is **impossible from inside the project itself**.

The one place a daily job runs unattended is a **scheduled GitHub Action** — it
runs on GitHub's infrastructure on a cron, with nothing open anywhere. That is
exactly what `/.github/workflows/daily-update.yml` does. This is the real,
working mechanism; there is no other way to get a true unattended daily sync.

```
private master repo  ──(daily 12:00 cron, on GitHub)──>  this repo
   (source of truth)        clone → compare → install → commit
```

## One-time setup (≈3 minutes)

1. **Push this project to a GitHub repo** (private is fine).
2. **Pick your master repo** — the private repo that holds the latest design
   system (the source of truth you publish updates to). In
   `.github/workflows/daily-update.yml`, set:
   ```yaml
   env:
     MASTER_REPO: your-org/LinkedIn-DS
   ```
3. **Add the read token as a secret** (this is the "secret key" you mentioned —
   it lives in GitHub, you never paste it into a chat or a file):
   - Create a **fine-grained Personal Access Token** with **Read-only → Contents**
     access to the master repo. (GitHub → Settings → Developer settings →
     Fine-grained tokens.)
   - In **this** repo: Settings → Secrets and variables → Actions → **New
     repository secret**, name it **`DS_SYNC_TOKEN`**, paste the token.
   - Pushing the installed update back into this repo uses the built-in
     `GITHUB_TOKEN` — no extra secret needed for that.
4. **Enable Actions** for the repo if it asks, then open the **Actions** tab and
   hit **Run workflow** once to confirm it works. After that it runs daily.

## What it does each run

1. Clones the master repo (read-only, via the token).
2. `tools/check-update.cjs` compares this repo's version
   (`overrides/BRANCH.md` → falls back to `update-manifest.json`) to master's
   `update-manifest.json`. Up to date → it stops. Behind → continues.
3. `tools/apply-update.cjs` copies the **master-owned** files in, honouring
   `governance/ownership.json`: your **`overrides/`** (brand, fonts, signature)
   and **`client/`** (your saved/learned items) are **never overwritten**, and
   generated files (`_ds_bundle.js`, etc.) + your `.github/` workflow are left
   alone.
4. Commits the update with a clear message (`chore(ds): auto-update to v…`) and
   pushes. `overrides/BRANCH.md` is stamped with the new version.

## Choices

- **Auto-install vs review:** the default pushes the update straight to the
  branch. To require a human review instead, swap the "Commit & push" step for a
  pull-request action (one line, noted in the workflow).
- **Exact noon:** cron is UTC. `0 10 * * *` ≈ 12:00 Amsterdam in summer (CEST);
  use `0 11 * * *` for 12:00 in winter (CET), or run two cron lines.

## Caveats

- GitHub **disables scheduled workflows after ~60 days with no repo activity** —
  the daily auto-commits keep it alive, but a long-dormant repo may need a manual
  "Run workflow" to wake it.
- The sync is **additive/overwrite**: it won't delete a file master removed
  (rare). The changelog flags any **MAJOR** change that needs a look.
- This installs into the **repo**. A running browser instance still needs a
  reload to pick up newly committed files (the in-app **Update Center** is the
  on-open / 24h check for that side).
