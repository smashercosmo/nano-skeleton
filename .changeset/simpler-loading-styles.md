---
"nano-skeleton": minor
---

feat: hide less, more predictably, while loading

- The package can be imported during server-side rendering, e.g. in Next.js. `define()` does nothing on a server. Before, importing it there failed with "HTMLElement is not defined"
- A copy of a loading skeleton, e.g. made with `cloneNode()`, no longer stays `inert` forever
- A copy of a skeleton with automatically detected text still switches back to element mode when its text is replaced. Automatic detection now sets `inline="auto"` instead of a bare `inline`, so a copy can tell the attribute wasn't set by you
- `loading` and `inert` are put back when something else removes them while loading, e.g. a library that morphs the DOM (idiomorph, morphdom, Turbo, htmx)
- Images and SVGs inside a wrapper without a box (`display: contents`, e.g. a `<slot>`) are hidden in element mode
- A consumer of another library that leaves a provider without unsubscribing is dropped, instead of being kept and updated for as long as the provider lives
- A skeleton removed from the page is no longer `loading` or `inert`
- Bold, italic and small-caps text gets bars of the same size as regular text in the font-based inline styles

BREAKING CHANGES:

- `<video>`, `<object>`, `<embed>` and `<iframe>` keep showing their own content while loading. Videos, objects and embeds still get the shimmering background, which shows wherever they're transparent. To hide one completely, wrap it in an element and put the skeleton around that
- Text decorations, such as a link's underline, are hidden while loading. Only the links directly inside an `interactive` skeleton keep their underline
- Elements inside inline text, such as a `<kbd>`, no longer keep their borders, backgrounds and shadows while loading
- An image inside a `<picture>` or a link is hidden like any other child, and the wrapper becomes the placeholder: make it a block box around the image
- The ellipsis of truncated text is no longer clipped while loading
- An automatically detected inline mode sets `inline="auto"`, not `inline=""`. `nano-skeleton[inline]` selectors still match, `nano-skeleton[inline=""]` ones don't
- Removing `inert` from a loading skeleton no longer makes its content usable, as the attribute is put back. Set `interactive` instead
