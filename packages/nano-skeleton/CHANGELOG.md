# Changelog

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
