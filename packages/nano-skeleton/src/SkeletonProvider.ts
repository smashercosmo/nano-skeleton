import type { ContextRequestEvent } from "#root/ContextRequestEvent.js";
import type { LoadingCallback } from "#root/types.js";

import { SKELETON_CONTEXT } from "#root/constants.js";

export class SkeletonProvider extends HTMLElement {
  static observedAttributes = ["loading"];

  #subscribers = new Set<LoadingCallback>();
  #internals = this.attachInternals();

  constructor() {
    super();
    /**
     * Adding listener from the constructor so the provider is ready before any
     * descendant connects and asks for context.
     */
    this.addEventListener("context-request", (event: ContextRequestEvent) => {
      if (
        event.context !== SKELETON_CONTEXT ||
        typeof event.callback !== "function"
      )
        return;

      /** The nearest provider wins */
      event.stopPropagation();

      const { callback } = event;

      if (event.subscribe) {
        this.#subscribers.add(callback);
        callback(this.loading, () => this.#subscribers.delete(callback));
      } else {
        callback(this.loading);
      }
    });
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean) {
    this.toggleAttribute("loading", Boolean(value));
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;
    /**
     * Via internals, so an aria-busy attribute set by the user still takes
     * precedence.
     */
    this.#internals.ariaBusy = this.loading ? "true" : null;
    for (const callback of this.#subscribers) callback(this.loading);
  }
}
