/* Sample LinkedIn visuals built from the design-system components.
   Each entry: { id, label, type, render() -> ReactNode (a 1080×1350 Canvas) }.
   The Visual Library renders these scaled, and exports them at true size. */
(function () {
  const DS = (window.__dsNS||(window.__dsNS=(function(){var ks;try{ks=Object.keys(window)}catch(e){return{}}for(var i=0;i<ks.length;i++){try{var v=window[ks[i]];if(v&&typeof v==="object"&&v.Headline&&v.Canvas&&v.Stat)return v}catch(e){}}return{}})()));
  const {
    Canvas, Chrome, Eyebrow, Headline, Mark, Subhead,
    Stat, StatBox, StatRow, Quote, Attribution,
    InfoCard, Chip, Cta, BrowserMock,
  } = DS;
  const h = React.createElement;

  // shorthand for an absolutely-placed content block inside a Canvas
  const Block = (props, children) =>
    h("div", { style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", ...(props.style || {}) } }, children);

  const VISUALS = [
    {
      id: "single-donut",
      label: "Most outreach fails on the first line",
      type: "Single",
      render: () => h(Canvas, { role: "light" }, [
        h(Chrome, { key: "c", name: "Your name", category: "Outreach", position: "top" }),
        Block({ style: { top: "210px" } }, [
          h(Eyebrow, { key: "e" }, "The re-hook"),
          h(Headline, { key: "h", size: "lg", style: { marginTop: 18 } }, ["Most outreach fails on the ", h(Mark, { key: "m" }, "first line")]),
          h(Subhead, { key: "s", style: { marginTop: 24 } }, "One supporting line that adds the context the hook left out."),
        ]),
        h("div", { key: "d", style: { position: "absolute", left: 0, right: 0, bottom: "190px", display: "flex", justifyContent: "center" } },
          h("div", { style: { position: "relative", width: 520, height: 520, borderRadius: "50%", background: "conic-gradient(var(--brand-primary) 0 68%, var(--canvas-light-soft) 68% 100%)" } },
            h("div", { style: { position: "absolute", inset: 120, borderRadius: "50%", background: "var(--canvas-light-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, [
              h("span", { key: "n", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 130, letterSpacing: "-.04em", lineHeight: .9, color: "var(--fg)" } }, "68%"),
              h("span", { key: "c", style: { fontWeight: 500, fontSize: 28, color: "var(--muted)", marginTop: 6 } }, "never read past it"),
            ]))),
      ]),
    },
    {
      id: "catalog",
      label: "You're picking from a catalog of crap",
      type: "Infographic",
      render: () => h(Canvas, { role: "light", density: "tight" }, [
        h("div", { key: "bar", style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
          h("span", { key: "n", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em" } }, "Your name"),
          h("span", { key: "c", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em", color: "var(--muted)" } }, "Positioning · GTM"),
        ]),
        h("div", { key: "hd", style: { marginTop: 36 } }, [
          h(Eyebrow, { key: "e" }, "Open five homepages in your space"),
          h(Headline, { key: "h", size: "md", style: { marginTop: 14 } }, ["You're picking from a ", h(Mark, { key: "m" }, "catalog of crap")]),
        ]),
        h("div", { key: "grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 40 } }, [
          h(BrowserMock, { key: 1, title: "Saves you time" }),
          h(BrowserMock, { key: 2, title: "AI-powered" }),
          h(BrowserMock, { key: 3, title: "Built for teams like yours" }),
          h(BrowserMock, { key: 4, title: "Enterprise-grade security" }),
          h(BrowserMock, { key: 5, title: "Seamless integration" }),
          h(BrowserMock, { key: 6, title: "What only you can claim", cta: "Write your own brief →", emphasis: true }),
        ]),
      ]),
    },
    {
      id: "quote-light",
      label: "The visual carries the save, not the caption",
      type: "Quote",
      render: () => h(Canvas, { role: "light" }, [
        h(Chrome, { key: "c", name: "Your name", category: "Content", position: "top" }),
        h("div", { key: "q", style: { position: "absolute", left: "var(--margin)", right: "150px", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } }, [
          h(Quote, { key: "qt", label: "QUOTE" }, "The visual carries the save, not the caption."),
          h(Attribution, { key: "a", name: "Full name", role: "Role · company", style: { marginTop: 70 } }),
        ]),
      ]),
    },
    {
      id: "carousel-cover",
      label: "How I write cold DMs that get replies",
      type: "Carousel · cover",
      render: () => h(Canvas, { role: "loud" }, [
        Block({ style: { top: "150px" } }, [
          h(Eyebrow, { key: "e" }, "A carousel about"),
          h(Headline, { key: "h", size: "lg", style: { marginTop: 18 } }, "How I write cold DMs that get replies"),
          h(Subhead, { key: "s", style: { marginTop: 30, color: "var(--canvas-loud-muted)" } }, "The exact structure — swipe through."),
        ]),
        h(Chrome, { key: "c", name: "Your name", category: "Outreach", position: "bottom", swipe: true }),
      ]),
    },
    {
      id: "section-result",
      label: "3.4× more replies",
      type: "Carousel · result",
      render: () => h(Canvas, { role: "section" }, [
        h(Chrome, { key: "c", name: "Your name", category: "Outreach", position: "top" }),
        h("div", { key: "r", style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } }, [
          h(Eyebrow, { key: "e", color: "var(--accent)" }, "The result"),
          h(Stat, { key: "s", value: "3.4×", caption: "more replies than the template everyone copies.", align: "left", size: "xl", style: { marginTop: 10 } }),
        ]),
      ]),
    },
    {
      id: "case-results",
      label: "0 → 10k followers in 90 days",
      type: "Infographic · case study",
      render: () => h(Canvas, { role: "light", density: "tight" }, [
        h("div", { key: "bar", style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
          h("span", { key: "n", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em" } }, "Your name"),
          h("span", { key: "c", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em", color: "var(--muted)" } }, "Case study"),
        ]),
        h(Headline, { key: "h", size: "sm", style: { marginTop: 44 } }, ["From ", h(Mark, { key: "m" }, "0 to 10k"), " followers in 90 days"]),
        h("div", { key: "cards", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 36 } }, [
          h(InfoCard, { key: 1, number: 1, label: "Audit", heading: "We mapped what already worked" }, h("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, [h(Chip, { key: "a" }, "Top posts"), h(Chip, { key: "b" }, "Hooks")])),
          h(InfoCard, { key: 2, number: 2, label: "Format", heading: "Carousels became the engine", emphasis: true }),
        ]),
        h(StatRow, { key: "res", label: "RESULTS", style: { position: "absolute", left: "var(--margin-tight)", right: "var(--margin-tight)", bottom: "120px" } }, [
          h(StatBox, { key: 1, value: "10k", caption: "followers" }),
          h(StatBox, { key: 2, value: "90", caption: "days" }),
          h(StatBox, { key: 3, value: "5.2×", caption: "reach" }),
        ]),
      ]),
    },
  ];

  window.SAMPLE_VISUALS = VISUALS;
})();
