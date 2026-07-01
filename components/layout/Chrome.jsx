import React from "react";

/**
 * Chrome — the identity bar. Name (or company) on the left, claimed
 * category / function on the right. Sits at the top OR bottom (deliver
 * both as variants). The swipe arrow (→) is ONLY valid on carousels.
 */
export function Chrome({
  name = "Name",
  category = "Category / function",
  position = "top",          // 'top' | 'bottom'
  swipe = false,             // carousel only
  inset,                     // override side inset; defaults to the canvas margin
  style = {},
}) {
  const side = inset ?? "var(--margin)";
  const edge = position === "top" ? { top: side } : { bottom: side };

  return (
    <div
      style={{
        position: "absolute",
        left: side,
        right: side,
        ...edge,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-4)",
        fontFamily: "var(--font-body)",
        ...style,
      }}
    >
      <span
        style={{
          fontWeight: "var(--fw-semibold)",
          fontSize: "var(--fz-chrome)",
          letterSpacing: "var(--tr-chrome)",
          color: "var(--fg)",
        }}
      >
        {name}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <span
          style={{
            fontWeight: "var(--fw-semibold)",
            fontSize: "var(--fz-chrome)",
            letterSpacing: "var(--tr-chrome)",
            color: "var(--muted)",
          }}
        >
          {category}
        </span>
        {swipe ? <SwipeArrow /> : null}
      </div>
    </div>
  );
}

/**
 * SwipeArrow — the "there is more, keep swiping" cue. Carousels only;
 * never on single, quote or infographic.
 */
export function SwipeArrow({ size = 72, style = {} }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "var(--radius-pill)",
        border: "var(--line) solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--fg)",
        ...style,
      }}
    >
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    </span>
  );
}
