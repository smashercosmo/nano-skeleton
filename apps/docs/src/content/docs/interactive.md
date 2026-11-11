---
title: Interactive skeletons
label: Interactive
order: 7
demo: interactive
---

By default, a loading skeleton is `inert`: its content can't be focused, clicked
or reached by assistive technology. That's usually what you want, but sometimes
the content is usable before the data arrives, e.g. a link whose `href` is
already known.

It matters most when content goes back into the loading state (a background
refetch, pagination): an `inert` element that had focus loses it, and keyboard
users are sent back to the top of the page.

Add `interactive` to keep the content focusable and clickable while loading:

```html
<nano-skeleton-provider loading>
  <nano-skeleton inline interactive>
    <a href="/posts/42">Placeholder post title</a>
  </nano-skeleton>
</nano-skeleton-provider>
```

The placeholder looks the same, but the content stays in the tab order and
keeps its accessible name. Make sure that name makes sense while loading, as
screen reader users will hear it. The provider sets `aria-busy="true"` while
loading to tell them the region is still updating.

### Link underlines

Text decorations are hidden while loading, except in interactive skeletons:
there, the underline of a link placed directly inside the skeleton stays
visible. The placeholder can be focused and clicked, so it should still look
like a link.

If your design calls for hiding the underline, wrap the link in an extra
element, so it's no longer a direct child of the skeleton:

```html
<nano-skeleton inline interactive>
  <span><a href="/posts/42">Placeholder post title</a></span>
</nano-skeleton>
```
