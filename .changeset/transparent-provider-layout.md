---
"nano-skeleton": minor
---

feat: lay out the provider's children as if the provider weren't there

- `<nano-skeleton-provider>` is `display: contents` by default, as it only holds the loading state. Its children are laid out as children of its parent, e.g. as items of a surrounding flex or grid container. The rule has zero specificity, so any style of your own, such as `display: grid` on the provider, still applies
- The provider is still exposed to assistive technology as `aria-busy` while loading

BREAKING CHANGES:

- A provider without styles of its own was an inline box before. Layouts that relied on it being a single box, e.g. a single flex or grid item wrapping its children, need `display: block` (or another display) on the provider
