import { highlightAll } from "microlighter";

let scheduled = false;

/**
 * Re-highlights every code block on the page. microlighter clears all
 * highlights on each run, so the whole document is always highlighted, not just
 * the block that changed. Batched to once per frame, as sliders fire many input
 * events.
 */
function requestHighlight() {
  if (scheduled) {
    return;
  }
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    void highlightAll();
  });
}

export { requestHighlight };
