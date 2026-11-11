import { ContextProvider } from "@lit/context";
import { describe, expect, it } from "vitest";

import { getProvider, getSkeleton, render } from "./helpers.js";
import {
  getLitConsumer,
  loadingContext,
  renderWithLit,
} from "./lit-consumer.js";

describe("lit", () => {
  it("updates a Lit consumer with every change", async () => {
    expect.assertions(3);

    await renderWithLit(`
      <nano-skeleton-provider><lit-consumer></lit-consumer></nano-skeleton-provider>
    `);
    const initial = getLitConsumer().consumer.value;
    getProvider().loading = true;
    const whileLoading = getLitConsumer().consumer.value;
    getProvider().loading = false;

    expect(initial).toBe(false);
    expect(whileLoading).toBe(true);
    expect(getLitConsumer().consumer.value).toBe(false);
  });

  it("stops updating a Lit consumer once it's removed", async () => {
    expect.assertions(1);

    await renderWithLit(`
      <nano-skeleton-provider><lit-consumer></lit-consumer></nano-skeleton-provider>
    `);
    const consumer = getLitConsumer();
    consumer.remove();
    getProvider().loading = true;

    expect(consumer.consumer.value).toBe(false);
  });

  it("lets a Lit provider set the loading state of skeletons", async () => {
    expect.assertions(2);

    await render("");
    const host = document.createElement("div");
    const provider = new ContextProvider(host, {
      context: loadingContext,
      initialValue: true,
    });
    host.innerHTML = "<nano-skeleton>Text</nano-skeleton>";
    document.body.append(host);
    const whileLoading = getSkeleton().getAttribute("loading");
    provider.setValue(false);

    expect(whileLoading).toBe("");
    expect(getSkeleton().getAttribute("loading")).toBeNull();
  });
});
