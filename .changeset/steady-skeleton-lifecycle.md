---
"nano-skeleton": minor
---

fix: make the skeleton lifecycle robust

- A skeleton that was moved twice, or added and removed again, within the same task stayed subscribed to its provider after being removed. Skeletons now connect synchronously, and subscribe only while connected
- Skeletons work after being moved to another document, e.g. an iframe's: the styles and fonts are added to that document. Before, adopting the styles failed with an error
- Providers defined after their skeletons are found: a connecting provider asks skeletons without a provider to request the loading state again, following the Context Protocol
- `inline`, `interactive` and the provider's `loading`, set as properties before the elements are defined, are no longer lost
- Automatically detected inline mode is switched off again when the text is replaced with elements. An `inline` attribute set by the author is kept
- An `inert` attribute set by the author is no longer removed when loading ends

BREAKING CHANGES:

- The `loading` property of `<nano-skeleton>` is read-only. The loading state is set by the provider, and setting it on a skeleton showed a placeholder without making it inert
