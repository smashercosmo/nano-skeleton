import type { LoadingCallback } from "#root/types.js";

/**
 * Follows the community Context Protocol (@see
 * https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md)
 */
export class ContextRequestEvent extends Event {
  readonly context: unknown;
  readonly callback: LoadingCallback;
  readonly subscribe: boolean;

  constructor(context: unknown, callback: LoadingCallback, subscribe = false) {
    /** Composed, so skeletons inside shadow roots can reach a provider outside */
    super("context-request", { bubbles: true, composed: true });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe;
  }
}
