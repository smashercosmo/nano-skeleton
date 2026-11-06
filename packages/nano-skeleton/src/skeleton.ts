import type { Unsubscribe } from "#root/types.js";

import { COMPONENT_NAME, SKELETON_CONTEXT } from "#root/constants.js";
import { ContextRequestEvent } from "#root/context-request-event.js";
import { registerFont } from "#root/fonts.js";
import { adoptStyles } from "#root/styles.js";

/**
 * How inline text is drawn while loading: as one bar per line or one pill per
 * word, with a gradient per line or one gradient for all lines
 */
const INLINE_MODES = [
  "lines-bg-per-line",
  "lines-bg-per-block",
  "words-bg-per-line",
  "words-bg-per-block",
] as const;

type InlineMode = (typeof INLINE_MODES)[number];

function isInlineMode(value: unknown): value is InlineMode {
  const modes: string[] = [...INLINE_MODES];
  return typeof value === "string" && modes.includes(value);
}

function isDocumentOrShadowRoot(
  node: Node | Document | ShadowRoot,
): node is Document | ShadowRoot {
  return "adoptedStyleSheets" in node;
}

class Skeleton extends HTMLElement {
  public static readonly observedAttributes = ["interactive", "inline"];
  public static define() {
    if (!customElements.get(COMPONENT_NAME)) {
      customElements.define(COMPONENT_NAME, this);
    }
  }

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

  public get interactive() {
    return this.hasAttribute("interactive");
  }

  public set interactive(value: boolean) {
    this.toggleAttribute("interactive", value);
  }

  /**
   * The inline mode, if the skeleton is in inline mode. A bare `inline`
   * attribute, or any unknown value, means `"lines-bg-per-line"`.
   */
  public get inline(): InlineMode | undefined {
    const value = this.getAttribute("inline");
    if (value === null) {
      return undefined;
    }
    return isInlineMode(value) ? value : "lines-bg-per-line";
  }

  public set inline(value: InlineMode | undefined) {
    if (value === undefined) {
      this.removeAttribute("inline");
    } else {
      this.setAttribute("inline", value);
    }
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
      this.#registerFont();
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
    if (this.hasAttribute("inline")) {
      return;
    }
    /**
     * Here we auto-determine `inline` mode. Skeleton is considered `inline` if
     * it contains text nodes only. The attribute is added without a value, so
     * the default mode applies.
     */
    const hasText = [...this.childNodes].some(
      (node) => node instanceof Text && node.data.trim() !== "",
    );
    if (hasText) {
      this.setAttribute("inline", "");
    }
  }

  /** Inline modes other than the default draw the text with a built-in font */
  #registerFont() {
    const { inline } = this;
    if (inline === "lines-bg-per-block") {
      registerFont("lines");
    } else if (
      inline === "words-bg-per-line" ||
      inline === "words-bg-per-block"
    ) {
      registerFont("words");
    }
  }

  #render(loading: boolean) {
    this.toggleAttribute("loading", loading);
    this.toggleAttribute("inert", loading && !this.interactive);
  }
}

export type { InlineMode };
export { Skeleton };
