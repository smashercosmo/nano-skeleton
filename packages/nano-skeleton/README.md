# nano-skeleton

A tiny, framework-agnostic skeleton loader built on Web Components.

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
  loading state has the exact same size as the loaded one.
- **One switch per region.** A `<nano-skeleton-provider>` controls every
  `<nano-skeleton>` inside it, no matter how deeply nested.
- **Text-aware.** Inline text gets a per-line placeholder that follows line
  wrapping, including truncated text with an ellipsis.
- **Media-aware.** `<img>` and `<video>` keep their box while their content is
  hidden.
- **Accessible by default.** Loading content is made `inert`, so it can't be
  focused or clicked, the provider is marked `aria-busy`, and the shimmer
  respects `prefers-reduced-motion`. Opt out per skeleton with `interactive`.
- **Light and dark mode** out of the box via `light-dark()`.
- **Works everywhere:** plain HTML, any framework, inside Shadow DOM.
- **No dependencies**, styles included. No CSS file to import.

## Installation

```bash
npm install nano-skeleton
# or
pnpm add nano-skeleton
# or
yarn add nano-skeleton
```

## Quick start

Call `init()` once to register the custom elements:

```js
import { init } from "nano-skeleton";

init();
```

`init()` is idempotent, so calling it more than once (for example from several
entry points or during hot reload) is safe.

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

## How it works

There are two elements:

| Element                    | Role                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| `<nano-skeleton-provider>` | Owns the `loading` state for everything inside it.                       |
| `<nano-skeleton>`          | Marks a piece of content that should become a placeholder while loading. |

When a `<nano-skeleton>` connects, it asks the nearest provider above it for the
loading state (using the
[Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md))
and subscribes to changes. Toggling the provider's `loading` attribute updates
all of its skeletons at once.

A `<nano-skeleton>` without a provider simply renders its content as usual.

`<nano-skeleton>` works in one of two modes, picked automatically from its
content (text mode can also be forced with the `text` attribute).

### Text mode

If the skeleton directly contains non-empty text, it renders inline and the text
itself becomes the placeholder. Each line of wrapped text gets its own rounded
bar, so the skeleton has the same shape as the real paragraph.

```html
<h2><nano-skeleton>Lorem ipsum dolor sit amet</nano-skeleton></h2>

<p>
  <nano-skeleton>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  </nano-skeleton>
</p>
```

Tip: put the skeleton _inside_ the heading or paragraph, not around it, so the
placeholder matches the text and not the whole block.

The mode is re-evaluated whenever the content changes, so you can render
placeholder text first and replace it with real data later:

```html
<h2><nano-skeleton>Loading title…</nano-skeleton></h2>
```

#### Text wrapped in elements

Automatic detection only looks at text placed directly inside the skeleton.
When the text is wrapped in an inline element, like a link or `<strong>`, add
`text` to force text mode:

```html
<p>
  <nano-skeleton text>
    <a href="/posts/42">Read the full post</a>
  </nano-skeleton>
</p>
```

The placeholder follows the text lines exactly like plain text does. The
wrapping elements should be inline: a block or `inline-block` child gets a
single bar for its whole box.

Text decorations, such as a link's underline, stay visible while loading, so the
placeholder still reads as a link. To hide them too, wrap the link's content in
a `<span>`:

```html
<nano-skeleton text>
  <a href="/posts/42"><span>Read the full post</span></a>
</nano-skeleton>
```

### Element mode

If the skeleton contains elements, it becomes `display: contents` (it doesn't
affect layout at all), and each **direct child** is painted as a placeholder
block while everything inside it is hidden.

```html
<!-- Image: keeps its box, the picture itself is hidden -->
<nano-skeleton>
  <img src="/cover.png" width="1600" height="1200" alt="" />
</nano-skeleton>

<!-- Video: the poster/frame and controls are hidden -->
<nano-skeleton>
  <video controls width="400" src="/clip.webm"></video>
</nano-skeleton>

<!-- Any box: a button, a badge, a chart container... -->
<nano-skeleton>
  <button type="button">Follow</button>
</nano-skeleton>
```

