One cell of an infographic, plus `Chip` and the `Cta` bar.

```jsx
<InfoCard number={1} label="Format" heading="Carousels became the engine"
  body="One story per post, a signature headline every time." emphasis>
  <div style={{display:"flex",gap:10}}><Chip>Hooks</Chip><Chip tone="accent">Cadence</Chip></div>
</InfoCard>

<Cta>DM me ‘SCRIPT’ →</Cta>
```

- Each cell: label + mini-heading + body + **one** supporting element (chips, mini-chart, screenshot, illustration) as children.
- `emphasis` on the single stand-out card per sheet (thicker border — emphasis by weight, not colour).
- `Chip tone`: `"soft"` · `"accent"` · `"solid"`.
