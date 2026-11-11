import { describe, expect, it } from "vitest";

import {
  getSkeleton,
  ink,
  measureWhileLoading,
  render,
  settle,
} from "./helpers.js";

const MODES = [
  { mode: "auto-detected", attribute: "" },
  { mode: "lines-bg-per-line", attribute: 'inline="lines-bg-per-line"' },
  { mode: "lines-bg-per-block", attribute: 'inline="lines-bg-per-block"' },
  { mode: "words-bg-per-line", attribute: 'inline="words-bg-per-line"' },
  { mode: "words-bg-per-block", attribute: 'inline="words-bg-per-block"' },
];

const LINE_HEIGHTS = ["normal", "1.5", "24px"];

const FONTS = ["serif", "sans-serif", "monospace"];

/**
 * In the "-bg-per-block" styles the skeleton's child is the placeholder, whose
 * lines are drawn with the built-in font. Its "normal" line height is the
 * font's, so it needs a number or a length.
 */
const CASES = MODES.flatMap(({ mode, attribute }) =>
  LINE_HEIGHTS.filter(
    (lineHeight) => !mode.endsWith("-bg-per-block") || lineHeight !== "normal",
  ).flatMap((lineHeight) =>
    FONTS.map((font) => ({ mode, attribute, lineHeight, font })),
  ),
);

/** A paragraph with forced lines, around or inside the skeleton */
function paragraph(attribute: string, lineHeight: string, font: string) {
  const style = `margin: 0; font: 16px/${lineHeight} ${font}`;
  const text = "Lorem ipsum<br />dolor sit<br />amet";
  return attribute.includes("-bg-per-block")
    ? `<nano-skeleton ${attribute}><p style="${style}">${text}</p></nano-skeleton>`
    : `<p style="${style}"><nano-skeleton ${attribute}>${text}</nano-skeleton></p>`;
}

/** The default style draws the page's own font, so it keeps its baseline */
const BASELINE_CASES = MODES.filter(
  ({ mode }) => mode === "auto-detected" || mode === "lines-bg-per-line",
).flatMap(({ mode, attribute }) =>
  ["normal", "1.2", "1.5"].flatMap((lineHeight) =>
    FONTS.map((font) => ({ mode, attribute, lineHeight, font })),
  ),
);

/**
 * The styles drawn with the built-in font get its baseline, and the shift moves
 * their bars onto the page font's
 */
const SHIFT_CASES = MODES.filter(
  ({ mode }) => mode !== "auto-detected" && mode !== "lines-bg-per-line",
).flatMap(({ mode, attribute }) =>
  ["normal", "1.2", "1.5"]
    .filter(
      (lineHeight) =>
        !mode.endsWith("-bg-per-block") || lineHeight !== "normal",
    )
    .flatMap((lineHeight) =>
      FONTS.map((font) => ({ mode, attribute, lineHeight, font })),
    ),
);

/**
 * A line of black bars on white at 100px, with an empty inline-block at the
 * end, which sits on the baseline of the text it's in. The link is drawn with
 * the built-in font too, so it mustn't make the line taller.
 */
function shiftedLine(attribute: string, lineHeight: string, font: string) {
  const style = `margin: 0; font: 100px/${lineHeight} ${font}; white-space: nowrap`;
  const text = `Lorem <a href="#">ipsum</a><i style="display: inline-block"></i>`;
  const line = attribute.includes("-bg-per-block")
    ? `<nano-skeleton ${attribute}><p style="${style}">${text}</p></nano-skeleton>`
    : `<p style="${style}"><nano-skeleton ${attribute}>${text}</nano-skeleton></p>`;
  return `
    <nano-skeleton-provider style="background: white; --nano-skeleton-background-image: linear-gradient(black, black)">
      ${line}
    </nano-skeleton-provider>
  `;
}

describe("layout", () => {
  /**
   * The lines are forced with <br>, so the text can't wrap differently: the
   * font-based styles approximate glyph widths, which is a separate concern
   */
  it.each(CASES)(
    "keeps the height of $mode text with line-height $lineHeight in $font",
    async ({ attribute, lineHeight, font }) => {
      expect.assertions(1);

      await render(`
        <nano-skeleton-provider>
          ${paragraph(attribute, lineHeight, font)}
        </nano-skeleton-provider>
      `);
      const { loaded, loading } = await measureWhileLoading("p");

      expect(loading.height).toBeCloseTo(loaded.height, 0);
    },
  );

  /**
   * At 100px, a baseline even a few hundredths of an em off shows. The link is
   * drawn with the built-in font too, so it mustn't make the line taller.
   */
  it.each(BASELINE_CASES)(
    "keeps the baseline of $mode text with line-height $lineHeight in $font",
    async ({ attribute, lineHeight, font }) => {
      expect.assertions(2);

      await render(`
        <nano-skeleton-provider>
          <p style="margin: 0; font: 100px/${lineHeight} ${font}; white-space: nowrap">
            <nano-skeleton ${attribute}>Lorem <a href="#">ipsum</a><i style="display: inline-block"></i></nano-skeleton>
          </p>
        </nano-skeleton-provider>
      `);
      /** An empty inline-block sits on the baseline of the text it's in */
      const baseline = await measureWhileLoading("i");
      const line = await measureWhileLoading("p");

      expect(baseline.loading.bottom).toBeCloseTo(baseline.loaded.bottom, 0);
      expect(line.loading.height).toBeCloseTo(line.loaded.height, 0);
    },
  );

  /**
   * The shift that puts the bars on the baseline is the distance between the
   * baselines of the built-in font and the page font. The screenshot shows
   * where the bars end.
   */
  it.each(SHIFT_CASES)(
    "puts the bars of $mode on the baseline with the shift, with line-height $lineHeight in $font",
    async ({ attribute, lineHeight, font }) => {
      expect.assertions(3);

      await render(shiftedLine(attribute, lineHeight, font));
      const baseline = await measureWhileLoading("i");

      const unshifted = await ink("p");

      expect(
        Math.abs(unshifted.bottom - baseline.loading.bottom),
      ).toBeLessThanOrEqual(1);

      const shift = (baseline.loading.bottom - baseline.loaded.bottom) / 100;
      getSkeleton().style.setProperty(
        "--nano-skeleton-inline-baseline-shift",
        String(shift),
      );
      await settle();

      const shifted = await ink("p");

      expect(
        Math.abs(shifted.bottom - baseline.loaded.bottom),
      ).toBeLessThanOrEqual(1);

      const line = await measureWhileLoading("p");

      expect(line.loading.height).toBeCloseTo(line.loaded.height, 0);
    },
  );
});
