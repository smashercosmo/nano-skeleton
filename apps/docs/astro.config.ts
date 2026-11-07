import type { AstroIntegration } from "astro";

import { defineConfig } from "astro/config";
import {
  createGrammarLoader,
  normalizeLanguage,
} from "microlighter/grammar-dependencies.js";
import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { URL } from "node:url";

const LANGUAGE_CLASS = /class="[^"]*\blanguage-(?<language>[\w\-]+)/gv;

/** Grammar names of the code blocks' languages in the built pages */
async function usedLanguages(dir: URL) {
  const files = await readdir(dir, { recursive: true });
  const reads: Promise<string>[] = [];
  for (const file of files) {
    if (file.endsWith(".html")) {
      reads.push(readFile(new URL(file, dir), "utf8"));
    }
  }
  const pages = await Promise.all(reads);
  const languages = new Set<string>();
  for (const html of pages) {
    for (const match of html.matchAll(LANGUAGE_CLASS)) {
      const language = match.groups?.["language"];
      if (language !== undefined) {
        languages.add(normalizeLanguage(language));
      }
    }
  }
  return [...languages];
}

/**
 * Microlighter lazy-loads its grammars with
 * import(`./grammars/${language}.js`), relative to its own module. The bundler
 * doesn't follow that import, so the grammars are copied next to the bundled
 * chunk: the languages of the built pages' code blocks, plus the grammars those
 * embed (e.g. CSS and JavaScript in HTML).
 */
function microlighterGrammars(): AstroIntegration {
  let assets = "_astro";
  return {
    name: "microlighter-grammars",
    hooks: {
      "astro:config:done": ({ config }) => {
        ({ assets } = config.build);
      },
      "astro:build:done": async ({ dir, logger }) => {
        const { languages } = await createGrammarLoader()(
          await usedLanguages(dir),
        );
        const names = Object.keys(languages);
        const source = new URL(
          "grammars/",
          import.meta.resolve("microlighter"),
        );
        const target = new URL(`${assets}/grammars/`, dir);
        await mkdir(target, { recursive: true });
        await Promise.all(
          names.map(async (name) => {
            await copyFile(
              new URL(`${name}.js`, source),
              new URL(`${name}.js`, target),
            );
          }),
        );
        logger.info(`Copied grammars: ${names.toSorted().join(", ")}`);
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
  /**
   * GitHub Pages serves pages from directories and redirects URLs without a
   * trailing slash, so links include it to skip the redirect
   */
  trailingSlash: "always",
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
