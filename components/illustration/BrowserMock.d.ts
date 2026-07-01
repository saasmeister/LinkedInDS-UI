import React from "react";

export interface BrowserMockProps {
  /** Mini-heading shown over the skeleton content. */
  title?: string;
  /** Skeleton CTA label; null to hide. Default "Get started". */
  cta?: string | null;
  /** The one stand-out window (accent border + accent CTA). */
  emphasis?: boolean;
  /** "light" white window | "section" for use on a dark canvas. */
  tone?: "light" | "section";
  /** Real content; omit for an auto skeleton (nav + headline + lines + CTA). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * A mini browser/app window that illustrates a homepage or screen inside a
 * visual — the "catalog of homepages" pattern. Window chrome over content.
 */
export function BrowserMock(props: BrowserMockProps): JSX.Element;
