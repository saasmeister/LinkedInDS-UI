import React from "react";

/**
 * InfoCard — one cell of an infographic. Category label + mini-heading +
 * body + ONE supporting element (passed as children: chips, a mini-chart,
 * a screenshot slot, an illustration). Set `emphasis` on the single card
 * per sheet that should stand out (thicker border).
 */
export function InfoCard({ label = "CATEGORY", heading, body, emphasis = false, number, children, style = {} }) {
  return (
    <div
      style={{
        border: `${emphasis ? "var(--line-strong)" : "var(--line)"} solid ${emphasis ? "var(--muted)" : "var(--line)"}`,
        borderRadius: "var(--radius-card)",
        background: "var(--bg)",
        padding: "var(--space-4) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {number != null ? (
          <span style={{
            width: 52, height: 52, flex: "none", borderRadius: "var(--radius-pill)",
            background: "var(--canvas-section-bg)", color: "var(--canvas-section-fg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", fontSize: "26px",
          }}>{number}</span>
        ) : null}
        <span style={{ fontFamily: "var(--font-body)", fontWeight: "var(--fw-bold)", fontSize: "var(--fz-label)", letterSpacing: "var(--tr-eyebrow)", color: "var(--muted)" }}>
          {label}
        </span>
      </div>
      {heading ? (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", fontSize: "28px", lineHeight: 1.15, color: "var(--fg)", letterSpacing: "var(--tr-tight)" }}>
          {heading}
        </span>
      ) : null}
      {body ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--fz-body)", lineHeight: "var(--lh-body)", color: "var(--muted)", margin: 0 }}>
          {body}
        </p>
      ) : null}
      {children ? <div style={{ marginTop: "auto", paddingTop: "var(--space-2)" }}>{children}</div> : null}
    </div>
  );
}

/** Chip — a pill tag for categorising / marking. */
export function Chip({ children, tone = "soft", style = {} }) {
  const styles = {
    soft:    { background: "var(--soft)", color: "var(--fg)", border: "var(--line) solid var(--line)" },
    accent:  { background: "var(--accent-soft)", color: "var(--accent-fg)", border: "var(--line) solid var(--accent)" },
    solid:   { background: "var(--canvas-section-bg)", color: "var(--canvas-section-fg)", border: "var(--line) solid transparent" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 44,
        padding: "0 var(--space-3)",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "22px",
        whiteSpace: "nowrap",
        ...styles[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
