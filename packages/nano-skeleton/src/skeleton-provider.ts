import type { ContextRequestEvent } from "#root/context-request-event.js";
import type { LoadingCallback } from "#root/types.js";

import { adoptStyles } from "#root/adopt-styles.js";
import { PROVIDER_NAME, SKELETON_CONTEXT } from "#root/constants.js";
import { ContextProviderEvent } from "#root/context-provider-event.js";

export class SkeletonProvider extends HTMLElement {
  public static readonly observedAttributes = ["loading"];
  public static define() {
    if (!customElements.get(PROVIDER_NAME)) {
      customElements.define(PROVIDER_NAME, this);
    }
  }

  readonly #subscribers = new Set<LoadingCallback>();
  readonly #internals = this.attachInternals();

  public constructor() {
    super();
    /**
     * Adding listener from the constructor so the provider is ready before any
     * descendant connects and asks for context.
     */
    this.addEventListener("context-request", (event: ContextRequestEvent) => {
      if (
        event.context !== SKELETON_CONTEXT ||
        typeof event.callback !== "function"
      ) {
        return;
      }

      /** The nearest provider wins */
      event.stopPropagation();

      const { callback: subscriber } = event;

      if (event.subscribe) {
        this.#subscribers.add(subscriber);
        subscriber(this.loading, () => {
          this.#subscribers.delete(subscriber);
        });
      } else {
        subscriber(this.loading);
      }
    });
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
    this.dispatchEvent(new ContextProviderEvent(SKELETON_CONTEXT));
  }

  public attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) {
      return;
    }
    /** Setting `aria-busy` Via internals so it can be overridden by user */
    // oxlint-disable-next-line unicorn/no-null -- ariaBusy accepts either string or null
    this.#internals.ariaBusy = this.loading ? "true" : null;
    for (const subscriber of this.#subscribers) {
      subscriber(this.loading);
    }
  }
}
