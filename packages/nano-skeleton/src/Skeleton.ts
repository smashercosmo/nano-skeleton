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
  static observedAttributes = ["interactive"];

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

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;
    this.#render(this.#loading);
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
    let isText = false;
    for (const node of this.childNodes) {
      if (node instanceof Text && node.data.trim() !== "") {
        isText = true;
        break;
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
