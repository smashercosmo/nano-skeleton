---
title: Customization
order: 10
demo: customization
---

The look is controlled by CSS custom properties:

<div class="table-wrap">

| Property                                         | Default                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `--nano-skeleton-background-image`               | A light/dark-aware horizontal gradient                                                    |
| `--nano-skeleton-background-size`                | `300%`                                                                                    |
| `--nano-skeleton-animation`                      | `nano-skeleton-shimmer 2s infinite ease-in-out`                                           |
| `--nano-skeleton-inline-border-radius`           | `1`, how round the text bar ends are: from `0` (square) to `1` (fully round)              |
| `--nano-skeleton-inline-glyph-width`             | `0.5`, the width of a character of inline text, in em. See [Inline modes](#inline-styles) |
| `--nano-skeleton-inline-ascent`                  | `0.71`, how far the text bars reach above the baseline, in em                             |
| `--nano-skeleton-inline-descent`                 | `0`, how far the text bars reach below the baseline, in em                                |
| `--nano-skeleton-inline-baseline-shift`          | `0`, moves the text bars up onto the page font's baseline, in em                          |
| `--nano-skeleton-forced-colors-background-image` | A gray gradient mixed from system colors                                                  |

</div>

Set them on any element: a skeleton inherits them from its ancestors, so a
parent element (or `:root`, to change all skeletons at once) works as well as
the `nano-skeleton` element itself.

The default animation uses the `nano-skeleton-shimmer` keyframes, so a custom
`--nano-skeleton-animation` can reuse them with a different duration or easing.

```css
/* All skeletons on the page */
:root {
  --nano-skeleton-background-size: 200%;
}

/* Brand-colored shimmer for skeletons inside .brand */
.brand {
  --nano-skeleton-background-image: linear-gradient(
    90deg,
    light-dark(#e0e7ff, #1e1b4b) 33%,
    light-dark(#eef2ff, #312e81),
    light-dark(#e0e7ff, #1e1b4b) 66%
  );
}

/* Pulse instead of shimmer */
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
.pulse {
  --nano-skeleton-animation: pulse 1.5s infinite ease-in-out;
}

/* Square text bars */
.square {
  --nano-skeleton-inline-border-radius: 0;
}
```
