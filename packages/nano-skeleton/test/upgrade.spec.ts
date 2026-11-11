import { describe, expect, it } from "vitest";

import { defineElements, settle } from "./helpers.js";

describe("upgrade", () => {
  it("applies properties set before the elements were defined", async () => {
    expect.assertions(3);

    const provider = document.createElement("nano-skeleton-provider");
    const skeleton = document.createElement("nano-skeleton");
    skeleton.textContent = "Text";
    Object.assign(provider, { loading: true });
    Object.assign(skeleton, { inline: "words-bg-per-line", interactive: true });
    provider.append(skeleton);
    document.body.replaceChildren(provider);
    defineElements();
    await settle();

    expect(skeleton.getAttribute("inline")).toBe("words-bg-per-line");
    expect(skeleton.getAttribute("interactive")).toBe("");
    expect(skeleton.getAttribute("loading")).toBe("");
  });
});
