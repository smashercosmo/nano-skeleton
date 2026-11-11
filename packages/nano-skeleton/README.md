# nano-skeleton

A tiny, framework-agnostic skeleton loader built on Web Components.

**[Documentation and live demos](https://smashercosmo.github.io/nano-skeleton/)**

Instead of maintaining a separate "loading" version of every component, wrap the
pieces of your real UI in `<nano-skeleton>` and flip a single `loading` switch.
The layout stays exactly where it is, nothing jumps, and the content is swapped
for a shimmering placeholder of the same shape.

```html
<nano-skeleton-provider loading>
  <article class="card">
    <nano-skeleton>
      <img src="/cover.png" width="320" height="240" alt="" />
    </nano-skeleton>
    <h2><nano-skeleton>Card title</nano-skeleton></h2>
    <p>
      <nano-skeleton>
        Some description text that wraps over several lines.
      </nano-skeleton>
    </p>
  </article>
</nano-skeleton-provider>
```

## Features

- **Zero layout shift.** The skeleton is drawn over your real markup, so the
  loading state has the exact same size as the loaded one. (Inline text is
  drawn with an average glyph width, so it can wrap slightly differently.)
- **One switch per region.** A `<nano-skeleton-provider>` controls every
  `<nano-skeleton>` inside it, no matter how deeply nested.
- **Text-aware.** Inline text gets a per-line placeholder that follows line
  wrapping.
- **Media-aware.** An `<img>` keeps its box while its picture is hidden.
- **Accessible by default.** Loading content is made `inert`, so it can't be
  focused or clicked, the provider is marked `aria-busy`, and the shimmer
  respects `prefers-reduced-motion`. Opt out per skeleton with `interactive`.
- **Light and dark mode** out of the box via `light-dark()`.
- **Works everywhere:** plain HTML, any framework, inside Shadow DOM. Safe to
  import during server-side rendering.
- **No dependencies**, styles included.

## Installation

```bash
npm install nano-skeleton
# or
pnpm add nano-skeleton
# or
yarn add nano-skeleton
```

## Quick start

Register the custom elements:

```js
import { Skeleton, SkeletonProvider } from "nano-skeleton";

SkeletonProvider.define();
Skeleton.define();
```

Each `define()` does nothing if the element is already registered, so calling
it more than once (for example from several entry points or during hot reload)
is safe.

Add the stylesheet to the page, so skeletons that are already in the HTML,
e.g. rendered on a server, look right from the first paint instead of once the
script has run:

```js
import "nano-skeleton/styles.css";
```

Then use the elements in your markup:

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

## API

### `SkeletonProvider.define()`

Registers `<nano-skeleton-provider>` with `customElements`. Does nothing if the
element is already registered, so it's safe to call multiple times.

### `Skeleton.define()`

Registers `<nano-skeleton>` with `customElements`. Does nothing if the element
is already registered, so it's safe to call multiple times.

### `<nano-skeleton-provider>`

| Attribute / property | Type      | Description                                                           |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `loading`            | `boolean` | When present/`true`, all descendant skeletons render as placeholders. |

While loading, the provider is exposed to assistive technology as
`aria-busy="true"`. An `aria-busy` attribute you set yourself takes precedence.

### `<nano-skeleton>`

| Attribute / property | Type         | Description                                                                                                                                                                                                                                                    |
| -------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive`        | `boolean`    | Keeps the content focusable and clickable while loading. See [Interactive skeletons](https://smashercosmo.github.io/nano-skeleton/#interactive).                                                                                                               |
| `inline`             | `InlineMode` | Forces inline mode, e.g. for text inside a link, and picks how text is drawn. See [Text wrapped in elements](https://smashercosmo.github.io/nano-skeleton/#text-in-elements) and [Inline styles](https://smashercosmo.github.io/nano-skeleton/#inline-styles). |

The component also manages these attributes itself, which you can use as
styling hooks:

| Attribute | Set when                                                                                 |
| --------- | ---------------------------------------------------------------------------------------- |
| `loading` | The nearest provider is loading.                                                         |
| `inline`  | The skeleton directly contains text (`inline="auto"`), or `inline` is set (inline mode). |
| `inert`   | The nearest provider is loading and `interactive` isn't set. Blocks focus and clicks.    |

### Exports

```ts
import type { InlineMode } from "nano-skeleton"; // values of the `inline` attribute

import {
  Skeleton, // <nano-skeleton> class
  SkeletonProvider, // <nano-skeleton-provider> class
  COMPONENT_NAME, // "nano-skeleton"
  PROVIDER_NAME, // "nano-skeleton-provider"
} from "nano-skeleton";
```

## Documentation

Inline and element modes, inline styles, interactive skeletons, nested providers,
customization, dark mode, RTL, reduced motion, forced colors, React usage and
browser support are covered, with live demos, on the
**[documentation site →](https://smashercosmo.github.io/nano-skeleton/)**

## License

[MIT](https://github.com/smashercosmo/nano-skeleton/blob/main/LICENSE) ©
Vladislav Shkodin
