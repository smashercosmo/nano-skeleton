import { ContextRoot } from "@lit/context";
import { describe, expect, it } from "vitest";

import { SkeletonProvider } from "#root/index.js";

import { getProvider, settle } from "./helpers.js";
import { LitConsumer, getLitConsumer } from "./lit-consumer.js";

/**
 * Its own file, so the provider isn't defined yet: every test file runs in a
 * fresh iframe with its own custom element registry
 */
describe("lit with a late provider", () => {
  it("hands Lit consumers over to the nearest provider when both are defined later", async () => {
    expect.assertions(4);

    LitConsumer.define();
    /** Lit consumers only ask again for a `ContextRoot` */
    new ContextRoot().attach(document.body);
    document.body.innerHTML = `
      <nano-skeleton-provider id="outer" loading>
        <lit-consumer id="first"></lit-consumer>
        <nano-skeleton-provider id="inner">
          <lit-consumer id="second"></lit-consumer>
        </nano-skeleton-provider>
      </nano-skeleton-provider>
    `;
    await settle();
    SkeletonProvider.define();
    const first = getLitConsumer("#first").consumer.value;
    const second = getLitConsumer("#second").consumer.value;
    getProvider("#outer").loading = false;
    getProvider("#inner").loading = true;

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(getLitConsumer("#first").consumer.value).toBe(false);
    expect(getLitConsumer("#second").consumer.value).toBe(true);
  });
});
