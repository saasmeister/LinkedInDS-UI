import React from "react";

export interface StatProps {
  value?: string;
  caption?: string;
  /** "lg" 150px | "xl" 230px hero. Default "lg". */
  size?: "lg" | "xl";
  align?: "center" | "left";
  style?: React.CSSProperties;
}
/**
 * One big number with a caption — the hero figure on a single/result slide.
 */
export function Stat(props: StatProps): JSX.Element;

export interface StatBoxProps {
  value?: string;
  caption?: string;
  tone?: "section" | "soft";
  style?: React.CSSProperties;
}
/** Compact framed stat for an infographic results row. */
export function StatBox(props: StatBoxProps): JSX.Element;

export interface StatRowProps {
  label?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Labelled rail of StatBoxes. */
export function StatRow(props: StatRowProps): JSX.Element;
