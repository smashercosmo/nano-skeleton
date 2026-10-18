import type {
  Skeleton,
  SkeletonProvider,
  COMPONENT_NAME,
  PROVIDER_NAME,
} from "nano-skeleton";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type ElementProps<T extends HTMLElement> = Partial<
  Omit<T, keyof HTMLElement | FunctionKeys<T>>
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
