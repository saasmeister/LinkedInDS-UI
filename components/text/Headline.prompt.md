The hero headline with its fixed signature treatment, plus Eyebrow / Subhead / Mark.

```jsx
<Eyebrow>The re-hook</Eyebrow>
<Headline size="lg" signature="underline">
  Most outreach fails on the <Mark>first line</Mark>
</Headline>
<Subhead>One supporting line that adds context the hook left out.</Subhead>
```

- `size`: `"sm"` 56 · `"md"` 72 · `"lg"` 88 (cover).
- `signature` / `<Mark signature>`: `"underline"` (default) · `"block"` · `"bubble"` · `"plain"` — pick once, keep it consistent across the series. Defaults to the `--signature` token.
- The headline deliberately differs from the post hook.
