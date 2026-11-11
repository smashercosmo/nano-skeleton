---
"nano-skeleton": minor
---

feat: shape the text bars of the font-based inline styles with custom properties

- The built-in fonts are variable fonts. New custom properties set their axes, as unitless numbers in em: `--nano-skeleton-inline-glyph-width` (default `0.5`), `--nano-skeleton-inline-ascent` (`0.71`) and `--nano-skeleton-inline-descent` (`0`)
- `--nano-skeleton-inline-baseline-shift` (default `0`) moves the bars of the font-based styles up or down without changing the layout, to put them on the baseline of the page's font, e.g. `0.09` for Helvetica
- Wide characters, such as Chinese, Japanese and Korean, get bars a full em wide, about as wide as the real characters, so such text wraps much closer to the loaded text
- Spaces in `lines-bg-per-block` are half as wide as the other characters, as in the `words-` styles, so all of them wrap text the same way
- In the default style, `--nano-skeleton-inline-border-radius: 1` gives fully round ends with any line height. A tight line height left them less than round
- Text inside other elements, such as `<b>` or `<a>`, gets its bars in Firefox too in the `-bg-per-block` styles

BREAKING CHANGES:

- `--nano-skeleton-letter-spacing` is removed. Set `--nano-skeleton-inline-glyph-width` to make the bars wider or narrower
- The `-bg-per-block` styles draw the skeleton's child, as element mode does: wrap the paragraph or heading in the skeleton, instead of putting the skeleton inside it. The skeleton no longer becomes an `inline-block`, and the child should have a line height as a number or a length, as a `normal` one comes from the built-in font. The skeleton doesn't set `display` on anything else either: `lines-bg-per-line` is no longer forced to `display: inline`
