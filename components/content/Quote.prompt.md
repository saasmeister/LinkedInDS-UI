One pulled sentence, left-aligned and vertically centred, with attribution beneath. Quote-visual and testimonial use the same setup.

```jsx
<Quote label="QUOTE">The visual carries the save, not the caption.</Quote>
<Attribution name="Full name" role="Role · company" src="/avatar.jpg" />
```

- Typography carries the visual — keep everything else minimal, no swipe arrow.
- Works on a light or section canvas; the quote mark uses `--soft`/`--accent` so it reads on either.
- `Avatar` is a round placeholder; pass `src` to fill it.
