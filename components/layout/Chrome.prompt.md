The identity bar — name left, claimed category/function right. Top or bottom. The swipe arrow is carousels-only.

```jsx
<Chrome name="Your name" category="Category / function" position="bottom" swipe />
```

- `position`: `"top"` | `"bottom"` — deliver both variants and pick by how the visual lands.
- `swipe`: ONLY on a carousel (the "keep swiping" cue). Never on single / quote / infographic.
- Reads `--fg`/`--muted` from the Canvas, so it inverts correctly on any role.
