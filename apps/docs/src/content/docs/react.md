---
title: React
order: 15
---

React 19 passes properties to custom elements, so `loading` can be bound
directly:

```tsx
import { useQuery } from "@tanstack/react-query";
import { Skeleton, SkeletonProvider } from "nano-skeleton";

SkeletonProvider.define();
Skeleton.define();

export function UserCard({ id }: { id: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  return (
    <nano-skeleton-provider loading={isPending}>
      <article>
        <nano-skeleton>
          <img src={data?.avatar} width={64} height={64} alt="" />
        </nano-skeleton>
        <h2>
          <nano-skeleton>{data?.name ?? "Placeholder name"}</nano-skeleton>
        </h2>
      </article>
    </nano-skeleton-provider>
  );
}
```

Use placeholder text while the data is loading: it's never shown, but it gives
the skeleton a realistic size.

The package can be imported on a server, e.g. in Next.js: there, `define()`
does nothing, and the elements start working once the same code runs in the
browser. Import `nano-skeleton/styles.css` too, e.g. in the root layout, so
the server-rendered skeletons look right before that.

The package declares the elements for DOM APIs, so
`document.querySelector("nano-skeleton")` or a `useRef<Skeleton>()` attached to
one is typed without any setup. To get JSX type checking for the custom
elements, add a declaration file:

```ts
// nano-skeleton.d.ts
import type {
  Skeleton,
  SkeletonProvider,
  COMPONENT_NAME,
  PROVIDER_NAME,
  InlineMode,
} from "nano-skeleton";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [COMPONENT_NAME]: DetailedHTMLProps<
        HTMLAttributes<Skeleton>,
        Skeleton
      > & {
        interactive?: boolean;
        inline?: InlineMode;
      };
      [PROVIDER_NAME]: DetailedHTMLProps<
        HTMLAttributes<SkeletonProvider>,
        SkeletonProvider
      > & {
        loading?: boolean;
      };
    }
  }
}
```
