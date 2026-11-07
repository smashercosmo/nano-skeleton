---
"nano-skeleton": minor
---

fix: hide more of the content and keep layouts steady while loading

- `lines-bg-per-block` and `words-bg-per-block` no longer collapse lines with `line-height: normal`, the browser default
- In Safari, every line of inline text gets its own rounded bar and gradient: `box-decoration-break` needs the `-webkit-` prefix there
- Text shadows and strokes are hidden, they stayed visible as ghost text
- Images, SVGs and videos placed directly inside inline text are hidden. Other inline elements, such as a `<kbd>`, keep their borders and backgrounds
- Generated content (`::before` and `::after`) and list markers of element-mode children are hidden. The element's own box, including its border, shadow and outline, is kept
- An ellipsis of truncated text is clipped while loading, it was drawn on top of the placeholder
- The font-based inline styles keep the inherited `letter-spacing` unless `--nano-skeleton-letter-spacing` is set. Before, it was reset to `0`
- Custom properties can be set on the skeleton element itself, not only on its ancestors

BREAKING CHANGES:

- `--nano-skeleton-letter-spacing` replaces the inherited `letter-spacing` in the font-based inline styles, which is used when the property isn't set. Before, the default was `0`
