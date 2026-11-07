import { highlightAll } from "microlighter";

/**
 * Forced colors mode turns highlighted tokens into blocks of the system
 * highlight color, which makes code unreadable. Plain text in the system colors
 * is easier to read there.
 */
const forcedColors = matchMedia("(forced-colors: active)");

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
    if (forcedColors.matches) {
      CSS.highlights.clear();
    } else {
      void highlightAll();
    }
  });
}

forcedColors.addEventListener("change", () => {
  requestHighlight();
});

export { requestHighlight };
