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
  static observedAttributes = ["interactive", "inline"];

  #unsubscribe?: Unsubscribe | undefined;
  #observer = new MutationObserver(() => this.#update());

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean) {
    this.toggleAttribute("loading", Boolean(value));
  }

  /** Keeps the content focusable and clickable while loading */
  get interactive() {
    return this.hasAttribute("interactive");
  }

  set interactive(value: boolean) {
    this.toggleAttribute("interactive", Boolean(value));
  }

  /** Forces text mode, even when the text is wrapped in elements */
  get inline() {
    return this.hasAttribute("inline");
  }

  set inline(value: boolean) {
    this.toggleAttribute("inline", Boolean(value));
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;
    if (name === "inline") this.#update();
    else this.#render(this.loading);
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
    let isInline = this.inline;
    for (const node of this.childNodes) {
      if (isInline) break;
      if (node instanceof Text && node.data.trim() !== "") {
        isInline = true;
      }
    }
    this.toggleAttribute("inline", isInline);
  }

  #render(loading: boolean) {
    this.toggleAttribute("loading", loading);
    this.toggleAttribute("inert", loading && !this.interactive);
  }
}
