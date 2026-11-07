import { describe, expect, it } from "vitest";

import { render, style } from "./helpers.js";

/**
 * Runs with forced colors and reduced motion emulated, see vitest.config.ts.
 * Named "*.emulated.spec.ts" to run in that project only
 */
describe("forced colors and reduced motion", () => {
  it("redraws placeholders with system colors", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").forcedColorAdjust).toBe("none");
    expect(style("nano-skeleton").backgroundImage).toContain("gradient");
  });

  it("keeps link underlines visible", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton inline><a href="#">Link</a></nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("a").textDecorationColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("stops the shimmer for reduced motion", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").animationName).toBe("none");
  });
});
