---
"nano-skeleton": patch
---

chore: ship element types, smaller styles

- The package declares `nano-skeleton` and `nano-skeleton-provider` in `HTMLElementTagNameMap`, so `document.querySelector("nano-skeleton")` and `document.createElement("nano-skeleton")` return the element types
- The styles are minified: about 1.2KB instead of 3KB gzipped
- Declaration source maps are published, so the `.d.ts` files no longer reference missing files
- `sideEffects: false`, keywords and a description in package.json
