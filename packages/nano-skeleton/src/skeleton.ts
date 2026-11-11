import { adoptStyles } from "#root/adopt-styles.js";
import { COMPONENT_NAME } from "#root/constants.js";
import { ContextConsumer } from "#root/context-consumer.js";
import { registerFont } from "#root/fonts.js";
import { hasDom } from "#root/html-element.js";

/**
 * How inline text is drawn while it's loading. Each value combines two choices:
 *
 * - "lines" or "words": one solid bar per line, or one pill per word.
 * - "bg-per-line" or "bg-per-block": the shimmering gradient stretches across
 *   each line separately, or across the whole block of text.
 */
const INLINE_MODES = [
  "lines-bg-per-line",
  "lines-bg-per-block",
  "words-bg-per-line",
  "words-bg-per-block",
] as const;

type InlineMode = (typeof INLINE_MODES)[number];

/** The value of an `inline` attribute that was detected automatically. */
const AUTO_INLINE = "auto";

function isInlineMode(value: unknown): value is InlineMode {
  const modes: string[] = [...INLINE_MODES];
  return typeof value === "string" && modes.includes(value);
}

/**
 * Safely checks if a DOM node is a non-empty text node. We use `nodeType`
 * because `instanceof Text` can break if the node comes from an iframe.
 */
function isNonEmptyText(node: Node) {
  return (
    node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== ""
  );
}

class Skeleton extends ContextConsumer {
  /**
   * `loading` and `inert` are managed by the skeleton itself. They are observed
   * so they can be put back when something else changes them, see
   * `attributeChangedCallback`.
   */
  public static readonly observedAttributes = [
    "interactive",
    "inline",
    "loading",
    "inert",
  ];
  /** Safe to call more than once, and on a server, where it does nothing. */
  public static define() {
    if (hasDom() && !customElements.get(COMPONENT_NAME)) {
      customElements.define(COMPONENT_NAME, this);
    }
  }

  /**
   * The loading state the nearest provider last sent us. This is the source of
   * truth: the `loading` attribute only mirrors it, for the styles.
   */
  #loading = false;

  /** True if the `inert` attribute was added automatically by this component. */
  #ownInert = false;

  /** True between `connectedCallback` and `disconnectedCallback`. */
  #connected = false;

  /** True while we are changing our own `loading` and `inert` attributes. */
  #rendering = false;

  readonly #observer = new MutationObserver(() => {
    this.#update();
  });

  /**
   * Indicates if the component is in a loading state. Controlled by the nearest
   * `<nano-skeleton-provider>`.
   */
  public get loading() {
    return this.#loading;
  }

  public get interactive() {
    return this.hasAttribute("interactive");
  }

  public set interactive(value: boolean) {
    this.toggleAttribute("interactive", value);
  }

  /**
   * The current visual mode for inline text. If the attribute is just `inline`
   * with no value, was detected automatically (`inline="auto"`), or has an
   * unknown value, it is the default, `"lines-bg-per-line"`.
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
    } else if (name === "interactive") {
      this.#render(this.#loading);
    } else if (this.#connected && !this.#rendering) {
      /**
       * Something else changed `loading` or `inert`, which are ours to manage.
       * Libraries that update the page by morphing the DOM (idiomorph,
       * morphdom, Turbo, htmx) remove attributes that aren't in the HTML they
       * got from the server, and ours never are. Rendering again puts them
       * back. To keep the content usable while loading, set `interactive`
       * instead of removing `inert`.
       *
       * Skipped until the skeleton is connected: a copy of a loading skeleton
       * arrives with these attributes, and `connectedCallback` needs to see
       * them to tell that it is a copy.
       */
      this.#render(this.#loading);
    }
  }

  public override connectedCallback() {
    this.#upgradeProperty("inline");
    this.#upgradeProperty("interactive");

    adoptStyles(this);

    this.#registerFont();
    this.#update();

    /**
     * A skeleton that already has `loading` when it connects is a copy of a
     * loading skeleton, e.g. made with `cloneNode()` or `innerHTML`. The copy's
     * `inert` attribute was added by the original, so it's ours to remove.
     * Without this, the copy would stay inert forever.
     */
    if (
      this.hasAttribute("loading") &&
      !this.interactive &&
      this.hasAttribute("inert")
    ) {
      this.#ownInert = true;
    }
    this.#connected = true;
    this.#render(false);

    /** Ask the nearest provider for its context data. */
    super.connectedCallback();

    this.#observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer.disconnect();
    this.#connected = false;
    /**
     * A removed skeleton has no provider, so it isn't loading. It also keeps
     * the check for copies in `connectedCallback` honest: an element that we
     * removed `loading` from here can't be mistaken for a copy later.
     */
    this.#render(false);
  }

  protected override contextChangedCallback(loading: boolean) {
    this.#render(loading);
  }

  /**
   * Fixes properties that were assigned before the custom element was defined,
   * ensuring they use our getter/setter methods instead of becoming static
   * properties.
   */
  #upgradeProperty(name: "inline" | "interactive") {
    if (Object.hasOwn(this, name)) {
      const value: unknown = Reflect.get(this, name);
      Reflect.deleteProperty(this, name);
      Reflect.set(this, name, value);
    }
  }

  /**
   * Switches to inline mode automatically when the skeleton directly contains
   * text, and back when the text is gone.
   *
   * Automatic detection sets `inline="auto"`. The value is how we recognize our
   * own attribute later: we only remove `inline` when it says "auto", so an
   * `inline` attribute set by the author is never touched. Because the mark is
   * in the attribute itself, and not in a private field, it survives copying: a
   * copy made with `cloneNode()` or `innerHTML` still knows that its `inline`
   * was detected automatically.
   *
   * The styles treat "auto" like any value that isn't a style name: it means
   * the default style.
   */
  #update() {
    const hasText = [...this.childNodes].some((node) => isNonEmptyText(node));
    if (hasText && !this.hasAttribute("inline")) {
      this.setAttribute("inline", AUTO_INLINE);
    } else if (!hasText && this.getAttribute("inline") === AUTO_INLINE) {
      this.removeAttribute("inline");
    }
  }

  /**
   * Registers the built-in font that the current inline style draws its bars
   * with: its glyphs are solid bars instead of letters. The default
   * `"lines-bg-per-line"` style doesn't need one, as it draws the bars behind
   * the page's own font.
   */
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

  /**
   * Remembers the loading state and mirrors it in the attributes: `loading` for
   * the styles, and `inert` while loading unless the skeleton is interactive.
   * An `inert` attribute is only removed if we added it.
   */
  #render(loading: boolean) {
    this.#loading = loading;
    /** Tells `attributeChangedCallback` that these changes are our own */
    this.#rendering = true;
    try {
      this.toggleAttribute("loading", loading);
      const inert = loading && !this.interactive;
      if (inert && !this.hasAttribute("inert")) {
        this.toggleAttribute("inert", true);
        this.#ownInert = true;
      } else if (!inert && this.#ownInert) {
        this.toggleAttribute("inert", false);
        this.#ownInert = false;
      }
    } finally {
      this.#rendering = false;
    }
  }
}

export type { InlineMode };
export { Skeleton };
