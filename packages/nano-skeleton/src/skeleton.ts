import type { Unsubscribe } from "#root/types.js";

import { adoptStyles } from "#root/adopt-styles.js";
import { COMPONENT_NAME, SKELETON_CONTEXT } from "#root/constants.js";
import { ContextProviderEvent } from "#root/context-provider-event.js";
import { ContextRequestEvent } from "#root/context-request-event.js";
import { registerFont } from "#root/fonts.js";

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

/** Checks the node type, as `instanceof Text` fails for nodes of an iframe */
function isNonEmptyText(node: Node) {
  return (
    node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== ""
  );
}

class Skeleton extends HTMLElement {
  public static readonly observedAttributes = ["interactive", "inline"];
  public static define() {
    if (!customElements.get(COMPONENT_NAME)) {
      customElements.define(COMPONENT_NAME, this);
    }
  }

  #unsubscribe?: Unsubscribe | undefined;

  /** `inline` was added by auto-detection, not by the author */
  #autoInline = false;

  /** `inert` was added by the skeleton, not by the author */
  #ownInert = false;

  /** The skeleton is changing its own `inline` attribute */
  #settingInline = false;

  readonly #observer = new MutationObserver(() => {
    this.#update();
  });

  /** A provider connected: try again if no provider answered before */
  readonly #onContextProvider = (event: Event) => {
    if (
      event instanceof ContextProviderEvent &&
      event.context === SKELETON_CONTEXT
    ) {
      this.#requestContext();
    }
  };

  /** Set by the nearest provider, see `<nano-skeleton-provider loading>` */
  public get loading() {
    return this.hasAttribute("loading");
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
      if (!this.#settingInline) {
        this.#autoInline = false;
      }
      this.#registerFont();
      this.#update();
    } else {
      this.#render(this.loading);
    }
  }

  /**
   * Synchronous, so a skeleton that is moved or removed right after being added
   * never subscribes while it's disconnected
   */
  public connectedCallback() {
    this.#upgradeProperty("inline");
    this.#upgradeProperty("interactive");

    adoptStyles(this);

    this.#registerFont();
    this.#update();
    this.#render(false);
    this.#requestContext();

    this.#observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  public disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.ownerDocument.removeEventListener(
      "context-provider",
      this.#onContextProvider,
    );
    this.#observer.disconnect();
  }

  /**
   * Subscribes to the nearest provider. Without one, waits for a provider to
   * connect, e.g. one that is defined later.
   */
  #requestContext() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;

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

    if (this.#isSubscribed()) {
      this.ownerDocument.removeEventListener(
        "context-provider",
        this.#onContextProvider,
      );
    } else {
      this.ownerDocument.addEventListener(
        "context-provider",
        this.#onContextProvider,
      );
    }
  }

  /**
   * A method, as TypeScript can't tell that the provider's callback sets
   * `#unsubscribe` during `dispatchEvent()`
   */
  #isSubscribed() {
    return this.#unsubscribe !== undefined;
  }

  /**
   * A property set before the element was defined is an own property that
   * shadows the accessor. Re-sets it through the accessor.
   */
  #upgradeProperty(name: "inline" | "interactive") {
    if (Object.hasOwn(this, name)) {
      const value: unknown = Reflect.get(this, name);
      Reflect.deleteProperty(this, name);
      Reflect.set(this, name, value);
    }
  }

  /**
   * Auto-detects inline mode: the skeleton is inline if it directly contains
   * text. The attribute is added without a value, so the default mode applies,
   * and removed again once the text is gone. An `inline` attribute set by the
   * author is never removed.
   */
  #update() {
    const hasText = [...this.childNodes].some((node) => isNonEmptyText(node));
    if (hasText && !this.hasAttribute("inline")) {
      this.#setInline(true);
      this.#autoInline = true;
    } else if (!hasText && this.#autoInline) {
      this.#setInline(false);
      this.#autoInline = false;
    }
  }

  #setInline(force: boolean) {
    this.#settingInline = true;
    try {
      this.toggleAttribute("inline", force);
    } finally {
      this.#settingInline = false;
    }
  }

  /** Inline modes other than the default draw the text with a built-in font */
  #registerFont() {
    const { inline } = this;
    if (inline === "lines-bg-per-block") {
      registerFont("lines", this.ownerDocument);
    } else if (
      inline === "words-bg-per-line" ||
      inline === "words-bg-per-block"
    ) {
      registerFont("words", this.ownerDocument);
    }
  }

  /** Only removes an `inert` attribute that the skeleton added itself */
  #render(loading: boolean) {
    this.toggleAttribute("loading", loading);
    const inert = loading && !this.interactive;
    if (inert && !this.hasAttribute("inert")) {
      this.toggleAttribute("inert", true);
      this.#ownInert = true;
    } else if (!inert && this.#ownInert) {
      this.toggleAttribute("inert", false);
      this.#ownInert = false;
    }
  }
}

export type { InlineMode };
export { Skeleton };
