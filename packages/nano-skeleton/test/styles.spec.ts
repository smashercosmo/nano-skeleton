import { describe, expect, it } from "vitest";

import {
  animatedProperties,
  boxDecorationBreak,
  get,
  ink,
  render,
  style,
} from "./helpers.js";

const ICON = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='green'/></svg>",
)}`;

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const INLINE_MODES = [
  { mode: "auto-detected", attribute: "" },
  { mode: "lines-bg-per-line", attribute: 'inline="lines-bg-per-line"' },
  { mode: "lines-bg-per-block", attribute: 'inline="lines-bg-per-block"' },
  { mode: "words-bg-per-line", attribute: 'inline="words-bg-per-line"' },
  { mode: "words-bg-per-block", attribute: 'inline="words-bg-per-block"' },
];

const FONT_MODES = INLINE_MODES.filter(
  ({ mode }) => mode !== "auto-detected" && mode !== "lines-bg-per-line",
);

const BLOCK_MODES = INLINE_MODES.filter(({ mode }) =>
  mode.endsWith("-bg-per-block"),
);

function textSkeleton(attribute: string, text: string) {
  return attribute.includes("-bg-per-block")
    ? `<nano-skeleton ${attribute}><span id="text" style="display: inline-block">${text}</span></nano-skeleton>`
    : `<nano-skeleton id="text" ${attribute}>${text}</nano-skeleton>`;
}

function pixels(value: string) {
  return Number(value.replace(/px$/v, ""));
}

describe("styles", () => {
  it("doesn't override the page's own shimmer keyframes", async () => {
    expect.assertions(1);

    await render(`
      <style>
        @keyframes shimmer { to { translate: 10px } }
        .own { animation: shimmer 1s paused }
      </style>
      <div class="own"></div>
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);
    expect(animatedProperties(".own")).toContain("translate");
  });

  it("uses custom properties set on the skeleton itself", async () => {
    expect.assertions(1);

    await render(`
      <style>.wide { --nano-skeleton-background-size: 50%; }</style>
      <nano-skeleton-provider loading>
        <p><nano-skeleton class="wide">Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").backgroundSize).toMatch(/^50%/v);
  });

  it("keeps the inherited letter-spacing in font-based styles", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p style="letter-spacing: 2px">
          <nano-skeleton inline="words-bg-per-line">Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("nano-skeleton").letterSpacing).toBe("2px");
  });

  /** The radius is a fraction from 0 to 1, the axis goes from 0 to 100 */
  it("sets the font's axes from the custom properties", async () => {
    expect.assertions(4);

    await render(`
      <nano-skeleton-provider loading>
        <p style="--nano-skeleton-inline-glyph-width: 1.2; --nano-skeleton-inline-ascent: 0.75; --nano-skeleton-inline-descent: 0.25; --nano-skeleton-inline-border-radius: 0.25">
          <nano-skeleton inline="words-bg-per-line">Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);
    const settings = style("nano-skeleton").fontVariationSettings;

    expect(settings).toMatch(/"wdth" 240\b/v);
    expect(settings).toMatch(/"ASCN" 750\b/v);
    expect(settings).toMatch(/"DESC" 250\b/v);
    expect(settings).toMatch(/"RADI" 25\b/v);
  });

  it.each(FONT_MODES)(
    "sets the shift axis from --nano-skeleton-inline-baseline-shift in $mode",
    async ({ attribute }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider loading>
          <p style="--nano-skeleton-inline-baseline-shift: -0.12">
            ${textSkeleton(attribute, "Text")}
          </p>
        </nano-skeleton-provider>
      `);

      expect(style("#text").fontVariationSettings).toMatch(/"SHFT" -120\b/v);
    },
  );

  /**
   * As in element mode, the skeleton is laid out as if it weren't there, so the
   * child stays the flex item
   */
  it.each(BLOCK_MODES)(
    "draws $mode on the skeleton's child",
    async ({ attribute }) => {
      expect.assertions(4);

      await render(`
        <style>
          .flex { display: flex; width: 300px }
           p { flex: 1; margin: 0 }
        </style>
        <nano-skeleton-provider loading>
          <div class="flex">
            <nano-skeleton ${attribute}><p>Text <b>bold</b></p></nano-skeleton>
          </div>
        </nano-skeleton-provider>
      `);

      expect(style("nano-skeleton").display).toBe("contents");
      expect(get("p").getBoundingClientRect().width).toBeCloseTo(300, 0);
      expect(style("p").backgroundClip).toBe("text");
      /** Firefox would leave the text of a hidden <b> out of the clip */
      expect(style("b").opacity).toBe("1");
    },
  );

  /** The default style's bars reach the page font's cap height */
  it("draws the bars up to about the cap height by default", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <nano-skeleton inline="lines-bg-per-block"><p>Text</p></nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("p").fontVariationSettings).toMatch(/"ASCN" 710\b/v);
  });

  it.each(FONT_MODES)(
    "makes every glyph as wide as --nano-skeleton-inline-glyph-width in $mode",
    async ({ attribute }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider loading>
          <p style="font-size: 100px; --nano-skeleton-inline-glyph-width: 1">
            ${textSkeleton(attribute, "Text")}
          </p>
        </nano-skeleton-provider>
      `);

      expect(get("#text").getBoundingClientRect().width).toBeCloseTo(400, 0);
    },
  );

  /**
   * Spaces are about as wide as real ones. In the lines font they're bars too,
   * so both fonts wrap text the same way.
   */
  it.each(FONT_MODES)(
    "makes spaces half as wide as the other glyphs in $mode",
    async ({ attribute }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider loading>
          <p style="font-size: 100px; white-space: nowrap; --nano-skeleton-inline-glyph-width: 1">
            ${textSkeleton(attribute, "A B")}
          </p>
        </nano-skeleton-provider>
      `);

      expect(get("#text").getBoundingClientRect().width).toBeCloseTo(250, 0);
    },
  );

  /**
   * Wide characters, such as CJK, get bars twice as wide as the rest, a full em
   * by default. Drawn with a fallback font instead, they'd be about 1em wide at
   * any glyph width.
   */
  it.each(FONT_MODES)(
    "draws wide characters with bars twice as wide in $mode",
    async ({ attribute }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider loading>
          <p style="font-size: 100px; white-space: nowrap; --nano-skeleton-inline-glyph-width: 1.2">
            ${textSkeleton(attribute, "Ab漢字")}
          </p>
        </nano-skeleton-provider>
      `);

      expect(get("#text").getBoundingClientRect().width).toBeCloseTo(720, 0);
    },
  );

  /**
   * The bar is the background of the skeleton's inline box, which covers the
   * font's content area. The bars are black on white, so the screenshot shows
   * where they are.
   */
  it("draws the bars of the default style over the box of the text", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading style="background: white; --nano-skeleton-background-image: linear-gradient(black, black)">
        <p style="font-size: 100px; line-height: 2; white-space: nowrap">
          <nano-skeleton>Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);
    const bar = await ink("p");
    const box = get("nano-skeleton").getBoundingClientRect();

    expect(Math.abs(bar.top - box.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(bar.bottom - box.bottom)).toBeLessThanOrEqual(1);
  });

  /**
   * The radius is a fraction: 1, the default, gives fully rounded ends even
   * with a line height smaller than the bar, and 0.25 a quarter of that radius.
   * At 20px with a line height of 1, a full radius is 0.75em, 15px.
   */
  it("rounds the bar ends of the default style by a fraction of a full radius", async () => {
    expect.assertions(2);

    await render(`
      <nano-skeleton-provider loading>
        <p style="font-size: 20px; line-height: 1; white-space: nowrap">
          <nano-skeleton id="round">Text</nano-skeleton>
          <nano-skeleton id="quarter" style="--nano-skeleton-inline-border-radius: 0.25">Text</nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);
    const { height } = get("#round").getBoundingClientRect();

    expect(pixels(style("#round").borderTopLeftRadius)).toBeGreaterThanOrEqual(
      height / 2,
    );
    expect(pixels(style("#quarter").borderTopLeftRadius)).toBeCloseTo(3.75, 1);
  });

  it.each(FONT_MODES)(
    "sets the roundness axis of $mode from the radius fraction",
    async ({ attribute }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider loading>
          <p style="--nano-skeleton-inline-border-radius: 0.5">
            ${textSkeleton(attribute, "Text")}
          </p>
        </nano-skeleton-provider>
      `);

      expect(style("#text").fontVariationSettings).toMatch(/"RADI" 50\b/v);
    },
  );

  it("hides text shadows and strokes", async () => {
    expect.assertions(3);

    await render(`
      <style>
        p {
          text-shadow: 1px 1px red;
          -webkit-text-stroke: 1px red;
        }
        button {
          text-shadow: 1px 1px red;  
        }
      </style>  
      <nano-skeleton-provider loading>
        <p>
          <nano-skeleton>Text</nano-skeleton>
        </p>
        <nano-skeleton>
          <button>Follow</button>
        </nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("p nano-skeleton").textShadow).toBe("none");
    expect(
      style("p nano-skeleton").getPropertyValue("-webkit-text-stroke-color"),
    ).toBe(TRANSPARENT);
    expect(style("button").textShadow).toBe("none");
  });

  /**
   * Images and SVGs are content, like the text. Other elements can't be hidden
   * as a whole (Firefox would drop their bars), so their borders and
   * backgrounds are made transparent instead.
   */
  it("hides images, SVGs and the decorations of elements inside inline text", async () => {
    expect.assertions(5);

    await render(`
      <nano-skeleton-provider loading>
        <p>
          <nano-skeleton>
            Press
            <kbd style="border: 1px solid rgb(255, 0, 0); background: rgb(0, 0, 255)">Ctrl</kbd>
            <img src="${ICON}" width="16" height="16" alt="" />
            <svg width="16" height="16"><rect width="16" height="16" /></svg>
            <b><img id="nested" src="${ICON}" width="16" height="16" alt="" /></b>
          </nano-skeleton>
        </p>
      </nano-skeleton-provider>
    `);

    expect(style("img").opacity).toBe("0");
    expect(style("svg").opacity).toBe("0");
    expect(style("#nested").opacity).toBe("0");
    expect(style("kbd").borderTopColor).toBe(TRANSPARENT);
    expect(style("kbd").backgroundColor).toBe(TRANSPARENT);
  });

  /**
   * Faked bold, italics and small caps would change the size of the bars, so
   * bold or small-caps text would wrap differently from regular text
   */
  it.each(FONT_MODES)(
    "draws bold and small-caps text with bars of the same width in $mode",
    async ({ attribute }) => {
      expect.assertions(2);

      await render(`
        <nano-skeleton-provider loading>
          <p style="font-size: 40px; white-space: nowrap">
            ${textSkeleton(attribute, "Text sample")}
          </p>
          <p style="font-size: 40px; white-space: nowrap; font-weight: bold; font-variant: small-caps">
            ${textSkeleton(attribute, "Text sample").replace('id="text"', 'id="styled"')}
          </p>
        </nano-skeleton-provider>
      `);

      expect(style("#styled").getPropertyValue("font-synthesis")).toBe("none");
      expect(get("#styled").getBoundingClientRect().width).toBeCloseTo(
        get("#text").getBoundingClientRect().width,
        0,
      );
    },
  );

  it("hides pseudo-elements of element-mode children but keeps their box", async () => {
    expect.assertions(5);

    await render(`
      <style>
        .icon::before { content: "x"; }
        .icon::after { content: "y"; }
      </style>
      <nano-skeleton-provider loading>
        <nano-skeleton>
          <button
            class="icon"
            style="border: 2px solid rgb(255, 0, 0); box-shadow: rgb(0, 0, 255) 0 2px 4px; outline: 3px solid rgb(0, 128, 0)"
          >Follow</button>
        </nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("button", "::before").opacity).toBe("0");
    expect(style("button", "::after").opacity).toBe("0");
    expect(style("button").borderTopColor).toBe("rgb(255, 0, 0)");
    expect(style("button").boxShadow).toContain("rgb(0, 0, 255)");
    expect(style("button").outlineColor).toBe("rgb(0, 128, 0)");
  });

  /**
   * Opacity does nothing on an element without a box, so what's inside a
   * `display: contents` wrapper has to be hidden itself
   */
  it("hides images inside a boxless wrapper of an element-mode child", async () => {
    expect.assertions(3);

    await render(`
      <nano-skeleton-provider loading>
        <nano-skeleton>
          <div>
            <span style="display: contents">
              <img id="wrapped" src="${ICON}" width="16" height="16" alt="" />
              <svg width="16" height="16"><rect width="16" height="16" /></svg>
            </span>
          </div>
        </nano-skeleton>
        <nano-skeleton>
          <img id="placeholder" src="${ICON}" width="16" height="16" alt="" />
        </nano-skeleton>
      </nano-skeleton-provider>
    `);

    expect(style("#wrapped").opacity).toBe("0");
    expect(style("svg").opacity).toBe("0");
    /** An image that is the skeleton's child is the placeholder itself */
    expect(style("#placeholder").opacity).toBe("1");
  });

  it("hides the list marker of an element-mode list item", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <ul>
          <nano-skeleton><li style="color: rgb(255, 0, 0)">Item</li></nano-skeleton>
        </ul>
      </nano-skeleton-provider>
    `);

    /** ::marker doesn't take opacity, but inherits the transparent text fill */
    expect(
      style("li", "::marker").getPropertyValue("-webkit-text-fill-color"),
    ).toBe(TRANSPARENT);
  });

  it("draws every line of inline text as a separate bar", async () => {
    expect.assertions(1);

    await render(`
      <nano-skeleton-provider loading>
        <p><nano-skeleton>Text</nano-skeleton></p>
      </nano-skeleton-provider>
    `);

    expect(boxDecorationBreak("nano-skeleton")).toBe("clone");
  });
});
