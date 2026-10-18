import fs from "node:fs";
import url from "node:url";
import { replacePlugin } from "rolldown/plugins";
import { defineConfig } from "tsdown";

const css = fs
  .readFileSync(url.fileURLToPath(import.meta.resolve("#root/styles.css")))
  .toString();

export default defineConfig((options) => ({
  entry: ["./src/index.ts"],
  format: ["esm"],
  unbundle: true,
  fixedExtension: false,
  sourcemap: true,
  clean: true,
  minify: true,
  dts: true,
  define: {
    "import.meta.env.MODE": JSON.stringify(
      options.watch ? "development" : "production",
    ),
  },
  tsconfig: "./tsconfig.lib.json",
  deps: {
    neverBundle: true,
  },
  exports: {
    devExports: "source",
    packageJson: true,
  },
  plugins: [
    replacePlugin({
      "__CSS_CONTENT__": css,
    }),
  ],
}));
