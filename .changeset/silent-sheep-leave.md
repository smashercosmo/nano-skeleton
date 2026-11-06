---
"nano-skeleton": minor
---

feat: implement different rendering modes for inline skeletons

- The `inline` attribute now takes a value that picks how text is drawn while loading:
  - `lines-bg-per-line` (the default): one rounded bar per line, each with its own gradient, as before
  - `lines-bg-per-block`: one bar per line, with a single gradient shimmering across all lines in sync
  - `words-bg-per-line`: one pill per word, with a gradient per line
  - `words-bg-per-block`: one pill per word, with a single gradient shimmering across all lines in sync
- A bare `inline` attribute, an automatically detected inline mode or an unknown value all mean `lines-bg-per-line`
- All modes except the default draw the text with a tiny built-in font (1-2KB, embedded in the package) whose glyphs are solid bars, so the bars have the same height in every browser, including those without `text-box-trim`. The fonts are only registered once a skeleton that uses them appears, and work inside shadow roots
- In the `-bg-per-block` modes the skeleton becomes a single `inline-block` box, so it should be the only content of its paragraph or heading
- New `--nano-skeleton-letter-spacing` custom property to make the bars of the font-based modes longer or shorter for notably wide or narrow fonts
- New `InlineMode` type export with the values of the `inline` attribute

BREAKING CHANGES:

- `--nano-skeleton-text-border-radius` is replaced by `--nano-skeleton-inline-border-radius`, a number from `0` (square) to `1` (fully rounded, the default) instead of a length. It's relative to the bar height, so the bar shape stays the same at any font size, and it also sets the roundness of the pills in the `words-` modes. It doesn't apply to `lines-bg-per-block`, where the bars are square
- The `inline` property is now `InlineMode | undefined` instead of a boolean
