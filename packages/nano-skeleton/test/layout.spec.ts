import { describe, expect, it } from "vitest";

import { measureWhileLoading, render } from "./helpers.js";

const MODES = [
  { mode: "auto-detected", attribute: "" },
  { mode: "lines-bg-per-line", attribute: 'inline="lines-bg-per-line"' },
  { mode: "lines-bg-per-block", attribute: 'inline="lines-bg-per-block"' },
  { mode: "words-bg-per-line", attribute: 'inline="words-bg-per-line"' },
  { mode: "words-bg-per-block", attribute: 'inline="words-bg-per-block"' },
];

const LINE_HEIGHTS = ["normal", "1.5", "24px"];

const FONTS = ["serif", "sans-serif", "monospace"];

const CASES = MODES.flatMap(({ mode, attribute }) =>
  LINE_HEIGHTS.flatMap((lineHeight) =>
    FONTS.map((font) => ({ mode, attribute, lineHeight, font })),
  ),
);

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
          <p style="margin: 0; font: 16px/${lineHeight} ${font}">
            <nano-skeleton ${attribute}>Lorem ipsum<br />dolor sit<br />amet</nano-skeleton>
          </p>
        </nano-skeleton-provider>
      `);
      const { loaded, loading } = await measureWhileLoading("p");

      expect(loading.height).toBeCloseTo(loaded.height, 0);
    },
  );
});
