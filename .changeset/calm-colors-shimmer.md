---
"nano-skeleton": minor
---

feat: support forced colors mode

- Skeletons no longer disappear in forced colors mode (such as Windows High Contrast). They are redrawn with a neutral shimmering gradient mixed from the `CanvasText` and `Canvas` system colors, so they follow the user's palette
- Text decorations that stay visible while loading keep their system colors: `LinkText` for links and `CanvasText` for the rest
- New `--nano-skeleton-forced-colors-background-image` custom property to customize the placeholder in forced colors mode
- Softer default shimmer, with the gradient interpolated in OKLCH
