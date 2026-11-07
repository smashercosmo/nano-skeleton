import { describe, expect, it } from "vitest";

import {
  frameDocument,
  get,
  getProvider,
  getSkeleton,
  render,
  setLoading,
  settle,
  style,
} from "./helpers.js";

/**
 * Attributes are asserted by value: "" when present, null when absent, which
 * also checks that boolean attributes are set without a value
 */
function createSkeleton(text = "Text") {
  const skeleton = document.createElement("nano-skeleton");
  skeleton.textContent = text;
  return skeleton;
}

describe("lifecycle", () => {
  it("follows the new provider after a move", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider id="a"><nano-skeleton>Text</nano-skeleton></nano-skeleton-provider>
      <nano-skeleton-provider id="b"></nano-skeleton-provider>
    `);
    getProvider("#b").append(getSkeleton());
    await settle();
    getProvider("#a").loading = true;
    const withOldProvider = getSkeleton().getAttribute("loading");
    getProvider("#b").loading = true;

    expect(withOldProvider).toBeNull();
    expect(getSkeleton().getAttribute("loading")).toBe("");
  });

  it("stops following providers once removed after two quick moves", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider id="a"></nano-skeleton-provider>
      <nano-skeleton-provider id="b"></nano-skeleton-provider>
    `);
    const skeleton = createSkeleton();
    getProvider("#a").append(skeleton);
    getProvider("#b").append(skeleton);
    await settle();
    skeleton.remove();
    await settle();
    getProvider("#b").loading = true;

    expect(skeleton.getAttribute("loading")).toBeNull();
  });

  it("doesn't subscribe when removed in the same task it was added", async () => {
    expect.assertions(1);

    await render("");
    const provider = document.createElement("nano-skeleton-provider");
    const skeleton = createSkeleton();
    provider.append(skeleton);
    document.body.append(provider);
    provider.remove();
    await settle();
    provider.loading = true;

    expect(skeleton.getAttribute("loading")).toBeNull();
  });

  it("follows the nearest provider", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <nano-skeleton id="first">Outer</nano-skeleton>
        <nano-skeleton-provider>
          <nano-skeleton id="second">Inner</nano-skeleton>
        </nano-skeleton-provider>
      </nano-skeleton-provider>
    `);

    expect(getSkeleton("#first").getAttribute("loading")).toBe("");
    expect(getSkeleton("#second").getAttribute("loading")).toBeNull();
  });

  it("switches back to element mode when detected text is replaced", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider><nano-skeleton>Loading…</nano-skeleton></nano-skeleton-provider>
    `);
    const detected = getSkeleton().getAttribute("inline");
    getSkeleton().replaceChildren(document.createElement("img"));
    await settle();

    expect(detected).toBe("");
    expect(getSkeleton().getAttribute("inline")).toBeNull();
  });

  it.each([
    { attribute: "inline", value: "" },
    { attribute: 'inline="words-bg-per-line"', value: "words-bg-per-line" },
  ])(
    "keeps an $attribute attribute set by the author",
    async ({ attribute, value }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider><nano-skeleton ${attribute}>Text</nano-skeleton></nano-skeleton-provider>
      `);
      getSkeleton().replaceChildren(document.createElement("a"));
      await settle();

      expect(getSkeleton().getAttribute("inline")).toBe(value);
    },
  );

  it("doesn't let the loading state be set on a skeleton", async () => {
    expect.assertions(1);

    await render("<nano-skeleton>Text</nano-skeleton>");

    expect(() => Object.assign(getSkeleton(), { loading: true })).toThrow(
      TypeError,
    );
  });

  it("makes the content inert only while loading", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading><nano-skeleton><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    const whileLoading = getSkeleton().getAttribute("inert");
    await setLoading(false);

    expect(whileLoading).toBe("");
    expect(getSkeleton().getAttribute("inert")).toBeNull();
  });

  it("keeps an inert attribute set by the author", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><nano-skeleton inert><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    await setLoading(true);
    await setLoading(false);

    expect(getSkeleton().getAttribute("inert")).toBe("");
  });

  it("works after being moved to the document of an iframe", async () => {
    expect.assertions(2);

    await render("<iframe></iframe>");
    const frame = frameDocument();
    const provider = document.createElement("nano-skeleton-provider");
    provider.loading = true;
    provider.append(createSkeleton());
    frame.body.append(frame.adoptNode(provider));
    await settle();

    expect(getSkeleton("nano-skeleton", frame).getAttribute("loading")).toBe(
      "",
    );
    expect(style("nano-skeleton", undefined, frame).backgroundImage).toContain(
      "gradient",
    );
  });

  it("works inside a shadow root with the provider outside", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading><div id="host"></div></nano-skeleton-provider>
    `);
    const root = get("#host").attachShadow({ mode: "open" });
    root.innerHTML = "<p><nano-skeleton>Shadow text</nano-skeleton></p>";
    await settle();

    expect(getSkeleton("nano-skeleton", root).getAttribute("loading")).toBe("");
    expect(style("nano-skeleton", undefined, root).backgroundImage).toContain(
      "gradient",
    );
  });
});
