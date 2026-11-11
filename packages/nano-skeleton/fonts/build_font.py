"""
Build "Blocks" — a variable skeleton font.

Every non-space character is a solid block. Inside a word the blocks touch,
the first block gets rounded left corners, the last block rounded right
corners, a one-letter word gets all four corners rounded.

Axes (all controllable from CSS via font-variation-settings):
  wdth  12..360  (default 100)  letter width, % of 500 units  (also font-stretch)
  RADI  0..100   (default 40)   corner radius, % of half the block height (100 = pill)
  ASCN  0..1500  (default 710, about the cap height)  block top above baseline, font units
  DESC  0..1000  (default 0, sits on the baseline)  block bottom below baseline, font units
  SHFT  -300..300 (default 0)  moves the blocks up (or down, if negative), font units.
        It doesn't change the metrics, so the line and its baseline stay where
        they are, and the blocks can be put on the baseline of another font.

Word position is resolved with OpenType contextual alternates (calt + rclt),
so it works with plain text, copy/paste stays intact.

The whole Unicode range is mapped, except controls, surrogates and invisible
format characters. Letters are about as wide as an average letter of a text
font, and spaces half as wide, about as wide as a real space. Wide characters
(CJK, Hangul, kana, fullwidth forms, emoji) get blocks of a full em, 1000 units
at wdth 100. The cmap is a single format 13
subtable: each range of characters mapped to the same glyph takes 12 bytes.
"""
import io
from fontTools.fontBuilder import FontBuilder
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates
from fontTools.ttLib.tables import otTables
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.designspaceLib import DesignSpaceDocument, AxisDescriptor, SourceDescriptor
from fontTools import varLib
from fontTools.otlLib.builder import buildStatTable
from fontTools.cu2qu import curve_to_quadratic

FAMILY = "Blocks"
UPM = 1000
BASE_ADVANCE = 5.0  # advance = wdth * 5  → wdth 100 = 500 units
SPACE_ADVANCE = 2.5  # advance = wdth * 2.5 → wdth 100 = 250 units, for spaces
WIDE_ADVANCE = 10.0  # advance = wdth * 10 → wdth 100 = 1000 units, for wide characters

# The font's ascent and descent. In a line box, the baseline sits half the
# difference below its middle, 0.36em, about where common UI fonts put it
# (SF Pro 0.38em, Arial 0.35em, Verdana 0.4em), so a line of bars aligned to the
# top of the line sits about on the baseline of the text around it.
ASCENT = 1020
DESCENT = 300

AXES = [
    # tag, name, min, default, max
    ("wdth", "Width", 12, 100, 360),
    ("RADI", "Radius", 0, 40, 100),
    ("ASCN", "Ascent", 0, 710, 1500),
    ("DESC", "Descent", 0, 0, 1000),
    ("SHFT", "Shift", -300, 0, 300),
]
DEFAULTS = {a[0]: a[3] for a in AXES}

# ---------------------------------------------------------------- geometry
# Unit quarter circle around a corner at origin, from (0,-1) to (1,0),
# expressed as quadratic off-curve points + end point.
K = 0.5522847498
_unit = curve_to_quadratic([(0, -1), (0, -1 + K), (1 - K, 0), (1, 0)], 0.0005)
UNIT_OFF = _unit[1:-1]          # off-curve points (px, py)
UNIT_END = _unit[-1]            # (1, 0)


import os
# Letters inside a word overlap by OVERLAP units so no hairline seam shows
# between them. The overlap tab is inset by INSET units from the top and bottom
# edges: where two glyphs both paint a partially covered edge pixel, it would
# come out brighter/darker than the rest of the edge.
OVERLAP = int(os.environ.get("BLOCKS_OVERLAP", 30))
INSET = int(os.environ.get("BLOCKS_INSET", 8))


def corner_points(C, u, v, rx, ry, rounded):
    """Points for one corner. u = direction we arrive in, v = direction we leave.
    Unit coordinate (px, py) maps to C + px*v + py*u, x scaled by rx, y by ry."""
    def m(px, py):
        return (C[0] + rx * (px * v[0] + py * u[0]), C[1] + ry * (px * v[1] + py * u[1]))
    if not rounded:
        return [(C, 1)]
    pts = [(m(0, -1), 1)]
    pts += [(m(px, py), 0) for px, py in UNIT_OFF]
    pts.append((m(*UNIT_END), 1))
    return pts


