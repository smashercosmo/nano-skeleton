import type { ContextRequestEvent } from "#root/context-request-event.js";
import type { LoadingCallback } from "#root/types.js";

import { PROVIDER_NAME, SKELETON_CONTEXT } from "#root/constants.js";

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
     * Adding listener from the constructor so the provider is ready
     * before any descendant connects and asks for context.
     */
    this.addEventListener(
      "context-request",
      (event: Readonly<ContextRequestEvent>) => {
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
      },
    );
  }

  public get loading() {
    return this.hasAttribute("loading");
  }

  public set loading(value: boolean) {
    this.toggleAttribute("loading", value);
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
