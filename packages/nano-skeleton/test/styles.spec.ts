import { describe, expect, it } from "vitest";

import {
  animatedProperties,
  boxDecorationBreak,
  render,
  setLoading,
  style,
} from "./helpers.js";

const ICON = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='green'/></svg>",
)}`;

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("styles", () => {
  it("doesn't override the page's own shimmer keyframes", async () => {
    expect.assertions(1);

    await render(`
      <style>
        @keyframes shimmer { to { translate: 10px } }
        .own { animation: shimmer 1s paused }
      </style>
      <div class="own"></div>
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);
    expect(animatedProperties(".own")).toContain("translate");
  });

  it("uses custom properties set on the skeleton itself", async () => {
    expect.assertions(1);

    await render(`
      <style>.wide { --nano-skeleton-background-size: 50%; }</style>
      <nano-skeleton-provider loading>
        <p><nano-skeleton class="wide">Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").backgroundSize).toMatch(/^50%/v);
  });

  it("keeps the inherited letter-spacing in font-based styles", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p style="letter-spacing: 2px">
          <nano-skeleton inline="words-bg-per-line">Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").letterSpacing).toBe("2px");
  });

  it("applies --nano-skeleton-letter-spacing in font-based styles", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p style="letter-spacing: 2px; --nano-skeleton-letter-spacing: 3px">
          <nano-skeleton inline="words-bg-per-line">Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").letterSpacing).toBe("3px");
  });

  it("hides text shadows and strokes", async () => {
    expect.assertions(3);

    await render(`
      <nano-skeleton-provider loading>
        <p style="text-shadow: 1px 1px red; -webkit-text-stroke: 1px red">
          <nano-skeleton>Text</nano-skeleton>
        </p>
        <nano-skeleton>
          <button style="text-shadow: 1px 1px red">Follow</button>
        </nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("p nano-skeleton").textShadow).toBe("none");
    expect(
      style("p nano-skeleton").getPropertyValue("-webkit-text-stroke-color"),
    ).toBe(TRANSPARENT);
    expect(style("button").textShadow).toBe("none");
  });

  it("hides media inside inline text but keeps the boxes of other elements", async () => {
    expect.assertions(4);

    await render(`
      <nano-skeleton-provider loading>
        <p>
          <nano-skeleton>
            Press
            <kbd style="border: 1px solid rgb(255, 0, 0); background: rgb(0, 0, 255)">Ctrl</kbd>
            <img src="${ICON}" width="16" height="16" alt="" />
            <svg width="16" height="16"><rect width="16" height="16" /></svg>
          </nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("img").opacity).toBe("0");
    expect(style("svg").opacity).toBe("0");
    expect(style("kbd").borderTopColor).toBe("rgb(255, 0, 0)");
    expect(style("kbd").backgroundColor).toBe("rgb(0, 0, 255)");
  });

  it("hides pseudo-elements of element-mode children but keeps their box", async () => {
    expect.assertions(5);

    await render(`
      <style>
        .icon::before { content: "x"; }
        .icon::after { content: "y"; }
      </style>
      <nano-skeleton-provider loading>
        <nano-skeleton>
          <button
            class="icon"
            style="border: 2px solid rgb(255, 0, 0); box-shadow: rgb(0, 0, 255) 0 2px 4px; outline: 3px solid rgb(0, 128, 0)"
          >Follow</button>
        </nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("button", "::before").opacity).toBe("0");
    expect(style("button", "::after").opacity).toBe("0");
    expect(style("button").borderTopColor).toBe("rgb(255, 0, 0)");
    expect(style("button").boxShadow).toContain("rgb(0, 0, 255)");
    expect(style("button").outlineColor).toBe("rgb(0, 128, 0)");
  });

  it("hides the list marker of an element-mode list item", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <ul>
          <nano-skeleton><li style="color: rgb(255, 0, 0)">Item</li></nano-skeleton>
        </ul>
      </nano-skeleton-provider>
    `);

    expect(style("li", "::marker").color).toBe(TRANSPARENT);
  });

  it("clips truncated text instead of showing an ellipsis while loading", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <p style="width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          <nano-skeleton>A very long title that gets truncated</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);
    const loading = style("p").textOverflow;
    await setLoading(false);

    expect(loading).toBe("clip");
    expect(style("p").textOverflow).toBe("ellipsis");
  });

  it("draws every line of inline text as a separate bar", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(boxDecorationBreak("nano-skeleton")).toBe("clone");
  });
});
