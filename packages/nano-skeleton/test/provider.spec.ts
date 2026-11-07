import { describe, expect, it } from "vitest";

import { get, render, settle, style } from "./helpers.js";

describe("provider", () => {
  it("lays out its children as if it weren't there", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton-provider").display).toBe("contents");
  });

  it("is styled without any skeleton in its document", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="host"></div></nano-skeleton-provider>
    `);
    get("#host").attachShadow({ mode: "open" }).innerHTML =
      "<nano-skeleton>Shadow text</nano-skeleton>";
    await settle();

    expect(style("nano-skeleton-provider").display).toBe("contents");
  });

  it.each([
    { selector: "nano-skeleton-provider", display: "block" },
    { selector: ".grid", display: "grid" },
  ])(
    "lets the author's $selector style set its display",
    async ({ selector, display }) => {
      expect.assertions(1);

      await render(`
        <style>${selector} { display: ${display}; }</style>
        <nano-skeleton-provider class="grid">
          <p><nano-skeleton>Text</nano-skeleton></p>
        </nano-skeleton-provider>
      `);

      expect(style("nano-skeleton-provider").display).toBe(display);
    },
  );
});
