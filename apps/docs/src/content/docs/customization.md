---
title: Customization
order: 10
demo: customization
---

The look is controlled by CSS custom properties:

<div class="table-wrap">

| Property                                         | Default                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `--nano-skeleton-background-image`               | A light/dark-aware horizontal gradient                                           |
| `--nano-skeleton-background-size`                | `300%`                                                                           |
| `--nano-skeleton-animation`                      | `shimmer 2s infinite ease-in-out`                                                |
| `--nano-skeleton-inline-border-radius`           | `1`, roundness of the text bar ends, from `0` (square) to `1` (fully rounded)    |
| `--nano-skeleton-letter-spacing`                 | `0`, extra space per character in the font-based [inline styles](#inline-styles) |
| `--nano-skeleton-forced-colors-background-image` | A gray gradient mixed from system colors                                         |

</div>

Each `<nano-skeleton>` inherits these from its ancestors, so set them on a
parent element (or on `:root` to change all skeletons at once), not on the
`nano-skeleton` element itself:

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
