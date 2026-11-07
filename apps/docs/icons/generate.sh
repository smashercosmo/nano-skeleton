#!/bin/sh
# Renders the raster favicons from app-icon.svg into ../public.
# Uses only tools that ship with macOS (qlmanage, sips) and python3.
# The output is committed, so this only needs to run when the icon changes.
set -eu

cd "$(dirname "$0")"
out=../public
tmp=$(mktemp -d "${TMPDIR:-/tmp}/icons.XXXXXX")

qlmanage -t -s 512 -o "$tmp" app-icon.svg >/dev/null
src="$tmp/app-icon.svg.png"

sips -z 512 512 "$src" --out "$out/icon-512.png" >/dev/null
sips -z 192 192 "$src" --out "$out/icon-192.png" >/dev/null
sips -z 180 180 "$src" --out "$out/apple-touch-icon.png" >/dev/null
sips -z 32 32 "$src" --out "$tmp/32.png" >/dev/null

# favicon.ico with a single embedded 32×32 PNG
python3 - "$tmp/32.png" "$out/favicon.ico" <<'EOF'
import struct, sys
png = open(sys.argv[1], "rb").read()
header = struct.pack("<HHH", 0, 1, 1)
entry = struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png), 6 + 16)
open(sys.argv[2], "wb").write(header + entry + png)
EOF

rm -rf "$tmp"
