import { describe, expect, it } from "vitest";

import css from "#root/standalone.css?inline";

import { defineElements, get, settle, style } from "./helpers.js";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

/**
 * Markup as a server renders it: the elements aren't defined, so only the
 * provider's `loading` attribute and the `inline` attributes set by hand say
 * how the skeletons look. `data-measure` marks the placeholders.
 */
const MARKUP = `
  <nano-skeleton-provider loading>
    <p><nano-skeleton id="auto" data-measure>Lorem ipsum dolor</nano-skeleton></p>
    <p>
      <nano-skeleton id="words" inline="words-bg-per-line" data-measure
        >Lorem ipsum dolor</nano-skeleton
      >
    </p>
    <nano-skeleton inline="lines-bg-per-block">
      <p id="block" data-measure>Lorem ipsum dolor sit amet</p>
    </nano-skeleton>
    <nano-skeleton>
      <button id="button" type="button" data-measure>Follow</button>
    </nano-skeleton>
    <nano-skeleton-provider>
      <p><nano-skeleton id="loaded" data-measure>Loaded text</nano-skeleton></p>
    </nano-skeleton-provider>
  </nano-skeleton-provider>
  <nano-skeleton-provider>
    <p><nano-skeleton id="outside" data-measure>Loaded text</nano-skeleton></p>
  </nano-skeleton-provider>
`;

const PLACEHOLDERS = ["#auto", "#words", "#block", "#button"];

/** Links the stylesheet and renders the markup, once for the whole file */
async function renderOnce() {
  if (document.querySelector("[data-measure]")) {
    return;
  }
  const sheet = document.createElement("style");
  sheet.textContent = css;
  document.head.append(sheet);
  document.body.innerHTML = MARKUP;
  await settle();
}

/** The boxes of the placeholders, by id */
function boxes() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-measure]")].map((element) => [
      element.id,
      element.getBoundingClientRect().toJSON(),
    ]),
  );
}

/** The styles that make the placeholder: fill, background and font */
function looks(selector: string) {
  const { backgroundImage, fontFamily, webkitTextFillColor } = style(selector);
  return {
    gradient: backgroundImage.includes("gradient"),
    font: fontFamily,
    fill: webkitTextFillColor,
  };
}

/**
 * Each test file runs in its own document, and elements can't be undefined
 * again, so the tests run in order: before the elements are defined first
 */
describe("standalone stylesheet", () => {
  it("draws placeholders before the elements are defined", async () => {
    expect.assertions(5);

    await renderOnce();

    expect(customElements.get("nano-skeleton")).toBeUndefined();
    expect(looks("#auto")).toMatchObject({ gradient: true, fill: TRANSPARENT });
    expect(looks("#words")).toStrictEqual({
      gradient: true,
      font: "nano-skeleton-font-words",
      fill: TRANSPARENT,
    });
    expect(looks("#block")).toMatchObject({
      gradient: true,
      font: "nano-skeleton-font-lines",
    });
    expect(looks("#button")).toMatchObject({
      gradient: true,
      fill: TRANSPARENT,
    });
  });

  it("follows the nearest provider before the elements are defined", async () => {
    expect.assertions(2);

    await renderOnce();

    expect(looks("#loaded").gradient).toBe(false);
    expect(looks("#outside").gradient).toBe(false);
  });

  it("keeps every placeholder in place once the elements are defined", async () => {
    expect.assertions(3);

    await renderOnce();
    const before = boxes();
    const looksBefore = PLACEHOLDERS.map((selector) => looks(selector));
    defineElements();
    await settle();

    expect(get("#auto").getAttribute("inline")).toBe("auto");
    expect(boxes()).toStrictEqual(before);
    expect(PLACEHOLDERS.map((selector) => looks(selector))).toStrictEqual(
      looksBefore,
    );
  });
});
