import { PROVIDER_NAME, COMPONENT_NAME } from "#root/constants.js";
import { SkeletonProvider } from "#root/skeleton-provider.js";
import { Skeleton } from "#root/skeleton.js";

function init() {
  if (!customElements.get(PROVIDER_NAME)) {
    customElements.define(PROVIDER_NAME, SkeletonProvider);
  }
  if (!customElements.get(COMPONENT_NAME)) {
    customElements.define(COMPONENT_NAME, Skeleton);
  }
}

export { PROVIDER_NAME, COMPONENT_NAME } from "#root/constants.js";
export { Skeleton } from "#root/skeleton.js";
export { SkeletonProvider } from "#root/skeleton-provider.js";
export { init };
