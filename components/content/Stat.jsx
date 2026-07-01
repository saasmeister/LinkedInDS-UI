import React from "react";

/**
 * Stat — one big number with a caption. The hero number on a single or
 * a section result slide. Size "xl" is the 230px hero treatment.
 */
export function Stat({ value = "00%", caption, size = "lg", align = "center", style = {} }) {
  const fz = size === "xl" ? "var(--fz-stat-xl)" : "var(--fz-stat)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: "var(--space-2)",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-bold)",
          fontSize: fz,
          lineHeight: 0.9,
          letterSpacing: "var(--tr-stat)",
          color: "var(--fg)",
        }}
      >
        {value}
      </span>
      {caption ? (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: "var(--fw-medium)",
            fontSize: "var(--fz-subhead)",
            color: "var(--muted)",
            textAlign: align,
            maxWidth: "680px",
          }}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}

/**
 * StatBox — a compact framed stat for the results row of a case-study
 * infographic. Renders in the section colour by default.
 */
export function StatBox({ value = "00", caption, tone = "section", style = {} }) {
  const bg = tone === "section" ? "var(--canvas-section-bg)" : "var(--soft)";
  const fg = tone === "section" ? "var(--canvas-section-fg)" : "var(--fg)";
  const cap = tone === "section" ? "var(--canvas-section-muted)" : "var(--muted)";
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        borderRadius: "var(--radius-card)",
        padding: "var(--space-4) var(--space-3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-bold)",
          fontSize: "52px",
          letterSpacing: "var(--tr-stat)",
          color: fg,
        }}
      >
        {value}
      </span>
      {caption ? (
        <span style={{ fontSize: "var(--fz-label)", fontWeight: "var(--fw-medium)", color: cap, textAlign: "center" }}>
          {caption}
        </span>
      ) : null}
    </div>
  );
}

/** StatRow — labelled row of StatBoxes (the case-study "RESULTS" rail). */
export function StatRow({ label = "RESULTS", children, style = {} }) {
  return (
    <div style={style}>
      {label ? (
        <span style={{ fontFamily: "var(--font-body)", fontWeight: "var(--fw-bold)", fontSize: "var(--fz-label)", letterSpacing: "var(--tr-eyebrow)", color: "var(--muted)" }}>
          {label}
        </span>
      ) : null}
      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
        {children}
      </div>
    </div>
  );
}
