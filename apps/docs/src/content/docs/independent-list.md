---
title: Independent loading states
label: Independent list
order: 8
demo: list
---

Each provider controls only its own subtree, so items can finish loading
independently. Press "Simulate fetch" to load every item at its own pace.

```html
<ul>
  <li>
    <nano-skeleton-provider loading data-id="1">
      <nano-skeleton>Item one</nano-skeleton>
    </nano-skeleton-provider>
  </li>
  <li>
    <nano-skeleton-provider loading data-id="2">
      <nano-skeleton>Item two</nano-skeleton>
    </nano-skeleton-provider>
  </li>
</ul>

<script type="module">
  for (const provider of document.querySelectorAll("nano-skeleton-provider")) {
    loadItem(provider.dataset.id).then(() => (provider.loading = false));
  }
</script>
```
