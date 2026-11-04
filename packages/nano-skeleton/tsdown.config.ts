import fs from "node:fs/promises";
import url from "node:url";
import { replacePlugin } from "rolldown/plugins";
import { defineConfig } from "tsdown";

export default defineConfig(async (options) => {
  const stylesPath = url.fileURLToPath(import.meta.resolve("#root/styles.css"));
  const css = await fs.readFile(stylesPath, "utf8");

  return {
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
        options.watch === undefined ||
          options.watch === false ||
          options.watch === ""
          ? "production"
          : "development",
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
  };
});
