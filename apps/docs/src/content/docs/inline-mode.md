---
title: Inline mode
order: 3
demo: inline-mode
---

If the skeleton directly contains non-empty text, it renders inline and the text
itself becomes the placeholder. Each line of wrapped text gets its own rounded
bar, so the skeleton has the same shape as the real paragraph. Other ways to
draw the text, such as one pill per word, are covered in
[Inline styles](#inline-styles).

```html
<h3><nano-skeleton>Lorem ipsum dolor sit amet</nano-skeleton></h3>

<p>
  <nano-skeleton>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  </nano-skeleton>
</p>
```

Put the skeleton _inside_ the heading or paragraph, not around it, so the
placeholder matches the text and not the whole block.

The mode is re-evaluated whenever the content changes, so you can render
placeholder text first and replace it with real data later:

```html
<h3><nano-skeleton>Loading title…</nano-skeleton></h3>
```
