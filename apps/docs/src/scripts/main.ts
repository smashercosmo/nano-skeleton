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

async function copyCode({ currentTarget: button }: Readonly<Event>) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  await navigator.clipboard.writeText(
    button.parentElement?.querySelector("code")?.textContent ?? "",
  );
  button.textContent = "Copied";
  button.dataset["copied"] = "";
  setTimeout(() => {
    button.textContent = "Copy";
    delete button.dataset["copied"];
  }, 1500);
}

for (const pre of document.querySelectorAll("pre:has(> code)")) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy";
  button.textContent = "Copy";
  button.addEventListener("click", (event) => {
    void copyCode(event);
  });
  pre.append(button);
}

/** "#" links on headings coming from markdown */
for (const heading of document.querySelectorAll(".prose h3[id]")) {
  const anchor = document.createElement("a");
  anchor.className = "anchor";
  anchor.href = `#${heading.id}`;
  anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
  anchor.textContent = "#";
  heading.append(anchor);
}

requestHighlight();

//endregion
