/* Board editor — a small Canva-style direct-manipulation layer for the
   focused artboard in the Visual Board.

   What it does in edit mode:
     · click an element to select it (selection box + floating toolbar)
     · drag the body to move it (position:relative offset — never reflows siblings)
     · drag the corner handle to resize (uniform scale incl. font-size)
     · drag a palette item from the left rail onto the canvas to add it
     · delete / duplicate / bring-to-front / cycle brand colour
   It only mutates the artboard DOM; the controller persists artboard.innerHTML
   per variant and re-renders thumbnails. Coordinates are in true 1080×1350
   artboard space (pointer deltas are divided by the live preview scale). */
window.BoardEditor = (function () {
  var S = {
    frame: null, heroStage: null, selbox: null, eltbar: null, palette: null, cpop: null,
    onChange: function () {}, flash: function () {},
    art: null, scale: 1, sel: null, selected: [], marquee: null, olayer: null, active: false,
  };

  /* ---------- palette: draggable elements (brand-aware) ---------- */
  // Design-system colour swatches offered in the picker. Brand entries stay theme-linked
  // (a var() string, so they re-colour with the brand); literals are fixed.
  var SWATCHES = [
    { label: "Primary", val: "var(--brand-primary)" },
    { label: "Secondary", val: "var(--brand-secondary)" },
    { label: "Accent", val: "var(--brand-accent)" },
    { label: "Ink", val: "var(--fg)" },
    { label: "Muted", val: "var(--muted)" },
    { label: "Soft", val: "var(--soft)" },
    { label: "White", val: "#FFFFFF" },
    { label: "Ink 900", val: "#18181B" },
  ];
  var CUSTOM_KEY = "li-vds-board-colors-v1";
  function loadCustom() { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; } catch (e) { return []; } }
  var CUSTOM = loadCustom();
  function saveCustom() { try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(CUSTOM)); } catch (e) {} }

  /* ---------- magnetic 12-col grid (artboard = 1080×1350) ---------- */
  var MARGIN = 72, COLS = 12, GUTTER = 24;
  var COLW = (1080 - 2 * MARGIN - (COLS - 1) * GUTTER) / COLS;   // = 56
  var ROWH = 78;                                                // vertical rhythm
  var SNAP = 16;                                                // snap threshold (artboard px)
  var GRID_KEY = "li-vds-board-grid-v1";
  var gridState = (function () { try { return JSON.parse(localStorage.getItem(GRID_KEY)) || {}; } catch (e) { return {}; } })();
  var showGrid = gridState.grid !== false;     // default ON
  var showMargin = gridState.margin !== false; // default ON
  function saveGrid() { try { localStorage.setItem(GRID_KEY, JSON.stringify({ grid: showGrid, margin: showMargin })); } catch (e) {} }
  function xEdges() { var a = []; for (var i = 0; i < COLS; i++) { var s = MARGIN + i * (COLW + GUTTER); a.push(s); a.push(s + COLW); } return a; }
  function yLines() { var a = []; for (var y = MARGIN; y <= 1350 - MARGIN + 0.5; y += ROWH) a.push(Math.round(y)); return a; }
  function snapTo(v, lines) { var best = v, bd = SNAP; for (var i = 0; i < lines.length; i++) { var d = Math.abs(v - lines[i]); if (d < bd) { bd = d; best = lines[i]; } } return best; }

  var LIB_KEY = "li-vds-board-lib-v1";
  function loadLib() { try { return JSON.parse(localStorage.getItem(LIB_KEY)) || []; } catch (e) { return []; } }
  function saveLib() { try { localStorage.setItem(LIB_KEY, JSON.stringify(LIB)); } catch (e) {} }
  var LIB = loadLib();
  var DS_LIB = [];      // icons/illustrations already in the design system (auto-loaded from a manifest; read-only)
  /* Auto-detect the design system's own icon/illustration library. The board is a static
     file so it can't list a folder — instead it reads a small manifest the DS ships:
       assets/library-manifest.json  (or assets/icons/manifest.json)
     = a JSON array of paths (strings) or {"icons":[{name,src}, ...]}, paths relative to
     project root. Every visual then shows those icons in My library, ready to drag in —
     no re-upload. Absent (like a fresh system) → the section just shows the user's uploads. */
  function loadDSLibrary() {
    var bases = ["", "../", "../../"]; // app/ board, root, then the mirrored templates/visual-board/ copy
    var names = ["assets/library-manifest.json", "assets/icons/manifest.json"];
    var tries = [];
    bases.forEach(function (b) { names.forEach(function (n) { tries.push([b, b + n]); }); });
    (function next(i) {
      if (i >= tries.length) return;
      var base = tries[i][0], url = tries[i][1];
      fetch(url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          var items = Array.isArray(j) ? j : (j.icons || j.items || []);
          DS_LIB = items.map(function (it) {
            var src = typeof it === "string" ? it : (it.src || it.path || "");
            var name = typeof it === "string" ? src.split("/").pop() : (it.name || (it.src || "").split("/").pop());
            return { name: name, src: /^(https?:|data:|\/)/.test(src) ? src : base + src };
          }).filter(function (x) { return x.src; });
          renderLib();
        })
        .catch(function () { next(i + 1); });
    })(0);
  }
  var renderLib = function () {};

  /* ---------- the Icon Library (icon-kit.js) as a drag source ----------
     Icons drawn/imported in the Icon Library view live in window.IconKit (built-ins)
     + localStorage('icon-custom') (the user's own). They're rendered INLINE here so they
     recolour to the brand (var(--brand-primary)/var(--icon-ink)) and can be dragged onto
     the canvas. localStorage is shared across the app's views, so anything in the Icon
     Library shows up here automatically — no re-upload. */
  var KIT_LIB = [];   // [{ name, svg, kind }]
  function ensureIconCss(base) {
    if (!document.getElementById("li-icon-css")) {
      var l = document.createElement("link"); l.id = "li-icon-css"; l.rel = "stylesheet"; l.href = base + "components/icons/icon.css";
      document.head.appendChild(l);
    }
    // fallback ink colour so inline icons are never invisible if icon.css is slow/absent
    var ink = getComputedStyle(document.documentElement).getPropertyValue("--icon-ink").trim();
    if (!ink) document.documentElement.style.setProperty("--icon-ink", "#16232b");
  }
  function collectKit() {
    if (!window.IconKit) return;
    var entries = [], seen = {};
    (IconKit.markNames || []).forEach(function (n) { entries.push(["mark", n]); });
    try { (JSON.parse(localStorage.getItem("icon-custom")) || []).forEach(function (n) { entries.push(["mark", n]); }); } catch (e) {}
    (IconKit.illNames || []).forEach(function (n) { entries.push(["ill", n]); });
    KIT_LIB = [];
    entries.forEach(function (p) {
      var key = p[0] + ":" + p[1]; if (seen[key]) return; seen[key] = 1;
      var svg = p[0] === "ill" ? IconKit.ill(p[1]) : IconKit.mark(p[1]);
      if (svg && (svg.indexOf("<path") >= 0 || svg.indexOf("<circle") >= 0 || svg.indexOf("<rect") >= 0)) KIT_LIB.push({ name: p[1], svg: svg, kind: p[0] });
    });
  }
  function loadIconKit() {
    var bases = ["", "../", "../../"];
    (function tryBase(i) {
      if (window.IconKit) { ensureIconCss(bases[Math.max(0, i - 1)] || ""); collectKit(); renderLib(); return; }
      if (i >= bases.length) return;
      var s = document.createElement("script"); s.src = bases[i] + "components/icons/icon-kit.js";
      s.onload = function () { ensureIconCss(bases[i]);
        // chain-load the (optional) generated icon library AFTER the kit
        var lib = document.createElement("script"); lib.src = bases[i] + "components/icons/icon-library.js";
        lib.onload = lib.onerror = function () { collectKit(); renderLib(); };
        document.head.appendChild(lib); };
      s.onerror = function () { tryBase(i + 1); };
      document.head.appendChild(s);
    })(0);
    // refresh when the user edits/adds icons in the Icon Library view
    window.addEventListener("icon-changed", function () { collectKit(); renderLib(); });
    window.addEventListener("storage", function (e) { if (e.key === "icon-custom" || e.key === "icon-overrides") { collectKit(); renderLib(); } });
  }
  var history = [], histIndex = -1, clip = null;   // undo/redo stack + copy buffer
  function snapshot() {
    if (!S.art) return;
    history = history.slice(0, histIndex + 1);
    history.push(S.art.innerHTML);
    if (history.length > 80) history.shift();
    histIndex = history.length - 1;
  }
  function commit() { snapshot(); S.onChange(); }
  function undo() { if (!S.art || histIndex <= 0) return; histIndex--; S.art.innerHTML = history[histIndex]; deselect(); S.onChange(); S.flash("Undo"); }
  function redo() { if (!S.art || histIndex >= history.length - 1) return; histIndex++; S.art.innerHTML = history[histIndex]; deselect(); S.onChange(); S.flash("Redo"); }
  function copySel() { if (S.sel) { clip = S.sel.outerHTML; S.flash("Copied"); } }
  function paste() {
    if (!clip || !S.art) return;
    var tmp = document.createElement("div"); tmp.innerHTML = clip;
    var node = tmp.firstElementChild; if (!node) return;
    node.style.position = "absolute";
    node.style.left = (parseFloat(node.style.left || 0) + 34) + "px";
    node.style.top = (parseFloat(node.style.top || 0) + 34) + "px";
    S.art.appendChild(node); select(node); commit(); S.flash("Pasted");
  }
  function el(tag, css, html) { var d = document.createElement(tag); d.style.cssText = css; if (html != null) d.innerHTML = html; return d; }

  /* board's OWN ui icons for palette items (Inter/Lucide-style line glyphs, not the client's icon set) */
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var ICON = {
    heading: ic('<path d="M6 4v16M18 4v16M6 12h12"/>'),
    sub:     ic('<line x1="4" y1="7" x2="20" y2="7" stroke-width="2.4"/><line x1="4" y1="13" x2="13" y2="13"/><line x1="4" y1="18" x2="10" y2="18"/>'),
    eyebrow: ic('<path d="M3.5 12.5 11 5l8 0 0 8-7.5 7.5z"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>'),
    body:    ic('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="4" y1="16" x2="14" y2="16"/>'),
    stat:    ic('<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'),
    quote:   ic('<path d="M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2M19 7h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2"/>'),
    arrow:   ic('<circle cx="12" cy="12" r="9"/><path d="M9 12h6M13 9l3 3-3 3"/>'),
    avatar:  ic('<circle cx="12" cy="9" r="3.2"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>'),
    rect:    ic('<rect x="4" y="6" width="16" height="12" rx="2"/>'),
    circle:  ic('<circle cx="12" cy="12" r="8"/>'),
    pill:    ic('<rect x="3" y="8" width="18" height="8" rx="4"/>'),
    line:    ic('<line x1="4" y1="12" x2="20" y2="12"/>'),
    donut:   ic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.1"/>'),
    bar:     ic('<rect x="3" y="9" width="18" height="6" rx="2"/><line x1="13" y1="9" x2="13" y2="15"/>'),
  };

  // each factory returns a positioned element (absolute, sized in artboard px)
  var FACTORY = {
    heading: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:78px;line-height:1.04;letter-spacing:-.02em;color:var(--fg);width:640px", "Your headline"); },
    sub: function () { return el("div", "position:absolute;font-weight:500;font-size:34px;line-height:1.3;color:var(--muted);width:560px", "One supporting line"); },
    eyebrow: function () { return el("div", "position:absolute;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)", "EYEBROW"); },
    stat: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:320px;line-height:.82;letter-spacing:-.05em;color:var(--fg)", "68%"); },
    quote: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:200px;line-height:.6;color:var(--brand-primary)", "&ldquo;"); },
    arrow: function () { return el("div", "position:absolute;font-size:64px;font-weight:700;color:var(--fg)", "&rarr;"); },
    body: function () { return el("div", "position:absolute;font-weight:500;font-size:30px;line-height:1.45;color:var(--fg);width:560px", "A line of supporting copy that explains the point."); },
    avatar: function () { var d = el("div", "position:absolute;width:130px;height:130px;border-radius:50%;background:var(--soft)"); d.setAttribute("data-shape", "1"); return d; },
    rect: function () { var d = el("div", "position:absolute;width:340px;height:190px;border-radius:14px;background:var(--brand-primary)"); d.setAttribute("data-shape", "1"); return d; },
    circle: function () { var d = el("div", "position:absolute;width:230px;height:230px;border-radius:50%;background:var(--brand-primary)"); d.setAttribute("data-shape", "1"); return d; },
    pill: function () { var d = el("div", "position:absolute;width:280px;height:96px;border-radius:999px;background:var(--soft)"); d.setAttribute("data-shape", "1"); return d; },
    line: function () { var d = el("div", "position:absolute;width:340px;height:6px;border-radius:3px;background:var(--line)"); d.setAttribute("data-shape", "1"); return d; },
    donut: function () { var d = el("div", "position:absolute;width:360px;height:360px;border-radius:50%;background:conic-gradient(var(--brand-primary) 0 68%, var(--soft) 68% 100%)"); d.setAttribute("data-shape", "1"); return d; },
    bar: function () {
      var d = el("div", "position:absolute;width:520px;height:96px;border-radius:12px;overflow:hidden;display:flex");
      d.innerHTML = '<div style="width:68%;background:var(--brand-primary)"></div><div style="width:32%;background:var(--soft)"></div>';
      d.setAttribute("data-shape", "1"); return d;
    },
  };

  var GROUPS = [
    { name: "Text", items: [["heading", "Heading"], ["sub", "Subhead"], ["eyebrow", "Eyebrow"], ["body", "Body text"], ["stat", "Big stat"]] },
    { name: "Marks", items: [["quote", "Quote"], ["arrow", "Swipe"], ["avatar", "Avatar"]] },
    { name: "Shapes", items: [["rect", "Rectangle"], ["circle", "Circle"], ["pill", "Pill"], ["line", "Divider"], ["donut", "Donut"], ["bar", "Split bar"]] },
  ];

  function buildPalette() {
    var p = S.palette; p.innerHTML = "";
    // magnetic-grid view toggles (snapping is always on; these only show/hide the guides)
    var gb = el("div"); gb.className = "gridbar";
    function tog(label, on, svg, fn) {
      var b = el("div", "", svg + "<span>" + label + "</span>"); b.className = "gridtog" + (on ? " on" : "");
      b.addEventListener("click", function () { var n = fn(); b.classList.toggle("on", n); });
      return b;
    }
    gb.appendChild(tog("Grid", showGrid, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>', function () { showGrid = !showGrid; saveGrid(); applyOverlay(); return showGrid; }));
    gb.appendChild(tog("Margins", showMargin, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>', function () { showMargin = !showMargin; saveGrid(); applyOverlay(); return showMargin; }));
    p.appendChild(gb);
    GROUPS.forEach(function (g) {
      var h = el("div", "", g.name); h.className = "grp"; p.appendChild(h);
      var grid = el("div"); grid.className = "palette";
      g.items.forEach(function (it) {
        var b = el("div", "", '<span class="ic">' + (ICON[it[0]] || "") + '</span><span class="lbl">' + it[1] + '</span>'); b.className = "pitem"; b.setAttribute("draggable", "true");
        b.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", "spec:" + it[0]); e.dataTransfer.effectAllowed = "copy"; });
        grid.appendChild(b);
      });
      p.appendChild(grid);
    });
    // image upload (multiple) → saved to a reusable library
    var up = el("label", "", '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>Upload images / an icon set</span>');
    up.className = "pitem upload";
    var inp = el("input", "display:none"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = true;
    inp.addEventListener("change", function (e) {
      var files = [].slice.call(e.target.files).filter(function (f) { return f.type.indexOf("image/") === 0; });
      if (!files.length) return; var pending = files.length;
      files.forEach(function (f) { var r = new FileReader(); r.onload = function () { LIB.push(r.result); if (--pending === 0) { saveLib(); renderLib(); S.flash(files.length + " added to your library — drag them onto the canvas"); } }; r.readAsDataURL(f); });
      e.target.value = "";
    });
    up.appendChild(inp);

    // My library — upload sits at the TOP of this section, then DS icons + your uploads
    var libHead = el("div", "", "My library"); libHead.className = "grp"; p.appendChild(libHead);
    p.appendChild(up);
    var libWrap = el("div", "display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px"); p.appendChild(libWrap);
    renderLib = function () {
      libWrap.innerHTML = "";
      // 1) icons already in the design system (auto-detected, not removable)
      if (DS_LIB.length) {
        libWrap.appendChild(el("div", "", "In this design system")).className = "libcap";
        DS_LIB.forEach(function (item, i) {
          var t = el("div", "background-image:url('" + item.src + "')"); t.className = "libtile"; t.title = item.name || "icon";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) { ev.dataTransfer.setData("text/plain", "dsimg:" + i); ev.dataTransfer.effectAllowed = "copy"; });
          libWrap.appendChild(t);
        });
      }
      // 2) icons from the Icon Library (icon-kit) — rendered inline so they wear the brand
      if (KIT_LIB.length) {
        libWrap.appendChild(el("div", "", "From the Icon Library")).className = "libcap";
        KIT_LIB.forEach(function (item, i) {
          var t = el("div", ""); t.className = "libtile kit"; t.title = item.name;
          t.innerHTML = item.svg; var sv = t.querySelector("svg"); if (sv) sv.style.cssText = "width:100%;height:100%;display:block";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) { ev.dataTransfer.setData("text/plain", "kit:" + i); ev.dataTransfer.effectAllowed = "copy"; });
          libWrap.appendChild(t);
        });
      }
      // 3) the user's own uploads (removable)
      if (LIB.length) {
        if (DS_LIB.length || KIT_LIB.length) { libWrap.appendChild(el("div", "", "Your uploads")).className = "libcap"; }
        LIB.forEach(function (src, i) {
          var t = el("div", "background-image:url('" + src + "')"); t.className = "libtile";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) { ev.dataTransfer.setData("text/plain", "img:" + i); ev.dataTransfer.effectAllowed = "copy"; });
          var x = el("button", "", "&times;"); x.className = "rm"; x.title = "Remove from library";
          x.addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); LIB.splice(i, 1); saveLib(); renderLib(); });
          t.appendChild(x); libWrap.appendChild(t);
        });
      }
      if (!DS_LIB.length && !KIT_LIB.length && !LIB.length) {
        libWrap.appendChild(el("div", "grid-column:1/-1;font-size:11px;color:#bcc0c4;padding:6px 2px;line-height:1.4", "Icons from the Icon Library show up here automatically. Upload your own sets above to add more — they appear on every visual to drag in."));
      }
    };
    renderLib();
    var hint = el("div", "font-size:11px;color:#9aa0a6;line-height:1.4;margin-top:12px;padding:0 2px", "Drag any item onto the canvas. Double-click text to edit it. Keep single & quote visuals visual-led — don't pile on text.");
    p.appendChild(hint);
  }

  /* ---------- geometry helpers ---------- */
  function artRect() { return S.art.getBoundingClientRect(); }       // rendered (scaled) rect
  function frameRect() { return S.frame.getBoundingClientRect(); }
  function toArt(clientX, clientY) { var r = artRect(); return { x: (clientX - r.left) / S.scale, y: (clientY - r.top) / S.scale }; }

  function placeSel() {
    if (!S.selected.length) { S.selbox.style.display = "none"; S.eltbar.style.display = "none"; renderOutlines(); return; }
    var fr = frameRect();
    // group bounding box (union of all selected rects)
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    S.selected.forEach(function (n) { var r = n.getBoundingClientRect(); minX = Math.min(minX, r.left); minY = Math.min(minY, r.top); maxX = Math.max(maxX, r.right); maxY = Math.max(maxY, r.bottom); });
    var x = minX - fr.left, y = minY - fr.top, w = maxX - minX, h = maxY - minY;
    var multi = S.selected.length > 1;
    S.selbox.style.display = "block";
    S.selbox.style.left = x + "px"; S.selbox.style.top = y + "px";
    S.selbox.style.width = w + "px"; S.selbox.style.height = h + "px";
    // hide resize handles for multi-selection, and when a single selection is too small on screen
    S.selbox.classList.toggle("multi", multi);
    S.selbox.classList.toggle("tiny", !multi && Math.min(w, h) < 44);
    S.eltbar.style.display = "flex";
    // the toolbar tracks the (group) selection everywhere — including off-canvas
    var bx = x;
    var by = y - 42; if (by < 0) by = y + h + 8;
    S.eltbar.style.left = bx + "px"; S.eltbar.style.top = by + "px";
    renderOutlines();
  }

  function setSelection(list) {
    S.selected = (list || []).filter(function (n, i, a) { return n && a.indexOf(n) === i; });
    S.sel = S.selected[S.selected.length - 1] || null;   // primary (resize/colour anchor)
    placeSel();
  }
  function select(node) { setSelection(node ? [node] : []); }
  function deselect() { setSelection([]); closeColorPopover(); }
  // is `node` (or an ancestor up to the artboard) part of the current selection?
  function inSelection(node) { var n = node; while (n && n !== S.art) { if (S.selected.indexOf(n) >= 0) return true; n = n.parentElement; } return false; }
  // per-element outlines for multi-select (the selbox shows the group bounding box)
  function renderOutlines() {
    if (!S.olayer) return;
    S.olayer.innerHTML = "";
    if (S.selected.length < 2) return;
    var fr = frameRect();
    S.selected.forEach(function (n) {
      var r = n.getBoundingClientRect();
      S.olayer.appendChild(el("div", "position:absolute;left:" + (r.left - fr.left) + "px;top:" + (r.top - fr.top) + "px;width:" + r.width + "px;height:" + r.height + "px;outline:1.5px solid var(--brand-primary,#0A66C2);outline-offset:1px"));
    });
  }

  /* ---------- element toolbar ---------- */
  function buildToolbar() {
    S.eltbar.innerHTML = "";
    function btn(title, svg, fn) { var b = el("button", "", svg); b.title = title; b.addEventListener("click", function (e) { e.stopPropagation(); fn(b); }); S.eltbar.appendChild(b); return b; }
    btn("Bring to front", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>', function () {
      if (!S.selected.length) return; var max = 0; [].forEach.call(S.art.children, function (c) { max = Math.max(max, +c.style.zIndex || 0); }); S.selected.forEach(function (n) { max += 1; n.style.zIndex = max; }); commit();
    });
    btn("Colour", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="10.5" r="2.5"></circle><circle cx="8.5" cy="7.5" r="2.5"></circle><circle cx="6.5" cy="12.5" r="2.5"></circle><path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H17a5 5 0 0 0 5-5c0-4.4-4.5-8.4-10-8.4Z"></path></svg>', function (b) { openColorPopover(b); });
    btn("Duplicate", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>', function () {
      if (!S.selected.length) return;
      var clones = S.selected.map(function (n) {
        var c = n.cloneNode(true);
        c.style.position = "absolute";
        c.style.left = (parseFloat(n.style.left || 0) + 30) + "px";
        c.style.top = (parseFloat(n.style.top || 0) + 30) + "px";
        S.art.appendChild(c); return c;
      });
      setSelection(clones); commit();
    });
    btn("Delete", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>', function () {
      if (!S.selected.length) return; S.selected.forEach(function (n) { n.remove(); }); setSelection([]); commit();
    });
  }

  /* ---------- colour picker ---------- */
  function resolveColor(val) {
    var probe = el("span", "color:" + val); (S.art || document.body).appendChild(probe);
    var c = getComputedStyle(probe).color; probe.remove(); return c;
  }
  function applyColor(val) {
    if (!S.selected.length) return;
    S.selected.forEach(function (n) { if (n.getAttribute("data-shape")) n.style.background = val; else n.style.color = val; });
    commit();
  }
  function buildColorPopover() {
    var pop = S.cpop; pop.innerHTML = "";
    pop.appendChild(el("div", "", "Design-system colours")).className = "ct";
    var sw = el("div"); sw.className = "sw"; pop.appendChild(sw);
    SWATCHES.forEach(function (s) {
      var c = el("div", "background:" + s.val); c.className = "swatch"; c.title = s.label;
      c.addEventListener("click", function (e) { e.stopPropagation(); applyColor(s.val); closeColorPopover(); });
      sw.appendChild(c);
    });
    pop.appendChild(el("div")).className = "seg";
    if (CUSTOM.length) {
      pop.appendChild(el("div", "", "Your colours")).className = "ct";
      var cs = el("div"); cs.className = "sw"; pop.appendChild(cs);
      CUSTOM.forEach(function (hex, i) {
        var c = el("div", "background:" + hex); c.className = "swatch"; c.title = hex;
        c.addEventListener("click", function (e) { e.stopPropagation(); applyColor(hex); closeColorPopover(); });
        c.addEventListener("contextmenu", function (e) { e.preventDefault(); CUSTOM.splice(i, 1); saveCustom(); buildColorPopover(); });
        cs.appendChild(c);
      });
      pop.appendChild(el("div")).className = "seg";
    }
    var row = el("div"); row.className = "crow";
    var inp = el("input"); inp.type = "color"; inp.value = "#0A66C2";
    var add = el("button", "", "Add &amp; apply"); add.className = "addc";
    add.addEventListener("click", function (e) {
      e.stopPropagation();
      var hex = inp.value.toUpperCase();
      if (CUSTOM.indexOf(hex) === -1) { CUSTOM.push(hex); saveCustom(); }
      applyColor(hex); buildColorPopover(); closeColorPopover();
    });
    row.appendChild(inp); row.appendChild(add); pop.appendChild(row);
    pop.appendChild(el("div", "font-size:10.5px;color:#aab0b6;margin-top:9px;line-height:1.35", "Custom colours are saved to your palette here. Right-click one to remove. To bake a colour into the design system itself, add it to overrides/brand.css."));
  }
  function openColorPopover(anchor) {
    if (!S.selected.length) return;
    buildColorPopover();
    S.cpop.style.display = "block";
    var r = anchor.getBoundingClientRect();
    var w = 216, x = Math.min(r.left, window.innerWidth - w - 10), y = r.bottom + 8;
    if (y + 240 > window.innerHeight) y = Math.max(10, r.top - 248);
    S.cpop.style.left = Math.max(10, x) + "px"; S.cpop.style.top = y + "px";
  }
  function closeColorPopover() { if (S.cpop) S.cpop.style.display = "none"; }

  /* ---------- magnetic grid overlay (drawn in the scaled artboard wrap) ---------- */
  function applyOverlay() {
    if (!S.art) return;
    var wrap = S.art.closest(".artscale"); if (!wrap) return;
    var old = wrap.querySelector(":scope > .grid-overlay"); if (old) old.remove();
    if (!S.active || (!showGrid && !showMargin)) return;
    var ov = el("div"); ov.className = "grid-overlay";
    var html = "";
    if (showGrid) {
      for (var i = 0; i < COLS; i++) {
        var x = MARGIN + i * (COLW + GUTTER);
        html += '<div style="position:absolute;top:' + MARGIN + 'px;height:' + (1350 - 2 * MARGIN) + 'px;left:' + x + 'px;width:' + COLW + 'px;background:rgba(90,170,255,.12);border-left:1px solid rgba(90,170,255,.45);border-right:1px solid rgba(90,170,255,.45)"></div>';
      }
      yLines().forEach(function (y) { html += '<div style="position:absolute;left:' + MARGIN + 'px;right:' + MARGIN + 'px;top:' + y + 'px;height:1px;background:rgba(90,170,255,.3)"></div>'; });
    }
    if (showMargin) {
      // the UNSAFE zone outside the content margin, filled red — drag into it = "in the red"
      var innerH = 1350 - 2 * MARGIN;
      html += '<div style="position:absolute;left:0;top:0;width:1080px;height:' + MARGIN + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:0;bottom:0;width:1080px;height:' + MARGIN + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:0;top:' + MARGIN + 'px;width:' + MARGIN + 'px;height:' + innerH + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;right:0;top:' + MARGIN + 'px;width:' + MARGIN + 'px;height:' + innerH + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:' + MARGIN + 'px;top:' + MARGIN + 'px;right:' + MARGIN + 'px;bottom:' + MARGIN + 'px;border:2px solid rgba(229,57,53,.9)"></div>';
    }
    ov.innerHTML = html; wrap.appendChild(ov);
  }

  /* ---------- pointer: select / move / resize ---------- */
  var drag = null;
  function onPointerDown(e) {
    if (!S.active || !S.art) return;
    closeColorPopover();
    // resize handle?
    if (e.target.classList && e.target.classList.contains("handle")) {
      if (!S.sel) return;
      var w = S.sel.offsetWidth, h = S.sel.offsetHeight;
      var fs = parseFloat(getComputedStyle(S.sel).fontSize) || 0;
      // which handle: br = uniform (scale incl. font), r = width-only, b = height-only
      var dir = e.target.classList.contains("r") ? "x" : e.target.classList.contains("b") ? "y" : "xy";
      drag = { mode: "resize", dir: dir, sx: e.clientX, sy: e.clientY, w: w, h: h, fs: fs, hadH: !!S.sel.style.height };
      e.preventDefault(); return;
    }
    // ignore pointer drags while a text element is being edited inline
    if (e.target.getAttribute && e.target.getAttribute("contenteditable") === "true") return;
    var node = e.target;
    var onElement = node && node !== S.art && S.art.contains(node) && !(node.classList && node.classList.contains("grid-overlay"));
    if (!onElement) {
      // empty area → rubber-band marquee select (shift keeps the current selection)
      if (!e.shiftKey) setSelection([]);
      drag = { mode: "marquee", ox: e.clientX, oy: e.clientY, add: e.shiftKey, base: S.selected.slice() };
      updateMarquee(e); S.marquee.style.display = "block";
      e.preventDefault(); return;
    }
    if (e.shiftKey) {
      // toggle this element in/out of the selection (no drag)
      var i = S.selected.indexOf(node);
      if (i >= 0) S.selected.splice(i, 1); else S.selected.push(node);
      setSelection(S.selected);
      e.preventDefault(); return;
    }
    // plain click: keep the group if the element is already in it, else select just it
    if (!inSelection(node)) setSelection([node]);
    // start a group move (record each selected element's base position)
    var items = S.selected.map(function (n) {
      var bl = parseFloat(n.style.left), bt = parseFloat(n.style.top);
      return { n: n, bl: isNaN(bl) ? 0 : bl, bt: isNaN(bt) ? 0 : bt, pos: getComputedStyle(n).position };
    });
    drag = { mode: "move", sx: e.clientX, sy: e.clientY, items: items, moved: false };
    e.preventDefault();
  }
  function updateMarquee(e) {
    if (!S.marquee) return;
    var fr = frameRect();
    var x1 = Math.min(drag.ox, e.clientX), y1 = Math.min(drag.oy, e.clientY);
    var x2 = Math.max(drag.ox, e.clientX), y2 = Math.max(drag.oy, e.clientY);
    S.marquee.style.left = (x1 - fr.left) + "px"; S.marquee.style.top = (y1 - fr.top) + "px";
    S.marquee.style.width = (x2 - x1) + "px"; S.marquee.style.height = (y2 - y1) + "px";
  }
  function onPointerMove(e) {
    if (!drag) return;
    var dx = (e.clientX - drag.sx) / S.scale, dy = (e.clientY - drag.sy) / S.scale;
    if (drag.mode === "move") {
      if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 3) return;
      drag.moved = true;
      var primary = drag.items[drag.items.length - 1] || drag.items[0];
      var pnx = primary.bl + dx, pny = primary.bt + dy;
      // magnetic only INSIDE the canvas; crossing the edge to park releases the snap.
      if (!e.altKey) {
        if (pnx >= 0 && pnx <= 1080) pnx = snapTo(pnx, xEdges());
        if (pny >= 0 && pny <= 1350) pny = snapTo(pny, yLines());
      }
      var sdx = pnx - primary.bl, sdy = pny - primary.bt;   // snapped delta, applied to the whole group
      drag.items.forEach(function (it) {
        if (it.pos === "static") it.n.style.position = "relative";
        it.n.style.left = (it.bl + sdx) + "px";
        it.n.style.top = (it.bt + sdy) + "px";
      });
      placeSel();
    } else if (drag.mode === "marquee") {
      updateMarquee(e);
    } else if (drag.mode === "resize") {
      if (drag.dir === "x") {
        // width only — reflow text taller/shorter, font unchanged
        S.sel.style.width = Math.max(20, drag.w + dx) + "px";
      } else if (drag.dir === "y") {
        // height only
        S.sel.style.height = Math.max(8, drag.h + dy) + "px";
      } else {
        // corner — uniform scale incl. font-size
        var ratio = Math.max(0.15, (drag.w + dx) / drag.w);
        S.sel.style.width = Math.max(20, drag.w * ratio) + "px";
        if (drag.hadH || S.sel.getAttribute("data-shape")) S.sel.style.height = Math.max(8, drag.h * ratio) + "px";
        if (drag.fs) S.sel.style.fontSize = (drag.fs * ratio) + "px";
      }
      placeSel();
    }
  }
  function onPointerUp() {
    if (drag && drag.mode === "marquee") {
      var mb = S.marquee.getBoundingClientRect();
      S.marquee.style.display = "none";
      var moved = mb.width > 4 || mb.height > 4;
      if (moved) {
        var hits = [].filter.call(S.art.children, function (c) {
          if (c.classList && c.classList.contains("grid-overlay")) return false;
          var r = c.getBoundingClientRect();
          return !(r.right < mb.left || r.left > mb.right || r.bottom < mb.top || r.top > mb.bottom);
        });
        setSelection(drag.add ? drag.base.concat(hits) : hits);
      }
      // a plain click on empty space (no drag) already cleared via setSelection([]) in pointerdown
      drag = null; return;
    }
    if (drag && (drag.mode === "resize" || (drag.mode === "move" && drag.moved))) commit();
    drag = null;
  }

  /* ---------- drop from palette ---------- */
  function onDragOver(e) { if (S.active) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } }
  function onDrop(e) {
    if (!S.active || !S.art) return;
    var data = e.dataTransfer.getData("text/plain") || "";
    if (data.indexOf("dsimg:") === 0 || data.indexOf("img:") === 0) {   // a library image (DS-provided or uploaded)
      var ds = data.indexOf("dsimg:") === 0;
      var src = ds ? (DS_LIB[+data.slice(6)] || {}).src : LIB[+data.slice(4)];
      if (!src) return;
      e.preventDefault();
      var im = el("img", "position:absolute;width:300px;height:auto"); im.src = src;
      S.art.appendChild(im);
      var pp = toArt(e.clientX, e.clientY);
      im.style.left = Math.round(pp.x - 150) + "px"; im.style.top = Math.round(pp.y - 150) + "px";
      im.onload = function () { select(im); S.onChange(); };
      select(im); commit(); return;
    }
    if (data.indexOf("kit:") === 0) {   // an icon from the Icon Library — inserted inline so it recolours to the brand
      var kit = KIT_LIB[+data.slice(4)]; if (!kit) return;
      e.preventDefault();
      var wrap = el("div", "position:absolute;width:200px;height:200px"); wrap.innerHTML = kit.svg;
      var sv2 = wrap.querySelector("svg"); if (sv2) sv2.style.cssText = "width:100%;height:100%;display:block";
      wrap.setAttribute("data-shape", "icon");
      S.art.appendChild(wrap);
      var pk = toArt(e.clientX, e.clientY);
      wrap.style.left = Math.round(pk.x - 100) + "px"; wrap.style.top = Math.round(pk.y - 100) + "px";
      select(wrap); commit(); return;
    }
    if (data.indexOf("spec:") !== 0) return;
    e.preventDefault();
    var key = data.slice(5), make = FACTORY[key]; if (!make) return;
    var node = make();
    S.art.appendChild(node);
    var p = toArt(e.clientX, e.clientY);
    node.style.left = Math.round(p.x - node.offsetWidth / 2) + "px";
    node.style.top = Math.round(p.y - node.offsetHeight / 2) + "px";
    select(node); commit();
  }

  function onKey(e) {
    if (!S.active) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    var editingText = S.sel && S.sel.getAttribute("contenteditable") === "true";
    if (e.metaKey || e.ctrlKey) {
      var k = (e.key || "").toLowerCase();
      if (editingText) return;                                  // let the browser handle text editing
      if (k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (k === "y") { e.preventDefault(); redo(); return; }    // Windows redo
      if (k === "c") { if (S.sel) copySel(); return; }
      if (k === "v") { if (clip) { e.preventDefault(); paste(); } return; }
      return;
    }
    if (!S.selected.length || editingText) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); S.selected.forEach(function (n) { n.remove(); }); setSelection([]); commit(); }
    else if (e.key === "Escape") deselect();
  }

  /* double-click a text element to edit its copy in place */
  function onDbl(e) {
    if (!S.active || !S.art) return;
    var n = e.target;
    if (!n || n === S.art || !S.art.contains(n)) return;
    select(n);
    n.setAttribute("contenteditable", "true");
    n.style.cursor = "text";
    n.focus();
    var range = document.createRange(); range.selectNodeContents(n);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    function end() {
      n.removeAttribute("contenteditable"); n.style.cursor = "";
      n.removeEventListener("blur", end);
      placeSel(); commit();
    }
    n.addEventListener("blur", end);
  }

  /* ---------- public ---------- */
  return {
    init: function (opts) {
      Object.assign(S, opts);
      // selection chrome created on the fly: a rubber-band marquee + a per-element outline layer
      S.marquee = el("div", "position:absolute;border:1px solid var(--brand-primary,#0A66C2);background:rgba(10,102,194,.10);z-index:45;display:none;pointer-events:none");
      S.olayer = el("div", "position:absolute;inset:0;pointer-events:none;z-index:39");
      if (S.frame) { S.frame.appendChild(S.olayer); S.frame.appendChild(S.marquee); }
      buildPalette(); buildToolbar(); loadDSLibrary(); loadIconKit();
      S.heroStage.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      S.selbox.addEventListener("pointerdown", onPointerDown);
      // accept drops anywhere on the stage (card AND the pasteboard around it), so new
      // elements can be dropped outside the canvas too. Stage contains heroStage, so one
      // listener covers both; drops resolve to artboard coords (negative = off-canvas).
      var dropZone = (S.frame && S.frame.parentNode) || S.heroStage;
      dropZone.addEventListener("dragover", onDragOver);
      dropZone.addEventListener("drop", onDrop);
      S.heroStage.addEventListener("dblclick", onDbl);
      document.addEventListener("keydown", onKey);
      // clicking/dragging on the empty pasteboard (outside the card) marquee-selects (or clears)
      var stage = S.frame && S.frame.parentNode;
      if (stage) stage.addEventListener("pointerdown", function (e) {
        if (!S.active) return;
        if (S.heroStage.contains(e.target) || S.selbox.contains(e.target) || S.eltbar.contains(e.target) || (S.cpop && S.cpop.contains(e.target))) return;
        if (!e.shiftKey) setSelection([]);
        drag = { mode: "marquee", ox: e.clientX, oy: e.clientY, add: e.shiftKey, base: S.selected.slice() };
        updateMarquee(e); S.marquee.style.display = "block";
      });
      document.addEventListener("click", function (e) { if (S.cpop && S.cpop.style.display === "block" && !S.cpop.contains(e.target) && !S.eltbar.contains(e.target)) closeColorPopover(); });
      window.addEventListener("resize", function () { if (S.active) { placeSel(); applyOverlay(); } });
    },
    setActive: function (on) { S.active = on; if (!on) { deselect(); closeColorPopover(); } applyOverlay(); },
    // called by the controller after each hero render
    setTarget: function (artEl, scale) { S.art = artEl; S.scale = scale; deselect(); applyOverlay(); history = [artEl.innerHTML]; histIndex = 0; },
    reposition: placeSel,
    deselect: deselect,
  };
})();
