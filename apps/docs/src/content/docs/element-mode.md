---
title: Element mode
order: 6
demo: element-mode
---

If the skeleton contains elements, it becomes `display: contents` (it doesn't
affect layout at all), and each **direct child** is painted as a placeholder
block while its content is hidden (see [What is hidden](#what-is-hidden)).

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

### What is hidden

The skeleton replaces the element's content, not its look. While loading:

- **Hidden:** the element's background (replaced by the placeholder), its
  text, children, `::before` and `::after` content, list markers, and the
  contents of images, videos, iframes and embeds.
- **Kept:** the element's own box, including its border, box shadow and
  outline. Hide them in your own styles if you don't want them while loading,
  e.g. with `nano-skeleton[loading] > .card { box-shadow: none; }`.
- **Not hidden:** the contents of a `<canvas>` and the native parts of form
  controls, such as checkboxes, sliders or a select's arrow. Wrap them in an
  element, e.g. a `<div>`, and put the skeleton around that instead.

Images and videos that only get their size from the file keep their last
rendered size when they go back to loading, e.g. on a refetch. Before they've
been rendered once, images have no size and videos get the browser's default
300×150. An image inside a `<picture>` or a link works the same way: the image
itself becomes the placeholder.

In Safari, an image in a flex row that's too narrow for its content can shrink
while loading, as Safari doesn't use the remembered size there. Keep it from
shrinking, which is usually what an avatar needs anyway:

```css
.avatar {
  flex-shrink: 0;
}
```

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
