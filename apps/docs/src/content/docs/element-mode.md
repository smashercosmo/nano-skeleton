---
title: Element mode
order: 6
demo: element-mode
---

If the skeleton contains elements, it becomes `display: contents` (it doesn't
affect layout at all), and each **direct child** is painted as a placeholder
block while its content is hidden.

```html
<!-- Image: keeps its box, the picture itself is hidden -->
<nano-skeleton>
  <img src="/cover.png" width="1600" height="1200" alt="" />
</nano-skeleton>

<!-- Any box: a button, a badge, a chart container... -->
<nano-skeleton>
  <button type="button">Follow</button>
</nano-skeleton>
```

Nano-skeleton doesn't change the element's `display`, so the child should be a
box with a size of its own: a block, an `inline-block`, a flex or grid
container or item, or a replaced element, such as an image. An inline element,
e.g. a `<span>`, is only as tall as a line of text; for text, use
[inline mode](#inline-mode) instead.

Because the placeholder is just the element's own box, make sure it has a size
while loading, e.g. `width`/`height` attributes or `aspect-ratio` on images and
videos, or a fixed size on containers. Shape comes from your element too: a
rounded avatar produces a rounded placeholder.
