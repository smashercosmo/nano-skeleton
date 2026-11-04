import type { Unsubscribe } from "#root/types.js";

import { SKELETON_CONTEXT } from "#root/constants.js";
import { ContextRequestEvent } from "#root/context-request-event.js";
import { adoptStyles } from "#root/styles.js";

function isDocumentOrShadowRoot(
  node: Node | Document | ShadowRoot,
): node is Document | ShadowRoot {
  return "adoptedStyleSheets" in node;
}

export class Skeleton extends HTMLElement {
  public static readonly observedAttributes = ["interactive", "inline"];

  #unsubscribe?: Unsubscribe | undefined;

  readonly #observer = new MutationObserver(() => {
    this.#update();
  });

  public get loading() {
    return this.hasAttribute("loading");
  }

  public set loading(value: boolean) {
    this.toggleAttribute("loading", value);
  }

  /** Keeps the content focusable and clickable while loading */
  public get interactive() {
    return this.hasAttribute("interactive");
  }

  public set interactive(value: boolean) {
    this.toggleAttribute("interactive", value);
  }

  /** Forces text mode, even when the text is wrapped in elements */
  public get inline() {
    return this.hasAttribute("inline");
  }

  public set inline(value: boolean) {
    this.toggleAttribute("inline", value);
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) {
      return;
    }
    if (name === "inline") {
      this.#update();
    } else {
      this.#render(this.loading);
    }
  }

  public async connectedCallback() {
    const root = this.getRootNode();

    if (isDocumentOrShadowRoot(root)) {
      await adoptStyles(root);
    }

    this.#update();
    this.#render(false);

    this.dispatchEvent(
      new ContextRequestEvent(
        SKELETON_CONTEXT,
        (loading, unsubscribe) => {
          if (unsubscribe) {
            this.#unsubscribe = unsubscribe;
          }
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

  public disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.#observer.disconnect();
  }

  #update() {
    let isInline = this.inline;
    for (const node of this.childNodes) {
      if (isInline) {
        break;
      }
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
