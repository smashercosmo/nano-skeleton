import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";

/** A local test bed, not deployed, so it's served from the root */
export default defineConfig((config) => ({
  build: {
    /**
     * Browsers with native light-dark(). With older targets Lightning CSS
     * polyfills it based on prefers-color-scheme only, which breaks the theme
     * switcher that sets color-scheme on :root.
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
}));
