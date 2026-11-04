import { CSS_CONTENT, COMPONENT_NAME } from "#root/constants.js";

/** CSS_CONTENT constant gets replaced with styles.css content during build. */
const css = `@scope (${COMPONENT_NAME}) {
  ${CSS_CONTENT}
}`;

const cache: { sheet?: CSSStyleSheet } = {};

export async function adoptStyles(root: Document | ShadowRoot) {
  if (!cache.sheet) {
    cache.sheet = new CSSStyleSheet();
    await cache.sheet.replace(css);
  }
  const { sheet } = cache;
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
}
