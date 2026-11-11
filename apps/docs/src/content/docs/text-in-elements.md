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
block, as tall as the line and with square corners.

```html
<p>
  <nano-skeleton inline>
    <a href="/posts/42">Read the full post</a>
  </nano-skeleton>
</p>
```
