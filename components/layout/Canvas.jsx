import React from "react";

/**
 * Canvas — the 1080×1350 artboard for one LinkedIn visual.
 *
 * Sets the canvas ROLE (loud / light / section) and exposes generic
 * --fg / --bg / --muted / --line / --soft / --sig-color custom props
 * so every child primitive styles itself without knowing the role.
 *
 * Render at natural 1080×1350 and scale with the `scale` prop (or wrap
 * in your own transform) to fit a preview.
 */
export function Canvas({
  role = "light",
  margin,                // override the safe field; defaults per density
  density = "default",   // 'default' (96px) | 'tight' (56px, infographics)
  scale,
  children,
  style = {},
  ...rest
}) {
  const roles = {
    loud: {
      "--bg": "var(--canvas-loud-bg)",
      "--fg": "var(--canvas-loud-fg)",
      "--muted": "var(--canvas-loud-muted)",
      "--line": "var(--canvas-loud-line)",
      "--soft": "color-mix(in srgb, #fff 14%, transparent)",
      "--sig-color": "var(--canvas-loud-fg)",
    },
    light: {
      "--bg": "var(--canvas-light-bg)",
      "--fg": "var(--canvas-light-fg)",
      "--muted": "var(--canvas-light-muted)",
      "--line": "var(--canvas-light-line)",
      "--soft": "var(--canvas-light-soft)",
      "--sig-color": "var(--brand-primary)",
    },
    section: {
      "--bg": "var(--canvas-section-bg)",
      "--fg": "var(--canvas-section-fg)",
      "--muted": "var(--canvas-section-muted)",
      "--line": "var(--canvas-section-line)",
      "--soft": "var(--canvas-section-soft)",
      "--sig-color": "var(--accent)",
    },
  };

  const pad = margin ?? (density === "tight" ? "var(--margin-tight)" : "var(--margin)");

  return (
    <div
      data-canvas={role}
      data-screen-label={rest["data-screen-label"]}
      style={{
        position: "relative",
        width: "var(--canvas-w)",
        height: "var(--canvas-h)",
        boxSizing: "border-box",
        padding: pad,
        overflow: "hidden",
        fontFamily: "var(--font-body)",
        background: "var(--bg)",
        color: "var(--fg)",
        ...(scale != null
          ? { transform: `scale(${scale})`, transformOrigin: "top left" }
          : {}),
        ...roles[role],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
