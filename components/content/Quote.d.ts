import React from "react";

export interface QuoteProps {
  children?: React.ReactNode;
  label?: string;
  style?: React.CSSProperties;
}
/**
 * One pulled sentence, left-aligned, set large. Pair with <Attribution>.
 */
export function Quote(props: QuoteProps): JSX.Element;

export interface AvatarProps {
  src?: string;
  size?: number;
  alt?: string;
  style?: React.CSSProperties;
}
/** Round profile photo placeholder. */
export function Avatar(props: AvatarProps): JSX.Element;

export interface AttributionProps {
  name?: string;
  role?: string;
  src?: string;
  style?: React.CSSProperties;
}
/** Avatar + name + role beneath a quote or testimonial. */
export function Attribution(props: AttributionProps): JSX.Element;
