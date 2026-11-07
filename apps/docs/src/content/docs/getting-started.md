---
title: Getting started
order: 1
---

Instead of maintaining a separate "loading" version of every component, wrap the
pieces of your real UI in `<nano-skeleton>` and flip a single `loading` switch.
The layout stays exactly where it is, nothing jumps, and the content is swapped
for a shimmering placeholder of the same shape.

- **Zero layout shift.** The skeleton is drawn over your real markup.
- **One switch per region.** A `<nano-skeleton-provider>` controls every
  `<nano-skeleton>` inside it, no matter how deeply nested.
- **Text-aware.** Inline text gets a per-line placeholder that follows wrapping.
- **Accessible by default.** Loading content is `inert`, the provider is
  `aria-busy`, and the shimmer respects reduced motion and forced colors.
- **Works everywhere:** plain HTML, any framework, inside Shadow DOM.
- **No dependencies**, styles included. No CSS file to import.

### Installation

```bash
npm install nano-skeleton
```

### Quick start

Register the custom elements once:

```js
import { Skeleton, SkeletonProvider } from "nano-skeleton";

SkeletonProvider.define();
Skeleton.define();
```

Each `define()` does nothing if the element is already registered, so calling
it more than once (for example from several entry points or during hot reload)
is safe.

Then wrap your content and toggle `loading` on the provider:

```html
<nano-skeleton-provider id="profile" loading>
  <nano-skeleton>
    <img src="/avatar.png" width="64" height="64" alt="" />
  </nano-skeleton>
  <strong><nano-skeleton>Jane Doe</nano-skeleton></strong>
</nano-skeleton-provider>

<script type="module">
  const profile = document.getElementById("profile");
  const user = await fetch("/api/me").then((r) => r.json());
  // ...render user data...
  profile.loading = false; // or profile.removeAttribute("loading")
</script>
```

### How it works

When a `<nano-skeleton>` connects, it asks the nearest provider above it for the
loading state (using the
[Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md))
and subscribes to changes. A `<nano-skeleton>` without a provider simply
renders its content as usual.

Each skeleton works in one of two modes, picked automatically from its content:
[inline mode](#inline-mode) for text and [element mode](#element-mode) for
everything else.
