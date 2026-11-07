import css from "./styles.css?inline";

const sheets = new WeakMap<Document, CSSStyleSheet>();

function isDocument(node: Node): node is Document {
  return node.nodeType === Node.DOCUMENT_NODE;
}

/**
 * Adopts the stylesheet into a document or a shadow root. A constructed
 * stylesheet can only be adopted within the document it was created for, so
 * each document gets its own. Synchronous, so the styles apply as soon as a
 * skeleton connects.
 */
function adoptStyles(root: Document | ShadowRoot) {
  const document = isDocument(root) ? root : root.ownerDocument;
  const window = document.defaultView;
  if (!window) {
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
