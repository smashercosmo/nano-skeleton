import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";

export default defineConfig((config) => {
  return {
    /** GitHub Pages serves the site from /nano-skeleton/ */
    base: config.command === "build" ? "/nano-skeleton/" : "/",
    build: {
      /**
       * Browsers with native light-dark(). With older targets Lightning CSS
       * polyfills it based on prefers-color-scheme only, which breaks the
       * theme switcher that sets color-scheme on :root.
       */
      cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"],
    },
    resolve: {
      conditions: [
        ...defaultClientConditions,
        ...(config.command === "serve" ? ["source"] : []),
      ],
    },
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
    ],
  };
});
