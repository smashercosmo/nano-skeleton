# nano-skeleton

A tiny, framework-agnostic skeleton loader built on Web Components.

**[Live demo](https://smashercosmo.github.io/nano-skeleton/)**

Wrap pieces of your real UI in `<nano-skeleton>`, put a
`<nano-skeleton-provider loading>` around them, and they turn into shimmering
placeholders of the exact same shape. No separate loading markup and no layout
shift.

```html
<nano-skeleton-provider loading>
  <h2><nano-skeleton>Card title</nano-skeleton></h2>
  <nano-skeleton>
    <img src="/cover.png" width="320" height="240" alt="" />
  </nano-skeleton>
</nano-skeleton-provider>
```

See the [package README](./packages/nano-skeleton/README.md) for installation,
usage, examples and API docs.

## Repository structure

This is a pnpm monorepo:

| Path                                                 | Description                                      |
| ---------------------------------------------------- | ------------------------------------------------ |
| [`packages/nano-skeleton`](./packages/nano-skeleton) | The published `nano-skeleton` package.           |
| [`apps/website`](./apps/website)                     | React demo site used to develop and showcase it. |
| [`internal/tsconfig`](./internal/tsconfig)           | Shared TypeScript configs.                       |

## Development

Requirements: Node.js 26+ and pnpm (see `packageManager` in `package.json` for
the exact version).

```bash
# Install dependencies
pnpm install

# Start the demo site in dev mode
pnpm dev

# Build all packages and apps
pnpm build

# Type-check everything
pnpm lint:types

# Format the code
pnpm format
```

The demo site imports the package from source, so changes in
`packages/nano-skeleton/src` show up in the dev server right away.

## License

[MIT](./LICENSE) © Vladislav Shkodin
