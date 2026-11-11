"""
Build "Blocks Solid": same metrics and axes as Blocks (minus the radius axis),
but no OpenType features. Every character, spaces included, is a square block,
so each line of text renders as one solid bar with square ends. Letters, spaces
and wide characters are as wide as in Blocks: spaces are half a letter, wide
characters a full em.

Axes:
  wdth  12..360  (default 100)  letter width, % of 500 units
  ASCN  0..1500  (default 710)  block top above baseline (about the cap height)
  DESC  0..1000  (default 0)    block bottom below baseline
  SHFT  -300..300 (default 0)   moves the blocks up, without changing the metrics
"""
import io
import os
import time

from fontTools import varLib
from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, SourceDescriptor
from fontTools.fontBuilder import FontBuilder
from fontTools.misc.timeTools import timestampSinceEpoch
from fontTools.otlLib.builder import buildStatTable
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import ttProgram
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates

import build_font
from build_font import (UPM, BASE_ADVANCE, SPACE_ADVANCE, WIDE_ADVANCE, ASCENT, DESCENT,
                        build_cmap, cmap_table, shift)

FAMILY = "Blocks Solid"
PS = "BlocksSolid"
# the axes of Blocks, without the radius
AXES = [axis for axis in build_font.AXES if axis[0] != "RADI"]
DEFAULTS = {a[0]: a[3] for a in AXES}

# Each block reaches OVERLAP units into the next one so no hairline seam shows
# between letters. The tab stops INSET units short of the top and bottom edges
# so partially covered edge pixels are not painted twice.
OVERLAP = 30
INSET = 8

GLYPHS = [".notdef", "sq", "mark", "sqw", "space"]


def program():
    p = ttProgram.Program()
    p.fromBytecode(b"")
    return p


def block(W, A, D):
    pts = [(0, -D), (0, A), (W, A), (W, A - INSET), (W + OVERLAP, A - INSET),
           (W + OVERLAP, -D + INSET), (W, -D + INSET), (W, -D)]
    g = Glyph()
    g.numberOfContours = 1
    g.coordinates = GlyphCoordinates(pts)
    g.flags = bytearray([1] * len(pts))
    g.endPtsOfContours = [len(pts) - 1]
    g.program = program()
    return g


def empty():
    g = Glyph()
    g.numberOfContours = 0
    return g


def master(loc):
    W = loc["wdth"] * BASE_ADVANCE
    WW = loc["wdth"] * WIDE_ADVANCE
    S = loc["wdth"] * SPACE_ADVANCE
    A, D = loc["ASCN"], loc["DESC"]
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(GLYPHS)
    # a placeholder: the variable font gets the full format 13 cmap in build()
    fb.setupCharacterMap({0x0020: "space"})
    glyphs = {".notdef": block(W, A, D), "sq": block(W, A, D), "mark": empty(),
              "sqw": block(WW, A, D), "space": block(S, A, D)}
    shift(glyphs, loc["SHFT"])
    fb.setupGlyf(glyphs)
    advances = {"mark": 0, "sqw": WW, "space": S}
    metrics = {}
    for n in GLYPHS:
        g = fb.font["glyf"][n]
        g.recalcBounds(fb.font["glyf"])
        metrics[n] = (round(advances.get(n, W)), g.xMin if g.numberOfContours else 0)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENT, descent=-DESCENT, lineGap=0)
    fb.setupNameTable({
        "familyName": FAMILY, "styleName": "Regular",
        "uniqueFontIdentifier": f"{PS}-Regular-1.0", "fullName": f"{FAMILY} Regular",
        "psName": f"{PS}-Regular", "version": "Version 1.000",
    })
    fb.setupOS2(
        sTypoAscender=ASCENT, sTypoDescender=-DESCENT, sTypoLineGap=0,
        usWinAscent=1500, usWinDescent=1000,
        # block top for text-box: ex, a fixed 1 unit for text-box: cap (see build_font.py)
        sxHeight=round(A + loc["SHFT"]), sCapHeight=1,
        fsSelection=0x40 | 0x80, usWeightClass=400, usWidthClass=5,
        achVendID="NONE", version=4,
    )
    fb.setupPost()
    ts = timestampSinceEpoch(int(time.time()))
    fb.setupHead(unitsPerEm=UPM, created=ts, modified=ts, flags=0x0001)
    buf = io.BytesIO()
    fb.font.save(buf)
    buf.seek(0)
    return TTFont(buf)


def build():
    ds = DesignSpaceDocument()
    for tag, name, mn, df, mx in AXES:
        a = AxisDescriptor()
        a.tag, a.name, a.minimum, a.default, a.maximum = tag, name, mn, df, mx
        ds.addAxis(a)
    # geometry is linear in each axis: default + one master per axis extreme
    locs = [dict(DEFAULTS)]
    for tag, name, mn, df, mx in AXES:
        for v in (mn, mx):
            if v != df:
                locs.append({**DEFAULTS, tag: v})
    names = {a[0]: a[1] for a in AXES}
    for i, loc in enumerate(locs):
        s = SourceDescriptor()
        s.font = master(loc)
        s.location = {names[t]: v for t, v in loc.items()}
        s.name, s.familyName, s.styleName = f"m{i}", FAMILY, "Regular"
        ds.addSource(s)
    vf, _, _ = varLib.build(ds, exclude=[])
    # spaces are blocks too, half as wide, so every character maps to a block
    vf["cmap"] = cmap_table(build_cmap("sq", "sqw", "space", "sqw"))
    buildStatTable(vf, [dict(tag=t, name=n, values=[dict(value=d, name="Regular", flags=0x2)])
                        for t, n, mn, d, mx in AXES])
    vf.save("BlocksSolid-VF.ttf")
    vf.flavor = "woff2"
    vf.save("BlocksSolid-VF.woff2")


if __name__ == "__main__":
    build()
