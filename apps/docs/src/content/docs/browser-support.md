---
title: Browser support
order: 17
---

nano-skeleton targets modern evergreen browsers:

<div class="table-wrap">

| Browser       | Version |
| ------------- | ------- |
| Chrome / Edge | 123+    |
| Safari        | 18+     |
| Firefox       | 146+    |

</div>

The versions come from
[`@scope`](https://developer.mozilla.org/docs/Web/CSS/@scope) (Firefox 146),
[`light-dark()`](https://developer.mozilla.org/docs/Web/CSS/color_value/light-dark)
(Chrome 123) and
[`content-visibility`](https://developer.mozilla.org/docs/Web/CSS/content-visibility)
(Safari 18). Some features are applied where supported and degrade gracefully
elsewhere:

- **Tighter text bars:** the default inline style trims the bars to the cap
  height with `text-box`, in Chrome 133+ and Safari 18.2+. Elsewhere, such as in
  Firefox, the bars are as tall as the font's content area, so they're slightly
  taller. The font-based [inline styles](#inline-styles) look the same
  everywhere.
- **Images and videos:** Safari 17.5 and earlier still paint the picture or
  video frame of a loading image or video on top of the placeholder.
- **Without `@scope`:** none of the styles apply, so the content stays visible
  while loading. It's still `inert`, as that doesn't depend on the styles.
