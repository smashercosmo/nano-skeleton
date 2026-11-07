import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/** A fresh list for each project, as Vitest writes a name into each instance */
function instances() {
  return [
    { browser: "chromium" as const },
    { browser: "webkit" as const },
    { browser: "firefox" as const },
  ];
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "default",
          include: ["test/*.spec.ts"],
          exclude: ["test/*.emulated.spec.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: instances(),
          },
        },
      },
      /**
       * A separate project, as media emulation applies to the whole browser
       * context and would leak into tests that run at the same time. WebKit
       * doesn't support forced colors, like Safari, so it isn't included.
       */
      {
        test: {
          name: "emulated",
          include: ["test/*.emulated.spec.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: {
                forcedColors: "active",
                reducedMotion: "reduce",
              },
            }),
            instances: instances().filter(
              ({ browser }) => browser !== "webkit",
            ),
          },
        },
      },
    ],
  },
});
