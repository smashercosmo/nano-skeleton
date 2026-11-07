---
title: Reduced motion
order: 13
---

The animation is disabled automatically for users with
`prefers-reduced-motion: reduce`. They see a static placeholder instead, and a
custom `--nano-skeleton-animation` is skipped for them as well.

A page can't switch this preference, but you can emulate it to see it on this
site:

- **Chrome / Edge:** DevTools → `⋮` → More tools → Rendering → "Emulate CSS
  media feature prefers-reduced-motion" → `reduce`.
- **Firefox:** `about:config` → set `ui.prefersReducedMotion` to `1`.
- **Safari / macOS:** System Settings → Accessibility → Display → Reduce motion.
