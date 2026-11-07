# Changelog

## 0.8.1

### Patch Changes

- fix: keep link underlines visible while loading in Chrome

  - Chrome painted underlines with the default `currentcolor` using the transparent text fill of a loading skeleton, so they disappeared. They now keep the text color, as documented. A `text-decoration-color` you set yourself still takes precedence

- fix: hide text placed directly inside element-mode children

  - Text placed directly inside a direct child of a skeleton in element mode, e.g. `<nano-skeleton><button>Follow</button></nano-skeleton>`, stayed visible on top of the placeholder. It's now hidden, the same way as in inline mode
  - Text decorations of element-mode children, such as a link's underline, are hidden too, as the placeholder is the element's box, not its text
  - Text in element-mode children can't be selected while loading, as in inline mode

- fix: hide video frames and controls in Safari, keep the size of media while loading

  - In Safari, a loading `<video>` showed its frame, native controls or "no video" icon on top of the placeholder. Loading images and videos now skip painting their contents (`content-visibility: hidden`) instead of having them replaced with an empty image, which works the same in every browser
  - Images and videos sized only by their file no longer change size while loading: they keep their last rendered size, e.g. on a refetch, and fall back to 300×150 before they've been rendered once. Before, Chrome drew them as a square or a 1×1 box

- fix: trim text bars to the cap height for a bare or auto-detected `inline`

  - Since 0.8.0, only an explicit `inline="lines-bg-per-line"` got bars trimmed to the cap height. Text detected automatically, a bare `inline` attribute or an unknown value got taller bars that nearly touched across lines, although they all mean `lines-bg-per-line`

## 0.8.0

### Minor Changes

- feat: implement different rendering modes for inline skeletons

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

## 0.7.0

### Minor Changes

- feat: support forced colors mode

  - Skeletons no longer disappear in forced colors mode (such as Windows High Contrast). They are redrawn with a neutral shimmering gradient mixed from the `CanvasText` and `Canvas` system colors, so they follow the user's palette
  - Text decorations that stay visible while loading keep their system colors: `LinkText` for links and `CanvasText` for the rest
  - New `--nano-skeleton-forced-colors-background-image` custom property to customize the placeholder in forced colors mode
  - Softer default shimmer, with the gradient interpolated in OKLCH

## 0.6.0

### Minor Changes

- refactor: replace `init()` with static `define()` methods

  BREAKING CHANGES:

  - `init()` is no more, use `SkeletonProvider.define()` and `Skeleton.define()` instead

## 0.5.1

### Patch Changes

- chore: add oxlint

## 0.5.0

### Minor Changes

- refactor: get rid of data attributes

  BREAKING CHANGES:

  - use `inline` attribute instead of `text` attribute
  - `data-text` attribute is no more
  - `data-loading` attribute is no more as well

## 0.4.1

### Patch Changes

- fix: link's skeleton and link's underline have different widths

## 0.4.0

### Minor Changes

- feat: RTL support

## 0.3.0

### Minor Changes

- feat: add `text` attribute to force text mode for text wrapped in elements

## 0.2.0

### Minor Changes

- feat: add `interactive` attribute to keep loading content focusable

- feat: expose `aria-busy` on loading providers

## 0.1.1

### Patch Changes

- chore: automate release workflow

## 0.1.0

Initial release.

### Added

- `<nano-skeleton>` element that turns its content into a placeholder of the
  same shape while loading, with no layout shift.
- `<nano-skeleton-provider>` element with a `loading` attribute/property that
  controls all skeletons inside it.
