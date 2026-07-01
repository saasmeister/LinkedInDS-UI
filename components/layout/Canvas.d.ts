import React from "react";

export type CanvasRole = "loud" | "light" | "section";

export interface CanvasProps {
  /** Canvas role — sets tone before any content. Default "light". */
  role?: CanvasRole;
  /** Override the safe inner margin (any CSS length). */
  margin?: string;
  /** Field density: "default" 96px, "tight" 56px for infographics. */
  density?: "default" | "tight";
  /** Convenience transform scale for previews (e.g. 0.42). */
  scale?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  "data-screen-label"?: string;
}

/**
 * The 1080×1350 artboard for one LinkedIn visual. Sets the canvas role
 * and exposes generic --fg/--muted/--line custom props to its children.
 */
export function Canvas(props: CanvasProps): JSX.Element;
