import type { LoadingCallback, Unsubscribe } from "#root/types.js";

import { SKELETON_CONTEXT } from "#root/constants.js";
import { ContextRequestEvent } from "#root/context-request-event.js";
import { HTMLElementBase } from "#root/html-element.js";

/**
 * Connects to the nearest provider and listens for its loading state. If no
 * provider is available, waits until one connects.
 *
 * Based on the Web Components Community Context Protocol:
 *
 * @see https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
 */
export abstract class ContextConsumer extends HTMLElementBase {
  #unsubscribe?: Unsubscribe | undefined;

  /**
   * The document we are waiting on for a provider to connect, if any.
   *
   * Remembered because the element can be moved to another document, e.g. into
   * an iframe. By the time `disconnectedCallback` runs, `ownerDocument` is
   * already the new document, so the listener would never be removed from the
   * old one.
   */
  #waitingOn?: Document | undefined;

  /**
   * Receives loading state updates from the provider.
   *
   * The callback reference must stay the same so that a new provider can
   * recognize this consumer and take over when needed.
   */
  readonly #callback: LoadingCallback = (loading, unsubscribe) => {
    if (unsubscribe !== undefined && unsubscribe !== this.#unsubscribe) {
      // A new provider took over, so stop listening to the previous one.
      this.#unsubscribe?.();
      this.#unsubscribe = unsubscribe;
    }

    this.contextChangedCallback(loading);
  };

  /**
   * Retries the context request when a provider connects. Checks the context
   * value instead of using instanceof so that providers from other versions of
   * the library also work.
   */
  readonly #onContextProvider = (event: Event) => {
    if ("context" in event && event.context === SKELETON_CONTEXT) {
      this.#requestContext();
    }
  };

  /** Requests the context as soon as the element is added to the DOM. */
  public connectedCallback() {
    this.#requestContext();
  }

  public disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.#stopWaiting();
  }

  /**
   * Called immediately with the current loading state, and again whenever the
   * state changes.
   */
  protected abstract contextChangedCallback(loading: boolean): void;

  #requestContext() {
    // Dispatching the event asks the nearest provider for its context.
    this.dispatchEvent(new ContextRequestEvent(this, this.#callback, true));

    // A provider was found, so there is no need to wait for another one.
    this.#stopWaiting();

    if (!this.#isSubscribed()) {
      // No provider was found, so wait until one connects in this document.
      this.#waitingOn = this.ownerDocument;
      this.#waitingOn.addEventListener(
        "context-provider",
        this.#onContextProvider,
      );
    }
  }

  /** Removes the listener from the document it was added to. */
  #stopWaiting() {
    this.#waitingOn?.removeEventListener(
      "context-provider",
      this.#onContextProvider,
    );
    this.#waitingOn = undefined;
  }

  /**
   * Checks whether a provider has subscribed to this consumer.
   *
   * Kept in a separate method because dispatchEvent() can update #unsubscribe
   * synchronously, which TypeScript cannot detect.
   */
  #isSubscribed() {
    return this.#unsubscribe !== undefined;
  }
}
