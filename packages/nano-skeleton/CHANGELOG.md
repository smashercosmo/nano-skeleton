# Changelog

## 1.0.0

### Major Changes

- feat: nano-skeleton 1.0

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

## 0.10.0

### Minor Changes

- feat: lay out the provider's children as if the provider weren't there

  - `<nano-skeleton-provider>` is `display: contents` by default, as it only holds the loading state. Its children are laid out as children of its parent, e.g. as items of a surrounding flex or grid container. The rule has zero specificity, so any style of your own, such as `display: grid` on the provider, still applies
  - The provider is still exposed to assistive technology as `aria-busy` while loading

  BREAKING CHANGES:

  - A provider without styles of its own was an inline box before. Layouts that relied on it being a single box, e.g. a single flex or grid item wrapping its children, need `display: block` (or another display) on the provider

## 0.9.0

### Minor Changes

- fix: hide more of the content and keep layouts steady while loading

  - `lines-bg-per-block` and `words-bg-per-block` no longer collapse lines with `line-height: normal`, the browser default
  - In Safari, every line of inline text gets its own rounded bar and gradient: `box-decoration-break` needs the `-webkit-` prefix there
  - Text shadows and strokes are hidden, they stayed visible as ghost text
  - Images, SVGs and videos placed directly inside inline text are hidden. Other inline elements, such as a `<kbd>`, keep their borders and backgrounds
  - Generated content (`::before` and `::after`) and list markers of element-mode children are hidden. The element's own box, including its border, shadow and outline, is kept
  - An ellipsis of truncated text is clipped while loading, it was drawn on top of the placeholder
  - The font-based inline styles keep the inherited `letter-spacing` unless `--nano-skeleton-letter-spacing` is set. Before, it was reset to `0`
  - Custom properties can be set on the skeleton element itself, not only on its ancestors

  BREAKING CHANGES:

  - `--nano-skeleton-letter-spacing` replaces the inherited `letter-spacing` in the font-based inline styles, which is used when the property isn't set. Before, the default was `0`

- fix: stop overriding the page's own `shimmer` keyframes

  - The built-in keyframes were named `shimmer`, a common name, and replaced any `@keyframes shimmer` of the page, breaking its own animations. They're now named `nano-skeleton-shimmer` and defined outside of `@scope`
  - A custom `--nano-skeleton-animation` can reuse them, e.g. `nano-skeleton-shimmer 1s infinite ease-in-out`

  BREAKING CHANGES:

  - A `--nano-skeleton-animation` that references `shimmer` has to use `nano-skeleton-shimmer` instead

- fix: make the skeleton lifecycle robust

  - A skeleton that was moved twice, or added and removed again, within the same task stayed subscribed to its provider after being removed. Skeletons now connect synchronously, and subscribe only while connected
  - Skeletons work after being moved to another document, e.g. an iframe's: the styles and fonts are added to that document. Before, adopting the styles failed with an error
  - Providers defined after their skeletons are found: a connecting provider asks skeletons without a provider to request the loading state again, following the Context Protocol
  - `inline`, `interactive` and the provider's `loading`, set as properties before the elements are defined, are no longer lost
  - Automatically detected inline mode is switched off again when the text is replaced with elements. An `inline` attribute set by the author is kept
  - An `inert` attribute set by the author is no longer removed when loading ends

  BREAKING CHANGES:

  - The `loading` property of `<nano-skeleton>` is read-only. The loading state is set by the provider, and setting it on a skeleton showed a placeholder without making it inert

### Patch Changes

- fix: keep media sizes steadier while loading

  - Media in a tight flex or grid row no longer shrinks while loading. Safari is the exception, as it doesn't use the remembered size there: give such media `flex-shrink: 0`
  - Images that haven't been rendered yet no longer get a 300×150 placeholder, which images don't have by default: they have no size until they're rendered. Videos keep the default 300×150, and iframes, embeds and objects get it too, with their contents hidden while loading
  - An image inside a `<picture>` or a link becomes the placeholder itself. Before, the placeholder was a thin bar as tall as a line of text

- chore: ship element types, smaller styles

  - The package declares `nano-skeleton` and `nano-skeleton-provider` in `HTMLElementTagNameMap`, so `document.querySelector("nano-skeleton")` and `document.createElement("nano-skeleton")` return the element types
  - The styles are minified: about 1.2KB instead of 3KB gzipped
  - Declaration source maps are published, so the `.d.ts` files no longer reference missing files
  - `sideEffects: false`, keywords and a description in package.json

## 0.8.1

### Patch Changes

- fix: keep link underlines visible while loading in Chrome

  - Chrome painted underlines with the default `currentcolor` using the transparent text fill of a loading skeleton, so they disappeared. They now keep the text color, as documented. A `text-decoration-color` you set yourself still takes precedence

