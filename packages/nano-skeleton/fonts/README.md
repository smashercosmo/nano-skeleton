# Fonts

Sources of the two variable fonts embedded in `src/fonts.ts`:

- `build_font.py` builds "Blocks" (`Blocks-VF.woff2`), the words font: one
  pill per word, with rounded ends from contextual alternates.
- `build_solid_font.py` builds "Blocks Solid" (`BlocksSolid-VF.woff2`), the
  lines font: spaces are blocks too, so a whole line becomes one bar.
- `embed.py` writes both into `src/fonts.ts` as base64, and into
  `src/fonts.css` as `@font-face` rules for the standalone stylesheet.

```sh
cd packages/nano-skeleton/fonts
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python build_font.py
.venv/bin/python build_solid_font.py
.venv/bin/python embed.py
```

Keep in mind when changing them:

- At `wdth` 100, letters are 0.5em, spaces 0.25em and wide characters 1em.
  `src/styles.css` maps `--nano-skeleton-inline-glyph-width` to `wdth` as
  em × 200, so change both together.
- The ascent and descent are 1.02em and 0.3em. The bars are only painted
  within this content area. The styles aligned to the top of the line put the
  baseline where these metrics do: 0.36em below the middle of the line, about
  where common UI fonts put it.
- The `SHFT` axis moves every point of every bar by the same amount and
  leaves the metrics alone, so the bars move while the line and its baseline
  stay put. It puts the bars on the page font's baseline.
- The bars reach 0.71em above the baseline by default, about the cap height,
  like the bars of the default style. The default of `--nano-skeleton-inline-ascent`
  in `src/styles.css` is the same.
- The cmap is a single format 13 subtable, which maps a whole range of
  characters to one glyph in 12 bytes. FontBuilder's default format 4 and 12
  subtables take an entry per character, which would make the full Unicode
  coverage several megabytes.
- The tests in `test/styles.spec.ts` and `test/layout.spec.ts` check the bar
  sizes, line heights and baselines, so run them after embedding new fonts.
