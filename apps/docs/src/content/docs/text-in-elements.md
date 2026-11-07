---
title: Text wrapped in elements
label: Text in elements
order: 5
demo: text-in-elements
---

Automatic detection only looks at text placed directly inside the skeleton.
When the text is wrapped in an inline element, like a link or `<strong>`, add
`inline` to force inline mode. Without it, the skeleton treats the link as a
box (element mode): the text is still hidden, but the placeholder is a plain
block, as tall as the line and with square corners, instead of rounded bars
trimmed to the text.

```html
<p>
  <nano-skeleton inline>
    <a href="/posts/42">Read the full post</a>
  </nano-skeleton>
</p>
```

The wrapping elements should be inline: a block or `inline-block` child gets a
single bar for its whole box.

Text decorations, such as a link's underline, stay visible while loading, so the
placeholder still reads as a link. To hide them too, wrap the link's content
in a `<span>`:

```html
<nano-skeleton inline>
  <a href="/posts/42"><span>Read the full post</span></a>
</nano-skeleton>
```

This doesn't work in the `-bg-per-block` [inline styles](#inline-styles),
where the text, including its decorations, shapes a single placeholder: the
underline is drawn as part of it.
