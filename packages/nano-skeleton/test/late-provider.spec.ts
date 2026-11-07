import { describe, expect, it } from "vitest";

import { Skeleton, SkeletonProvider } from "#root/index.js";

import { getSkeleton, settle } from "./helpers.js";

/**
 * Its own file, so the provider isn't defined yet: every test file runs in a
 * fresh iframe with its own custom element registry
 */
describe("late provider", () => {
  it("finds a provider that is defined after the skeleton", async () => {
    expect.assertions(1);

    Skeleton.define();
    document.body.innerHTML = `
      <nano-skeleton-provider loading><nano-skeleton>Text</nano-skeleton></nano-skeleton-provider>
    `;
    await settle();
    SkeletonProvider.define();
    await settle();

    expect(getSkeleton().getAttribute("loading")).toBe("");
  });
});
