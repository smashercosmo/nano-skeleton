import { Skeleton, SkeletonProvider } from "nano-skeleton";

import { requestHighlight } from "#root/scripts/highlight.js";
import { LOGO_REVEALED_KEY } from "#root/site.js";

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

/**
 * The "skeleton" part of the logo is loading until it's first hovered or
 * focused. It then stays revealed, on the next pages too: the header reads the
 * same key before the first paint.
 */
const logo = document.querySelector(".logo");
const logoProvider = logo?.querySelector<SkeletonProvider>(
  "nano-skeleton-provider",
);
const logoReveal = new AbortController();

function revealLogo() {
  if (logoProvider) {
    logoProvider.loading = false;
  }
  logoReveal.abort();
  try {
    sessionStorage.setItem(LOGO_REVEALED_KEY, "true");
  } catch {
    // Storage is unavailable: the logo is revealed on this page only
  }
}

if (logo && logoProvider?.loading === true) {
  for (const type of ["pointerenter", "focus"]) {
    logo.addEventListener(type, revealLogo, { signal: logoReveal.signal });
  }
}

//endregion

//region ------------- Table of contents -------------

/**
 * Marks the link of the section being read in both tables of contents (the
 * sidebar and the mobile one) with aria-current, which also styles it.
 *
 * The observed area is a thin band a fifth of the way down the viewport: the
 * section that crosses it is the one being read. Sections follow each other
 * without gaps, so exactly one crosses the band at a time.
 */
const tocLinks = new Map<string, HTMLAnchorElement[]>();
for (const link of document.querySelectorAll<HTMLAnchorElement>(".toc a")) {
  const id = decodeURIComponent(link.hash.slice(1));
  tocLinks.set(id, [...(tocLinks.get(id) ?? []), link]);
}

/** Marks the links of one section as current, and unmarks all the others */
function markCurrent(sectionId: string) {
  for (const [id, links] of tocLinks) {
    for (const link of links) {
      if (id === sectionId) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }
}

if (tocLinks.size > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries.find((entry) => entry.isIntersecting);
      if (current) {
        markCurrent(current.target.id);
      }
    },
    { rootMargin: "-20% 0px -80% 0px" },
  );
  for (const section of document.querySelectorAll(".section[id]")) {
    observer.observe(section);
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
