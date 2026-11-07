---
title: Element mode
order: 6
demo: element-mode
---

If the skeleton contains elements, it becomes `display: contents` (it doesn't
affect layout at all), and each **direct child** is painted as a placeholder
block while everything inside it is hidden.

```html
<!-- Image: keeps its box, the picture itself is hidden -->
<nano-skeleton>
  <img src="/cover.png" width="1600" height="1200" alt="" />
</nano-skeleton>

<!-- Video: the poster/frame and controls are hidden -->
<nano-skeleton>
  <video controls width="400" src="/clip.webm"></video>
</nano-skeleton>

<!-- Any box: a button, a badge, a chart container... -->
<nano-skeleton>
  <button type="button">Follow</button>
</nano-skeleton>
```

Because the placeholder is just the element's own box, make sure it has a size
while loading, e.g. `width`/`height` attributes or `aspect-ratio` on images and
videos, or a fixed size on containers. Shape comes from your element too: a
rounded avatar produces a rounded placeholder.

Images and videos that only get their size from the file keep their last
rendered size when they go back to loading, e.g. on a refetch. Before they've
been rendered once, they fall back to 300×150, the browser's default size for
media.

### Broken sources

While loading, the contents of an `<img>` or `<video>` aren't painted, only its
box: no picture, no video frame or native controls, and for a URL that is not
known yet, or one that fails, no broken-image icon or `alt` text. Compare both
columns in the demo above.

Safari ignores `aspect-ratio` on a broken image and draws it as a square, so
once loading ends, the image can change height. If an image gets its size from
CSS alone, e.g. a `width` and an `aspect-ratio`, add `contain: size` to keep it:

```css
.cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  contain: size;
}
```

Don't add it to images sized only by their file, as `contain: size` makes the
browser ignore the file's dimensions and the image would collapse.

### Transitions

The content is hidden with `opacity: 0`, so if an element inside has a
`transition` on `opacity` (or `transition: all`), it fades in and out when
`loading` changes instead of switching instantly.
