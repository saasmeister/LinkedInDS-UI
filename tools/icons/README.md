# Installing an icon set (fast, editable — no converter to build)

The SVG→editable-icon **converter is built into `icon-kit.js`** (`IconKit.installSvg`),
which is always part of the imported system. So installing a user's icons does
**not** need a build script or a hand-rolled converter — just register each SVG.

## The one mechanism: `IconKit.installSvg(name, svgString, {accent})`

Write a `components/icons/icon-library.js` that registers each uploaded SVG:

```js
(function () {
  if (!window.IconKit || !IconKit.installSvg) return;
  var A = { accent: "#F2685C" };   // the brand accent → recolours to var(--brand-primary)
  IconKit.installSvg("star",   "<svg viewBox='0 0 24 24'>…</svg>", A);
  IconKit.installSvg("funnel", "<svg viewBox='0 0 24 24'>…</svg>", A);
  // …one line per icon, filename (without .svg) as the name
})();
```

`icon-library.js` auto-loads after `icon-kit.js` (the board's Icon Library loader
and the icon editor both chain-load it). Each icon then:

- **appears in the Icon Library** and opens **node-editable** in the icon editor;
- **appears in the Visual Designer** ("From the Icon Library"), droppable onto the canvas;
- **recolours to the brand** — the colour matching `accent` becomes `var(--brand-primary)`, everything else `var(--icon-ink)`.

`installSvg` parses the SVG to **symmetric-handle anchors** (the IconKit edit format)
at runtime; asymmetric bezier handles are averaged, so very sharp cusps soften
slightly — fine for flat icons, and tweakable in the editor afterwards.

## Optional convenience: the bundler

If you have the SVGs in a folder and want the file written for you:

```bash
node tools/icons/build-icon-library.mjs <svg-folder> --accent "#F2685C" --out components/icons/icon-library.js
```

It just embeds each SVG into an `IconKit.installSvg(...)` call — the conversion
still happens in `icon-kit.js` at runtime. **Note:** a host import may skip
`tools/` (it copies frontend files), so don't depend on this script being
present — writing the `installSvg` calls directly (above) always works.
