import { describe, expect, it } from "vitest";

import type { Unsubscribe } from "#root/types.js";

import { ContextRequestEvent } from "#root/context-request-event.js";

import { get, getProvider, render } from "./helpers.js";

interface Call {
  loading: boolean;
  unsubscribe: Unsubscribe | undefined;
}

/**
 * A consumer of another library: a plain element that records every call of its
 * callback
 */
function createConsumer() {
  const element = get("#consumer");
  const calls: Call[] = [];
  /** One function, so the provider recognizes the consumer when it asks again */
  function record(loading: boolean, unsubscribe?: Unsubscribe) {
    calls.push({ loading, unsubscribe });
  }
  function request(subscribe = true) {
    element.dispatchEvent(new ContextRequestEvent(element, record, subscribe));
  }
  return { calls, request };
}

describe("context", () => {
  it("passes the same unsubscribe function with every update", async () => {
    expect.assertions(3);

    await render(`
      <nano-skeleton-provider><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request();
    getProvider().loading = true;
    getProvider().loading = false;

    expect(calls.map(({ loading }) => loading)).toStrictEqual([
      false,
      true,
      false,
    ]);
    expect(calls[0]?.unsubscribe).toBeTypeOf("function");
    expect(new Set(calls.map(({ unsubscribe }) => unsubscribe)).size).toBe(1);
  });

  it("stops updating a consumer once it unsubscribes", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request();
    calls[0]?.unsubscribe?.();
    getProvider().loading = true;

    expect(calls).toHaveLength(1);
  });

  it("updates a consumer that asked twice only once", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request();
    request();
    getProvider().loading = true;

    expect(calls.map(({ loading }) => loading)).toStrictEqual([
      false,
      false,
      true,
    ]);
  });

  it("answers a one-time request once, without an unsubscribe function", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request(false);
    getProvider().loading = true;

    expect(calls).toStrictEqual([{ loading: false, unsubscribe: undefined }]);
  });

  /** A consumer of another library may never call `unsubscribe` */
  it("drops a consumer that left the provider without unsubscribing", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request();
    get("#consumer").remove();
    getProvider().loading = true;
    getProvider().loading = false;

    expect(calls).toHaveLength(1);
  });

  it("keeps updating a consumer inside a shadow root", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider><div id="host"></div></nano-skeleton-provider>
    `);
    const root = get("#host").attachShadow({ mode: "open" });
    root.innerHTML = '<div id="consumer"></div>';
    const element = get("#consumer", root);
    const calls: boolean[] = [];
    element.dispatchEvent(
      new ContextRequestEvent(
        element,
        (loading) => {
          calls.push(loading);
        },
        true,
      ),
    );
    getProvider().loading = true;

    expect(calls).toStrictEqual([false, true]);
  });

  it("doesn't update consumers when the loading state stays the same", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading><div id="consumer"></div></nano-skeleton-provider>
    `);
    const { calls, request } = createConsumer();
    request();
    getProvider().setAttribute("loading", "true");

    expect(calls).toHaveLength(1);
  });
});
