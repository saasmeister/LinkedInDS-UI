/* Visual Library — a Canva-style gallery for the design system.
   Hero visual + scrollable reel of all visuals. Each visual has a ⋯ menu:
   Download PNG · Download HTML · Add to design system (approve → learn).  */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const h = React.createElement;
  const APPROVED_KEY = "li-vds-approved-v1";

  /* ---- theme capture for faithful HTML export ------------------------- */
  function walk(sheet, cb) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { return; }
    if (!rules) return;
    for (const r of rules) {
      if (r.styleSheet) { walk(r.styleSheet, cb); }   // @import
      else cb(r);
    }
  }
  function collectThemeCss() {
    let vars = "", classes = "";
    for (const sheet of document.styleSheets) {
      walk(sheet, (r) => {
        if (!r.selectorText) return;
        if (r.selectorText === ":root") vars += r.style.cssText;
        else if (/^\.(sig-|headline)/.test(r.selectorText)) classes += r.cssText + "\n";
      });
    }
    // include any runtime brand-layer overrides (Tweaks) set on <html>
    vars += document.documentElement.style.cssText;
    return { vars, classes };
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual";
  }
  function download(href, name) {
    const a = document.createElement("a");
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function buildHtmlDoc(node, label) {
    const { vars, classes } = collectThemeCss();
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${label}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>:root{${vars}} html,body{margin:0}
body{display:flex;align-items:center;justify-content:center;background:#e6e6e6;min-height:100vh}
${classes}</style></head>
<body>${node.outerHTML}</body></html>`;
  }

  /* ---- icons ---------------------------------------------------------- */
  const Dots = () => h("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" },
    [h("circle", { key: 1, cx: 5, cy: 12, r: 2 }), h("circle", { key: 2, cx: 12, cy: 12, r: 2 }), h("circle", { key: 3, cx: 19, cy: 12, r: 2 })]);
  const Check = (p) => h("svg", { width: p.s || 16, height: p.s || 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" },
    h("polyline", { points: "20 6 9 17 4 12" }));

  function MenuItem({ icon, label, sub, onClick, accent }) {
    const [hover, setHover] = useState(false);
    return h("button", {
      onClick, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
      style: {
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        padding: "11px 14px", border: "none", background: hover ? "#f3f4f6" : "transparent",
        cursor: "pointer", borderRadius: 10, font: "inherit",
        color: accent ? "var(--brand-primary)" : "#1f2328",
      },
    }, [
      h("span", { key: "i", style: { width: 20, display: "flex", justifyContent: "center", color: accent ? "var(--brand-primary)" : "#6b7280" } }, icon),
      h("span", { key: "t", style: { display: "flex", flexDirection: "column", lineHeight: 1.25 } }, [
        h("span", { key: "l", style: { fontWeight: 600, fontSize: 14 } }, label),
        sub ? h("span", { key: "s", style: { fontSize: 12, color: "#9aa0a6" } }, sub) : null,
      ]),
    ]);
  }

  function VisualLibrary({ visuals }) {
    const [activeId, setActiveId] = useState(visuals[0].id);
    const [menu, setMenu] = useState(null);          // {id, x, y}
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);
    const [exp, setExp] = useState(null);            // {id, kind}
    const [approved, setApproved] = useState(() => {
      try { return new Set(JSON.parse(localStorage.getItem(APPROVED_KEY) || "[]")); } catch (e) { return new Set(); }
    });
    const expRef = useRef(null);
    const byId = Object.fromEntries(visuals.map((v) => [v.id, v]));
    const active = byId[activeId];

    const persist = (set) => { try { localStorage.setItem(APPROVED_KEY, JSON.stringify([...set])); } catch (e) {} };
    const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2800); };

    const openMenu = (e, id) => {
      e.stopPropagation();
      const r = e.currentTarget.getBoundingClientRect();
      setMenu({ id, x: Math.min(r.left, window.innerWidth - 280), y: r.bottom + 6 });
    };

    // run export once the offscreen full-size node is mounted
    useEffect(() => {
      if (!exp) return;
      let cancelled = false;
      const run = async () => {
        setBusy(true);
        await new Promise((r) => setTimeout(r, 80));
        const node = expRef.current && expRef.current.firstElementChild;
        const v = byId[exp.id];
        try {
          if (!node) throw new Error("no node");
          if (exp.kind === "png") {
            const url = await window.htmlToImage.toPng(node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true });
            download(url, slug(v.label) + ".png");
            if (!cancelled) flash("Exported " + slug(v.label) + ".png");
          } else {
            const doc = buildHtmlDoc(node, v.label);
            const url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
            download(url, slug(v.label) + ".html");
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            if (!cancelled) flash("Exported " + slug(v.label) + ".html");
          }
        } catch (err) {
          if (!cancelled) flash("Export failed — try again");
          console.error(err);
        }
        if (!cancelled) { setBusy(false); setExp(null); }
      };
      run();
      return () => { cancelled = true; };
    }, [exp]);

    const exportVisual = (id, kind) => { setMenu(null); setExp({ id, kind }); };
    const toggleApprove = (id) => {
      setMenu(null);
      setApproved((prev) => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); flash("Removed from the design system"); }
        else { next.add(id); flash("Added — the design system will learn from this variant"); }
        persist(next);
        return next;
      });
    };

    const menuFor = menu && byId[menu.id];

    return h("div", { style: { minHeight: "100vh", background: "#eceef0", fontFamily: "var(--font-body)" }, onClick: () => setMenu(null) }, [

      /* header */
      h("header", { key: "hd", style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid #e0e2e5", background: "#fff" } }, [
        h("div", { key: "l" }, [
          h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-.01em", color: "#1f2328" } }, "Visual Library"),
          h("div", { key: "s", style: { fontSize: 13, color: "#8a9098", marginTop: 2 } }, visuals.length + " visuals · 1080 × 1350 · export PNG or HTML"),
        ]),
        h("div", { key: "r", style: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#5f6671" } }, [
          h("span", { key: "d", style: { width: 9, height: 9, borderRadius: "50%", background: "var(--brand-primary)" } }),
          h("span", { key: "t" }, approved.size + " approved · feeding the system"),
        ]),
      ]),

      /* hero */
      h("section", { key: "hero", style: { display: "flex", justifyContent: "center", padding: "40px 24px 28px" } },
        h("div", { style: { position: "relative" } }, [
          // toolbar
          h("div", { key: "tb", style: { position: "absolute", top: -2, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", transform: "translateY(-130%)" } }, [
            h("div", { key: "lbl", style: { display: "flex", alignItems: "center", gap: 10 } }, [
              h("span", { style: { fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--brand-primary)" } }, active.type),
              approved.has(active.id) ? h("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#1f8a5b", background: "#e7f6ee", padding: "3px 9px", borderRadius: 999 } }, [h(Check, { key: "c", s: 13 }), "In design system"]) : null,
            ]),
            h("div", { key: "act", style: { display: "flex", alignItems: "center", gap: 10 } }, [
              h("span", { key: "sz", style: { fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#fff", border: "1px solid #e0e2e5", borderRadius: 999, padding: "5px 12px" } }, "1080 × 1350 · PNG / HTML"),
              h("button", { key: "m", onClick: (e) => openMenu(e, active.id), style: btn() }, h(Dots)),
            ]),
          ]),
          // stage
          h("div", { key: "stage", style: { width: 1080 * 0.46, height: 1350 * 0.46, borderRadius: 4, overflow: "hidden", boxShadow: "0 12px 50px rgba(0,0,0,.16)", background: "#fff" } },
            h("div", { style: { width: 1080, height: 1350, transform: "scale(0.46)", transformOrigin: "top left" } }, active.render())),
        ])),

      /* reel */
      h("div", { key: "reelwrap", style: { borderTop: "1px solid #e0e2e5", background: "#fff", padding: "16px 0" } },
        h("div", { style: { display: "flex", gap: 16, overflowX: "auto", padding: "4px 32px 10px" } },
          visuals.map((v) => h(Thumb, {
            key: v.id, v, active: v.id === activeId, approved: approved.has(v.id),
            onSelect: () => setActiveId(v.id), onMenu: (e) => openMenu(e, v.id),
          })))),

      /* offscreen full-size node for export */
      exp ? h("div", { key: "exp", "aria-hidden": "true", style: { position: "fixed", left: -99999, top: 0, pointerEvents: "none", opacity: 0 } },
        h("div", { ref: expRef }, byId[exp.id].render())) : null,

      /* popover menu */
      menuFor ? h("div", {
        key: "menu", onClick: (e) => e.stopPropagation(),
        style: { position: "fixed", left: menu.x, top: menu.y, width: 264, background: "#fff", borderRadius: 14, boxShadow: "0 10px 40px rgba(0,0,0,.18)", border: "1px solid #ebedf0", padding: 7, zIndex: 50 },
      }, [
        h("div", { key: "h", style: { padding: "8px 12px 6px", fontSize: 12, color: "#9aa0a6", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, menuFor.label),
        h(MenuItem, { key: "png", icon: imgIcon(), label: "Download as PNG", sub: "1080 × 1350 image", onClick: () => exportVisual(menuFor.id, "png") }),
        h(MenuItem, { key: "html", icon: codeIcon(), label: "Download as HTML", sub: "Standalone, editable file", onClick: () => exportVisual(menuFor.id, "html") }),
        h("div", { key: "sep", style: { height: 1, background: "#f0f1f3", margin: "6px 8px" } }),
        h(MenuItem, { key: "ds", icon: approved.has(menuFor.id) ? h(Check, {}) : plusIcon(), label: approved.has(menuFor.id) ? "Remove from design system" : "Add to design system", sub: approved.has(menuFor.id) ? "Approved variant" : "Client approved → system learns", accent: !approved.has(menuFor.id), onClick: () => toggleApprove(menuFor.id) }),
      ]) : null,

      busy ? h("div", { key: "busy", style: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.4)", zIndex: 60, fontSize: 14, color: "#5f6671" } }, "Exporting…") : null,

      toast ? h("div", { key: "toast", style: { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#1f2328", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.25)", zIndex: 70 } }, toast) : null,
    ]);
  }

  function Thumb({ v, active, approved, onSelect, onMenu }) {
    const [hover, setHover] = useState(false);
    return h("div", {
      onClick: onSelect, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
      style: { flex: "none", width: 1080 * 0.1, cursor: "pointer", position: "relative" },
    }, [
      h("div", { key: "f", style: { width: 1080 * 0.1, height: 1350 * 0.1, borderRadius: 4, overflow: "hidden", background: "#fff", boxShadow: active ? "0 0 0 3px var(--brand-primary)" : "0 1px 4px rgba(0,0,0,.14)", transition: "box-shadow .12s" } },
        h("div", { style: { width: 1080, height: 1350, transform: "scale(0.1)", transformOrigin: "top left", pointerEvents: "none" } }, v.render())),
      (hover || active) ? h("button", { key: "m", onClick: onMenu, style: { position: "absolute", top: 6, right: 6, ...btn(28), background: "rgba(255,255,255,.92)" } }, h(Dots)) : null,
      approved ? h("span", { key: "a", style: { position: "absolute", top: 6, left: 6, width: 22, height: 22, borderRadius: "50%", background: "#1f8a5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" } }, h(Check, { s: 13 })) : null,
      h("div", { key: "l", style: { fontSize: 11, color: active ? "#1f2328" : "#8a9098", marginTop: 6, lineHeight: 1.3, fontWeight: active ? 600 : 400, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } }, v.label),
    ]);
  }

  function btn(size) {
    const s = size || 34;
    return { width: s, height: s, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid #e0e2e5", background: "#fff", color: "#5f6671", cursor: "pointer", padding: 0 };
  }
  const imgIcon = () => h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, [h("rect", { key: 1, x: 3, y: 3, width: 18, height: 18, rx: 2 }), h("circle", { key: 2, cx: 8.5, cy: 8.5, r: 1.5 }), h("polyline", { key: 3, points: "21 15 16 10 5 21" })]);
  const codeIcon = () => h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, [h("polyline", { key: 1, points: "16 18 22 12 16 6" }), h("polyline", { key: 2, points: "8 6 2 12 8 18" })]);
  const plusIcon = () => h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" }, [h("line", { key: 1, x1: 12, y1: 5, x2: 12, y2: 19 }), h("line", { key: 2, x1: 5, y1: 12, x2: 19, y2: 12 })]);

  window.VisualLibrary = VisualLibrary;
})();
