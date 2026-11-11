import { describe, expect, it } from "vitest";

import { render, style } from "./helpers.js";

/**
 * A border and an outline that forced colors mode would recolor, and a box
 * shadow it would remove. In a style sheet, not inline: inline styles win over
 * the library's styles.
 */
const RED_BOX = `
  <style>
    .red-box {
      border: 1px solid rgb(255, 0, 0);
      outline: 1px solid rgb(255, 0, 0);
      box-shadow: rgb(255, 0, 0) 0 2px 4px;
    }
  </style>
`;

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

  it("draws borders and outlines of element-mode children in system colors, without box shadows", async () => {
    expect.assertions(5);

    await render(`
      ${RED_BOX}
      <span id="canvas-text" style="color: CanvasText"></span>
      <span id="link-text" style="color: LinkText"></span>
      <span id="button-border" style="color: ButtonBorder"></span>
      <nano-skeleton-provider loading>
        <nano-skeleton><button class="red-box">Follow</button></nano-skeleton>
        <nano-skeleton><a href="#" class="red-box">Link</a></nano-skeleton>
      </nano-skeleton-provider>
    `);

    const canvasText = style("#canvas-text").color;
    const linkText = style("#link-text").color;
    const buttonBorder = style("#button-border").color;
    expect(style("button").borderTopColor).toBe(buttonBorder);
    expect(style("button").outlineColor).toBe(canvasText);
    expect(style("button").boxShadow).toBe("none");
    expect(style("a").borderTopColor).toBe(linkText);
    expect(style("a").outlineColor).toBe(linkText);
  });

  /**
   * Descendants of inline skeletons inherit the opt-out of forced colors, so a
   * link inside another element would keep the page's own outline color
   */
  it("draws the focus outline of a wrapped link in an interactive skeleton in system colors", async () => {
    expect.assertions(2);

    await render(`
      ${RED_BOX}
      <span id="link-text" style="color: LinkText"></span>
      <nano-skeleton-provider loading>
        <p>
          <nano-skeleton inline interactive>
            <span><a href="#" id="wrapped" class="red-box">Link</a></span>
          </nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("#wrapped").outlineStyle).toBe("solid");
    expect(style("#wrapped").outlineColor).toBe(style("#link-text").color);
  });

  /**
   * Elements inside inline text aren't placeholders: their borders, outlines
   * and box shadows are hidden, as they are without forced colors
   */
  it("hides borders, outlines and box shadows inside inline skeletons", async () => {
    expect.assertions(5);

    await render(`
      ${RED_BOX}
      <nano-skeleton-provider loading>
        <p>
          <nano-skeleton>
            Press <kbd class="red-box">Ctrl</kbd> or <a href="#" class="red-box">this link</a>
          </nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    const transparent = "rgba(0, 0, 0, 0)";
    expect(style("kbd").borderTopColor).toBe(transparent);
    expect(style("kbd").outlineStyle).toBe("none");
    expect(style("kbd").boxShadow).toBe("none");
    expect(style("a").borderTopColor).toBe(transparent);
    expect(style("a").outlineStyle).toBe("none");
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
