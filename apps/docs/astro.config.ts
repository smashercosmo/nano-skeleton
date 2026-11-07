import type { AstroIntegration } from "astro";

import { defineConfig } from "astro/config";
import { cp } from "node:fs/promises";
import { URL } from "node:url";

/**
 * Microlighter lazy-loads its grammars with
 * import(`./grammars/${language}.js`), relative to its own module. The bundler
 * doesn't follow that import, so the grammars are copied next to the bundled
 * chunk. Only the grammars a page actually uses are ever downloaded.
 */
function microlighterGrammars(): AstroIntegration {
  let assets = "_astro";
  return {
    name: "microlighter-grammars",
    hooks: {
      "astro:config:done": ({ config }) => {
        ({ assets } = config.build);
      },
      "astro:build:done": async ({ dir }) => {
        const grammars = new URL(
          "grammars/",
          import.meta.resolve("microlighter"),
        );
        await cp(grammars, new URL(`${assets}/grammars/`, dir), {
          recursive: true,
          filter: (source) => !source.endsWith(".d.ts"),
        });
      },
    },
  };
}

/**
 * In dev, nano-skeleton is resolved from its sources ("source" export
 * condition), so the library doesn't have to be built first and its changes
 * hot-reload. Builds use dist, where tsdown has inlined the styles.
 */
function nanoSkeletonSource(): AstroIntegration {
  return {
    name: "nano-skeleton-source",
    hooks: {
      "astro:config:setup": ({ command, updateConfig }) => {
        if (command !== "dev") {
          return;
        }
        updateConfig({
          vite: {
            resolve: {
              /** Setting conditions replaces Vite's defaults, so keep them */
              conditions: [
                "source",
                "module",
                "browser",
                "development|production",
              ],
            },
          },
        });
      },
    },
  };
}

export default defineConfig({
  /** GitHub Pages serves the site from /nano-skeleton/ */
  site: "https://smashercosmo.github.io",
  base: "/nano-skeleton",
  build: {
    /** One request less: the whole stylesheet is tiny */
    inlineStylesheets: "always",
  },
  markdown: {
    /** Code is highlighted on the client by microlighter */
    syntaxHighlight: false,
  },
  integrations: [nanoSkeletonSource(), microlighterGrammars()],
  vite: {
    /** Keeps microlighter's relative grammar imports working in dev */
    optimizeDeps: {
      exclude: ["microlighter"],
    },
    build: {
      /**
       * Browsers with native light-dark(). With older targets the CSS minifier
       * polyfills it based on prefers-color-scheme only, which breaks the theme
       * switcher that sets color-scheme on :root.
       */
      cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"],
    },
  },
});
