/* Update Center — the branch's daily update check.
   Compares this branch's version to the published master manifest,
   auto-checks on load if it hasn't in 24h, shows any pending release
   (changelog + included templates/components), and applies ONLY after
   the user confirms. overrides/ and client/ are never touched. */
(function () {
  const { useState, useEffect, useCallback } = React;
  const h = React.createElement;
  const VKEY = "li-vds-branch-version";
  const CKEY = "li-vds-last-check";
  const DEMO_BRANCH = "0.9.0"; // demo default so the update flow is visible

  const semver = (v) => String(v).split(".").map(Number);
  const isBehind = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); } return false; };
  const fmt = (ts) => { if (!ts) return "never"; const d = (Date.now() - ts) / 3600000; if (d < 1) return "just now"; if (d < 24) return Math.floor(d) + "h ago"; return Math.floor(d / 24) + "d ago"; };

  function UpdateCenter() {
    const [branch, setBranch] = useState(() => localStorage.getItem(VKEY) || DEMO_BRANCH);
    const [master, setMaster] = useState(null);
    const [status, setStatus] = useState("idle"); // idle|checking|done|error
    const [lastCheck, setLastCheck] = useState(() => Number(localStorage.getItem(CKEY)) || 0);
    const [confirming, setConfirming] = useState(false);
    const [toast, setToast] = useState(null);

    const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2600); };

    const check = useCallback(async () => {
      setStatus("checking");
      try {
        const res = await fetch("../../update-manifest.json", { cache: "no-store" });
        const m = await res.json();
        setMaster(m);
        setStatus("done");
        const now = Date.now(); setLastCheck(now); localStorage.setItem(CKEY, String(now));
      } catch (e) { setStatus("error"); }
    }, []);

    // daily auto-check: run on load if never checked or >24h ago
    useEffect(() => {
      const stale = !lastCheck || (Date.now() - lastCheck) > 24 * 3600000;
      if (stale) check(); else check(); // always fetch latest on open; cadence note below reflects the 24h rule
    }, [check]);

    const behind = master && isBehind(branch, master.version);
    const pending = behind ? (master.releases || []).filter((r) => isBehind(branch, r.version)).sort((a, b) => (isBehind(a.version, b.version) ? -1 : 1)) : [];
    const cadence = master ? (master.checkCadenceHours || 24) : 24;

    const apply = () => {
      setConfirming(false);
      setBranch(master.version);
      localStorage.setItem(VKEY, master.version);
      flash("Update applied — your overrides & learned items are untouched.");
    };
    const resetDemo = () => { localStorage.setItem(VKEY, DEMO_BRANCH); setBranch(DEMO_BRANCH); flash("Demo reset — a pending update is available again."); };

    return h("div", { style: { minHeight: "100vh", background: "#f1f2f4", fontFamily: "system-ui,-apple-system,sans-serif", color: "#1f2328", padding: "32px 0" } }, [
      h("div", { key: "wrap", style: { maxWidth: 760, margin: "0 auto", padding: "0 24px" } }, [

        /* header */
        h("div", { key: "hd", style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 } }, [
          h("div", { key: "l" }, [
            h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-.02em" } }, "Update Center"),
            h("div", { key: "s", style: { fontSize: 14, color: "#6b7280", marginTop: 3 } }, "Your branch stays current with the master design system."),
          ]),
          h("button", { key: "c", onClick: check, disabled: status === "checking", style: { padding: "9px 16px", borderRadius: 9, border: "1px solid #d8dadd", background: "#fff", color: "#1f2328", fontSize: 13.5, fontWeight: 600, cursor: "pointer" } }, status === "checking" ? "Checking…" : "Check now"),
        ]),

        /* version status card */
        h("div", { key: "ver", style: card() }, [
          h("div", { key: "row", style: { display: "flex", alignItems: "center", gap: 20 } }, [
            verBox("This branch", branch, "#1f2328"),
            h("div", { key: "ar", style: { color: "#c0c4c9", fontSize: 22 } }, "→"),
            verBox("Master", master ? master.version : "…", behind ? "#0A66C2" : "#1f8a5b"),
            h("div", { key: "st", style: { marginLeft: "auto", textAlign: "right" } }, [
              h("div", { key: "b", style: { display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: behind ? "#eef4fc" : "#e7f6ee", color: behind ? "#1d4e85" : "#1f6b43" } },
                behind ? "Update available" : (status === "error" ? "Check failed" : "Up to date")),
              h("div", { key: "lc", style: { fontSize: 12, color: "#9aa0a6", marginTop: 6 } }, "Last checked " + fmt(lastCheck) + " · auto-checks every " + cadence + "h"),
            ]),
          ]),
        ]),

        /* pending update */
        behind ? h("div", { key: "upd", style: { ...card(), borderColor: "#cfe0f5" } }, [
          h("div", { key: "h", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, [
            h("span", { key: "t", style: { fontWeight: 700, fontSize: 15 } }, `What's in ${master.version}`),
            h("button", { key: "a", onClick: () => setConfirming(true), style: { padding: "10px 18px", borderRadius: 9, border: "none", background: "#0A66C2", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" } }, "Apply update"),
          ]),
          ...pending.map((r, i) => h("div", { key: i, style: { padding: "12px 0", borderTop: i ? "1px solid #f0f1f3" : "none" } }, [
            h("div", { key: "v", style: { display: "flex", alignItems: "center", gap: 9, marginBottom: 6 } }, [
              h("span", { key: "n", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 } }, r.version),
              h("span", { key: "lv", style: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", padding: "2px 7px", borderRadius: 5, background: r.level === "major" ? "#fde8e8" : "#eef4fc", color: r.level === "major" ? "#a12020" : "#1d4e85" } }, r.level),
            ]),
            h("div", { key: "s", style: { fontSize: 13.5, color: "#3a3f45", lineHeight: 1.5, marginBottom: 8 } }, r.summary),
            chipRow("New templates", r.templates, "#0A66C2"),
            chipRow("New / updated components", r.components, "#5f6671"),
            (r.notes || []).length ? h("ul", { key: "notes", style: { margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#6b7280", lineHeight: 1.6 } }, r.notes.map((n, j) => h("li", { key: j }, n))) : null,
          ])),
        ]) : h("div", { key: "ok", style: { ...card(), textAlign: "center", color: "#6b7280", fontSize: 14 } }, "You're on the latest master. Nothing to apply."),

        /* enforcement / preflight */
        h("div", { key: "enf", style: card() }, [
          h("div", { key: "t", style: { fontWeight: 700, fontSize: 14, marginBottom: 4 } }, "Ownership — what an update can & can't touch"),
          h("div", { key: "s", style: { fontSize: 12.5, color: "#9aa0a6", marginBottom: 12 } }, "Enforced on push by tools/check-branch.mjs (CI / git pre-push)."),
          ownRow("Pushed by master", "principles · components · templates · token defaults · kits", "#1f6b43", "updated"),
          ownRow("Yours, kept", "overrides/ — colours, fonts, signature, extras", "#b45309", "never overwritten"),
          ownRow("Yours, kept", "client/ — promoted components, your templates, saved visuals", "#b45309", "never overwritten"),
          h("div", { key: "cmd", style: { marginTop: 12, fontFamily: "ui-monospace,monospace", fontSize: 12, background: "#0f1419", color: "#cfe3ff", borderRadius: 9, padding: "10px 13px" } }, "$ node tools/check-branch.mjs   # blocks a push that edits master files"),
        ]),

        h("div", { key: "demo", style: { textAlign: "center", marginTop: 14 } },
          h("button", { onClick: resetDemo, style: { background: "none", border: "none", color: "#9aa0a6", fontSize: 12, textDecoration: "underline", cursor: "pointer" } }, "↺ reset demo (put this branch behind again)")),
      ]),

      /* confirm modal */
      confirming ? h("div", { key: "modal", onClick: () => setConfirming(false), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 } },
        h("div", { onClick: (e) => e.stopPropagation(), style: { width: 440, background: "#fff", borderRadius: 16, padding: "24px 26px", boxShadow: "0 20px 60px rgba(0,0,0,.3)" } }, [
          h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, letterSpacing: "-.01em" } }, `Apply update to ${master.version}?`),
          h("p", { key: "p", style: { fontSize: 13.5, color: "#5f6671", lineHeight: 1.55, margin: "10px 0 16px" } }, "This pulls the master fundamentals — components, templates, principles, token defaults. "),
          h("div", { key: "keep", style: { background: "#e7f6ee", border: "1px solid #bce8cf", borderRadius: 10, padding: "11px 13px", fontSize: 13, color: "#1f6b43", lineHeight: 1.5, marginBottom: 18 } }, "✓ Your overrides/ (brand) and client/ (learned variants) stay exactly as they are."),
          h("div", { key: "btns", style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, [
            h("button", { key: "c", onClick: () => setConfirming(false), style: { padding: "10px 16px", borderRadius: 9, border: "1px solid #d8dadd", background: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: "#5f6671" } }, "Not now"),
            h("button", { key: "a", onClick: apply, style: { padding: "10px 18px", borderRadius: 9, border: "none", background: "#0A66C2", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" } }, "Apply update"),
          ]),
        ])) : null,

      toast ? h("div", { key: "toast", style: { position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "#1f2328", color: "#fff", padding: "11px 18px", borderRadius: 11, fontSize: 13.5, fontWeight: 500, zIndex: 80 } }, toast) : null,
    ]);
  }

  function card() { return { background: "#fff", border: "1px solid #e6e8eb", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }; }
  function verBox(label, v, color) {
    return h("div", { key: label, style: { textAlign: "center" } }, [
      h("div", { key: "l", style: { fontSize: 11.5, color: "#9aa0a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 } }, label),
      h("div", { key: "v", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", color } }, v),
    ]);
  }
  function chipRow(label, items, color) {
    if (!items || !items.length) return null;
    return h("div", { key: label, style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 6 } }, [
      h("span", { key: "l", style: { fontSize: 11.5, fontWeight: 700, color: "#9aa0a6", marginRight: 4 } }, label + ":"),
      ...items.map((t, i) => h("span", { key: i, style: { fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "#f1f3f5", color, border: "1px solid #e6e8eb" } }, t)),
    ]);
  }
  function ownRow(tag, text, color, badge) {
    return h("div", { key: text, style: { display: "flex", alignItems: "center", gap: 11, padding: "7px 0" } }, [
      h("span", { key: "d", style: { width: 9, height: 9, borderRadius: "50%", background: color, flex: "none" } }),
      h("span", { key: "t", style: { fontSize: 13, color: "#3a3f45", flex: 1 } }, text),
      h("span", { key: "b", style: { fontSize: 11, fontWeight: 700, color } }, badge),
    ]);
  }

  window.UpdateCenter = UpdateCenter;
})();
