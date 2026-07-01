/* check-update.cjs — is this branch behind master?  (Node CommonJS; not bundled in the browser.)
 *
 * Compares the version this branch was last built on (overrides/BRANCH.md
 * "Based on master: X.Y.Z", falling back to update-manifest.json) against the
 * master design system's published update-manifest.json.
 *
 * Usage:
 *   node tools/check-update.cjs --master-dir .ds-master   # compare vs a cloned master checkout
 *   node tools/check-update.cjs --master-url <raw url>     # compare vs a fetched manifest
 *
 * Exit codes:  0 = up to date   ·   10 = behind (update available)   ·   1 = error
 * Prints a one-line JSON status to stdout either way.
 */
const { readFileSync } = require("node:fs");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function parseSemver(v) {
  const m = String(v || "").trim().match(/(\d+)\.(\d+)\.(\d+)/);
  return m ? [(+m[1]), (+m[2]), (+m[3])] : null;
}
function cmp(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
function localVersion() {
  try {
    const t = readFileSync("overrides/BRANCH.md", "utf8");
    const m = t.match(/based on master[^\d]*(\d+\.\d+\.\d+)/i);
    if (m) return m[1];
  } catch (e) {}
  try {
    return JSON.parse(readFileSync("update-manifest.json", "utf8")).version;
  } catch (e) {}
  return "0.0.0";
}
async function masterManifest() {
  const dir = arg("--master-dir");
  if (dir) return JSON.parse(readFileSync(dir + "/update-manifest.json", "utf8"));
  const url = arg("--master-url");
  if (url) {
    const headers = {};
    if (process.env.DS_SYNC_TOKEN) headers.Authorization = "Bearer " + process.env.DS_SYNC_TOKEN;
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error("fetch " + url + " → " + r.status);
    return await r.json();
  }
  throw new Error("pass --master-dir <cloned master> or --master-url <manifest url>");
}

(async () => {
  try {
    const local = localVersion();
    const m = await masterManifest();
    const master = m.version;
    const lv = parseSemver(local), mv = parseSemver(master);
    if (!lv || !mv) throw new Error("unparseable version (local=" + local + ", master=" + master + ")");
    const behind = cmp(lv, mv) < 0;
    const latest = (m.releases && m.releases[0]) || {};
    console.log(JSON.stringify({
      local, master, behind,
      level: behind ? (latest.level || "minor") : "none",
      summary: behind ? (latest.summary || "") : "up to date",
    }));
    process.exit(behind ? 10 : 0);
  } catch (e) {
    console.log(JSON.stringify({ error: String(e.message || e) }));
    process.exit(1);
  }
})();
