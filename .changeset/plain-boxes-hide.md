---
"nano-skeleton": patch
---

fix: hide text placed directly inside element-mode children

- Text placed directly inside a direct child of a skeleton in element mode, e.g. `<nano-skeleton><button>Follow</button></nano-skeleton>`, stayed visible on top of the placeholder. It's now hidden, the same way as in inline mode
- Text decorations of element-mode children, such as a link's underline, are hidden too, as the placeholder is the element's box, not its text
- Text in element-mode children can't be selected while loading, as in inline mode
