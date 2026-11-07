import type { SkeletonProvider } from "#root/skeleton-provider.js";
import type { Skeleton } from "#root/skeleton.js";

/**
 * Shipped with the package, so `document.querySelector("nano-skeleton")` and
 * `document.createElement("nano-skeleton")` return the right types
 */
declare global {
  interface HTMLElementTagNameMap {
    "nano-skeleton": Skeleton;
    "nano-skeleton-provider": SkeletonProvider;
  }
}

export { COMPONENT_NAME, PROVIDER_NAME } from "#root/constants.js";
export { Skeleton } from "#root/skeleton.js";
export type { InlineMode } from "#root/skeleton.js";
export { SkeletonProvider } from "#root/skeleton-provider.js";
