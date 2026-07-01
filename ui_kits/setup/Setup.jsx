/* Brand Settings — window.Setup
   ONE page: left = all brand options (colours, tint, font, signature, optional
   source + hand-off), right = a live LinkedIn FEED preview of how a visual will
   look. Choices persist to localStorage and inject a live brand layer so the
   preview (and the rest of the app) reflect them immediately. The page can't
   write overrides/brand.css itself — "Copy for the assistant" hands the agent a
   ready prompt; or paste the CSS yourself. */
(function () {
  const { useState, useEffect } = React;
  const LS = "li-vds-brand-setup-v1";

  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora", "Manrope", "Figtree", "Outfit", "DM Sans"];
  const SIGS = [["underline", "Underline"], ["block", "Block"], ["bubble", "Bubble"], ["plain", "Plain"]];
  const DEFAULTS = {
    primary: "#0A66C2", secondary: "#16232B", accent: "#E7A33E",
    tint: 7, font: "Inter", signature: "underline",
    sourceType: "manual", figmaUrl: "", githubUrl: "", fileName: "",
    profileName: "Your Name", profileRole: "Founder · building in public", profileHandle: "yourname", profilePhoto: "",
  };

  function loadFont(font) {
    const id = "gf-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  function hexToRgb(hex) {
    const m = (hex || "#000").replace("#", "");
    const n = m.length === 3 ? m.split("").map(c => c + c).join("") : m;
    const i = parseInt(n, 16);
    return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
  }
  function lightTint(hex, pct) {
    const [r, g, b] = hexToRgb(hex); const a = pct / 100;
    const mix = c => Math.round(c * a + 255 * (1 - a));
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }
  function cssText(s) {
    return `:root {
  /* ---- Colours -------------------------------------------- */
  --brand-primary:   ${s.primary};
  --brand-secondary: ${s.secondary};
  --brand-accent:    ${s.accent};
  --brand-tint: ${s.tint}%;

  /* ---- Type ----------------------------------------------- */
  /* Add this <link> to the page <head> too:
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${s.font.replace(/\s+/g, "+")}:wght@400;500;600;700;800&display=swap"> */
  --brand-font:         '${s.font}', system-ui, sans-serif;
  --brand-font-display: '${s.font}', system-ui, sans-serif;

  /* ---- Headline signature --------------------------------- */
  --signature: ${s.signature};
}`;
  }
  function assistantMsg(s) {
    let src = "No external source — use the values below.";
    if (s.sourceType === "figma" && s.figmaUrl) src = "Figma file: " + s.figmaUrl + "\n(Pull the brand colours, fonts and logo from this Figma file.)";
    else if (s.sourceType === "github" && s.githubUrl) src = "GitHub repo: " + s.githubUrl + "\n(Pull theme tokens / colours / fonts from this repo.)";
    else if (s.sourceType === "file" && s.fileName) src = "Figma file \u201c" + s.fileName + "\u201d is attached in this chat.\n(Read it and pull the brand colours, fonts and logo from it.)";
    return `Set up my brand for the LinkedIn Visual Design System.

SOURCE
${src}

MY CHOICES (use these, or override them with what you find in the source)
- Primary (loud canvas):   ${s.primary}
- Secondary (section):     ${s.secondary}
- Accent (highlight):      ${s.accent}
- Light tint:              ${s.tint}%
- Font:                    ${s.font}
- Headline signature:      ${s.signature}

Please write these into overrides/brand.css (load the font's <link> too) and confirm. Then I'll start making visuals.`;
  }
  function copyText(text) {
    try { var ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0;top:-9999px"; document.body.appendChild(ta); ta.select(); var ok = document.execCommand("copy"); ta.remove(); if (ok) return true; } catch (e) {}
    if (navigator.clipboard) { navigator.clipboard.writeText(text); return true; }
    return false;
  }
  const h = React.createElement;

  // Read the live configured brand from the document (reflects overrides/brand.css),
  // so the slider starts on the real brand instead of the default blue/Inter.
  function readBrand() {
    try {
      const cs = getComputedStyle(document.documentElement);
      const g = v => (cs.getPropertyValue(v) || "").trim();
      const fam = v => { const m = g(v).match(/^['"]?([^'",]+)/); return m ? m[1].trim() : ""; };
      const out = {};
      const p = g("--brand-primary"); if (p) out.primary = p;
      const sc = g("--brand-secondary"); if (sc) out.secondary = sc;
      const ac = g("--brand-accent"); if (ac) out.accent = ac;
      const t = parseInt(g("--brand-tint"), 10); if (!isNaN(t)) out.tint = t;
      const f = fam("--brand-font"); if (f) out.font = f;
      const sg = g("--signature"); if (sg) out.signature = sg;
      return out;
    } catch (e) { return {}; }
  }

  function Setup() {
    const [s, setS] = useState(() => {
      const live = readBrand();   // configured brand wins over the blue/Inter defaults
      try { return Object.assign({}, DEFAULTS, live, JSON.parse(localStorage.getItem(LS)) || {}); }
      catch (e) { return Object.assign({}, DEFAULTS, live); }
    });
    const [copied, setCopied] = useState("");

    useEffect(() => { loadFont(s.font); }, [s.font]);
    useEffect(() => {
      try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {}
      let el = document.getElementById("brand-live");
      if (!el) { el = document.createElement("style"); el.id = "brand-live"; document.head.appendChild(el); }
      el.textContent = cssText(s);
    }, [s]);

    const set = (k, v) => setS(p => Object.assign({}, p, { [k]: v }));
    const light = lightTint(s.primary, s.tint);
    const copy = (key, text) => { copyText(text); setCopied(key); setTimeout(() => setCopied(""), 1700); };
    const sig = (color) => s.signature === "underline" ? { boxShadow: `inset 0 -0.14em 0 ${color || s.accent}` }
      : s.signature === "block" ? { background: color || s.accent, color: "#fff", padding: "0 .14em", borderRadius: 3 }
      : s.signature === "bubble" ? { border: `2.5px solid ${color || s.accent}`, borderRadius: "999px", padding: ".02em .4em" }
      : {};

    // ---- tokens / chrome styles (settings UI is neutral Inter; only the preview uses the brand font) ----
    const ui = "'Inter',system-ui,-apple-system,sans-serif";
    const label = { display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "#9aa0a6", margin: "0 0 9px" };
    const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)" };
    const field = { width: "100%", padding: "11px 12px", fontSize: 14, border: "1px solid #d8dadd", borderRadius: 9, background: "#fff", boxSizing: "border-box", fontFamily: "inherit", color: "#1f2328" };

    function Color({ k, name, role }) {
      return h("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 11 } },
        h("input", { type: "color", value: s[k], onChange: e => set(k, e.target.value), style: { width: 46, height: 38, border: "1px solid #d8dadd", borderRadius: 8, background: "#fff", padding: 2, cursor: "pointer", flex: "none" } }),
        h("div", { style: { minWidth: 0 } },
          h("div", { style: { fontWeight: 600, fontSize: 14 } }, name),
          h("div", { style: { fontSize: 12.5, color: "#8a9098" } }, role)),
        h("div", { style: { marginLeft: "auto", fontSize: 12.5, color: "#8a9098", fontFamily: "monospace" } }, (s[k] || "").toUpperCase()));
    }

    // ---- the LIVE feed preview (right) ----
    function FeedVisual() {
      // a single-visual "loud" cover, recoloured live
      return h("div", { style: { aspectRatio: "4/5", background: s.primary, color: "#fff", padding: "30px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: `'${s.font}', sans-serif` } },
        h("div", { style: { fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.72)" } }, "The hard truth"),
        h("div", null,
          h("div", { style: { fontWeight: 800, fontSize: 38, lineHeight: 1.05, letterSpacing: "-.02em" } },
            "Most outreach dies on the ",
            h("span", { style: sig("#fff") }, "first line")),
          h("div", { style: { display: "flex", alignItems: "center", gap: 9, marginTop: 24 } },
            h("span", { style: { width: 30, height: 30, borderRadius: "50%", flex: "none", background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : "rgba(255,255,255,.25)" } }),
            h("span", { style: { fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.9)" } }, "@" + (s.profileHandle || "yourname")),
            h("span", { style: { marginLeft: "auto", fontSize: 22 } }, "\u2192"))));
    }
    function MiniRole(bg, fg, kicker, kc) {
      return h("div", { style: { flex: 1, aspectRatio: "4/5", borderRadius: 8, background: bg, color: fg, padding: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: `'${s.font}', sans-serif` } },
        h("div", { style: { fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: kc } }, kicker),
        h("div", { style: { fontWeight: 700, fontSize: 13, lineHeight: 1.08, marginTop: 4 } }, "Headline"));
    }
    function Feed() {
      const act = (txt) => h("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#5f6671", padding: "9px 0" } }, txt);
      return h("div", null,
        h("span", { style: label }, "Live preview — in the feed"),
        h("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,.08)", maxWidth: 380 } },
          // post header
          h("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "13px 14px 10px" } },
            h("span", { style: { width: 44, height: 44, borderRadius: "50%", border: "1px solid #e5e7eb", flex: "none", background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : light } }),
            h("div", { style: { lineHeight: 1.25 } },
              h("div", { style: { fontWeight: 700, fontSize: 14, color: "#111827" } }, s.profileName || "Your Name"),
              h("div", { style: { fontSize: 12, color: "#6b7280" } }, s.profileRole || "Founder · building in public"),
              h("div", { style: { fontSize: 12, color: "#6b7280" } }, "2h · \uD83C\uDF10")),
            h("span", { style: { marginLeft: "auto", color: s.primary, fontWeight: 700, fontSize: 13 } }, "+ Follow")),
          // post text
          h("div", { style: { padding: "0 14px 12px", fontSize: 13.5, lineHeight: 1.5, color: "#1f2328" } },
            "Spent years getting this wrong. Here's the one change that doubled my reply rate \uD83D\uDC47"),
          // the visual
          FeedVisual(),
          // action bar
          h("div", { style: { display: "flex", borderTop: "1px solid #eef0f2" } },
            act("\uD83D\uDC4D Like"), act("\uD83D\uDCAC Comment"), act("\uD83D\uDD01 Repost"), act("\u27A4 Send"))),
        // three canvas roles
        h("div", { style: { marginTop: 16 } },
          h("span", { style: label }, "Your three canvases"),
          h("div", { style: { display: "flex", gap: 8, maxWidth: 380 } },
            MiniRole(s.primary, "#fff", "Loud", "rgba(255,255,255,.7)"),
            MiniRole(light, "#18181b", "Light", "#8a9098"),
            MiniRole(s.secondary, "#fff", "Section", s.accent))));
    }

    // ---- left controls ----
    const srcOpt = (val, name) => h("button", { onClick: () => set("sourceType", val),
      style: { flex: 1, minWidth: 70, padding: "8px 6px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", borderRadius: 8, border: "1.5px solid " + (s.sourceType === val ? s.primary : "#d8dadd"), background: s.sourceType === val ? s.primary : "#fff", color: s.sourceType === val ? "#fff" : "#3a3f45", fontFamily: "inherit" } }, name);

    const left = h("div", { style: { flex: "1 1 0", minWidth: 0, maxWidth: 560 } },
      h("div", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: s.primary, marginBottom: 10 } },
        h("span", { style: { width: 8, height: 8, borderRadius: "50%", background: s.primary } }), "Brand settings"),
      h("h1", { style: { fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", margin: "0 0 6px", color: "#111827" } }, "Your brand"),
      h("p", { style: { fontSize: 14.5, lineHeight: 1.5, color: "#6b7280", margin: "0 0 20px" } }, "Set it here or just tell the assistant in chat — everything updates live on the right, and persists across every visual."),

      // Profile (name · role · photo)
      h("div", { style: card },
        h("span", { style: label }, "Your profile"),
        h("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" } },
          h("label", { style: { flex: "none", cursor: "pointer", textAlign: "center" } },
            h("span", { style: { display: "block", width: 60, height: 60, borderRadius: "50%", border: "1px solid #d8dadd", background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : "#f1f2f4", marginBottom: 5 } },
              !s.profilePhoto && h("span", { style: { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#b6bcc3" } }, "+")),
            h("span", { style: { fontSize: 11, color: s.primary, fontWeight: 600 } }, s.profilePhoto ? "Change" : "Photo"),
            h("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => set("profilePhoto", r.result); r.readAsDataURL(f); } })),
          h("div", { style: { flex: "1 1 0", minWidth: 0 } },
            h("input", { style: Object.assign({}, field, { marginBottom: 8 }), placeholder: "Name", value: s.profileName, onChange: e => set("profileName", e.target.value) }),
            h("input", { style: Object.assign({}, field, { marginBottom: 8 }), placeholder: "Role / function (e.g. Founder · SaaS)", value: s.profileRole, onChange: e => set("profileRole", e.target.value) }),
            h("input", { style: field, placeholder: "@handle", value: s.profileHandle, onChange: e => set("profileHandle", e.target.value.replace(/^@/, "")) }))),
        s.profilePhoto && h("button", { onClick: () => set("profilePhoto", ""), style: { marginTop: 10, fontSize: 12, fontWeight: 600, color: "#8a9098", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" } }, "Remove photo")),

      // Colours
      h("div", { style: card },
        h("span", { style: label }, "Colours"),
        h(Color, { k: "primary", name: "Primary", role: "Loud canvas — covers & backs" }),
        h(Color, { k: "secondary", name: "Secondary", role: "Section canvas — chapter markers" }),
        h(Color, { k: "accent", name: "Accent", role: "Highlight / signature mark" }),
        h("div", { style: { marginTop: 14 } },
          h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } },
            h("span", { style: { fontSize: 13, fontWeight: 600, color: "#3a3f45" } }, "Light-canvas tint"),
            h("span", { style: { fontSize: 13, color: "#8a9098", fontFamily: "monospace" } }, s.tint + "%")),
          h("input", { type: "range", min: 3, max: 16, value: s.tint, onChange: e => set("tint", +e.target.value), style: { width: "100%", accentColor: s.primary } }))),

      // Type & signature
      h("div", { style: card },
        h("span", { style: label }, "Type & signature"),
        h("select", { value: s.font, onChange: e => set("font", e.target.value), style: Object.assign({}, field, { fontFamily: `'${s.font}', sans-serif`, marginBottom: 14 }) },
          FONTS.map(f => h("option", { key: f, value: f }, f))),
        h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          SIGS.map(([val, name]) => h("button", { key: val, onClick: () => set("signature", val),
            style: { flex: 1, minWidth: 78, padding: "9px 6px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 8, border: "1.5px solid " + (s.signature === val ? s.primary : "#d8dadd"), background: s.signature === val ? s.primary : "#fff", color: s.signature === val ? "#fff" : "#3a3f45", fontFamily: "inherit" } }, name)))),

      // Source (optional)
      h("div", { style: card },
        h("span", { style: label }, "Start from an existing brand (optional)"),
        h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
          srcOpt("manual", "Manual"), srcOpt("figma", "Figma"), srcOpt("github", "GitHub"), srcOpt("file", ".fig file")),
        s.sourceType === "figma" && h("input", { style: field, placeholder: "https://www.figma.com/file/…", value: s.figmaUrl, onChange: e => set("figmaUrl", e.target.value) }),
        s.sourceType === "github" && h("input", { style: field, placeholder: "https://github.com/owner/repo", value: s.githubUrl, onChange: e => set("githubUrl", e.target.value) }),
        s.sourceType === "file" && h("label", { style: { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "1px solid #d8dadd", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3a3f45" } },
          s.fileName ? "\u2713 " + s.fileName : "Choose .fig file",
          h("input", { type: "file", accept: ".fig", style: { display: "none" }, onChange: e => set("fileName", e.target.files[0] ? e.target.files[0].name : "") })),
        (s.sourceType === "figma" || s.sourceType === "github" || s.sourceType === "file") &&
          h("div", { style: { fontSize: 12, color: "#8a9098", marginTop: 8, lineHeight: 1.4 } }, "The assistant imports it — paste/attach it in the chat with the hand-off below.")),

      // Hand-off
      h("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } },
        h("button", { onClick: () => copy("msg", assistantMsg(s)), style: { display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", fontSize: 15, fontWeight: 700, borderRadius: 11, cursor: "pointer", border: "none", background: s.primary, color: "#fff", fontFamily: "inherit" } },
          copied === "msg" ? "Copied — paste in chat \u2713" : "Apply via the assistant"),
        h("button", { onClick: () => copy("css", cssText(s)), style: { padding: "12px 18px", fontSize: 14, fontWeight: 600, borderRadius: 11, cursor: "pointer", border: "1px solid #d8dadd", background: "#fff", color: "#5f6671", fontFamily: "inherit" } },
          copied === "css" ? "Copied brand.css \u2713" : "Copy brand.css")));

    return h("div", { style: { minHeight: "100vh", fontFamily: ui, color: "#1f2328", background: "#f6f7f8" } },
      h("div", { style: { display: "flex", gap: 40, alignItems: "flex-start", maxWidth: 1180, margin: "0 auto", padding: "34px 36px 60px", boxSizing: "border-box", flexWrap: "wrap" } },
        left,
        h("div", { style: { flex: "0 0 380px", maxWidth: 380, position: "sticky", top: 28 } }, Feed())));
  }

  window.Setup = Setup;
})();
