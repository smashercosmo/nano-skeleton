import { describe, expect, it } from "vitest";

import { render } from "./helpers.js";

/** The families of the fonts registered in this test file's document */
function registeredFamilies() {
  return [...document.fonts].map(({ family }) => family.replaceAll('"', ""));
}

/**
 * Each test file runs in its own document, and fonts stay registered once
 * added, so the tests run in order: the default style first
 */
describe("fonts", () => {
  it("doesn't register a built-in font for the default style", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
        <p><nano-skeleton inline="lines-bg-per-line">Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(registeredFamilies()).toStrictEqual([]);
  });

  it("registers the built-in font of each font-based style", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <nano-skeleton inline="lines-bg-per-block"><p>Text</p></nano-skeleton>
        <p><nano-skeleton inline="words-bg-per-line">Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(registeredFamilies().toSorted()).toStrictEqual([
      "nano-skeleton-font-lines",
      "nano-skeleton-font-words",
    ]);
  });
});
