# Changelog

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
