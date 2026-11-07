---
"nano-skeleton": minor
---

fix: stop overriding the page's own `shimmer` keyframes

- The built-in keyframes were named `shimmer`, a common name, and replaced any `@keyframes shimmer` of the page, breaking its own animations. They're now named `nano-skeleton-shimmer` and defined outside of `@scope`
- A custom `--nano-skeleton-animation` can reuse them, e.g. `nano-skeleton-shimmer 1s infinite ease-in-out`

BREAKING CHANGES:

- A `--nano-skeleton-animation` that references `shimmer` has to use `nano-skeleton-shimmer` instead
