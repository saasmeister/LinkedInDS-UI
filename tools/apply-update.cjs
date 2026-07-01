/* apply-update.cjs — install a master update into this branch.  (Node CommonJS; not bundled in the browser.)
 *
 * Copies master-owned files from a cloned master checkout into this repo,
 * honouring governance/ownership.json: it NEVER touches branch-owned paths
 * (overrides/**, client/**), skips ignored/generated files, and leaves the
 * branch's own .github/ workflow + secrets alone. Then it stamps the new
 * version into overrides/BRANCH.md.
 *
 * Usage:  node tools/apply-update.cjs --master-dir .ds-master
 *
 * Additive/overwrite only — it does not delete files master removed (rare;
 * review the changelog for MAJOR notes). Run check-update.cjs first.
 */
const { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } = require("node:fs");
const { dirname, join, relative, sep } = require("node:path");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
const MASTER = arg("--master-dir") || ".ds-master";

const own = JSON.parse(readFileSync("governance/ownership.json", "utf8"));
const PROTECT = [
  ...(own.branchOwned || []),   // overrides/**, client/**
  ...(own.ignored || []),       // uploads, scraps, _ds_* generated, master.lock, thumbnails, support.js
  ".git/**",
  ".github/**",                 // the branch owns its own workflow + secrets wiring
  "node_modules/**",
  ".ds-master/**",
];

function globToRe(g) {
  const re = g.replace(/[.+^${}()|[\]\\]/g, "\\$&")
              .replace(/\*\*\/?/g, "\u0000")
              .replace(/\*/g, "[^/]*")
              .replace(/\u0000/g, ".*");
  return new RegExp("^" + re + "$");
}
const PROTECT_RE = PROTECT.map(globToRe);
const isProtected = (p) => PROTECT_RE.some((re) => re.test(p));

function walk(dir, base, out) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(base, abs).split(sep).join("/");
    if (rel === ".git" || rel.indexOf(".git/") === 0) continue;
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, base, out);
    else out.push(rel);
  }
}

const files = [];
walk(MASTER, MASTER, files);

let written = 0, skipped = 0;
for (const rel of files) {
  if (isProtected(rel)) { skipped++; continue; }
  mkdirSync(dirname(rel) || ".", { recursive: true });
  copyFileSync(join(MASTER, rel), rel);
  written++;
}

let newVersion = "unknown";
try {
  newVersion = JSON.parse(readFileSync(MASTER + "/update-manifest.json", "utf8")).version;
} catch (e) {}
try {
  let b = readFileSync("overrides/BRANCH.md", "utf8");
  b = b.replace(/based on master \*\*VERSION [\d.]+\*\*/i, "based on master **VERSION " + newVersion + "**")
       .replace(/(\*\*Based on master:\*\* )[\d.]+/i, "$1" + newVersion);
  writeFileSync("overrides/BRANCH.md", b);
} catch (e) {}

console.log(JSON.stringify({ applied: newVersion, written, skipped }));
