---
"nano-skeleton": patch
---

fix: keep link underlines visible while loading in Chrome

- Chrome painted underlines with the default `currentcolor` using the transparent text fill of a loading skeleton, so they disappeared. They now keep the text color, as documented. A `text-decoration-color` you set yourself still takes precedence
