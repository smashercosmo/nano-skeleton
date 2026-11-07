---
title: Inline styles
order: 4
demo: inline-styles
---

The value of `inline` picks how the text is drawn while loading. It combines
two choices: one bar per line or one pill per word, and one gradient per line
or one gradient for the whole block.

<div class="table-wrap">

| `inline` value                    | Looks like                                                             |
| --------------------------------- | ---------------------------------------------------------------------- |
| `lines-bg-per-line` (the default) | One rounded bar per line, each with its own gradient.                  |
| `lines-bg-per-block`              | One bar per line, with a single gradient shimmering across all lines.  |
| `words-bg-per-line`               | One pill per word, with a gradient per line.                           |
| `words-bg-per-block`              | One pill per word, with a single gradient shimmering across all lines. |

</div>

A bare `inline`, an automatically detected inline mode, or an unknown value all
mean `lines-bg-per-line`.

```html
<p>
  <nano-skeleton inline="words-bg-per-block">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </nano-skeleton>
</p>
```

The default style draws the bars as backgrounds of the text lines. All other
styles draw the text with a built-in font in which every character is a solid
bar from the baseline to the cap height (spaces too in `lines-bg-per-block`,
while in the `words-` styles they're gaps), and clip the background to it. The
bars are the same height in every browser, including those without
`text-box-trim`. The fonts are about 1KB and 2KB, embedded in the package, and
only registered once a skeleton that uses them appears.

The bars use an average glyph width, so text can wrap a little differently
than the real text: the placeholder approximates its shape rather than matching
it exactly, and a paragraph can end up with one line more or less. The height
of each line doesn't change. The text keeps its `letter-spacing`. To make the
bars longer or shorter for a notably wide or narrow font, set
`--nano-skeleton-letter-spacing`, which replaces it while loading (values from
about `-0.1em` to `0.2em` keep the bars solid).

Characters of scripts without spaces between words, such as Chinese or
Japanese, are about twice as wide as the bars, and a whole line becomes one
bar in the `words-` styles. For such text, prefer the default style, which
follows the real text exactly.

### Things to keep in mind

- `--nano-skeleton-inline-border-radius` sets how round the bar ends are, from
  `0` (square) to `1` (fully rounded, the default). It's relative to the bar
  height, so the shape stays the same at any font size. In the `words-` styles
  the pill ends come from the font, which has a matching variation axis.
- In `lines-bg-per-block` the ends of each line can't be rounded, so
  `--nano-skeleton-inline-border-radius` doesn't apply there and the bars are
  square.
- In the `-bg-per-block` styles the skeleton becomes a single `inline-block`
  box around all of its lines, which is what lets one gradient span them. The
  skeleton should then be the only content of its block, e.g. the whole text of
  a paragraph or heading. Text before it on the same line would push the whole
  skeleton onto the next line.
