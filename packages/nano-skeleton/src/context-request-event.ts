import type { LoadingCallback } from "#root/types.js";

import { SKELETON_CONTEXT } from "#root/constants.js";

/**
 * Describes a context request that a provider can receive.
 *
 * Some properties are optional because other implementations or older versions
 * of the Community Context Protocol may not provide them. For example,
 *
 * @lit/context does not provide `subscribe`.
 *
 * @see https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
 */
export interface ContextRequest extends Event {
  readonly context: unknown;
  readonly contextTarget?: Element;
  readonly callback: LoadingCallback;
  readonly subscribe?: boolean;
}

/**
 * This library's implementation of a context request event.
 *
 * Unlike the general ContextRequest interface, this event always provides both
 * `contextTarget` and `subscribe`.
 *
 * @see https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
 */
export class ContextRequestEvent extends Event implements ContextRequest {
  /** Identifies the context being requested. */
  public readonly context: unknown = SKELETON_CONTEXT;

  /**
   * The element that made the request. Unlike event.target, this always refers
   * to the original element, even when the event crosses a Shadow DOM
   * boundary.
   */
  public readonly contextTarget: Element;

  /**
   * Called by the provider to send the current loading state and future
   * updates.
   */
  public readonly callback: LoadingCallback;

  /**
   * Whether the provider should keep sending updates. If false, only the
   * current loading state is sent.
   */
  public readonly subscribe: boolean;

  public constructor(
    contextTarget: Element,
    callback: LoadingCallback,
    subscribe = false,
  ) {
    // Allows the event to cross Shadow DOM boundaries and reach ancestor providers.
    super("context-request", { bubbles: true, composed: true });

    this.contextTarget = contextTarget;
    this.callback = callback;
    this.subscribe = subscribe;
  }
}