def block_glyph(W, A, D, p, left_round, right_round):
    """p = radius as fraction (0..1) of half the block height."""
    H = A + D
    ry = p * H / 2
    if left_round and right_round:
        rx = p * W / 2          # one-letter word: never wider than half the letter
    else:
        rx = ry                 # circular corners on word ends
    pts = []
    # left side, going up
    if left_round:
        pts += corner_points((0, -D), (-1, 0), (0, 1), rx, ry, True)
        pts += corner_points((0, A), (0, 1), (1, 0), rx, ry, True)
    else:
        pts += [((0, -D), 1), ((0, -D + INSET), 1), ((-OVERLAP, -D + INSET), 1),
                ((-OVERLAP, A - INSET), 1), ((0, A - INSET), 1), ((0, A), 1)]
    # right side, going down
    if right_round:
        pts += corner_points((W, A), (1, 0), (0, -1), rx, ry, True)
        pts += corner_points((W, -D), (0, -1), (-1, 0), rx, ry, True)
    else:
        pts += [((W, A), 1), ((W, A - INSET), 1), ((W + OVERLAP, A - INSET), 1),
                ((W + OVERLAP, -D + INSET), 1), ((W, -D + INSET), 1), ((W, -D), 1)]
    g = Glyph()
    g.numberOfContours = 1
    g.coordinates = GlyphCoordinates([p_ for p_, _ in pts])
    g.flags = bytearray(f for _, f in pts)
    g.endPtsOfContours = [len(pts) - 1]
    from fontTools.ttLib.tables import ttProgram
    g.program = ttProgram.Program()
    g.program.fromBytecode(b"")
    return g


def shift(glyphs, offset):
    """Moves the outlines of the glyphs up by offset units. Only the outlines
    move: the metrics, and so the baseline, stay put."""
    for g in glyphs.values():
        if g.numberOfContours > 0:
            g.coordinates.translate((0, offset))


def empty_glyph():
    g = Glyph()
    g.numberOfContours = 0
    return g


GLYPHS = [".notdef", "space", "mark", "sq", "sq.init", "sq.medi", "sq.fina", "sq.isol",
          "space.wide", "sqw", "sqw.init", "sqw.medi", "sqw.fina", "sqw.isol"]
SHAPES = {  # left rounded, right rounded
    "sq": (False, False),
    "sq.medi": (False, False),
    "sq.init": (True, False),
    "sq.fina": (False, True),
    "sq.isol": (True, True),
}

# ---------------------------------------------------------------- cmap
SPACES = [0x0020, 0x00A0, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
          0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000]
WIDE_SPACES = [0x3000]  # ideographic space
MARK_RANGES = [(0x0300, 0x036F), (0x1AB0, 0x1AFF), (0x1DC0, 0x1DFF), (0x20D0, 0x20FF),
               (0xFE20, 0xFE2F), (0x0483, 0x0489),
               (0x1160, 0x11FF), (0xD7B0, 0xD7FF),  # Hangul Jamo vowels and finals
               (0x3099, 0x309A),  # combining kana voiced sound marks
               (0xFE00, 0xFE0F), (0xE0100, 0xE01EF)]  # variation selectors
# Never mapped: browsers handle them without a glyph
SKIPPED_RANGES = [
    (0x0000, 0x001F), (0x007F, 0x009F),  # controls
    (0xD800, 0xDFFF),  # surrogates
    (0x00AD, 0x00AD), (0x061C, 0x061C), (0x180E, 0x180E),  # invisibles
    (0x200B, 0x200F), (0x2028, 0x202E), (0x2060, 0x206F),
    (0xFEFF, 0xFEFF), (0xFFF9, 0xFFFB), (0xE0000, 0xE007F),
]
# East Asian wide and fullwidth characters
WIDE_RANGES = [
    (0x1100, 0x115F),  # Hangul Jamo initial consonants
    (0x2E80, 0x303E),  # CJK radicals, Kangxi radicals, CJK symbols and punctuation
    (0x3041, 0x33FF),  # kana, Bopomofo, Hangul compatibility Jamo, CJK compatibility
    (0x3400, 0x4DBF),  # CJK extension A
    (0x4E00, 0x9FFF),  # CJK unified ideographs
    (0xA000, 0xA4CF),  # Yi
    (0xA960, 0xA97F),  # Hangul Jamo extended A
    (0xAC00, 0xD7A3),  # Hangul syllables
    (0xF900, 0xFAFF),  # CJK compatibility ideographs
    (0xFE10, 0xFE19), (0xFE30, 0xFE6F),  # vertical and small forms
    (0xFF01, 0xFF60), (0xFFE0, 0xFFE6),  # fullwidth forms
    (0x1F300, 0x1F64F), (0x1F680, 0x1F6FF),  # emoji
    (0x1F900, 0x1F9FF), (0x1FA70, 0x1FAFF),
    (0x20000, 0x2FFFD), (0x30000, 0x3FFFD),  # CJK extensions B and later
]


