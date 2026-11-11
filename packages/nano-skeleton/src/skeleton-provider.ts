import type { ContextRequest } from "#root/context-request-event.js";
import type { LoadingCallback, Unsubscribe } from "#root/types.js";

import { adoptStyles } from "#root/adopt-styles.js";
import { PROVIDER_NAME, SKELETON_CONTEXT } from "#root/constants.js";
import { ContextProviderEvent } from "#root/context-provider-event.js";
import { ContextRequestEvent } from "#root/context-request-event.js";
import { HTMLElementBase, hasDom } from "#root/html-element.js";

interface Subscription {
  /**
   * The element that asked, to ask again from there. Requests of older versions
   * of the Context Protocol don't have it.
   */
  readonly consumer: Element | undefined;
  /** The same function with every update, so consumers can tell providers apart */
  readonly unsubscribe: Unsubscribe;
}

/**
 * Checked by node type: `instanceof ShadowRoot` fails for a shadow root that
 * belongs to another document, e.g. an iframe's.
 */
function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in node;
}

export class SkeletonProvider extends HTMLElementBase {
  public static readonly observedAttributes = ["loading"];
  /** Safe to call more than once, and on a server, where it does nothing. */
  public static define() {
    if (hasDom() && !customElements.get(PROVIDER_NAME)) {
      customElements.define(PROVIDER_NAME, this);
    }
  }

  readonly #subscriptions = new Map<LoadingCallback, Subscription>();
  readonly #internals = this.attachInternals();

  /** Any implementation of the protocol can ask, see `ContextRequest` */
  readonly #onContextRequest = (event: ContextRequest) => {
    if (
      event.context !== SKELETON_CONTEXT ||
      typeof event.callback !== "function"
    ) {
      return;
    }

    /** The nearest provider wins */
    event.stopPropagation();

    const { callback: subscriber } = event;

    /** Without `subscribe`, a request is a one-time request */
    if (event.subscribe !== true) {
      subscriber(this.loading);
      return;
    }

    let subscription = this.#subscriptions.get(subscriber);
    if (!subscription) {
      const consumer: Element | undefined = event.contextTarget;
      subscription = {
        consumer,
        unsubscribe: () => {
          this.#subscriptions.delete(subscriber);
        },
      };
      this.#subscriptions.set(subscriber, subscription);
    }
    subscriber(this.loading, subscription.unsubscribe);
  };

  /**
   * A provider connected below this one, e.g. one that was defined later: its
   * consumers ask again, so that a provider closer to them takes them over
   */
  readonly #onContextProvider = (event: ContextProviderEvent) => {
    if (event.context !== SKELETON_CONTEXT || event.target === this) {
      return;
    }

    /** Any consumer the new provider is closer to is subscribed here */
    event.stopPropagation();

    /**
     * A consumer that's taken over unsubscribes here, which Map iteration
     * handles. One that isn't keeps its subscription and isn't added again.
     */
    for (const [subscriber, { consumer }] of this.#subscriptions) {
      consumer?.dispatchEvent(
        new ContextRequestEvent(consumer, subscriber, true),
      );
    }
  };

  public constructor() {
    super();
    /**
     * Adding listeners from the constructor so the provider is ready before any
     * descendant connects and asks for context.
     */
    this.addEventListener("context-request", this.#onContextRequest);
    this.addEventListener("context-provider", this.#onContextProvider);
  }

  public get loading() {
    return this.hasAttribute("loading");
  }

  public set loading(value: boolean) {
    this.toggleAttribute("loading", value);
  }

  public connectedCallback() {
    /**
     * The provider is `display: contents` by default, so it needs the styles
     * too, e.g. when its skeletons are all inside shadow roots
     */
    adoptStyles(this);

    /**
     * `loading` set before the element was defined is an own property that
     * shadows the accessor. Re-sets it through the accessor.
     */
    if (Object.hasOwn(this, "loading")) {
      const value: unknown = Reflect.get(this, "loading");
      Reflect.deleteProperty(this, "loading");
      Reflect.set(this, "loading", value);
    }

    /** Lets skeletons that connected before this provider find it */
    this.dispatchEvent(new ContextProviderEvent());
  }

  public attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    /** Only the presence counts, e.g. `loading=""` and `loading="true"` */
    if ((oldValue === null) === (newValue === null)) {
      return;
    }
    /** Setting `aria-busy` via internals so it can be overridden by user */
    // oxlint-disable-next-line unicorn/no-null -- ariaBusy accepts either string or null
    this.#internals.ariaBusy = this.loading ? "true" : null;
    for (const [subscriber, subscription] of this.#subscriptions) {
      /**
       * Our own skeletons unsubscribe when they're removed. A consumer of
       * another library may not, and would then be kept, with its element, for
       * as long as this provider lives. So a consumer that has left this
       * provider is dropped instead of updated. Deleting during iteration is
       * safe with a Map.
       */
      if (subscription.consumer && !this.#contains(subscription.consumer)) {
        this.#subscriptions.delete(subscriber);
      } else {
        subscriber(this.loading, subscription.unsubscribe);
      }
    }
  }

  /**
   * Whether the element is inside this provider, including inside shadow roots,
   * which `Node.contains()` doesn't look into.
   */
  #contains(element: Element) {
    let node: Node | undefined = element;
    while (node) {
      if (node === this) {
        return true;
      }
      /** From a shadow root, continue from its host */
      node = node.parentNode ?? (isShadowRoot(node) ? node.host : undefined);
    }
    return false;
  }
}
