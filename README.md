# nano-skeleton

A tiny, framework-agnostic skeleton loader built on Web Components.

**[Documentation and live demos](https://smashercosmo.github.io/nano-skeleton/)**

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
a quick start and the API.

## Repository structure

This is a pnpm monorepo:

| Path                                                 | Description                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| [`packages/nano-skeleton`](./packages/nano-skeleton) | The published `nano-skeleton` package.                              |
| [`apps/docs`](./apps/docs)                           | Astro documentation site with live demos, deployed to GitHub Pages. |
| [`internal/tsconfig`](./internal/tsconfig)           | Shared TypeScript configs.                                          |
| [`.github/actions`](./.github/actions)               | Actions used by the release workflow, run from TypeScript sources.  |

## Development

Requirements: pnpm (see `packageManager` in `package.json` for the exact
version). pnpm installs the Node.js version from `devEngines.runtime` itself.

```bash
# Install dependencies
pnpm install

# Start the docs site in dev mode
pnpm --filter docs dev

# Build all packages and apps
pnpm build

# Lint and type-check everything (build first: the apps get the
# package's types from its dist)
pnpm lint

# Format the code
pnpm format
```

The docs site imports the package from source in dev mode, so changes in
`packages/nano-skeleton/src` show up in the dev server right away.

### TypeScript

Type-checking uses TypeScript 7 (`tsc`, installed as `@typescript/native`).
Tools that need the TypeScript compiler API, such as the declaration build in
tsdown, import `typescript`, which is aliased to the TypeScript 6 compatible
package, as TypeScript 7 doesn't provide that API.

## Releases

Changes are described with change intents in `.changeset/`. The release
workflow turns pending intents into a release PR, and merging it stages the
new version on npm and drafts a GitHub release. Approving the staged version
(`pnpm stage approve`) publishes it, and publishing the draft release deploys
the docs.

## License

[MIT](./LICENSE) © Vladislav Shkodin
