import React from "react";

export interface InfoCardProps {
  label?: string;
  heading?: React.ReactNode;
  body?: React.ReactNode;
  /** The one stand-out card per sheet (thicker border). */
  emphasis?: boolean;
  /** Step number badge for numbered-flow infographics. */
  number?: number | string;
  /** ONE supporting element: chips, mini-chart, screenshot, illustration. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/**
 * One cell of an infographic: label + mini-heading + body + one element.
 */
export function InfoCard(props: InfoCardProps): JSX.Element;

export interface ChipProps {
  children?: React.ReactNode;
  tone?: "soft" | "accent" | "solid";
  style?: React.CSSProperties;
}
/** Pill tag for categorising / marking. */
export function Chip(props: ChipProps): JSX.Element;
