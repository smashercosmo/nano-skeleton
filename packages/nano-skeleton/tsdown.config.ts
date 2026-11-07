import { defineConfig } from "tsdown";

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
   * syntax such as light-dark() and @scope is kept as is: lowering light-dark()
   * would base it on prefers-color-scheme only and ignore the page's
   * color-scheme.
   */
  css: { minify: true, target: false },
  tsconfig: "./tsconfig.lib.json",
  deps: {
    neverBundle: true,
  },
  exports: {
    devExports: "source",
    packageJson: true,
  },
});