def build_cmap(letter, letter_wide, space, space_wide):
    """Maps every character to one of the given glyphs, or to "mark" for
    combining characters, which take no space"""
    cmap = {cp: letter for cp in range(0x0020, 0x110000)}
    for a, b in WIDE_RANGES:
        for cp in range(a, b + 1):
            cmap[cp] = letter_wide
    for a, b in MARK_RANGES:
        for cp in range(a, b + 1):
            cmap[cp] = "mark"
    for a, b in SKIPPED_RANGES:
        for cp in range(a, b + 1):
            cmap.pop(cp, None)
    for cp in SPACES:
        cmap[cp] = space
    for cp in WIDE_SPACES:
        cmap[cp] = space_wide
    return cmap


def cmap_table(cmap):
    """A cmap with a single format 13 subtable. FontBuilder would write format 4
    and 12 subtables, which take an entry per character when many characters
    share a glyph."""
    subtable = CmapSubtable.newSubtable(13)
    subtable.platformID, subtable.platEncID, subtable.language = 3, 10, 0
    subtable.cmap = cmap
    table = newTable("cmap")
    table.tableVersion = 0
    table.tables = [subtable]
    return table


FEATURES = """
languagesystem DFLT dflt;
languagesystem latn dflt;
languagesystem cyrl dflt;
languagesystem grek dflt;

# narrow and wide letters take part in the same words
@ISOL = [sq.isol sqw.isol];
@INIT = [sq.init sqw.init];
@MEDI = [sq.medi sqw.medi];
@FINA = [sq.fina sqw.fina];

table GDEF {
  GlyphClassDef [sq sq.init sq.medi sq.fina sq.isol sqw sqw.init sqw.medi sqw.fina sqw.isol], , [mark], ;
} GDEF;

# 1) every letter starts out isolated (rounded on both sides)
lookup ToIsol { lookupflag IgnoreMarks; sub [sq sqw] by @ISOL; } ToIsol;
# 2) a letter followed by another letter is not the last one -> init
lookup ToInit { lookupflag IgnoreMarks; sub @ISOL' @ISOL by @INIT; } ToInit;
# 3) a letter preceded by a letter is not the first one -> medi / fina
lookup ToMediFina {
  lookupflag IgnoreMarks;
  sub [@INIT @MEDI] @INIT' by @MEDI;
  sub [@INIT @MEDI] @ISOL' by @FINA;
} ToMediFina;

feature calt { lookup ToIsol; lookup ToInit; lookup ToMediFina; } calt;
# rclt is "required": it keeps the shaping on even when a browser turns off
# optional contextual features (e.g. with letter-spacing).
feature rclt { lookup ToIsol; lookup ToInit; lookup ToMediFina; } rclt;
"""


