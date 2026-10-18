import { PROVIDER_NAME, COMPONENT_NAME } from "#root/constants.js";
import { ContextRequestEvent } from "#root/ContextRequestEvent.js";
import { Skeleton } from "#root/Skeleton.js";
import { SkeletonProvider } from "#root/SkeletonProvider.js";

declare global {
  interface HTMLElementEventMap {
    "context-request": ContextRequestEvent;
  }
  interface HTMLElementTagNameMap {
    [PROVIDER_NAME]: SkeletonProvider;
    [COMPONENT_NAME]: Skeleton;
  }
}
