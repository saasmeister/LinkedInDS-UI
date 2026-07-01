/* Visual Board — vanilla controller.

   Data model (in the HTML, under #source):
     <section class="visual">            ONE visual = one reel entry
       <div class="round"> A  B[chosen]  C </div>   an iteration = 3 variants
       <div class="round"> A[chosen]  B  C </div>    the next iteration
     </section>

   · REEL = one thumb per <section> (its latest chosen variant) + count badge.
   · CANVAS = focused variant big (fills remaining height); BOTTOM DOCK pins the
     iteration timeline + reel so the visual never gets squeezed.
   · EDIT mode (board-editor.js) = Canva-style drag / resize / drop on the hero;
     edits persist per variant and the assistant can iterate over them.
   · "+ New visual" / "Iterate" copy a ready-made `/linkedin-visual` prompt to the
     clipboard; the user pastes it to the agent, which runs the brief then builds. */
(function () {
  function boot() {
    var source = document.getElementById("source");
    var reel = document.getElementById("reel");
    if (!source || !reel) { return requestAnimationFrame(boot); }
    init(source, reel);
  }

  function init(source, reel) {
  var APPROVED_KEY = "li-vds-board-approved-v1";
  var CHOSEN_KEY = "li-vds-board-chosen-v1";
  var EDITS_KEY = "li-vds-board-edits-v1";
  var SLIDES_KEY = "li-vds-board-slidepos-v1";
  var heroStage = document.getElementById("heroStage");
  var stageEl = document.getElementById("stage");
  var heroType = document.getElementById("heroType");
  var heroVer = document.getElementById("heroVer");
  var heroChosen = document.getElementById("heroChosen");
  var heroBadge = document.getElementById("heroBadge");
  var heroDots = document.getElementById("heroDots");
  var timelineEl = document.getElementById("timeline");
  var tlsub = document.getElementById("tlsub");
  var menu = document.getElementById("menu");
  var menuLabel = document.getElementById("menuLabel");
  var toast = document.getElementById("toast");
  var countEl = document.getElementById("count");
  var feedEl = document.getElementById("feed");

  /* ---- build the model ---- */
  var visuals = [].slice.call(source.querySelectorAll(".visual")).map(function (sec, vi) {
    var rounds = [].slice.call(sec.querySelectorAll(".round")).map(function (rd) {
      return [].slice.call(rd.querySelectorAll(".artboard"));
    });
    if (!rounds.length) { var loose = [].slice.call(sec.querySelectorAll(".artboard")); if (loose.length) rounds = [loose]; }
    return { el: sec, label: sec.getAttribute("data-label") || ("Visual " + (vi + 1)), type: sec.getAttribute("data-type") || "visual", rounds: rounds };
  }).filter(function (v) { return v.rounds.length; });

  var chosenStore = loadJSON(CHOSEN_KEY, {});
  var approved = new Set(loadJSON(APPROVED_KEY, []));
  var editsStore = loadJSON(EDITS_KEY, {});       // { "label#round#variant": editedInnerHTML }
  var slidePos = loadJSON(SLIDES_KEY, {});        // { "label#round#variant": currentSlideIndex } (carousels)
  var activeIdx = 0;
  var focus = { round: 0, variant: 0 };
  var menuTarget = null;
  var editing = false;
  var heroArt = null, heroScale = 1, editorTarget = null;
  var zoom = 1;   // 1 = fit-to-stage; user can zoom in/out

  function loadJSON(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function slug(s) { return (s || "visual").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual"; }
  function flash(m) { toast.textContent = m; toast.style.display = "block"; clearTimeout(flash._t); flash._t = setTimeout(function () { toast.style.display = "none"; }, 2800); }
  function letter(i) { return String.fromCharCode(65 + i); }

  function chosenOf(vi, ri) {
    var key = visuals[vi].label + "#" + ri;
    if (chosenStore[key] != null) return chosenStore[key];
    var arr = visuals[vi].rounds[ri];
    for (var i = 0; i < arr.length; i++) if (arr[i].hasAttribute("data-chosen")) return i;
    return 0;
  }
  function setChosen(vi, ri, varIdx) { chosenStore[visuals[vi].label + "#" + ri] = varIdx; saveJSON(CHOSEN_KEY, chosenStore); }
  function lastRound(vi) { return visuals[vi].rounds.length - 1; }
  function variantCount(vi) { return visuals[vi].rounds.reduce(function (n, r) { return n + r.length; }, 0); }
  function editKey(vi, ri, varIdx) { return visuals[vi].label + "#" + ri + "#" + varIdx; }

  /* ---- carousel helpers (a variant can be a multi-slide carousel) ---- */
  function slidesOf(node) { return [].slice.call(node.querySelectorAll(":scope > .cslide")); }
  function slideCount(vi, ri, varIdx) { return slidesOf(visuals[vi].rounds[ri][varIdx]).length; }
  function isCarousel(vi, ri, varIdx) { return slideCount(vi, ri, varIdx) > 1; }
  function curSlideOf(vi, ri, varIdx) { var n = slideCount(vi, ri, varIdx); return Math.max(0, Math.min(slidePos[editKey(vi, ri, varIdx)] || 0, Math.max(0, n - 1))); }
  function curSlide() { return curSlideOf(activeIdx, focus.round, focus.variant); }
  function gotoSlide(n) { slidePos[editKey(activeIdx, focus.round, focus.variant)] = n; saveJSON(SLIDES_KEY, slidePos); renderHero(); }

  /* fresh artboard clone with any persisted edits applied */
  function makeClone(vi, ri, varIdx) {
    var src = visuals[vi].rounds[ri][varIdx];
    var c = src.cloneNode(true);
    var ed = editsStore[editKey(vi, ri, varIdx)];
    if (ed != null) c.innerHTML = ed;
    return c;
  }
  /* scaled, non-interactive mount for thumbnails */
  function mountThumb(into, vi, ri, varIdx, scale) {
    into.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.style.cssText = "width:1080px;height:1350px;transform:scale(" + scale + ");transform-origin:top left;pointer-events:none";
    var clone = makeClone(vi, ri, varIdx);
    wrap.appendChild(clone);
    var cs = [].slice.call(clone.querySelectorAll(":scope > .cslide"));
    if (cs.length > 1) cs.forEach(function (el, idx) { el.style.display = idx === 0 ? "block" : "none"; });   // thumb = slide 1
    into.appendChild(wrap);
  }

  /* ---- hero (responsive: fills the stage above the dock) ---- */
  function setZoomLabel(s) { var zp = document.getElementById("zoomPct"); if (zp) zp.textContent = Math.round(s * 100) + "%"; }
  function setHeroMeta(v, carousel, cur, n) {
    heroType.textContent = v.type;
    heroVer.innerHTML = "v<b>" + (focus.round + 1) + "</b> · variant <b>" + letter(focus.variant) + "</b>" +
      (carousel ? (cur == null ? " · <b>" + n + "</b> slides" : " · slide <b>" + (cur + 1) + "/" + n + "</b>") : "");
    var isChosen = focus.variant === chosenOf(activeIdx, focus.round);
    heroChosen.style.display = "inline-flex";
    heroChosen.classList.toggle("is-chosen", isChosen);
    heroChosen.innerHTML = isChosen ? "★ Chosen" : "☆ Choose this variant";
    heroChosen.title = isChosen ? "This is the picked variant for v" + (focus.round + 1) : "Pick this variant as the winner for v" + (focus.round + 1);
    heroBadge.style.display = approved.has(v.label) ? "inline-flex" : "none";
  }

  function renderHero() {
    var v = visuals[activeIdx];
    var availH = stageEl.clientHeight - 92;     // top padding/bar (-34) + bottom hint room
    var availW = stageEl.clientWidth - 48;
    var art = makeClone(activeIdx, focus.round, focus.variant);
    var slides = slidesOf(art);
    var carousel = slides.length > 1;

    // CAROUSEL (not editing) → show ALL slides side-by-side as a scrollable filmstrip
    if (carousel && !editing) { renderFilmstrip(v, art, slides, availH, availW); return; }

    // single visual — OR a carousel while editing (one slide at a time, so edits target it)
    var fit = Math.min(availW / 1080, availH / 1350); // scale that fits BOTH dimensions
    if (!(fit > 0)) fit = 0.3;
    var s = Math.max(0.04, fit * zoom);
    heroStage.className = "";
    heroStage.style.cssText = "";
    heroStage.style.width = Math.round(1080 * s) + "px"; heroStage.style.height = Math.round(1350 * s) + "px";
    setZoomLabel(s);
    heroStage.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "artscale";
    wrap.style.cssText = "width:1080px;height:1350px;transform:scale(" + s + ");transform-origin:top left;" + (editing ? "" : "pointer-events:none");
    wrap.appendChild(art);
    heroStage.appendChild(wrap);
    heroArt = art; heroScale = s;
    var cur = carousel ? curSlide() : 0;
    if (carousel) slides.forEach(function (el, idx) { el.style.display = idx === cur ? "block" : "none"; });
    editorTarget = carousel ? slides[cur] : art;   // edits target the visible slide
    renderCarouselNav(carousel, cur, slides.length);
    if (editing && window.BoardEditor) BoardEditor.setTarget(editorTarget, s);
    setHeroMeta(v, carousel, cur, slides.length);
  }

  /* carousel review = a horizontal filmstrip of every slide (scroll / drag to pan) */
  function renderFilmstrip(v, art, slides, availH, availW) {
    var s = Math.max(0.04, (availH / 1350) * zoom);
    var cardW = Math.round(1080 * s), cardH = Math.round(1350 * s);
    setZoomLabel(s);
    renderCarouselNav(false, 0, 0);     // no per-slide arrows/dots in the strip
    heroStage.className = "filmstrip";
    heroStage.style.cssText = "position:relative;width:" + Math.round(availW) + "px;height:" + cardH + "px;overflow-x:auto;overflow-y:hidden;background:transparent;box-shadow:none;border-radius:0;cursor:grab;";
    heroStage.innerHTML = "";
    var strip = document.createElement("div");
    strip.style.cssText = "display:flex;gap:24px;align-items:flex-start;width:max-content;height:" + cardH + "px;padding:0 2px;";
    slides.forEach(function (sl, idx) {
      var card = document.createElement("div");
      card.style.cssText = "flex:none;width:" + cardW + "px;height:" + cardH + "px;border-radius:4px;overflow:hidden;box-shadow:0 6px 26px rgba(0,0,0,.14);background:#fff;position:relative;";
      var inner = document.createElement("div");
      inner.style.cssText = "width:1080px;height:1350px;transform:scale(" + s + ");transform-origin:top left;position:relative;pointer-events:none;";
      sl.style.display = "block";
      inner.appendChild(sl);
      card.appendChild(inner);
      var chip = document.createElement("div");
      chip.style.cssText = "position:absolute;top:7px;left:7px;background:rgba(31,35,40,.66);color:#fff;font:700 11px/1 system-ui,sans-serif;padding:4px 7px;border-radius:6px;";
      chip.textContent = (idx + 1) + " / " + slides.length;
      card.appendChild(chip);
      strip.appendChild(card);
    });
    heroStage.appendChild(strip);
    heroArt = art; heroScale = s; editorTarget = null;
    enableDragScroll(heroStage);
    setHeroMeta(v, true, null, slides.length);
  }

  function enableDragScroll(el) {
    if (el._dragScroll) return; el._dragScroll = true;
    var down = false, sx = 0, sl = 0;
    el.addEventListener("pointerdown", function (e) { if (el.className !== "filmstrip") return; down = true; sx = e.clientX; sl = el.scrollLeft; el.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", function () { if (down) { down = false; if (el.className === "filmstrip") el.style.cursor = "grab"; } });
    el.addEventListener("pointermove", function (e) { if (!down || el.className !== "filmstrip") return; el.scrollLeft = sl - (e.clientX - sx); });
  }

  /* carousel nav lives in .frame (OUTSIDE the scaled artboard, so always usable) */
  function renderCarouselNav(carousel, cur, n) {
    var frame = stageEl.querySelector(".frame");
    [].forEach.call(frame.querySelectorAll(".cnav,.cdots"), function (e) { e.remove(); });
    if (!carousel) return;
    function arrow(dir, target) {
      var b = document.createElement("button"); b.className = "cnav " + dir;
      b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="' + (dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6") + '"></polyline></svg>';
      if (target < 0 || target > n - 1) b.setAttribute("disabled", "");
      else b.addEventListener("click", function (e) { e.stopPropagation(); gotoSlide(target); });
      return b;
    }
    frame.appendChild(arrow("prev", cur - 1));
    frame.appendChild(arrow("next", cur + 1));
    var dots = document.createElement("div"); dots.className = "cdots";
    for (var i = 0; i < n; i++) (function (idx) {
      var d = document.createElement("div"); d.className = "cdot" + (idx === cur ? " on" : "");
      d.addEventListener("click", function (e) { e.stopPropagation(); gotoSlide(idx); });
      dots.appendChild(d);
    })(i);
    frame.appendChild(dots);
  }

  /* ---- timeline (history of the active visual) ---- */
  function renderTimeline() {
    var v = visuals[activeIdx];
    timelineEl.innerHTML = "";
    tlsub.textContent = "“" + v.label + "” · " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s") + " · " + variantCount(activeIdx) + " variants";
    v.rounds.forEach(function (variants, ri) {
      if (ri > 0) timelineEl.appendChild(chev());
      var round = document.createElement("div"); round.className = "round";
      var ch = chosenOf(activeIdx, ri);
      var head = document.createElement("div"); head.className = "rh";
      head.innerHTML = '<span class="rv">v' + (ri + 1) + '</span><span class="rn">picked ' + letter(ch) + '</span>';
      round.appendChild(head);
      var vars = document.createElement("div"); vars.className = "vars";
      variants.forEach(function (node, varIdx) {
        var cell = document.createElement("div");
        cell.className = "tlvar" + (varIdx === ch ? " chosen" : "") + ((ri === focus.round && varIdx === focus.variant) ? " focused" : "");
        mountThumb(cell, activeIdx, ri, varIdx, 58 / 1080);
        var ck = document.createElement("span"); ck.className = "ck";
        ck.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        cell.appendChild(ck);
        var vk = document.createElement("span"); vk.className = "vk"; vk.textContent = letter(varIdx);
        cell.appendChild(vk);
        cell.addEventListener("click", function () { focus = { round: ri, variant: varIdx }; renderHero(); renderTimeline(); });
        cell.addEventListener("contextmenu", function (e) { e.preventDefault(); openMenu(cell, ri, varIdx); });
        vars.appendChild(cell);
      });
      round.appendChild(vars);
      timelineEl.appendChild(round);
    });
    timelineEl.appendChild(chev());
    var next = document.createElement("div"); next.className = "round next";
    next.innerHTML = '<div class="plus"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div><div class="nt">Iterate<br>3 new variants</div>';
    next.title = "Prepare an iterate prompt for the assistant";
    next.addEventListener("click", function () { prepareModal("iterate", v.label); });
    timelineEl.appendChild(next);
  }
  function chev() { var a = document.createElement("div"); a.className = "arrow"; a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'; return a; }

  /* ---- reel (one entry per visual) ---- */
  function renderReel() {
    reel.innerHTML = "";
    visuals.forEach(function (v, i) {
      var ri = lastRound(i), ch = chosenOf(i, ri);
      var t = document.createElement("div");
      var car = isCarousel(i, ri, ch);
      t.className = "thumb" + (i === activeIdx ? " active" : "") + (approved.has(v.label) ? " approved" : "") + (car ? " iscarousel" : "");
      var frame = document.createElement("div"); frame.className = "tframe";
      mountThumb(frame, i, ri, ch, 96 / 1080);
      var cbadge = document.createElement("span"); cbadge.className = "cbadge";
      if (isCarousel(i, ri, ch)) {
        var ns = slideCount(i, ri, ch);
        cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"></rect><path d="M7 21h12a2 2 0 0 0 2-2V7"></path></svg><span>' + ns + '</span>';
        cbadge.title = ns + " slides · click, then swipe ‹ › on the canvas";
      } else {
        cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg><span>' + variantCount(i) + '</span>';
        cbadge.title = variantCount(i) + " variants across " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s");
      }
      frame.appendChild(cbadge);
      var abadge = document.createElement("span"); abadge.className = "abadge";
      abadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      frame.appendChild(abadge);
      var dots = document.createElement("button"); dots.className = "dots";
      dots.style.cssText = "position:absolute;top:5px;right:5px;width:25px;height:25px;background:rgba(255,255,255,.92)";
      dots.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
      dots.addEventListener("click", function (e) { e.stopPropagation(); activeIdx = i; focus = { round: ri, variant: ch }; renderHero(); renderTimeline(); renderReel(); openMenu(e.currentTarget, ri, ch); });
      frame.appendChild(dots);
      var lbl = document.createElement("div"); lbl.className = "lbl";
      lbl.innerHTML = (car ? '<span class="kind">▤ Carousel · ' + slideCount(i, ri, ch) + ' slides</span>' : '') + v.label;
      t.appendChild(frame); t.appendChild(lbl);
      t.addEventListener("click", function () { activeIdx = i; var lr = lastRound(i); focus = { round: lr, variant: chosenOf(i, lr) }; renderHero(); renderTimeline(); renderReel(); });
      reel.appendChild(t);
    });
    // + New visual card
    var nv = document.createElement("div"); nv.className = "newvis";
    nv.innerHTML = '<div class="nframe"><div class="plus"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div></div><div class="nlbl">New visual</div>';
    nv.title = "Prepare a new-visual prompt for the assistant";
    nv.addEventListener("click", function () { prepareModal("new"); });
    reel.appendChild(nv);

    countEl.textContent = visuals.length + " visual" + (visuals.length === 1 ? "" : "s") + " · 1080 × 1350 · export PNG or HTML";
    feedEl.textContent = approved.size + " approved · feeding the system";
  }

  /* ---- menu ---- */
  function openMenu(anchor, ri, varIdx) {
    menuTarget = { round: ri, variant: varIdx };
    var v = visuals[activeIdx];
    menuLabel.textContent = v.label + " · v" + (ri + 1) + " " + letter(varIdx);
    menu.querySelector('[data-act="choose"]').style.display = varIdx === chosenOf(activeIdx, ri) ? "none" : "flex";
    var ap = approved.has(v.label), apBtn = menu.querySelector('[data-act="approve"]');
    apBtn.querySelector(".ml").textContent = ap ? "Remove from design system" : "Add to design system";
    apBtn.querySelector(".ms").textContent = ap ? "Approved variant" : "Client approved → system learns";
    var r = anchor.getBoundingClientRect();
    menu.style.display = "block";
    menu.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
    menu.style.top = Math.min(r.bottom + 6, window.innerHeight - 240) + "px";
  }
  function closeMenu() { menu.style.display = "none"; menuTarget = null; }
  document.addEventListener("click", closeMenu);
  menu.addEventListener("click", function (e) { e.stopPropagation(); });
  heroDots.addEventListener("click", function (e) { e.stopPropagation(); openMenu(e.currentTarget, focus.round, focus.variant); });
  heroChosen.addEventListener("click", function (e) {
    e.stopPropagation();
    if (focus.variant === chosenOf(activeIdx, focus.round)) return;   // already the winner
    setChosen(activeIdx, focus.round, focus.variant);
    flash("Picked variant " + letter(focus.variant) + " for v" + (focus.round + 1));
    renderHero(); renderTimeline(); renderReel();
  });
  menu.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.getAttribute("data-act"); if (!menuTarget) return;
      var ri = menuTarget.round, varIdx = menuTarget.variant; closeMenu();
      if (act === "png") exportPng(ri, varIdx);
      else if (act === "html") exportHtml(ri, varIdx);
      else if (act === "choose") { setChosen(activeIdx, ri, varIdx); flash("Picked variant " + letter(varIdx) + " for v" + (ri + 1)); renderHero(); renderTimeline(); renderReel(); }
      else if (act === "approve") toggleApprove();
    });
  });
  function toggleApprove() {
    var k = visuals[activeIdx].label;
    if (approved.has(k)) { approved.delete(k); flash("Removed from the design system"); }
    else { approved.add(k); flash("Added — the design system will learn from this variant"); }
    saveJSON(APPROVED_KEY, [].slice.call(approved)); renderHero(); renderReel();
  }

  /* ---- edit mode ---- */
  function persistEdit() {
    if (!heroArt) return;
    editsStore[editKey(activeIdx, focus.round, focus.variant)] = heroArt.innerHTML;
    saveJSON(EDITS_KEY, editsStore);
    renderTimeline(); renderReel();
    if (window.BoardEditor) BoardEditor.reposition();
  }
  function setEditing(on) {
    editing = on;
    document.body.classList.toggle("editing", on);
    var railEl = document.getElementById("rail");
    railEl.style.minWidth = on ? "236px" : "0px";
    railEl.style.width = on ? "236px" : "0px";
    document.getElementById("editToggleLabel").textContent = on ? "Done" : "Edit";
    if (window.BoardEditor) BoardEditor.setActive(on);
    renderHero();
    if (on) flash("Edit mode — drag, resize, drop elements. Changes save to this variant.");
  }
  document.getElementById("editToggle").addEventListener("click", function () { setEditing(!editing); });

  /* ---- zoom ---- */
  function setZoom(z) { zoom = Math.max(0.2, Math.min(4, z)); renderHero(); if (editing && window.BoardEditor) BoardEditor.reposition(); }
  document.getElementById("zoomIn").addEventListener("click", function () { setZoom(zoom * 1.15); });
  document.getElementById("zoomOut").addEventListener("click", function () { setZoom(zoom / 1.15); });
  document.getElementById("zoomFit").addEventListener("click", function () { setZoom(1); });
  stageEl.addEventListener("wheel", function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.93)); }, { passive: false });

  /* ---- keyboard: arrow keys page a focused carousel left/right ---- */
  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.target && e.target.getAttribute && e.target.getAttribute("contenteditable") === "true") return;
    if (!isCarousel(activeIdx, focus.round, focus.variant)) return;
    var n = slideCount(activeIdx, focus.round, focus.variant), cur = curSlide();
    if (e.key === "ArrowLeft" && cur > 0) { e.preventDefault(); gotoSlide(cur - 1); }
    else if (e.key === "ArrowRight" && cur < n - 1) { e.preventDefault(); gotoSlide(cur + 1); }
  });

  /* ---- new visual / iterate → hand a ready-made prompt to the agent ----
     Agent-first: these buttons don't open a panel and don't fork a second
     assistant. They copy a standard `/linkedin-visual` prompt (with the rules
     baked in: ask the brief first, stay on the board, 3 variants) to the
     clipboard, so the user pastes it into the chat and the agent takes over. */
  function chatPrompt(text) {
    // The async Clipboard API is blocked in sandboxed previews, so try the legacy
    // execCommand path first (it works during a user-gesture click), then async,
    // then a fallback box the user can copy from manually.
    var ok = false;
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    } catch (e) { ok = false; }
    if (ok) { flash("Prompt copied — paste it to the assistant to continue"); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash("Prompt copied — paste it to the assistant to continue"); },
        function () { showPromptFallback(text); }
      );
      return;
    }
    showPromptFallback(text);
  }
  // last resort: show the prompt in a selectable box so the user can copy it by hand
  function showPromptFallback(text) {
    var prev = document.getElementById("promptFallback"); if (prev) prev.remove();
    var mac = navigator.platform && navigator.platform.indexOf("Mac") >= 0;
    var wrap = document.createElement("div"); wrap.id = "promptFallback";
    wrap.style.cssText = "position:fixed;inset:0;background:rgba(20,24,28,.45);z-index:200;display:flex;align-items:center;justify-content:center";
    var box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:14px;padding:20px;width:min(92vw,560px);box-shadow:0 16px 50px rgba(0,0,0,.3);font-family:'Inter',system-ui,sans-serif";
    box.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Copy this prompt, then paste it to the assistant</div><div style="font-size:13px;color:#6b7280;margin-bottom:10px">It\u2019s pre-selected \u2014 copy with ' + (mac ? "\u2318C" : "Ctrl+C") + ', then paste in the chat.</div>';
    var ta = document.createElement("textarea"); ta.value = text; ta.readOnly = true;
    ta.style.cssText = "width:100%;height:130px;border:1px solid #d8dadd;border-radius:10px;padding:11px;font:inherit;font-size:13px;line-height:1.5;resize:none;box-sizing:border-box;color:#1f2328";
    box.appendChild(ta);
    var row = document.createElement("div"); row.style.cssText = "display:flex;justify-content:flex-end;margin-top:12px";
    var close = document.createElement("button"); close.textContent = "Done";
    close.style.cssText = "padding:9px 18px;border:none;border-radius:9px;background:var(--brand-primary,#0A66C2);color:#fff;font-weight:700;cursor:pointer";
    close.addEventListener("click", function () { wrap.remove(); });
    row.appendChild(close); box.appendChild(row);
    wrap.appendChild(box); document.body.appendChild(wrap);
    ta.focus(); ta.select();
    wrap.addEventListener("click", function (e) { if (e.target === wrap) wrap.remove(); });
  }
  function openBrief(msg) { flash(msg); }   // legacy no-op nudge (kept for safety)

  /* ---- prepare-prompt modal (New visual / Iterate) ----
     A static artifact lives in an isolated preview frame; it cannot reach the
     chat input (cross-origin). So this modal PREPARES the prompt — paste your
     post + notes — and copies it; you paste once into the chat and attach any
     screenshots/drawings there. Agent-first: the AI still runs the brief. */
  function prepareModal(kind, label) {
    var prev = document.getElementById("prepModal"); if (prev) prev.remove();
    var mac = navigator.platform && navigator.platform.indexOf("Mac") >= 0;
    var scrim = document.createElement("div"); scrim.id = "prepModal";
    scrim.style.cssText = "position:fixed;inset:0;background:rgba(20,24,28,.45);z-index:200;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif";
    var box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:16px;padding:22px;width:min(94vw,580px);max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.32)";
    var title = kind === "iterate" ? "Iterate \u201c" + label + "\u201d" : "New visual";
    var lead = kind === "iterate"
      ? "Tell the assistant what to change. It'll add a new round of 3 variants to this visual."
      : "Paste your LinkedIn post and any direction. The assistant will ask the brief, then build 3 variants on the board.";
    box.innerHTML = '<div style="font-family:var(--font-display,inherit);font-weight:700;font-size:19px;letter-spacing:-.01em">' + title + '</div>' +
      '<div style="font-size:13.5px;color:#6b7280;margin:4px 0 16px;line-height:1.45">' + lead + '</div>';

    function field(labelText, ph, big) {
      var w = document.createElement("div"); w.style.cssText = "margin-bottom:14px";
      w.innerHTML = '<div style="font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">' + labelText + '</div>';
      var t = document.createElement("textarea"); t.placeholder = ph;
      t.style.cssText = "width:100%;height:" + (big ? "120px" : "60px") + ";border:1px solid #d8dadd;border-radius:10px;padding:11px;font:inherit;font-size:14px;line-height:1.5;resize:vertical;box-sizing:border-box;color:#1f2328";
      w.appendChild(t); box.appendChild(w); return t;
    }

    var inA, inB;
    if (kind === "iterate") {
      inA = field("What should change?", "e.g. make variant B bolder, swap the metaphor to a ladder, tighten the headline\u2026", true);
    } else {
      inA = field("Your LinkedIn post", "Paste the post text here\u2026", true);
      inB = field("Direction / emphasize (optional)", "e.g. lean on the 68% stat; keep it punchy; audience = founders", false);
      box.appendChild(el2("div", "font-size:12.5px;color:#8a9098;margin:-4px 0 14px;line-height:1.45", "\uD83D\uDCCE Got screenshots, sketches or a brand reference? Paste/drag them straight into the chat after you paste this prompt."));
    }

    function el2(tag, css, html) { var d = document.createElement(tag); d.style.cssText = css; d.innerHTML = html; return d; }
    function buildPrompt() {
      if (kind === "iterate") {
        var ch = (inA.value || "").trim();
        return "/linkedin-visual\n\nIterate the visual \u201c" + label + "\u201d on the Visual Board." +
          (ch ? " What I want to change: " + ch + "." : " Ask me what I want to change first.") +
          " Add a NEW round of 3 genuinely different variants to that visual\u2019s existing <section> (keep the previous rounds). Stay on Visual Board.html \u2014 don\u2019t make a separate file.";
      }
      var post = (inA.value || "").trim(), notes = (inB.value || "").trim();
      return "/linkedin-visual\n\nI want a NEW visual on the Visual Board. Ask me the brief questions first (the type, the ONE thing readers should remember, the visual analogy, any references), then build 3 genuinely different variants as a new <section> on Visual Board.html \u2014 never a separate file." +
        (notes ? "\n\nDirection: " + notes : "") +
        (post ? "\n\nPOST:\n" + post : "");
    }

    var row = document.createElement("div"); row.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:6px";
    var hint = el2("div", "font-size:12px;color:#aab0b6", "Copies the prompt \u2014 paste it in the chat (" + (mac ? "\u2318V" : "Ctrl+V") + ").");
    var btns = document.createElement("div"); btns.style.cssText = "display:flex;gap:8px";
    var cancel = document.createElement("button"); cancel.textContent = "Cancel";
    cancel.style.cssText = "padding:10px 16px;border:1px solid #d8dadd;border-radius:10px;background:#fff;font:inherit;font-weight:600;cursor:pointer;color:#5f6671";
    cancel.addEventListener("click", function () { scrim.remove(); });
    var copy = document.createElement("button"); copy.textContent = "Copy prompt";
    copy.style.cssText = "padding:10px 20px;border:none;border-radius:10px;background:var(--brand-primary,#0A66C2);color:#fff;font:inherit;font-weight:700;cursor:pointer";
    copy.addEventListener("click", function () { var ok = chatPrompt(buildPrompt()); scrim.remove(); });
    btns.appendChild(cancel); btns.appendChild(copy);
    row.appendChild(hint); row.appendChild(btns); box.appendChild(row);

    scrim.appendChild(box); document.body.appendChild(scrim);
    scrim.addEventListener("click", function (e) { if (e.target === scrim) scrim.remove(); });
    setTimeout(function () { inA.focus(); }, 30);
  }

  /* ---- export ---- */
  function nameFor(ri, varIdx) { var base = slug(visuals[activeIdx].label) + "-v" + (ri + 1) + letter(varIdx).toLowerCase(); if (isCarousel(activeIdx, ri, varIdx)) base += "-s" + ((slidePos[editKey(activeIdx, ri, varIdx)] || 0) + 1); return base; }
  function offscreen(vi, ri, varIdx) {
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none";
    var art = makeClone(vi, ri, varIdx);
    var slides = slidesOf(art);
    if (slides.length > 1) { var c = Math.max(0, Math.min(slidePos[editKey(vi, ri, varIdx)] || 0, slides.length - 1)); slides.forEach(function (el, idx) { el.style.display = idx === c ? "block" : "none"; }); }   // export the current slide
    holder.appendChild(art); document.body.appendChild(holder);
    return { holder: holder, node: art };
  }
  function exportPng(ri, varIdx) {
    if (!window.htmlToImage) { flash("Export library not loaded"); return; }
    flash("Exporting PNG…");
    var o = offscreen(activeIdx, ri, varIdx), nm = nameFor(ri, varIdx);
    window.htmlToImage.toPng(o.node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true })
      .then(function (url) { dl(url, nm + ".png"); flash("Exported " + nm + ".png"); })
      .catch(function (e) { console.error(e); flash("Export failed — try again"); })
      .then(function () { o.holder.remove(); });
  }
  function exportHtml(ri, varIdx) {
    var o = offscreen(activeIdx, ri, varIdx), nm = nameFor(ri, varIdx);
    var doc = buildDoc(o.node, visuals[activeIdx].label); o.holder.remove();
    var url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    dl(url, nm + ".html"); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    flash("Exported " + nm + ".html");
  }
  function dl(href, name) { var a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  function buildDoc(node, label) {
    var vars = "", classes = "";
    function walk(sheet) {
      var rules; try { rules = sheet.cssRules; } catch (e) { return; }
      if (!rules) return;
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.styleSheet) walk(r.styleSheet);
        else if (r.selectorText === ":root") vars += r.style.cssText;
        else if (r.selectorText && /^\.(sig-|headline|artboard)/.test(r.selectorText)) classes += r.cssText + "\n";
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) walk(document.styleSheets[s]);
    vars += document.documentElement.style.cssText;
    return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>' + label + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">' +
      '<style>:root{' + vars + '} html,body{margin:0} body{display:flex;align-items:center;justify-content:center;background:#e6e6e6;min-height:100vh}' + classes + '</style></head>' +
      '<body>' + node.outerHTML + '</body></html>';
  }

  /* ---- editor wiring + resize ---- */
  if (window.BoardEditor) {
    BoardEditor.init({
      frame: stageEl.querySelector(".frame"),
      heroStage: heroStage,
      selbox: document.getElementById("selbox"),
      eltbar: document.getElementById("eltbar"),
      cpop: document.getElementById("cpop"),
      palette: document.getElementById("palette"),
      onChange: persistEdit,
      flash: flash,
    });
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderHero, 120); });

  if (!visuals.length) { countEl.textContent = "No visuals yet — add a <section class=\"visual\"> block"; return; }
  var lr = lastRound(0); focus = { round: lr, variant: chosenOf(0, lr) };
  renderTimeline(); renderReel(); renderHero();           // hero LAST so it fits the final stage size
  requestAnimationFrame(renderHero);                       // re-fit after the dock has laid out
  if (window.ResizeObserver) { new ResizeObserver(function () { renderHero(); if (editing && window.BoardEditor) BoardEditor.reposition(); }).observe(stageEl); }
  }
  boot();
})();
