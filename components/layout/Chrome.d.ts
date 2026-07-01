import React from "react";

export interface ChromeProps {
  /** Left side: company or personal name. */
  name?: string;
  /** Right side: the claimed category / function. */
  category?: string;
  /** Above or below the content. Default "top". */
  position?: "top" | "bottom";
  /** Show the swipe arrow — CAROUSELS ONLY. */
  swipe?: boolean;
  /** Override the side inset (defaults to the canvas margin). */
  inset?: string;
  style?: React.CSSProperties;
}

/**
 * The identity bar: name left, claimed category/function right.
 */
export function Chrome(props: ChromeProps): JSX.Element;

export interface SwipeArrowProps {
  size?: number;
  style?: React.CSSProperties;
}
/** The → "keep swiping" cue — carousels only. */
export function SwipeArrow(props: SwipeArrowProps): JSX.Element;