Because the placeholder is just the element's own box, make sure it has a size
while loading, e.g. `width`/`height` attributes or `aspect-ratio` on images, or
a fixed size on containers.

The content is hidden with `opacity: 0`, so if an element inside has a
`transition` on `opacity` (or `transition: all`), it fades in and out when
`loading` changes instead of switching instantly.

### Interactive skeletons

By default, a loading skeleton is `inert`: its content can't be focused, clicked
or reached by assistive technology. That's usually what you want, but sometimes
the content is usable before the data arrives, e.g. a link whose `href` is
already known, or a button that doesn't depend on the data.

It matters most when content goes back into the loading state (a background
refetch, pagination): an `inert` element that had focus loses it, and keyboard
users are sent back to the top of the page.

Add `interactive` to keep the content focusable and clickable while loading:

```html
<nano-skeleton-provider loading>
  <nano-skeleton interactive>
    <a href="/posts/42" class="card__link">
      <span>Placeholder post title</span>
    </a>
  </nano-skeleton>
</nano-skeleton-provider>
```

The placeholder looks the same, but the content stays in the tab order and
keeps its accessible name. Make sure that name makes sense while loading, as screen reader users
will hear it. The provider sets `aria-busy="true"` while loading to tell them
the region is still updating.

## Examples

### A card

```html
<nano-skeleton-provider loading>
  <article class="card">
    <div class="card__media">
      <nano-skeleton>
        <img src="/preview.png" width="1600" height="1200" alt="" />
      </nano-skeleton>
    </div>
    <div class="card__content">
      <h2 class="card__title">
        <nano-skeleton>Lorem ipsum dolor sit amet</nano-skeleton>
      </h2>
      <p class="card__description">
        <nano-skeleton>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </nano-skeleton>
      </p>
    </div>
  </article>
</nano-skeleton-provider>

<style>
  .card__media img {
    width: 320px;
    height: auto;
    aspect-ratio: 4 / 3;
    display: block;
    border-radius: 0.5rem;
  }
</style>
```

### A list with independent loading states

Each provider controls only its own subtree, so items can finish loading
independently:

```html
<ul>
  <li>
    <nano-skeleton-provider loading data-id="1">
      <nano-skeleton>Item one</nano-skeleton>
    </nano-skeleton-provider>
  </li>
  <li>
    <nano-skeleton-provider loading data-id="2">
      <nano-skeleton>Item two</nano-skeleton>
    </nano-skeleton-provider>
  </li>
</ul>

<script type="module">
  for (const provider of document.querySelectorAll("nano-skeleton-provider")) {
    loadItem(provider.dataset.id).then(() => (provider.loading = false));
  }
</script>
```

### Nested providers

The nearest provider wins. This lets a page load in stages: the outer shell
finishes first, while an inner section keeps its own state.

```html
<nano-skeleton-provider id="page">
  <h1><nano-skeleton>Dashboard</nano-skeleton></h1>

  <nano-skeleton-provider id="stats" loading>
    <!-- Controlled by #stats, not by #page -->
    <p><nano-skeleton>Revenue: $12,345</nano-skeleton></p>
  </nano-skeleton-provider>
</nano-skeleton-provider>
```

### React

React 19 passes properties to custom elements, so `loading` can be bound
directly:

```tsx
import { init } from "nano-skeleton";
import { useQuery } from "@tanstack/react-query";

init();

export function UserCard({ id }: { id: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  return (
    <nano-skeleton-provider loading={isPending}>
      <article>
        <nano-skeleton>
          <img src={data?.avatar} width={64} height={64} alt="" />
        </nano-skeleton>
        <h2>
          <nano-skeleton>{data?.name ?? "Placeholder name"}</nano-skeleton>
        </h2>
        <p>
          <nano-skeleton>
            {data?.bio ??
              "A placeholder bio that is roughly as long as a real one."}
          </nano-skeleton>
        </p>
      </article>
    </nano-skeleton-provider>
  );
}
```

Placeholder text while loading gives the skeleton a realistic size, as it's
never visible to the user.

To get JSX type checking for the custom elements, add a declaration file:

