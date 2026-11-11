import { SKELETON_CONTEXT } from "#root/constants.js";

/**
 * Announces that a context provider has connected.
 *
 * Consumers waiting for a provider use this event to try their context request
 * again. Existing providers also use it to let consumers find a closer
 * provider.
 *
 * The event only announces the new provider. Consumers switch providers through
 * their context requests, not through this event.
 *
 * Implements the Community Context Protocol:
 * https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
 */
export class ContextProviderEvent extends Event {
  /**
   * Identifies the context this provider offers. Uses `unknown` because
   * listeners may receive events for contexts they do not handle.
   */
  public readonly context: unknown = SKELETON_CONTEXT;

  public constructor() {
    // Let the event cross shadow boundaries and bubble up the DOM tree.
    super("context-provider", { bubbles: true, composed: true });
  }
}
