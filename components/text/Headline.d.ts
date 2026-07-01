import React from "react";

export interface EyebrowProps {
  children?: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}
/** Small all-caps kicker / category label above a headline. */
export function Eyebrow(props: EyebrowProps): JSX.Element;

export interface HeadlineProps {
  children?: React.ReactNode;
  /** "sm" 56px | "md" 72px | "lg" 88px (cover). Default "md". */
  size?: "sm" | "md" | "lg";
  /** Signature shape; defaults to the --signature token. */
  signature?: "underline" | "block" | "bubble" | "plain";
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}
/**
 * The hero headline with its fixed signature treatment.
 */
export function Headline(props: HeadlineProps): JSX.Element;

export interface MarkProps {
  children?: React.ReactNode;
  signature?: "underline" | "block" | "bubble" | "plain";
  style?: React.CSSProperties;
}
/** Wraps the emphasised words in a headline; carries the signature shape. */
export function Mark(props: MarkProps): JSX.Element;

export interface SubheadProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Supporting line under the headline. */
export function Subhead(props: SubheadProps): JSX.Element;
