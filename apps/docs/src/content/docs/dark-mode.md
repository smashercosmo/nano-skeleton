---
title: Dark mode
order: 11
---

The default colors use `light-dark()`, so they follow the page's
`color-scheme`. Try the Auto/Light/Dark switcher at the top of this page: every
demo follows it. Make sure your page sets it:

```css
:root {
  color-scheme: light dark;
}
```

Because `color-scheme` is inherited, it can also be set on a single region,
e.g. a dark sidebar on a light page, and the skeletons inside it follow.
