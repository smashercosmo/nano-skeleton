---
title: Right-to-left
order: 12
demo: rtl
---

The shimmer follows the reading direction: in right-to-left content, set with
`dir="rtl"` on the skeleton or any ancestor, it moves from right to left. A
custom `--nano-skeleton-animation` with its own keyframes isn't affected.

```html
<p dir="rtl">
  <nano-skeleton>نص تجريبي يلتف على عدة أسطر</nano-skeleton>
</p>
```
