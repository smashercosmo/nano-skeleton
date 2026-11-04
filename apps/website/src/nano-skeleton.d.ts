import type {
  Skeleton,
  SkeletonProvider,
  COMPONENT_NAME,
  PROVIDER_NAME,
} from "nano-skeleton";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type FunctionKeys<TObject> = {
  [TKey in keyof TObject]: TObject[TKey] extends (
    ...args: readonly never[]
  ) => unknown
    ? TKey
    : never;
}[keyof TObject];

type ElementProps<TElement extends HTMLElement> = Partial<
  Omit<TElement, keyof HTMLElement | FunctionKeys<TElement>>
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [COMPONENT_NAME]: DetailedHTMLProps<HTMLAttributes<Skeleton>, Skeleton> &
        ElementProps<Skeleton>;
      [PROVIDER_NAME]: DetailedHTMLProps<
        HTMLAttributes<SkeletonProvider>,
        SkeletonProvider
      > &
        ElementProps<SkeletonProvider>;
    }
  }
}
