import { ContextConsumer, createContext } from "@lit/context";
import { ReactiveElement } from "@lit/reactive-element";

import { render } from "./helpers.js";

/** The skeletons' context, as `@lit/context` creates it */
const loadingContext = createContext<boolean>(
  Symbol.for("nano-skeleton-context"),
);

/** Gets the loading state with the `ContextConsumer` of `@lit/context` */
class LitConsumer extends ReactiveElement {
  public static define() {
    if (!customElements.get("lit-consumer")) {
      customElements.define("lit-consumer", this);
    }
  }

  public readonly consumer = new ContextConsumer(this, {
    context: loadingContext,
    subscribe: true,
  });
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-consumer": LitConsumer;
  }
}

/** Registers all elements, including the Lit consumer, and renders the markup */
async function renderWithLit(html: string) {
  LitConsumer.define();
  await render(html);
}

function getLitConsumer(selector = "lit-consumer") {
  const consumer = document.querySelector<LitConsumer>(selector);
  if (!consumer) {
    throw new Error(`No element matches "${selector}"`);
  }
  return consumer;
}

export { LitConsumer, loadingContext, renderWithLit, getLitConsumer };
