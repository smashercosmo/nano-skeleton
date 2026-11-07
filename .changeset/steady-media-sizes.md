---
"nano-skeleton": patch
---

fix: keep media sizes steadier while loading

- Media in a tight flex or grid row no longer shrinks while loading. Safari is the exception, as it doesn't use the remembered size there: give such media `flex-shrink: 0`
- Images that haven't been rendered yet no longer get a 300×150 placeholder, which images don't have by default: they have no size until they're rendered. Videos keep the default 300×150, and iframes, embeds and objects get it too, with their contents hidden while loading
- An image inside a `<picture>` or a link becomes the placeholder itself. Before, the placeholder was a thin bar as tall as a line of text
