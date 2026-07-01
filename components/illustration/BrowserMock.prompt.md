A mini browser/app window to illustrate a homepage or screen inside a visual — the "catalog of homepages" pattern. Window chrome (dots + address pill) over content.

```jsx
<BrowserMock title="Saves you time" />
<BrowserMock title="What only you can claim" cta="Write your own brief →" emphasis />
```

- Leave children empty for an auto skeleton (nav + headline + lines + CTA), or pass real content.
- `emphasis` marks the one stand-out window (accent border + accent CTA) — the "build this instead" card.
- `tone="section"` for windows placed on a dark/section canvas.
