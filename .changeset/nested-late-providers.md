---
"nano-skeleton": patch
---

fix: follow the Context Protocol more closely

- Nested providers that are defined after their skeletons work: skeletons of the inner provider followed the outer one. A provider that connects now takes over the skeletons it's closer to from the provider above it
- Subscribers get the same `unsubscribe` function with every update, as the protocol asks. A `@lit/context` consumer stopped getting updates after the first one
- Requests carry `contextTarget`, the element that asked, as in the current version of the protocol
- Changing `loading=""` to `loading="true"` no longer updates the skeletons
