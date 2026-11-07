---
title: API
order: 16
---

### `SkeletonProvider.define()`

Registers `<nano-skeleton-provider>` with `customElements`. Does nothing if the
element is already registered.

### `Skeleton.define()`

Registers `<nano-skeleton>` with `customElements`. Does nothing if the element
is already registered.

The elements can be defined in any order and at any time: skeletons find a
provider that is defined after them, and properties set on the elements before
they're defined are applied once they are.

### `<nano-skeleton-provider>`

<div class="table-wrap">

| Attribute / property | Type      | Description                                                           |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `loading`            | `boolean` | When present/`true`, all descendant skeletons render as placeholders. |

</div>

While loading, the provider is exposed to assistive technology as
`aria-busy="true"`. An `aria-busy` attribute you set yourself takes precedence.

### `<nano-skeleton>`

<div class="table-wrap">

| Attribute / property | Type         | Description                                                                                                        |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `interactive`        | `boolean`    | Keeps the content focusable and clickable while loading.                                                           |
| `inline`             | `InlineMode` | Forces inline mode, e.g. for text inside a link, and picks how text is drawn. See [Inline styles](#inline-styles). |
| `loading`            | `boolean`    | Read-only. Whether the nearest provider is loading. Set `loading` on the provider instead.                         |

</div>

The component also manages these attributes itself, which you can use as
styling hooks:

<div class="table-wrap">

| Attribute | Set when                                                                              |
| --------- | ------------------------------------------------------------------------------------- |
| `loading` | The nearest provider is loading.                                                      |
| `inline`  | The skeleton directly contains text, or `inline` is set (inline mode).                |
| `inert`   | The nearest provider is loading and `interactive` isn't set. Blocks focus and clicks. |

</div>

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
