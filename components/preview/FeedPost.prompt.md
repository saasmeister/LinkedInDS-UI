Wraps a visual in the real LinkedIn feed post chrome so a user can preview how it lands in the timeline — single image or carousel document.

```jsx
// single image post
<FeedPost mode="single" author={{ name: "Thomas Varekamp", headline: "AI voor hogere marges", time: "21h" }}
  text="Update: 1 maand na lancering." media={<img src="visual.png" style={{width:'100%'}} />} />

// carousel / document post
<FeedPost mode="carousel" docTitle="How He Built a $500K DM Machine"
  pages={[<Cover/>, <Bio/>, <Quote/>]} author={{ name: "Heena Khuman" }} />
```

- `mode="carousel"` renders the document viewer: page-count pill ("N pages"), next arrow, fullscreen icon, two pages side-by-side.
- Chrome (avatar, in-badge, ·1st, headline, time, globe, action bar) is LinkedIn's own UI — keep it neutral; the brand layer only styles the visual inside.
