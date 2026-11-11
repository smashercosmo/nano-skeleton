---
title: Inline skeletons
order: 3
demo: inline-skeletons
---

If the skeleton directly contains non-empty text, it renders inline and the text
itself becomes the placeholder. Each line of wrapped text gets its own rounded
bar, so the skeleton has the same shape as the real paragraph. Other ways to
draw the text, such as one pill per word, are covered in
[Inline modes](#inline-styles).

```html
<h3><nano-skeleton>Lorem ipsum dolor sit amet</nano-skeleton></h3>

<p>
  <nano-skeleton>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  </nano-skeleton>
</p>
```
