import css from "./styles.css?inline";

const sheets = new WeakMap<Document, CSSStyleSheet>();

function isDocumentOrShadowRoot(
  node: Node | Document | ShadowRoot,
): node is Document | ShadowRoot {
  return "adoptedStyleSheets" in node;
}

/**
 * Adopts the stylesheet into the document or shadow root that contains the
 * element. A constructed stylesheet can only be adopted within the document it
 * was created for, so each document gets its own. Synchronous, so the styles
 * apply as soon as an element connects.
 */
function adoptStyles(element: Element) {
  const root = element.getRootNode();
  const document = element.ownerDocument;
  const window = document.defaultView;
  if (!isDocumentOrShadowRoot(root) || !window) {
    return;
  }

  let sheet = sheets.get(document);
  if (!sheet) {
    sheet = new window.CSSStyleSheet();
    // oxlint-disable-next-line node/no-sync -- a DOM API, synchronous on purpose: an async connectedCallback races with disconnects
    sheet.replaceSync(css);
    sheets.set(document, sheet);
  }

  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets.push(sheet);
  }
}

export { adoptStyles };
