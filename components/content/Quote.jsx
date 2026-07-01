import React from "react";

/**
 * Quote — one pulled sentence, left-aligned, vertically centred, with
 * air left and right. Typography carries the visual. Pair with
 * <Attribution> underneath. No swipe arrow on a quote visual.
 */
export function Quote({ children, label = "QUOTE", style = {} }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-bold)",
          fontSize: "150px",
          lineHeight: 0.6,
          color: "var(--soft)",
        }}
      >
        &ldquo;
      </span>
      {label ? (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: "var(--fw-bold)",
            fontSize: "var(--fz-eyebrow)",
            letterSpacing: "var(--tr-eyebrow)",
            color: "var(--muted)",
            marginTop: "var(--space-2)",
          }}
        >
          {label}
        </span>
      ) : null}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-semibold)",
          fontSize: "var(--fz-quote)",
          lineHeight: "var(--lh-quote)",
          letterSpacing: "var(--tr-tight)",
          color: "var(--fg)",
          margin: "var(--space-3) 0 0",
          maxWidth: "820px",
          textWrap: "balance",
        }}
      >
        {children}
      </p>
    </div>
  );
}

/**
 * Avatar — round profile photo placeholder (drop a real <img> child to fill).
 */
export function Avatar({ src, size = 96, alt = "", style = {} }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
        background: "var(--soft)",
        border: "var(--line) solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 80 80" fill="none"
          stroke="var(--muted)" strokeWidth="4">
          <circle cx="40" cy="30" r="15" />
          <path d="M12 72 C12 48 68 48 68 72" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

/**
 * Attribution — avatar + name + role beneath a quote (or testimonial).
 */
export function Attribution({ name = "Full name", role = "Role / company", src, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", ...style }}>
      <Avatar src={src} size={96} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: "var(--fw-bold)", fontSize: "30px", color: "var(--fg)" }}>
          {name}
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: "var(--fw-medium)", fontSize: "24px", color: "var(--muted)" }}>
          {role}
        </span>
      </div>
    </div>
  );
}
