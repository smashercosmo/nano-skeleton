import { Skeleton, SkeletonProvider } from "nano-skeleton";

import { requestHighlight } from "#root/scripts/highlight.js";

SkeletonProvider.define();
Skeleton.define();

//region ------------- Demos -------------

/**
 * Every demo has its own "Loading" switch that toggles all providers inside it,
 * and a "Simulate fetch" button: all providers start loading, then each one
 * finishes after its own `data-delay` (ms, or "random").
 */
for (const demo of document.querySelectorAll("[data-demo]")) {
  const toggle = demo.querySelector<HTMLInputElement>("[data-loading-toggle]");
  const simulate = demo.querySelector("[data-simulate]");
  const providers = [
    ...demo.querySelectorAll<SkeletonProvider>(
      "[data-stage] nano-skeleton-provider",
    ),
  ];
  /** Bumped on every interaction, so stale timers know to do nothing */
  const state = { run: 0 };

  toggle?.addEventListener("change", () => {
    state.run += 1;
    for (const provider of providers) {
      provider.loading = toggle.checked;
    }
  });

  /** Browsers restore the switch's state on reload, without a change event */
  toggle?.dispatchEvent(new Event("change"));

  simulate?.addEventListener("click", () => {
    state.run += 1;
    const current = { run: state.run, pending: providers.length };
    if (toggle) {
      toggle.checked = true;
    }
    for (const provider of providers) {
      provider.loading = true;
      const delay =
        provider.dataset["delay"] === "random"
          ? 500 + Math.random() * 2000
          : Number(provider.dataset["delay"] ?? 1500);
      setTimeout(() => {
        if (current.run !== state.run) {
          return;
        }
        provider.loading = false;
        current.pending -= 1;
        if (current.pending === 0 && toggle) {
          toggle.checked = false;
        }
      }, delay);
    }
  });
}

//endregion

//region ------------- Logo -------------

/** The "skeleton" part of the logo is loading until it's hovered or focused */
const logo = document.querySelector(".logo");
const logoProvider = logo?.querySelector<SkeletonProvider>(
  "nano-skeleton-provider",
);
if (logo && logoProvider) {
  for (const type of ["pointerenter", "focus"]) {
    logo.addEventListener(type, () => {
      logoProvider.loading = false;
    });
  }
  for (const type of ["pointerleave", "blur"]) {
    logo.addEventListener(type, () => {
      logoProvider.loading = true;
    });
  }
}

//endregion

//region ------------- Code blocks -------------

/** Timers that switch "Copied" back to "Copy", restarted on every click */
const resetTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

async function copyCode(event: Event) {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  try {
    await navigator.clipboard.writeText(
      button.parentElement?.querySelector("code")?.textContent ?? "",
    );
    button.textContent = "Copied";
  } catch {
    /** No clipboard access, e.g. denied by the user */
    button.textContent = "Copy failed";
  }
  button.dataset["copied"] = "";
  globalThis.clearTimeout(resetTimers.get(button));
  resetTimers.set(
    button,
    globalThis.setTimeout(() => {
      button.textContent = "Copy";
      delete button.dataset["copied"];
    }, 1500),
  );
}

/**
 * The button goes into a wrapper next to the code block, not into the block
 * itself, which scrolls horizontally and would take the button with it
 */
for (const pre of document.querySelectorAll("pre:has(> code)")) {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy";
  button.textContent = "Copy";
  button.addEventListener("click", (event) => {
    void copyCode(event);
  });
  pre.before(wrapper);
  wrapper.append(pre, button);
}

/**
 * "#" links on headings coming from markdown, in the docs sections only: the
 * changelog repeats the same h3 headings in every version. A sibling of the
 * heading, so the link's label doesn't become part of the heading's accessible
 * name.
 */
for (const heading of document.querySelectorAll(".section .prose h3[id]")) {
  const wrapper = document.createElement("div");
  wrapper.className = "heading";
  const anchor = document.createElement("a");
  anchor.className = "anchor";
  anchor.href = `#${heading.id}`;
  anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
  anchor.textContent = "#";
  heading.before(wrapper);
  wrapper.append(heading, anchor);
}

requestHighlight();

//endregion
