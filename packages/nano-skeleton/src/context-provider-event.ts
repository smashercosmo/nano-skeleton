/**
 * Announces a provider that connected, e.g. one that was defined after its
 * skeletons, so skeletons without a provider can request the context again.
 * Follows the community Context Protocol (@see
 * https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md)
 */
export class ContextProviderEvent extends Event {
  public readonly context: unknown;

  public constructor(context: unknown) {
    /** Composed, so it reaches skeletons that listen on the document */
    super("context-provider", { bubbles: true, composed: true });
    this.context = context;
  }
}
