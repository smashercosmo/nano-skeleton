import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";

export default defineConfig((config) => {
  return {
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
