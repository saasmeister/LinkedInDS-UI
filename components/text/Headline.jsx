import React from "react";

/**
 * Eyebrow — the small all-caps kicker / category label above a headline.
 */
export function Eyebrow({ children, color, style = {} }) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--fw-bold)",
        fontSize: "var(--fz-eyebrow)",
        letterSpacing: "var(--tr-eyebrow)",
        textTransform: "uppercase",
        color: color ?? "var(--muted)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Headline — the hero of every visual. Gets ONE fixed, recognisable
 * "signature" treatment, kept consistent across a whole series. Wrap the
 * emphasised words in <Mark> to carry the signature shape.
 */
export function Headline({
  children,
  size = "md",               // 'sm' | 'md' | 'lg'
  signature,                 // 'underline' | 'block' | 'bubble' | 'plain'; default reads --signature
  as: Tag = "h2",
  style = {},
}) {
  const sizes = {
    sm: "var(--fz-head-sm)",
    md: "var(--fz-head-md)",
    lg: "var(--fz-head-lg)",
  };
  return (
    <Tag
      data-signature={signature}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: "var(--fw-bold)",
        fontSize: sizes[size],
        lineHeight: "var(--lh-head)",
        letterSpacing: "var(--tr-tight)",
        color: "var(--fg)",
        margin: 0,
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Mark — wraps the word(s) in a headline that carry the signature shape.
 * Resolves --signature (or the `signature` prop) to underline / block / bubble.
 */
export function Mark({ children, signature, style = {} }) {
  const sig = signature; // when undefined, falls back to the CSS var via class
  const cls =
    sig === "block" ? "sig-block" :
    sig === "bubble" ? "sig-bubble" :
    sig === "plain" ? "" :
    "sig-underline";
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}

/**
 * Subhead — the supporting line under the headline.
 */
export function Subhead({ children, style = {} }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: "var(--fw-regular)",
        fontSize: "var(--fz-subhead)",
        lineHeight: "var(--lh-body)",
        color: "var(--muted)",
        margin: 0,
        maxWidth: "760px",
        textWrap: "pretty",
        ...style,
      }}
    >
      {children}
    </p>
  );
}
