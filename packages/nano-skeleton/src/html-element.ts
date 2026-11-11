/** True in browsers, false where there is no DOM, e.g. in Node */
function hasDom() {
  return "HTMLElement" in globalThis && "customElements" in globalThis;
}

/**
 * The class the elements extend: the browser's `HTMLElement`, or an empty
 * stand-in where there is no DOM, e.g. in Node during server-side rendering.
 *
 * `class X extends HTMLElement` runs when the module is imported, so without
 * the stand-in, just importing the package on a server would throw "HTMLElement
 * is not defined". The stand-in is never instantiated: `define()` does nothing
 * without a DOM.
 */
const HTMLElementBase: typeof HTMLElement = hasDom()
  ? HTMLElement
  : // oxlint-disable-next-line typescript/no-extraneous-class, typescript/no-unsafe-type-assertion -- an empty stand-in, see above
    (class {} as typeof HTMLElement);

export { HTMLElementBase, hasDom };
