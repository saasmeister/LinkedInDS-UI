import React from "react";

export interface FeedAuthor {
  name?: string;
  /** The headline / claimed category shown under the name. */
  headline?: string;
  /** Optional blue link line ("Visit my website"). */
  link?: string;
  /** Avatar image URL; falls back to initials on a blue circle. */
  avatar?: string;
  /** e.g. "21h". */
  time?: string;
}

export interface FeedPostProps {
  /** "single" full-bleed visual | "carousel" document viewer. */
  mode?: "single" | "carousel";
  author?: FeedAuthor;
  /** The post caption above the media. */
  text?: string;
  /** Single mode: the visual node (rendered full-bleed). */
  media?: React.ReactNode;
  /** Carousel mode: array of page nodes. */
  pages?: React.ReactNode[];
  /** Carousel document title shown in the page-count pill. */
  docTitle?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  width?: number;
  style?: React.CSSProperties;
}

/**
 * Wraps a visual in the real LinkedIn feed post chrome — preview how a
 * single image or a carousel actually lands in the timeline.
 * @startingPoint section="Preview" subtitle="LinkedIn feed post preview (single / carousel)" viewport="560x680"
 */
export function FeedPost(props: FeedPostProps): JSX.Element;
