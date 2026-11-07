---
title: Forced colors
order: 14
---

In forced colors mode (such as Windows High Contrast), browsers remove gradient
backgrounds, which would make the skeleton invisible. nano-skeleton opts its
placeholders out of forced colors and redraws them with a neutral gradient mixed
from the `CanvasText` and `Canvas` system colors, so they follow the user's
palette and keep the shimmer. Text decorations that stay visible while loading,
such as a link's underline, keep their system colors: `LinkText` for links and
`CanvasText` for the rest.

`--nano-skeleton-background-image` is ignored in this mode, since custom colors
would bypass the user's palette. Use
`--nano-skeleton-forced-colors-background-image` instead, and stick to
[system colors](https://developer.mozilla.org/docs/Web/CSS/system-color):

```css
:root {
  --nano-skeleton-forced-colors-background-image: linear-gradient(
    90deg,
    GrayText 33%,
    Highlight,
    GrayText 66%
  );
}
```

To try it on this site:

- **Chrome / Edge:** DevTools → `⋮` → More tools → Rendering → "Emulate CSS
  media feature forced-colors" → `active`.
- **Firefox:** Settings → Fonts → Colors… → Override the colors specified by
  the page → Always.
- **Windows:** Settings → Accessibility → Contrast themes.
