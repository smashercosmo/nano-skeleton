import type { InlineMode, Skeleton, SkeletonProvider } from "nano-skeleton";

import { requestHighlight } from "#root/scripts/highlight.js";

type Colors = "default" | "indigo" | "emerald" | "amber" | "rose";

const DEFAULT_INLINE_MODE = "lines-bg-per-line";

const INLINE_MODES: readonly string[] = [
  DEFAULT_INLINE_MODE,
  "lines-bg-per-block",
  "words-bg-per-line",
  "words-bg-per-block",
] satisfies InlineMode[];

function isInlineMode(value: string): value is InlineMode {
  return INLINE_MODES.includes(value);
}

/** [base light, base dark, highlight light, highlight dark] */
const PALETTES: Record<Exclude<Colors, "default">, readonly string[]> = {
  indigo: ["#e0e7ff", "#1e1b4b", "#eef2ff", "#312e81"],
  emerald: ["#d1fae5", "#022c22", "#ecfdf5", "#064e3b"],
  amber: ["#fef3c7", "#3b2405", "#fffbeb", "#5c3a0a"],
  rose: ["#ffe4e6", "#4c0519", "#fff1f2", "#881337"],
};

interface State {
  readonly fontSize: number;
  readonly inlineStyle: InlineMode;
  readonly inlineRadius: number;
  readonly letterSpacing: number;
  readonly width: number;
  readonly avatarRadius: number;
  readonly linkMode: string;
  readonly interactive: boolean;
  readonly dir: string;
  readonly animation: string;
  readonly duration: number;
  readonly bgSize: number;
  readonly colors: Colors;
}

function isColors(value: string): value is Colors {
  return value === "default" || Object.hasOwn(PALETTES, value);
}

function readState(values: ReadonlyMap<string, string>): State {
  function text(name: string) {
    return values.get(name) ?? "";
  }
  const colors = text("colors");
  const inlineStyle = text("inlineStyle");
  return {
    fontSize: Number(text("fontSize")),
    inlineStyle: isInlineMode(inlineStyle) ? inlineStyle : DEFAULT_INLINE_MODE,
    inlineRadius: Number(text("inlineRadius")),
    letterSpacing: Number(text("letterSpacing")),
    width: Number(text("width")),
    avatarRadius: Number(text("avatarRadius")),
    linkMode: text("linkMode"),
    interactive: values.has("interactive"),
    dir: text("dir"),
    animation: text("animation"),
    duration: Number(text("duration")),
    bgSize: Number(text("bgSize")),
    colors: isColors(colors) ? colors : "default",
  };
}

function gradient(colors: Colors) {
  if (colors === "default") {
    return "";
  }
  const [baseLight, baseDark, lightLight, lightDark] = PALETTES[colors];
  const base = `light-dark(${baseLight}, ${baseDark})`;
  return `linear-gradient(\n    90deg,\n    ${base} 33%,\n    light-dark(${lightLight}, ${lightDark}),\n    ${base} 66%\n  )`;
}

function animation({ animation: name, duration }: Readonly<State>) {
  if (name === "none") {
    return "none";
  }
  return `${name} ${duration}s infinite ease-in-out`;
}

const DEFAULT_ANIMATION = "nano-skeleton-shimmer 2s infinite ease-in-out";

/** Every custom property the playground can set */
const CUSTOM_PROPERTIES = [
  "--nano-skeleton-inline-border-radius",
  "--nano-skeleton-letter-spacing",
  "--nano-skeleton-animation",
  "--nano-skeleton-background-size",
  "--nano-skeleton-background-image",
];

/**
 * Custom properties that differ from the library defaults, in the order they
 * are printed. The defaults need no declaration.
 */
function customProperties(state: Readonly<State>) {
  const result: [string, string][] = [];
  if (state.inlineRadius !== 1) {
    result.push([
      "--nano-skeleton-inline-border-radius",
      String(state.inlineRadius),
    ]);
  }
  if (state.letterSpacing !== 0) {
    result.push(["--nano-skeleton-letter-spacing", `${state.letterSpacing}em`]);
  }
  if (animation(state) !== DEFAULT_ANIMATION) {
    result.push(["--nano-skeleton-animation", animation(state)]);
  }
  if (state.bgSize !== 300) {
    result.push(["--nano-skeleton-background-size", `${state.bgSize}%`]);
  }
  const image = gradient(state.colors);
  if (image !== "") {
    result.push(["--nano-skeleton-background-image", image]);
  }
  return result;
}

