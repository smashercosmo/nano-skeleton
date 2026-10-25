import { SKELETON_CONTEXT } from "#root/constants.js";
import { ContextRequestEvent } from "#root/ContextRequestEvent.js";
import { adoptStyles } from "#root/styles.js";
import { type Unsubscribe } from "#root/types.js";

function isDocumentOrShadowRoot(
  node: Node | Document | ShadowRoot,
): node is Document | ShadowRoot {
  return "adoptedStyleSheets" in node;
}

export class Skeleton extends HTMLElement {
  static observedAttributes = ["interactive", "text"];

  #loading = false;
  #unsubscribe?: Unsubscribe | undefined;
  #observer = new MutationObserver(() => this.#update());

  /** Keeps the content focusable and clickable while loading */
  get interactive() {
    return this.hasAttribute("interactive");
  }

  set interactive(value: boolean) {
    this.toggleAttribute("interactive", Boolean(value));
  }

  /** Forces text mode, even when the text is wrapped in elements */
  get text() {
    return this.hasAttribute("text");
  }

  set text(value: boolean) {
    this.toggleAttribute("text", Boolean(value));
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;
    if (name === "text") this.#update();
    else this.#render(this.#loading);
  }

  connectedCallback() {
    const root = this.getRootNode();

    if (isDocumentOrShadowRoot(root)) {
      adoptStyles(root);
    }

    this.#update();
    this.#render(false);

    this.dispatchEvent(
      new ContextRequestEvent(
        SKELETON_CONTEXT,
        (loading, unsubscribe) => {
          if (unsubscribe) this.#unsubscribe = unsubscribe;
          this.#render(loading);
        },
        true,
      ),
    );

    this.#observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.#observer.disconnect();
  }

  #update() {
    let isText = this.text;
    for (const node of this.childNodes) {
      if (isText) break;
      if (node instanceof Text && node.data.trim() !== "") {
        isText = true;
      }
    }
    this.toggleAttribute("data-text", isText);
  }

  #render(loading: boolean) {
    this.#loading = loading;
    this.toggleAttribute("inert", loading && !this.interactive);
    this.toggleAttribute("data-loading", loading);
  }
}
