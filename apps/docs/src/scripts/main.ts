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

/** Names of the code blocks' languages, for the buttons' and blocks' labels */
const LANGUAGE_NAMES = new Map([
  ["bash", "shell"],
  ["css", "CSS"],
  ["html", "HTML"],
  ["js", "JavaScript"],
  ["ts", "TypeScript"],
  ["tsx", "TSX"],
]);

/** "HTML code" for a block with class="language-html", "code" otherwise */
function codeName(code: Element) {
  const language = /\blanguage-(?<language>[\w\-]+)/v.exec(code.className)
    ?.groups?.["language"];
  const name =
    language === undefined ? undefined : LANGUAGE_NAMES.get(language);
  return name === undefined ? "code" : `${name} code`;
}

/** Timers that clear the "Copied" message, restarted on every click */
const resetTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

/**
 * The last message announced. VoiceOver skips a message identical to the
 * previous one, even if the region was emptied in between, so a repeated one
 * gets a no-break space, which isn't read aloud
 */
let lastMessage = "";

/** U+00A0 */
const NO_BREAK_SPACE = String.fromCodePoint(160);

/** Sets `data-copied` or `data-failed` on the button, or neither */
function markResult(button: HTMLButtonElement, result?: "copied" | "failed") {
  button.toggleAttribute("data-copied", result === "copied");
  button.toggleAttribute("data-failed", result === "failed");
}

/**
 * Shows the result in the status element next to the button, which is also a
 * live region, so sighted and screen reader users get the same message
 */
function reportCopy(
  button: HTMLButtonElement,
  status: HTMLElement,
  ok: boolean,
) {
  globalThis.clearTimeout(resetTimers.get(button));
  markResult(button, ok ? "copied" : "failed");

  let message = ok ? "Copied" : "Copy failed";
  if (message === lastMessage) {
    message += NO_BREAK_SPACE;
  }
  lastMessage = message;
  /** Emptied first, so the same message is announced again */
  status.replaceChildren();
  requestAnimationFrame(() => {
    status.replaceChildren(message);
  });

  resetTimers.set(
    button,
    globalThis.setTimeout(() => {
      markResult(button);
      /** No stale "Copied" left for screen reader browse mode */
      status.replaceChildren();
    }, 2000),
  );
}

async function copyCode(
  code: Element,
  button: HTMLButtonElement,
  status: HTMLElement,
) {
  try {
    await navigator.clipboard.writeText(code.textContent);
    reportCopy(button, status, true);
  } catch {
    /** No clipboard access, e.g. denied by the user */
    reportCopy(button, status, false);
  }
}

/**
 * A code block that scrolls horizontally becomes focusable, so keyboard users
 * can scroll it, and a named region, so screen readers say what it is. One that
 * fits isn't, so it doesn't add a stop to the tab order.
 */
function syncScrollable(pre: HTMLElement, name: string) {
  const scrollable = pre.scrollWidth > pre.clientWidth;
  if (scrollable) {
    pre.setAttribute("tabindex", "0");
    pre.setAttribute("role", "region");
    pre.setAttribute("aria-label", name);
  } else if (document.activeElement !== pre) {
    /** A focused block keeps its tabindex, so it doesn't lose focus */
    pre.removeAttribute("tabindex");
    pre.removeAttribute("role");
    pre.removeAttribute("aria-label");
  }
}

/**
 * Watches both the block and its code: the block changes size with the
 * viewport, the code with its content, e.g. in the playground
 */
const scrollableBlocks = new ResizeObserver((entries) => {
  const blocks = new Set<HTMLPreElement>();
  for (const { target } of entries) {
    const pre = target.closest("pre");
    if (pre) {
      blocks.add(pre);
    }
  }
  for (const pre of blocks) {
    const code = pre.querySelector(":scope > code");
    if (code) {
      syncScrollable(pre, codeName(code));
    }
  }
});

/**
 * The button goes into a wrapper next to the code block, not into the block
 * itself, which scrolls horizontally and would take the button with it.
 */
function addCopyButton(pre: HTMLElement, code: Element) {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";

  const copy = document.createElement("span");
  copy.className = "copy";

  /**
   * Visible text "Copy", plus the language for screen readers, so the buttons
   * of different blocks can be told apart
   */
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-button";
  const context = document.createElement("span");
  context.className = "visually-hidden";
  context.textContent = ` ${codeName(code)}`;
  button.append("Copy", context);

  /**
   * Outside the button: a button's content is presentational, so a live region
   * inside it isn't reliably announced
   */
  const status = document.createElement("span");
  status.className = "copy-status";
  status.setAttribute("role", "status");

  button.addEventListener("click", () => {
    void copyCode(code, button, status);
  });

  copy.append(button, status);
  pre.before(wrapper);
  wrapper.append(pre, copy);

  scrollableBlocks.observe(pre);
  scrollableBlocks.observe(code);
}

for (const code of document.querySelectorAll("pre > code")) {
  const pre = code.parentElement;
  if (pre) {
    addCopyButton(pre, code);
  }
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