def build_master(loc):
    W = loc["wdth"] * BASE_ADVANCE
    WW = loc["wdth"] * WIDE_ADVANCE
    A = loc["ASCN"]
    D = loc["DESC"]
    r = loc["RADI"] / 100

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(GLYPHS)
    # a placeholder: the variable font gets the full format 13 cmap in build()
    fb.setupCharacterMap({0x0020: "space"})

    glyf = {".notdef": block_glyph(W, A, D, 0, True, True),
            "space": empty_glyph(), "mark": empty_glyph(), "space.wide": empty_glyph()}
    for name, (lr, rr) in SHAPES.items():
        glyf[name] = block_glyph(W, A, D, r, lr, rr)
        glyf[name.replace("sq", "sqw", 1)] = block_glyph(WW, A, D, r, lr, rr)
    shift(glyf, loc["SHFT"])
    fb.setupGlyf(glyf)

    metrics = {}
    for name in GLYPHS:
        if name == "mark":
            adv = 0
        elif name.startswith("sqw") or name == "space.wide":
            adv = round(WW)
        elif name == "space":
            adv = round(loc["wdth"] * SPACE_ADVANCE)
        else:
            adv = round(W)
        g = fb.font["glyf"][name]
        g.recalcBounds(fb.font["glyf"])
        lsb = g.xMin if g.numberOfContours else 0
        metrics[name] = (adv, lsb)
    fb.setupHorizontalMetrics(metrics)

    fb.setupHorizontalHeader(ascent=ASCENT, descent=-DESCENT, lineGap=0)
    fb.setupNameTable({
        "familyName": FAMILY,
        "styleName": "Regular",
        "uniqueFontIdentifier": f"{FAMILY}-Regular-1.0",
        "fullName": f"{FAMILY} Regular",
        "psName": f"{FAMILY}-Regular",
        "version": "Version 1.000",
    })
    fb.setupOS2(
        sTypoAscender=ASCENT, sTypoDescender=-DESCENT, sTypoLineGap=0,
        usWinAscent=1500, usWinDescent=1000,
        # The x-height is the block top, so text-box: ex trims to it. The cap
        # height is 1 unit and doesn't vary, so text-box: cap trims to the
        # baseline in every browser: Chrome ignores MVAR for it, and a cap
        # height of 0 counts as missing.
        sxHeight=round(A + loc["SHFT"]), sCapHeight=1,
        fsSelection=0x40 | 0x80,  # REGULAR | USE_TYPO_METRICS
        usWeightClass=400, usWidthClass=5,
        achVendID="NONE", version=4,
    )
    fb.setupPost()
    import time
    from fontTools.misc.timeTools import timestampSinceEpoch
    ts = timestampSinceEpoch(int(time.time()))
    fb.setupHead(unitsPerEm=UPM, created=ts, modified=ts, flags=0x0001)
    addOpenTypeFeaturesFromString(fb.font, FEATURES)
    # roundtrip so the master is a clean TTFont
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

    # Geometry is linear and separable in every axis, so a default master
    # plus one master at each axis extreme reproduces it exactly.
    locations = [dict(DEFAULTS)]
    for tag, name, mn, df, mx in AXES:
        for v in (mn, mx):
            if v != df:
                loc = dict(DEFAULTS)
                loc[tag] = v
                locations.append(loc)

    # Radius is a percentage of block height (and width for one-letter words),
    # so geometry has RADI*ASCN, RADI*DESC and RADI*wdth terms: add the
    # corner masters that make those bilinear terms exact.
    ext = {t: (mn, mx) for t, n, mn, d, mx in AXES}
    for other in ("ASCN", "DESC", "wdth"):
        for rv in ext["RADI"]:
            for ov in ext[other]:
                loc = dict(DEFAULTS)
                loc["RADI"], loc[other] = rv, ov
                locations.append(loc)

    uniq = []
    for loc in locations:
        if loc not in uniq:
            uniq.append(loc)
    locations = uniq

    name_of = {a[0]: a[1] for a in AXES}
    for i, loc in enumerate(locations):
        s = SourceDescriptor()
        s.font = build_master(loc)
        s.location = {name_of[t]: v for t, v in loc.items()}
        s.name = f"master{i}"
        s.familyName = FAMILY
        s.styleName = "Regular"
        ds.addSource(s)

    vf, _, _ = varLib.build(ds, exclude=[])
    vf["cmap"] = cmap_table(build_cmap("sq", "sqw", "space", "space.wide"))
    buildStatTable(vf, [
        dict(tag=t, name=n, values=[dict(value=d, name="Regular", flags=0x2)])
        for t, n, mn, d, mx in AXES
    ])
    # named default instance
    out = os.environ.get("BLOCKS_OUT", "Blocks-VF")
    vf.save(out + ".ttf")
    vf.flavor = "woff2"
    vf.save(out + ".woff2")
    print("built", [a.axisTag for a in vf["fvar"].axes])


if __name__ == "__main__":
    build()
