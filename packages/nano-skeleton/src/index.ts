import { PROVIDER_NAME, COMPONENT_NAME } from "#root/constants.js";
import { Skeleton } from "#root/Skeleton.js";
import { SkeletonProvider } from "#root/SkeletonProvider.js";

export function init() {
  if (!customElements.get(PROVIDER_NAME)) {
    customElements.define(PROVIDER_NAME, SkeletonProvider);
  }
  if (!customElements.get(COMPONENT_NAME)) {
    customElements.define(COMPONENT_NAME, Skeleton);
  }
}

export { Skeleton, SkeletonProvider };
export { PROVIDER_NAME, COMPONENT_NAME };
