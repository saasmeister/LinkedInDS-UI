import React from "react";

/**
 * BrowserMock — a mini browser / app window used to ILLUSTRATE a homepage,
 * landing page or screen inside a visual. The recurring "catalog of
 * homepages" pattern: window chrome (traffic-light dots + an address pill)
 * over a content area. Drop real children, or leave empty for an auto
 * skeleton (headline bar + lines + a CTA button).
 *
 * Set `emphasis` on the one window that should stand out (accent border +
 * accent CTA) — the "build this instead" card.
 */
export function BrowserMock({
  title,                 // optional mini-heading shown over the content
  cta = "Get started",   // skeleton CTA label; null to hide
  emphasis = false,
  tone = "light",        // 'light' (white window) | 'section' (on dark canvas)
  children,
  style = {},
}) {
  const accent = emphasis ? "var(--accent)" : null;
  const winBg = tone === "section" ? "var(--canvas-section-soft)" : "#FFFFFF";
  const chromeBg = tone === "section"
    ? "color-mix(in srgb, #000 18%, var(--canvas-section-soft))"
    : "color-mix(in srgb, var(--brand-primary) 6%, #F2F2F2)";
  const skeleton = tone === "section"
    ? "color-mix(in srgb, #fff 16%, transparent)"
    : "color-mix(in srgb, var(--brand-primary) 12%, #E6E6E6)";

  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: winBg,
        border: `${emphasis ? "var(--line-strong)" : "var(--line)"} solid ${emphasis ? accent : "var(--line)"}`,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* window chrome */}
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-2)",
        padding: "16px 20px", background: chromeBg,
        borderBottom: `var(--line) solid ${emphasis ? accent : "var(--line)"}`,
      }}>
        <span style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 14, height: 14, borderRadius: "var(--radius-pill)",
              background: emphasis && i === 0 ? accent : skeleton,
            }} />
          ))}
        </span>
        <span style={{
          marginLeft: "var(--space-2)", flex: 1, height: 22,
          borderRadius: "var(--radius-pill)", background: skeleton,
        }} />
      </div>

      {/* content */}
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
        {children != null ? children : (
          <React.Fragment>
            {/* faux nav row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: skeleton }} />
              <span style={{ width: 60, height: 12, borderRadius: 6, background: skeleton }} />
              <span style={{ flex: 1 }} />
              <span style={{ width: 80, height: 26, borderRadius: 8, background: skeleton }} />
            </div>
            {title ? (
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)",
                fontSize: "34px", letterSpacing: "var(--tr-tight)", lineHeight: 1.1,
                color: tone === "section" ? "var(--canvas-section-fg)" : "var(--fg)",
                margin: "var(--space-2) 0 4px",
              }}>{title}</span>
            ) : null}
            <span style={{ width: "85%", height: 12, borderRadius: 6, background: skeleton }} />
            <span style={{ width: "55%", height: 12, borderRadius: 6, background: skeleton, marginBottom: "var(--space-2)" }} />
            {cta ? (
              <span style={{
                alignSelf: "flex-start", marginTop: "auto",
                padding: "12px 22px", borderRadius: "var(--radius-cta)",
                background: emphasis ? accent : skeleton,
                color: emphasis ? "#fff" : (tone === "section" ? "var(--canvas-section-muted)" : "var(--muted)"),
                fontFamily: "var(--font-body)", fontWeight: "var(--fw-bold)", fontSize: "20px",
              }}>{cta}</span>
            ) : null}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
