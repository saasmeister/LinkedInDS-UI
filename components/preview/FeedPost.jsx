import React from "react";

/* LinkedIn feed colours (the host UI, not the brand layer). */
const LI = {
  blue: "#0A66C2",
  text: "rgba(0,0,0,0.9)",
  sub: "rgba(0,0,0,0.6)",
  faint: "rgba(0,0,0,0.45)",
  line: "#E8E8E8",
  card: "#FFFFFF",
  feed: "#F4F2EE",
};

function Avatar({ src, name = "", size = 48 }) {
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <span style={{
      width: size, height: size, flex: "none", borderRadius: "50%", overflow: "hidden",
      background: src ? "#ddd" : LI.blue, color: "#fff", display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 600, fontSize: size * 0.38,
    }}>
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </span>
  );
}

const InBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 3, background: LI.blue, color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>in</span>
);
const Globe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={LI.faint} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>
);

function PostHeader({ author }) {
  const a = author || {};
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px 0" }}>
      <Avatar src={a.avatar} name={a.name || "Your Name"} />
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: LI.text }}>{a.name || "Your Name"}</span>
          <InBadge />
          <span style={{ fontSize: 13, color: LI.faint }}>· 1st</span>
        </div>
        <div style={{ fontSize: 13, color: LI.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}>
          {a.headline || "Claimed category / function"}
        </div>
        {a.link ? <div style={{ fontSize: 13, color: LI.blue, fontWeight: 600 }}>{a.link}</div> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: LI.faint, marginTop: 1 }}>
          <span>{a.time || "21h"}</span><span>·</span><Globe />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, color: LI.faint }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
      </div>
    </div>
  );
}

function PostText({ text }) {
  if (!text) return null;
  return (
    <div style={{ padding: "10px 16px 12px", fontSize: 15, lineHeight: 1.45, color: LI.text, whiteSpace: "pre-wrap" }}>
      {text}{text.length > 80 ? <span style={{ color: LI.faint }}> …more</span> : null}
    </div>
  );
}

function ActionBar({ likes = 23, comments = 4, reposts = 1 }) {
  const ico = (d) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={LI.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
  return (
    <div style={{ borderTop: `1px solid ${LI.line}`, margin: "0 16px", padding: "6px 0 10px", display: "flex", alignItems: "center", gap: 20, color: LI.sub, fontSize: 13 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-flex" }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", background: LI.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h4V9H2v12zM22 10c0-1.1-.9-2-2-2h-6.3l.9-4.5c.1-.5 0-1-.3-1.4-.4-.4-.9-.6-1.4-.6L8 8v13h11c.8 0 1.5-.5 1.8-1.2l2-7c.1-.3.2-.5.2-.8v-2z" /></svg>
          </span>
        </span>
        {likes}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{ico(<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.9A8.4 8.4 0 1 1 21 11.5z" />)}{comments}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{ico(<g><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></g>)}{reposts}</span>
      <span style={{ marginLeft: "auto" }}>{ico(<g><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></g>)}</span>
    </div>
  );
}

/**
 * FeedPost — wraps a visual in the real LinkedIn feed post chrome so a user
 * can preview exactly how it lands in the timeline. Two modes:
 *  - "single"   : one full-bleed image/visual (pass `media`).
 *  - "carousel" : a document viewer with page-count pill, next arrow and
 *                 fullscreen icon (pass `pages` — an array of nodes).
 */
export function FeedPost({
  mode = "single",
  author,
  text = "Update: 1 maand na lancering. Dit is wat er de afgelopen 7 dagen is gebeurd:",
  media,
  pages = [],
  docTitle = "Untitled",
  likes, comments, reposts,
  width = 540,
  style = {},
}) {
  return (
    <div style={{ width, background: LI.card, borderRadius: 10, border: `1px solid ${LI.line}`, boxShadow: "0 1px 3px rgba(0,0,0,.08)", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", overflow: "hidden", ...style }}>
      <PostHeader author={author} />
      <PostText text={text} />
      {mode === "carousel"
        ? <CarouselViewer pages={pages} docTitle={docTitle} />
        : <div style={{ background: "#000", lineHeight: 0 }}>{media}</div>}
      <ActionBar likes={likes} comments={comments} reposts={reposts} />
    </div>
  );
}

function CarouselViewer({ pages, docTitle }) {
  const count = pages.length || 1;
  return (
    <div style={{ position: "relative", background: "#000", overflow: "hidden" }}>
      {/* page-count pill */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: "rgba(0,0,0,.62)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "5px 11px", borderRadius: 7, display: "flex", alignItems: "center", gap: 7, maxWidth: "78%" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{docTitle}</span>
        <span style={{ opacity: .8 }}>·</span><span style={{ whiteSpace: "nowrap", opacity: .9 }}>{count} pages</span>
      </div>
      {/* two pages side by side, second peeking */}
      <div style={{ display: "flex", gap: 8, padding: 0 }}>
        {pages.slice(0, 2).map((p, i) => (
          <div key={i} style={{ flex: "0 0 calc(100% - 56px)", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: i === 0 ? 0 : 8, background: "#0b0b0b", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>{p}</div>
          </div>
        ))}
      </div>
      {/* next arrow */}
      <button style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", zIndex: 3, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.55)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
      {/* fullscreen */}
      <button style={{ position: "absolute", bottom: 12, right: 12, zIndex: 3, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.55)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
      </button>
    </div>
  );
}