function css(state: Readonly<State>) {
  const declarations = [
    ["font-size", `${state.fontSize}px`],
    ["max-width", `${state.width}px`],
    ...customProperties(state),
  ]
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  const keyframes =
    state.animation === "pulse"
      ? "@keyframes pulse {\n  50% {\n    opacity: 0.5;\n  }\n}\n\n"
      : "";
  return `${keyframes}.card {\n${declarations}\n}\n\n.avatar {\n  border-radius: ${state.avatarRadius}%;\n}`;
}

function html(state: Readonly<State>, loading: boolean) {
  const provider = loading
    ? "<nano-skeleton-provider loading>"
    : "<nano-skeleton-provider>";
  const dir = state.dir === "rtl" ? ' dir="rtl"' : "";
  /** The default style needs no value, and text is detected automatically */
  const style =
    state.inlineStyle === DEFAULT_INLINE_MODE
      ? ""
      : ` inline="${state.inlineStyle}"`;
  const linkAttributes = [
    state.linkMode === "inline" ? style || " inline" : "",
    state.interactive ? " interactive" : "",
  ].join("");
  return `${provider}
  <article class="card"${dir}>
    <nano-skeleton>
      <img class="avatar" src="/avatar.png" width="64" height="64" alt="" />
    </nano-skeleton>
    <h3><nano-skeleton${style}>Jane Cooper</nano-skeleton></h3>
    <p><nano-skeleton${style}>Senior product designer</nano-skeleton></p>
    <p>
      <nano-skeleton${style}>
        Designs calm, accessible interfaces and writes about the small
        details that make loading states feel fast.
      </nano-skeleton>
    </p>
    <nano-skeleton${linkAttributes}>
      <a href="/profile">View profile</a>
    </nano-skeleton>
    <nano-skeleton>
      <button type="button">Follow</button>
    </nano-skeleton>
  </article>
</nano-skeleton-provider>`;
}

function outputs(state: Readonly<State>): Record<string, string> {
  return {
    fontSizeOut: `${state.fontSize}px`,
    inlineRadiusOut: String(state.inlineRadius),
    letterSpacingOut: `${state.letterSpacing}em`,
    widthOut: `${state.width}px`,
    avatarRadiusOut: `${state.avatarRadius}%`,
    durationOut: `${state.duration}s`,
    bgSizeOut: `${state.bgSize}%`,
  };
}

/**
 * Doesn't wait for the elements to be defined: properties set before that are
 * applied once they are
 */
function initPlayground() {
  const form = document.querySelector<HTMLFormElement>("[data-pg-form]");
  const card = document.querySelector<SkeletonProvider>("[data-pg-card]");
  const link = document.querySelector<Skeleton>("[data-pg-link]");
  const htmlCode = document.querySelector("[data-pg-html]");
  const cssCode = document.querySelector("[data-pg-css]");
  const article = card?.querySelector("article");
  const texts = [...(card?.querySelectorAll<Skeleton>("[data-pg-text]") ?? [])];

  if (!form || !card || !link || !htmlCode || !cssCode || !article) {
    return;
  }

  function update() {
    if (!form || !card || !link || !htmlCode || !cssCode || !article) {
      return;
    }
    const values = new Map<string, string>();
    for (const [name, value] of new FormData(form)) {
      values.set(name, typeof value === "string" ? value : "");
    }
    const state = readState(values);

    card.style.setProperty("--pg-font-size", `${state.fontSize}px`);
    card.style.setProperty("--pg-width", `${state.width}px`);
    card.style.setProperty("--pg-avatar-radius", `${state.avatarRadius}%`);
    for (const name of CUSTOM_PROPERTIES) {
      card.style.removeProperty(name);
    }
    for (const [name, value] of customProperties(state)) {
      card.style.setProperty(name, value);
    }

    article.dir = state.dir;
    /** Removing the attribute lets the skeleton detect the default mode */
    for (const text of texts) {
      text.inline =
        state.inlineStyle === DEFAULT_INLINE_MODE
          ? undefined
          : state.inlineStyle;
    }
    link.inline = state.linkMode === "inline" ? state.inlineStyle : undefined;
    link.interactive = state.interactive;

    for (const [name, value] of Object.entries(outputs(state))) {
      const output = form.elements.namedItem(name);
      if (output instanceof HTMLOutputElement) {
        output.value = value;
      }
    }
    htmlCode.textContent = html(state, card.loading);
    cssCode.textContent = css(state);
    requestHighlight();
  }

  form.addEventListener("input", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  /** Reflect the "Loading" switch in the generated HTML */
  new MutationObserver(update).observe(card, {
    attributes: true,
    attributeFilter: ["loading"],
  });

  update();
}

export { initPlayground };
