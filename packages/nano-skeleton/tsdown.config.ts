import type { TsdownPlugin } from "tsdown";

import { bundle } from "lightningcss";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const STANDALONE_CSS = "./src/standalone.css";

/**
 * Emits dist/styles.css, the stylesheet exported as "nano-skeleton/styles.css"
 * for pages that render skeletons before the script runs: src/standalone.css
 * with its imports inlined. No targets, so modern syntax is kept as is, like in
 * the stylesheet the elements adopt.
 */
function standaloneStylesheet(): TsdownPlugin {
  const filename = fileURLToPath(new URL(STANDALONE_CSS, import.meta.url));
  return {
    name: "nano-skeleton-standalone-stylesheet",
    buildStart() {
      this.addWatchFile(filename);
    },
    generateBundle() {
      const { code } = bundle({ filename, minify: true });
      this.emitFile({ type: "asset", fileName: "styles.css", source: code });
    },
  };
}

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm"],
  unbundle: true,
  fixedExtension: false,
  /** The JavaScript maps embed the sources, for debugging the minified code */
  sourcemap: true,
  clean: true,
  minify: true,
  /**
   * The global source map option adds a source map comment to the declarations
   * either way, so the maps are emitted too. Editors fall back to the
   * declarations, as the TypeScript sources aren't published.
   */
  dts: { sourcemap: true },
  /**
   * The stylesheet is imported with "?inline" as a minified string. Modern
   * syntax such as light-dark() and nesting is kept as is: lowering
   * light-dark() would base it on prefers-color-scheme only and ignore the
   * page's color-scheme.
   */
  css: { minify: true, target: false },
  tsconfig: "./tsconfig.lib.json",
  deps: {
    neverBundle: true,
  },
  plugins: [standaloneStylesheet()],
  exports: {
    devExports: "source",
    packageJson: true,
    customExports: (exports, { isPublish }) => ({
      ...exports,
      "./styles.css": isPublish
        ? "./dist/styles.css"
        : { source: STANDALONE_CSS, default: "./dist/styles.css" },
    }),
  },
});
