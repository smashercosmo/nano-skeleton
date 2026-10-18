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
  #unsubscribe?: Unsubscribe | undefined;
  #observer = new MutationObserver(() => this.#update());

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
    this.toggleAttribute("inert", loading);
    this.toggleAttribute("data-loading", loading);
  }
}
