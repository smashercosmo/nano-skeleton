---
"nano-skeleton": minor
---

feat: a stylesheet for the first paint, `nano-skeleton/styles.css`

- Skeletons that are already in the HTML, e.g. rendered on a server, look the same before the script runs as after it, instead of showing the real content until then. Import or link the stylesheet in the page's `<head>`
- Before the elements are defined, a skeleton is loading if its nearest provider has `loading`, and inline if it contains only text. Text mixed with elements needs an explicit `inline`
- The stylesheet includes the built-in fonts as `data:` URLs: a Content Security Policy that restricts fonts has to allow `font-src data:`
