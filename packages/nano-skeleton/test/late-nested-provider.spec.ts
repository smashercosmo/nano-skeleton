import { describe, expect, it } from "vitest";

import { Skeleton, SkeletonProvider } from "#root/index.js";

import { getProvider, getSkeleton, settle } from "./helpers.js";

/**
 * Its own file, so the provider isn't defined yet: every test file runs in a
 * fresh iframe with its own custom element registry
 */
describe("late nested provider", () => {
  it("follows the nearest provider when both are defined after the skeletons", async () => {
    expect.assertions(4);

    Skeleton.define();
    document.body.innerHTML = `
      <nano-skeleton-provider id="outer" loading>
        <nano-skeleton id="first">Outer</nano-skeleton>
        <nano-skeleton-provider id="inner">
          <nano-skeleton id="second">Inner</nano-skeleton>
        </nano-skeleton-provider>
      </nano-skeleton-provider>
    `;
    await settle();
    SkeletonProvider.define();
    await settle();
    const first = getSkeleton("#first").getAttribute("loading");
    const second = getSkeleton("#second").getAttribute("loading");
    getProvider("#outer").loading = false;
    getProvider("#inner").loading = true;

    expect(first).toBe("");
    expect(second).toBeNull();
    expect(getSkeleton("#first").getAttribute("loading")).toBeNull();
    expect(getSkeleton("#second").getAttribute("loading")).toBe("");
  });
});
