import React from "react";

/**
 * Cta — the closing call-to-action block for a carousel back cover.
 * A bordered, soft-filled bar that holds the next step (DM / link / follow).
 */
export function Cta({ children = "DM me \u2018WORD\u2019 \u2192", style = {} }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "560px",
        minHeight: "112px",
        padding: "0 var(--space-6)",
        border: "var(--line) solid var(--line)",
        borderRadius: "var(--radius-cta)",
        background: "var(--soft)",
        fontFamily: "var(--font-display)",
        fontWeight: "var(--fw-bold)",
        fontSize: "32px",
        letterSpacing: "var(--tr-tight)",
        color: "var(--fg)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
