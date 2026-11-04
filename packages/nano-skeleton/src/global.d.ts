import type { PROVIDER_NAME, COMPONENT_NAME } from "#root/constants.js";
import type { ContextRequestEvent } from "#root/context-request-event.js";
import type { SkeletonProvider } from "#root/skeleton-provider.js";
import type { Skeleton } from "#root/skeleton.js";

declare global {
  interface HTMLElementEventMap {
    "context-request": ContextRequestEvent;
  }
  interface HTMLElementTagNameMap {
    [PROVIDER_NAME]: SkeletonProvider;
    [COMPONENT_NAME]: Skeleton;
  }
}
