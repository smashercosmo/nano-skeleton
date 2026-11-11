---
"nano-skeleton": major
---

feat: nano-skeleton 1.0

The first stable release. The elements, their attributes and the custom properties are now a stable API: breaking changes will only come with a new major version. 1.0 renders server-side markup correctly from the first paint, shapes the text bars with variable fonts, hides less and more predictably while loading, follows the Context Protocol closely, and drops `@scope`, so it runs in older Firefox versions.

**Server-side rendering**

- New stylesheet export, `nano-skeleton/styles.css`. Import or link it in the page's `<head>`, and skeletons that are already in the HTML, e.g. rendered on a server, look the same before the script runs as after it. Without it, the real content shows until the elements are defined. Everything else still works without it
- Before the elements are defined, the stylesheet works from the markup alone: a skeleton is loading if its nearest provider has `loading` (followed across up to two levels of nested providers), and inline if it contains only text. Text mixed with elements, e.g. `Hello <b>world</b>`, needs an explicit `inline`. The content becomes `inert` once the script runs
- The stylesheet includes the built-in fonts as `data:` URLs, so the font-based styles have the right shape from the first paint. A Content Security Policy that restricts fonts has to allow `font-src data:`
- The package can be imported on a server, e.g. in Next.js: `define()` does nothing there. Before, importing it failed with "HTMLElement is not defined"

**Text bars**

- The built-in fonts are variable WOFF2 fonts, and new custom properties set their axes, as unitless numbers in em: `--nano-skeleton-inline-glyph-width` (default `0.5`), `--nano-skeleton-inline-ascent` (`0.71`) and `--nano-skeleton-inline-descent` (`0`)
- `--nano-skeleton-inline-baseline-shift` (default `0`) moves the bars of the font-based styles up or down without changing the layout, to put them on the baseline of the page's font, e.g. `0.09` for Helvetica
- Wide characters, such as Chinese, Japanese and Korean, get bars a full em wide, about as wide as the real characters, so such text wraps much closer to the loaded text
- Spaces in `lines-bg-per-block` are half as wide as the other characters, as in the `words-` styles, so all the font-based styles wrap text the same way
- Bold, italic and small-caps text gets bars of the same size as regular text in the font-based styles
- In the default style, `--nano-skeleton-inline-border-radius: 1` gives fully round ends with any line height. A tight line height left them less than round
- Text inside other elements, such as `<b>` or `<a>`, gets its bars in Firefox too in the `-bg-per-block` styles

**What is hidden while loading**

- Text decorations, such as a link's underline, are hidden. The links directly inside an `interactive` skeleton keep their underline, so a placeholder that can be clicked still looks like a link. To hide it, wrap the link in an element
- Elements inside inline text, such as a `<kbd>`, lose their borders, backgrounds and shadows, like the text itself
- Images and SVGs inside a wrapper without a box (`display: contents`, e.g. a `<slot>` or `<astro-island>`) are hidden in element mode
- An image inside a `<picture>` or a link is hidden like any other child, and the wrapper becomes the placeholder
- `<video>`, `<object>`, `<embed>` and `<iframe>` keep showing their own content. Videos, objects and embeds still get the shimmering background, which shows wherever they're transparent

**Lifecycle and the Context Protocol**

- `loading` and `inert` are put back when something else removes them while loading, e.g. a library that morphs the DOM (idiomorph, morphdom, Turbo, htmx)
- A copy of a loading skeleton, e.g. made with `cloneNode()`, no longer stays `inert` forever, and a copy with automatically detected text still switches back to element mode when its text is replaced
- A skeleton removed from the page is no longer `loading` or `inert`
- Nested providers that are defined after their skeletons work: a provider that connects takes over the skeletons it's closer to from the provider above it. Before, the skeletons of the inner provider followed the outer one
- Subscribers get the same `unsubscribe` function with every update, as the protocol asks. A `@lit/context` consumer stopped getting updates after the first one
- Requests carry `contextTarget`, the element that asked, as in the current version of the protocol
- A consumer of another library that leaves a provider without unsubscribing is dropped, instead of being updated for as long as the provider lives
- Changing `loading=""` to `loading="true"` no longer updates the skeletons

**Forced colors**

- Borders and outlines of loading skeletons use system colors, as text decorations already did: link colors for links, `ButtonBorder` for buttons and `CanvasText` for the rest. Box shadows are removed, as forced colors mode does. They kept the page's own colors, which could clash with the user's palette or disappear in it
- The focus outline of a link nested inside an interactive skeleton, e.g. `<span><a>…</a></span>`, gets the system link color too. Only links directly inside the skeleton did

**Browser support**

- The styles no longer use `@scope`, so Firefox 127+ is supported, down from 146+

BREAKING CHANGES:

- The `-bg-per-block` styles draw the skeleton's child, as element mode does: wrap the paragraph or heading in the skeleton, `<nano-skeleton inline="words-bg-per-block"><p>…</p></nano-skeleton>`, instead of putting the skeleton inside it. The skeleton no longer becomes an `inline-block`. The child needs a line height that is a number or a length, e.g. `line-height: 1.5` on the `body`: a `normal` one comes from the built-in font while loading, so the paragraph would jump when it loads
- The skeleton no longer sets `display` on anything else either: `lines-bg-per-line` is no longer forced to `display: inline`
- `--nano-skeleton-letter-spacing` is removed. Set `--nano-skeleton-inline-glyph-width` to make the bars wider or narrower. The bars keep the inherited `letter-spacing`
- Text decorations are hidden while loading, except on links directly inside an `interactive` skeleton. Styles that relied on underlines staying visible elsewhere need the link moved directly into an `interactive` skeleton
- Elements inside inline text no longer keep their borders, backgrounds and shadows while loading
- An image inside a `<picture>` or a link is hidden like any other child, and the wrapper becomes the placeholder: make the wrapper a block box around the image, e.g. `display: block`, `display: inline-block` or a flex or grid item. By default it's an inline box, only as tall as a line of text
- `<video>`, `<object>`, `<embed>` and `<iframe>` keep showing their own content while loading. To hide one completely, wrap it in an element, e.g. a `<div>`, and put the skeleton around that
- The ellipsis of truncated text is no longer clipped while loading
- Automatically detected inline mode sets `inline="auto"`, not `inline=""`. `nano-skeleton[inline]` selectors still match, `nano-skeleton[inline=""]` ones don't
- Removing `inert` from a loading skeleton no longer makes its content usable, as the attribute is put back. Set `interactive` instead
- Without `@scope`, the styles have lower specificity: a selector like `nano-skeleton[loading] > *` instead of `:scope[loading] > *`. The rules that hide content are `!important` as before, but a style of your own that lost to a non-important rule of the library may now win