- fix: hide text placed directly inside element-mode children

  - Text placed directly inside a direct child of a skeleton in element mode, e.g. `<nano-skeleton><button>Follow</button></nano-skeleton>`, stayed visible on top of the placeholder. It's now hidden, the same way as in inline mode
  - Text decorations of element-mode children, such as a link's underline, are hidden too, as the placeholder is the element's box, not its text
  - Text in element-mode children can't be selected while loading, as in inline mode

- fix: hide video frames and controls in Safari, keep the size of media while loading

  - In Safari, a loading `<video>` showed its frame, native controls or "no video" icon on top of the placeholder. Loading images and videos now skip painting their contents (`content-visibility: hidden`) instead of having them replaced with an empty image, which works the same in every browser
  - Images and videos sized only by their file no longer change size while loading: they keep their last rendered size, e.g. on a refetch, and fall back to 300×150 before they've been rendered once. Before, Chrome drew them as a square or a 1×1 box

- fix: trim text bars to the cap height for a bare or auto-detected `inline`

  - Since 0.8.0, only an explicit `inline="lines-bg-per-line"` got bars trimmed to the cap height. Text detected automatically, a bare `inline` attribute or an unknown value got taller bars that nearly touched across lines, although they all mean `lines-bg-per-line`

## 0.8.0

### Minor Changes

- feat: implement different rendering modes for inline skeletons

  - The `inline` attribute now takes a value that picks how text is drawn while loading:
    - `lines-bg-per-line` (the default): one rounded bar per line, each with its own gradient, as before
    - `lines-bg-per-block`: one bar per line, with a single gradient shimmering across all lines in sync
    - `words-bg-per-line`: one pill per word, with a gradient per line
    - `words-bg-per-block`: one pill per word, with a single gradient shimmering across all lines in sync
  - A bare `inline` attribute, an automatically detected inline mode or an unknown value all mean `lines-bg-per-line`
  - All modes except the default draw the text with a tiny built-in font (1-2KB, embedded in the package) whose glyphs are solid bars, so the bars have the same height in every browser, including those without `text-box-trim`. The fonts are only registered once a skeleton that uses them appears, and work inside shadow roots
  - In the `-bg-per-block` modes the skeleton becomes a single `inline-block` box, so it should be the only content of its paragraph or heading
  - New `--nano-skeleton-letter-spacing` custom property to make the bars of the font-based modes longer or shorter for notably wide or narrow fonts
  - New `InlineMode` type export with the values of the `inline` attribute

  BREAKING CHANGES:

  - `--nano-skeleton-text-border-radius` is replaced by `--nano-skeleton-inline-border-radius`, a number from `0` (square) to `1` (fully rounded, the default) instead of a length. It's relative to the bar height, so the bar shape stays the same at any font size, and it also sets the roundness of the pills in the `words-` modes. It doesn't apply to `lines-bg-per-block`, where the bars are square
  - The `inline` property is now `InlineMode | undefined` instead of a boolean

## 0.7.0

### Minor Changes

- feat: support forced colors mode

  - Skeletons no longer disappear in forced colors mode (such as Windows High Contrast). They are redrawn with a neutral shimmering gradient mixed from the `CanvasText` and `Canvas` system colors, so they follow the user's palette
  - Text decorations that stay visible while loading keep their system colors: `LinkText` for links and `CanvasText` for the rest
  - New `--nano-skeleton-forced-colors-background-image` custom property to customize the placeholder in forced colors mode
  - Softer default shimmer, with the gradient interpolated in OKLCH

## 0.6.0

### Minor Changes

- refactor: replace `init()` with static `define()` methods

  BREAKING CHANGES:

  - `init()` is no more, use `SkeletonProvider.define()` and `Skeleton.define()` instead

## 0.5.1

### Patch Changes

- chore: add oxlint

## 0.5.0

### Minor Changes

- refactor: get rid of data attributes

  BREAKING CHANGES:

  - use `inline` attribute instead of `text` attribute
  - `data-text` attribute is no more
  - `data-loading` attribute is no more as well

## 0.4.1

### Patch Changes

- fix: link's skeleton and link's underline have different widths

## 0.4.0

### Minor Changes

- feat: RTL support

## 0.3.0

### Minor Changes

- feat: add `text` attribute to force text mode for text wrapped in elements

## 0.2.0

### Minor Changes

- feat: add `interactive` attribute to keep loading content focusable

- feat: expose `aria-busy` on loading providers

## 0.1.1

### Patch Changes

- chore: automate release workflow

## 0.1.0

Initial release.

### Added

- `<nano-skeleton>` element that turns its content into a placeholder of the
  same shape while loading, with no layout shift.
- `<nano-skeleton-provider>` element with a `loading` attribute/property that
  controls all skeletons inside it.
