# tools/ — enforcement & update wiring

Two things make the master ↔ branch model real: a **gate** that blocks bad pushes, and a **daily check** for updates.

## 1. Enforce ownership (blocks a bad push)

`check-branch.mjs` reads `governance/ownership.json` + `governance/master.lock` and exits non-zero on a violation — so it stops the push.

```bash
node tools/check-branch.mjs           # validate
node tools/check-branch.mjs --write-lock   # master owner: regenerate the lock after legit changes
```

It fails when:
- a **branch edits / adds / deletes a master-owned file** (anything outside `overrides/` + `client/`), or
- a **client name** (listed in `ownership.json → denyClientNames`) leaks into a master file.

### Wire it as a git pre-push hook
```bash
# .git/hooks/pre-push  (chmod +x)
#!/bin/sh
node tools/check-branch.mjs || exit 1
```

### Or as a CI gate (runs on every PR)
```yaml
# .github/workflows/ownership.yml
name: ownership
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node tools/check-branch.mjs
```

**Master owner flow:** make your change → `node tools/check-branch.mjs --write-lock` → commit the new `master.lock` → publish. The new lock becomes the baseline every branch validates against.

## 2. Daily update check

Two ways, depending on where the branch runs:

- **In-platform:** open the **Update Center** (`ui_kits/update-center/`). It auto-checks on load if it hasn't in 24h, shows any pending master version with its changelog + included templates, and applies only after you confirm.
- **Unattended (the real daily sync):** `.github/workflows/daily-update.yml` runs on GitHub's servers every day ~12:00 — clones the private master repo, runs `tools/check-update.mjs`, and on a new version runs `tools/apply-update.mjs` to install master-owned files (your `overrides/` + `client/` are never touched) and commit. **See `tools/CONNECT.md` for the one-time setup** (set `MASTER_REPO`, add the `DS_SYNC_TOKEN` secret). This is the only way to get a true daily scan that runs whether or not the project is open — a static design-system file can't run a daemon by itself.

```bash
node tools/check-update.cjs --master-dir .ds-master   # exit 10 = behind
node tools/apply-update.cjs --master-dir .ds-master   # install master-owned files
```
