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

    expect(detected).toBe("auto");
    expect(getSkeleton().getAttribute("inline")).toBeNull();
  });

  /**
   * A copy carries the attribute but not the original's private state, so the
   * "auto" value is what tells it that the attribute was detected
   */
  it.each([
    { how: "cloneNode", copy: (el: Element) => el.cloneNode(true) },
    {
      how: "innerHTML",
      copy: (el: Element) => {
        const template = document.createElement("template");
        template.innerHTML = el.outerHTML;
        return template.content;
      },
    },
  ])(
    "switches a $how copy of detected text back to element mode too",
    async ({ copy }) => {
      expect.assertions(2);

      await render(`
        <nano-skeleton-provider><nano-skeleton id="original">Loading…</nano-skeleton></nano-skeleton-provider>
        <div id="outside"></div>
      `);
      get("#outside").append(copy(getSkeleton("#original")));
      await settle();
      const skeleton = getSkeleton("#outside nano-skeleton");
      const copied = skeleton.getAttribute("inline");
      skeleton.replaceChildren(document.createElement("img"));
      await settle();

      expect(copied).toBe("auto");
      expect(skeleton.getAttribute("inline")).toBeNull();
    },
  );

  it("draws detected text in the default style", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading><p><nano-skeleton>Text</nano-skeleton></p></nano-skeleton-provider>
    `);

    expect(getSkeleton().inline).toBe("lines-bg-per-line");
    expect(style("nano-skeleton").backgroundImage).toContain("gradient");
  });

  /**
   * DOM-morphing libraries remove attributes that aren't in the HTML they got
   * from the server, which the skeleton's own attributes never are
   */
  it("puts back its attributes when something else removes them", async () => {
    expect.assertions(4);

    await render(`
      <nano-skeleton-provider loading><p><nano-skeleton>Text</nano-skeleton></p></nano-skeleton-provider>
    `);
    const skeleton = getSkeleton();
    skeleton.removeAttribute("loading");
    skeleton.removeAttribute("inert");
    skeleton.removeAttribute("inline");

    expect(skeleton.getAttribute("loading")).toBe("");
    expect(skeleton.getAttribute("inert")).toBe("");
    expect(skeleton.getAttribute("inline")).toBe("auto");
    expect(skeleton.loading).toBe(true);
  });

  it("removes its attributes again once loading ends after they were put back", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading><nano-skeleton><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    getSkeleton().removeAttribute("inert");
    getSkeleton().removeAttribute("loading");
    await setLoading(false);

    expect(getSkeleton().getAttribute("loading")).toBeNull();
    expect(getSkeleton().getAttribute("inert")).toBeNull();
  });

  it("removes a loading attribute that something else added", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider><nano-skeleton><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    getSkeleton().setAttribute("loading", "");

    expect(getSkeleton().getAttribute("loading")).toBeNull();
    expect(getSkeleton().loading).toBe(false);
  });

  it("doesn't put back inert on an interactive skeleton", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading><nano-skeleton interactive><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    getSkeleton().setAttribute("inert", "");
    getSkeleton().removeAttribute("inert");

    expect(getSkeleton().getAttribute("inert")).toBeNull();
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

  /** A copy carries the original's attributes, but not its private state */
  it("doesn't leave a copy of a loading skeleton inert", async () => {
    expect.assertions(3);

    await render(`
      <nano-skeleton-provider loading><nano-skeleton id="original"><button>Follow</button></nano-skeleton></nano-skeleton-provider>
      <div id="outside"></div>
    `);
    const copy = getSkeleton("#original").cloneNode(true);
    get("#outside").append(copy);
    await settle();
    const skeleton = getSkeleton("#outside nano-skeleton");

    expect(skeleton.getAttribute("loading")).toBeNull();
    expect(skeleton.getAttribute("inert")).toBeNull();
    expect(getSkeleton("#original").getAttribute("inert")).toBe("");
  });

  it("keeps an inert attribute set by the author after a move while loading", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider id="a" loading><nano-skeleton inert><button>Follow</button></nano-skeleton></nano-skeleton-provider>
      <nano-skeleton-provider id="b" loading></nano-skeleton-provider>
    `);
    getProvider("#b").append(getSkeleton());
    getProvider("#b").loading = false;

    expect(getSkeleton().getAttribute("inert")).toBe("");
  });

  it("isn't loading once removed from a loading provider", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading><nano-skeleton><button>Follow</button></nano-skeleton></nano-skeleton-provider>
    `);
    const skeleton = getSkeleton();
    skeleton.remove();

    expect(skeleton.getAttribute("loading")).toBeNull();
    expect(skeleton.getAttribute("inert")).toBeNull();
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
