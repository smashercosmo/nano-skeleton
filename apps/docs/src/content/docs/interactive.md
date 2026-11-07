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

By default, a link's underline stays visible while loading. For an interactive
link this matters: the placeholder can be focused and clicked, so it should
still look like a link, and color alone isn't enough to tell links apart.

If your styles use the `text-decoration` shorthand on links, e.g.
`a { text-decoration: underline }`, give it a color too, as the shorthand
resets the color to `currentcolor`, which Chrome paints with the skeleton's
transparent text fill:

```css
a {
  text-decoration: underline var(--link-color);
}
```

If your design calls for hiding the underline, wrap the link's content in an
extra element:

```html
<nano-skeleton inline interactive>
  <a href="/posts/42"><span>Placeholder post title</span></a>
</nano-skeleton>
```