```ts
// nano-skeleton.d.ts
import type {
  Skeleton,
  SkeletonProvider,
  COMPONENT_NAME,
  PROVIDER_NAME,
} from "nano-skeleton";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [COMPONENT_NAME]: DetailedHTMLProps<
        HTMLAttributes<Skeleton>,
        Skeleton
      > & {
        interactive?: boolean;
        text?: boolean;
      };
      [PROVIDER_NAME]: DetailedHTMLProps<
        HTMLAttributes<SkeletonProvider>,
        SkeletonProvider
      > & {
        loading?: boolean;
      };
    }
  }
}
```

## API

### `init()`

Registers `<nano-skeleton-provider>` and `<nano-skeleton>` with
`customElements`. Safe to call multiple times.

### `<nano-skeleton-provider>`

| Attribute / property | Type      | Description                                                           |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `loading`            | `boolean` | When present/`true`, all descendant skeletons render as placeholders. |

While loading, the provider is exposed to assistive technology as
`aria-busy="true"`. An `aria-busy` attribute you set yourself takes precedence.

### `<nano-skeleton>`

| Attribute / property | Type      | Description                                                                                                   |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `interactive`        | `boolean` | Keeps the content focusable and clickable while loading. See [Interactive skeletons](#interactive-skeletons). |
| `text`               | `boolean` | Forces text mode, e.g. for text inside a link. See [Text wrapped in elements](#text-wrapped-in-elements).     |

It also exposes these state attributes, which you can use as styling hooks:

| Attribute      | Set when                                                                              |
| -------------- | ------------------------------------------------------------------------------------- |
| `data-loading` | The nearest provider is loading.                                                      |
| `data-text`    | The skeleton directly contains text, or `text` is set (text mode).                    |
| `inert`        | The nearest provider is loading and `interactive` isn't set. Blocks focus and clicks. |

### Exports

```ts
import {
  init,
  Skeleton, // <nano-skeleton> class
  SkeletonProvider, // <nano-skeleton-provider> class
  COMPONENT_NAME, // "nano-skeleton"
  PROVIDER_NAME, // "nano-skeleton-provider"
} from "nano-skeleton";
```

## Customization

The look is controlled by CSS custom properties:

| Property                             | Default                                |
| ------------------------------------ | -------------------------------------- |
| `--nano-skeleton-background-image`   | A light/dark-aware horizontal gradient |
| `--nano-skeleton-background-size`    | `300%`                                 |
| `--nano-skeleton-animation`          | `shimmer 2s infinite ease-in-out`      |
| `--nano-skeleton-text-border-radius` | `0.375rem` (text mode only)            |

Each `<nano-skeleton>` inherits these from its ancestors, so set them on a
parent element (or on `:root` to change all skeletons at once), not on the
`nano-skeleton` element itself:

```css
/* All skeletons on the page */
:root {
  --nano-skeleton-background-size: 200%;
}

/* Brand-colored shimmer for skeletons inside .card */
.card {
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
.table {
  --nano-skeleton-text-border-radius: 0;
}
```

Shape (border radius, size) in element mode comes from your own element, so a
rounded avatar produces a rounded placeholder:

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

### Dark mode

The default colors use `light-dark()`, so they follow the page's
`color-scheme`. Make sure it's set:

```css
:root {
  color-scheme: light dark;
}
```

### Reduced motion

The animation is disabled automatically for users with
`prefers-reduced-motion: reduce`. They see a static placeholder instead, and a
custom `--nano-skeleton-animation` is skipped for them as well.

## Browser support

nano-skeleton targets modern evergreen browsers. It relies on
[`@scope`](https://developer.mozilla.org/docs/Web/CSS/@scope),
[constructable stylesheets](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/CSSStyleSheet)
and [`light-dark()`](https://developer.mozilla.org/docs/Web/CSS/color_value/light-dark).
Tighter text bars via `text-box-trim` are applied where supported and ignored
elsewhere.

## License

[MIT](https://github.com/smashercosmo/nano-skeleton/blob/main/LICENSE) ©
Vladislav Shkodin
