import type {
  Skeleton,
  SkeletonProvider,
  COMPONENT_NAME,
  PROVIDER_NAME,
} from "nano-skeleton";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * Only the properties that can be set. `Skeleton.loading` is read-only: React
 * would assign it and throw.
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [COMPONENT_NAME]: DetailedHTMLProps<HTMLAttributes<Skeleton>, Skeleton> &
        Partial<Pick<Skeleton, "inline" | "interactive">>;
      [PROVIDER_NAME]: DetailedHTMLProps<
        HTMLAttributes<SkeletonProvider>,
        SkeletonProvider
      > &
        Partial<Pick<SkeletonProvider, "loading">>;
    }
  }
}
