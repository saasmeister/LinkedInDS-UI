The role-aware 1080×1350 artboard for one LinkedIn visual — set its canvas role and it exposes `--fg/--muted/--line/--soft/--sig-color` to every child.

```jsx
<Canvas role="light" data-screen-label="Step 01">
  <Chrome name="Your name" category="Category" position="top" />
  <Headline>Start with the <Mark>one</Mark> thing</Headline>
</Canvas>
```

- `role`: `"loud"` (cover/back) · `"light"` (steps + default) · `"section"` (chapter marker).
- `density="tight"` switches the safe margin to 56px for infographics.
- `scale={0.42}` for thumbnails; render at natural size for export.
