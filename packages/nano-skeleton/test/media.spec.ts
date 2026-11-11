import { describe, expect, it } from "vitest";
import { server } from "vitest/browser";

import {
  get,
  measureWhileLoading,
  render,
  setLoading,
  style,
} from "./helpers.js";

const IMAGE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='teal'/></svg>",
)}`;

/**
 * While loading, an image shows an empty SVG without a size or aspect ratio of
 * its own. WebKit then lets the image shrink below its width in a flex row
 * that's too narrow. Documented in the element mode docs, with a workaround.
 */
const IS_WEBKIT = server.browser === "webkit";

async function keepsWidthInTightFlexRow() {
  expect.assertions(1);

  await render(`
    <nano-skeleton-provider>
      <div style="display: flex; width: 220px; gap: 8px; font: 32px sans-serif">
        <nano-skeleton><img src="${IMAGE}" style="width: 128px; height: 128px" alt="" /></nano-skeleton>
        <div style="min-width: 0"><nano-skeleton>Jane Cooper</nano-skeleton></div>
      </div>
    </nano-skeleton-provider>
  `);
  const { loaded, loading } = await measureWhileLoading("img");

  expect(loading.width).toBe(loaded.width);
}

describe("media", () => {
  it.skipIf(IS_WEBKIT)(
    "keeps the width of an image in a tight flex row",
    keepsWidthInTightFlexRow,
  );

  /** Fails once WebKit fixes it, then the known issue can be removed */
  it.runIf(IS_WEBKIT).fails(
    "lets an image shrink in a tight flex row in WebKit (known issue)",
    keepsWidthInTightFlexRow,
  );

  it("keeps the size of a responsive image that starts loading", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <div style="width: 250px">
          <nano-skeleton><img src="${IMAGE}" width="400" height="300" style="display: block; width: 100%; height: auto" alt="" /></nano-skeleton>
        </div>
      </nano-skeleton-provider>
    `);
    const loading = get("img").getBoundingClientRect();
    await setLoading(false);
    const loaded = get("img").getBoundingClientRect();

    expect(loading.width).toBe(loaded.width);
    expect(loading.height).toBe(loaded.height);
  });

  it("replaces the picture of a loading image with a transparent one", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <nano-skeleton><img src="${IMAGE}" width="40" height="30" alt="" /></nano-skeleton>
      </nano-skeleton-provider>
    `);
    const loading = style("img").content;
    await setLoading(false);

    expect(loading).toContain("data:image/svg+xml");
    expect(style("img").content).not.toContain("data:image/svg+xml");
  });

  /**
   * The wrapper is the placeholder, including its padding. As a flex item here,
   * it's a block box around the image, not an inline box one line tall.
   */
  it.each([
    {
      wrapper: "picture",
      html: `<picture style="padding: 10px"><source srcset="${IMAGE}" /><img src="${IMAGE}" width="120" height="80" style="display: block" alt="" /></picture>`,
    },
    {
      wrapper: "link",
      html: `<a href="#" style="padding: 10px"><img src="${IMAGE}" width="120" height="80" style="display: block" alt="" /></a>`,
    },
  ])(
    "draws the placeholder on a $wrapper around an image",
    async ({ html }) => {
      expect.assertions(4);

      await render(`
        <nano-skeleton-provider loading>
          <div style="display: flex">
            <nano-skeleton>${html}</nano-skeleton>
          </div>
        </nano-skeleton-provider>
      `);
      const wrapper = get("nano-skeleton > *").getBoundingClientRect();

      expect(style("nano-skeleton > *").backgroundImage).toContain("gradient");
      expect(style("img").opacity).toBe("0");
      expect(wrapper.width).toBe(140);
      expect(wrapper.height).toBe(100);
    },
  );
});
