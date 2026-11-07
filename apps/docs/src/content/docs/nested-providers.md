---
title: Nested providers
order: 9
demo: nested
---

The nearest provider wins. This lets a page load in stages: the outer shell
finishes first, while an inner section keeps its own state.

```html
<nano-skeleton-provider id="page">
  <h3><nano-skeleton>Dashboard</nano-skeleton></h3>

  <nano-skeleton-provider id="stats" loading>
    <!-- Controlled by #stats, not by #page -->
    <p><nano-skeleton>Revenue: $12,345</nano-skeleton></p>
  </nano-skeleton-provider>
</nano-skeleton-provider>
```
