import { CSS_CONTENT, COMPONENT_NAME } from "#root/constants.js";

/** It gets replaced with styles.css content during build. */
const css = `@scope (${COMPONENT_NAME}) {
  ${CSS_CONTENT}
}`;

let sheet: CSSStyleSheet | undefined;

export function adoptStyles(root: Document | ShadowRoot) {
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  }
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
}
