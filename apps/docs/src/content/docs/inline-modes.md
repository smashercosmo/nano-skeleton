---
title: Inline modes
order: 4
demo: inline-modes
---

The value of `inline` picks how the text is drawn while loading. It combines
two choices: one bar per line or one pill per word, and one gradient per line
or one gradient for the whole block.

<div class="table-wrap">

| `inline` value                    | Looks like                                                             |
| --------------------------------- | ---------------------------------------------------------------------- |
| `lines-bg-per-line` (the default) | One rounded bar per line, each with its own gradient.                  |
| `lines-bg-per-block`              | One bar per line, with a single gradient shimmering across all lines.  |
| `words-bg-per-line`               | One pill per word, with a gradient per line.                           |
| `words-bg-per-block`              | One pill per word, with a single gradient shimmering across all lines. |

</div>

A bare `inline`, an automatically detected inline mode (`inline="auto"`), or an
unknown value all mean `lines-bg-per-line`.

```html
<p>
  <nano-skeleton inline="words-bg-per-line">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </nano-skeleton>
</p>

<nano-skeleton inline="words-bg-per-block">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</nano-skeleton>
```

The default inline mode turns each line of text into a bar, preserving the text’s original font and wrapping behavior. Each bar is as tall as the font’s line box. See [Thinner bars](#thinner-bars-in-the-default-style) for how to make them thinner.

The other styles use a built-in variable font that renders every character as a solid bar, with the background clipped to the text. In `lines-bg-per-block` mode, spaces are rendered as bars too; in the `words-` modes, they remain gaps.

The fonts are approximately 1 KB and 3 KB, embedded in the package, and registered only when a skeleton using them first appears.

### Bar shape

The shape of the bars comes from custom properties. They're unitless numbers,
as the built-in font can't take lengths: sizes are in `em`, and the radius is
a fraction. Set them on the skeleton or on any ancestor.

<div class="table-wrap">

| Property                                | Default | Sets                                                                                                                       |
| --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--nano-skeleton-inline-glyph-width`    | `0.5`   | The width of a character, from `0.06` to `1.8`. Spaces get half of it, and wide characters, such as Chinese, twice as much |
| `--nano-skeleton-inline-ascent`         | `0.71`  | How far the bars reach above the baseline, from `0` to `1.5`. The default is about the cap height                          |
| `--nano-skeleton-inline-descent`        | `0`     | How far the bars reach below the baseline, from `0` to `1`                                                                 |
| `--nano-skeleton-inline-border-radius`  | `1`     | How round the bar ends are, from `0` (square) to `1` (fully round)                                                         |
| `--nano-skeleton-inline-baseline-shift` | `0`     | Moves the bars up, or down if negative, from `-0.3` to `0.3`. Not in the default style                                     |

</div>

```css
/* Wider and taller bars for a display font */
h1 {
  --nano-skeleton-inline-glyph-width: 0.6;
  --nano-skeleton-inline-ascent: 0.7;
}
```

### Thinner bars in the default style

The bars of the default style are as tall as the line box of your font, about
1.2em. For thinner bars, from the cap height down to the baseline, set
[`text-box`](https://developer.mozilla.org/docs/Web/CSS/text-box) on the
paragraph or heading around the skeleton. The skeleton picks it up from there:

```css
h3,
p {
  text-box: cap alphabetic;
}
```

`text-box` also trims the space above and below the paragraph itself, so do
this when your design is built for trimmed text. Try "Trim bars" in the demo
above.
