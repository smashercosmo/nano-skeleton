---
"nano-skeleton": patch
---

fix: hide video frames and controls in Safari, keep the size of media while loading

- In Safari, a loading `<video>` showed its frame, native controls or "no video" icon on top of the placeholder. Loading images and videos now skip painting their contents (`content-visibility: hidden`) instead of having them replaced with an empty image, which works the same in every browser
- Images and videos sized only by their file no longer change size while loading: they keep their last rendered size, e.g. on a refetch, and fall back to 300×150 before they've been rendered once. Before, Chrome drew them as a square or a 1×1 box
