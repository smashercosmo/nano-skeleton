/**
 * Variable WOFF2 fonts that render text as solid bars: one continuous bar per
 * line (1212 bytes) or one pill per word (3100 bytes). Both have the axes
 * "wdth" (glyph width, 12–360, 100 = 0.5em, with spaces half and wide
 * characters such as CJK twice as wide), "ASCN" (bar top above the baseline,
 * 0–1500 thousandths of an em), "DESC" (bar bottom below the baseline, 0–1000)
 * and "SHFT" (moves the bars up without changing the metrics, −300–300). The
 * words font also has "RADI" (pill end roundness, 0–100). They cover the whole
 * Unicode range.
 *
 * They draw the "lines-bg-per-block" and "words-" inline styles. The default
 * style draws the page's own font.
 *
 * Built and embedded by the scripts in ../fonts, see its README.
 */
const FONTS = {
  lines: {
    family: "nano-skeleton-font-lines",
    data: "d09GMgABAAAAAAS8AA8AAAAAC/wAAARZAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0hWQVJyP01WQVKBGgZgP1NUQVRsAIZYL2AKgQB6MINAATYCJAMUCwwABCAFhFUHOBvkCkAeg+Pu0MISd4pJxIL3zxIP/+/vm/vc+/4wiH/EH+bDSjrF1AcWqVxKES26UEFSiXgXB/+Ph+/3a+f9XUySSvNMWto2bLp4gw3JIonpNOhilQ0NSmS6yQUnnA4w4oDCM95h/3Ms+d+9iufRn+4d4olHB16DR2E9v+dVw9kV6NKmI5pW6AQGPPTZdMP0AjBc0uctQB0ABDoITFZIJ9UJONlkSPaiJkmIRrGhDh8UXHqo3aiYSicSaBbq1x/uOjZPOLy6BTDn4cHY9pjPMxSSfHkx1/NvjFOkK9KpBgUCJ3j4H+Vb4qSxKvKl/0+ofZP7AyCdklAihGYF6gpcKZ3YPbY7MGV92sII8a/N1xJJWlacuTyyrFldaZxAkmxHiBojnSIkBqRsx/+O7dBBR8jzATNQokSBwbgBgafxNAo8g9cReJNUIcjIh5DIhyluQVDcSnE3EsU9NPVD0DSALhWCrui6CZmum+laIdENvTsi6N2Zvm8h6Ps2fSsk+mHAOwgGnGRAhcRADKoQlCjboaDsQjkSQTkx1fZAC2kjbCJtgsOk9+ED/RxgMGPCjWc14SZarkWm5TpaJiNomULLwxAegUchyR5jweP/wYI6CwLBQjz/hMzzz7yygeCVTV4pI/NKhdcCwev4/ByZzy/4/BLB51d8Hkj8gHMVgvO4UCFzEZcrBA00OiPR6EKjDzKNvjQGIWiUNCYi0WihcQiZxmEaDQQVKgiqoNqMTLWF6nsE1Q9UvyFT/U51DkF1SfonEOJf4swysjizIs6UEeJMRToTyOIscS4Q4jxxHsAF5oUjvHAsLsBFRhXyCan6w1T9yzAjQyZ1hDu5Cetr1ECLPyHF/9I91L5AF0mhjvoSfEgHbCd2QyzNhyCdovYNxJJ9CCD/AbGU33RDIMZBZFAD7VCgxDBAAUIgRHPYELWO2hftlEhdie1PcOqVgQ8jUPIL6fvLBIFCG5RqYDXGW2utO90BkwEnweRWY/0UbmpS6lA2puIGNQVkcdKmTFukKFJO0ZRuWvofs9dqroY6LKtVC3+tSGquZ3ml8JsEZ/z7A6Rx03b9PjZAV+so+E2gIKaqKWWye7J77kUgeGv6zjZ1Xf1Gzn/A7/2zDkumwh47hSyBYKulYbNUP+WbhJCtxX9IH8NxXUBa0yy6JOi3qDsjgdABAZI2OgiQ9dJdgELdGAFqOrpWgCbdzRMQ1GwUEKHJNgGRtLFHQGQ1h2VRtBV6O17DpJP7MZvgMSyM8h7W9PW3rMmIaFMI2sUkDB3iKkw6xaxc1i5W7FVbW/9OQf8OSF2jltjHw4Hxk+YWhrWXVH9mSD2AKlQaU3uPuGdK6165/kWh2nvd36mp9jtkm31alZY5ZL89tltqh12O22+Lo8MZWSfj4eLGm2SClqm2K/nBlXY4qtUehxxUGl8b6zBH6yp8l8fsNkWrbXY46JjpdtTDy+weDnb2kYR9NSJFjkJOraViXziTW0snAAAA",
  },
  words: {
    family: "nano-skeleton-font-words",
    data: "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",
  },
} as const;

type FontVariant = keyof typeof FONTS;

/** The fonts registered in each document */
const registered = new WeakMap<Document, Set<FontVariant>>();

/**
 * Registers a font used by the inline modes that draw text as bars, in the
 * skeleton's own document. Fonts added to `document.fonts` are also available
 * inside shadow roots, unlike `@font-face` rules in adopted stylesheets.
 */
function registerFont(variant: FontVariant, document: Document) {
  const variants = registered.get(document) ?? new Set<FontVariant>();
  const window = document.defaultView;
  if (variants.has(variant) || !window) {
    return;
  }
  const { family, data } = FONTS[variant];
  const bytes = Uint8Array.from(atob(data), (char) => char.codePointAt(0) ?? 0);
  /**
   * The text is transparent anyway, so blocking rendering until the font is
   * parsed avoids flashing a fallback font
   */
  const font = new window.FontFace(family, bytes, { display: "block" });
  document.fonts.add(font);
  variants.add(variant);
  registered.set(document, variants);
}

export { registerFont };
