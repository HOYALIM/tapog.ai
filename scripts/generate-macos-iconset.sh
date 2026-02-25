#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$ROOT_DIR/branding/source/logo-primary.png}"
OUT_DIR="$ROOT_DIR/assets/macos/tapog.iconset"

if [[ ! -f "$SRC" ]]; then
  echo "Source image not found: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

sizes=(16 32 64 128 256 512)
for size in "${sizes[@]}"; do
  sips -z "$size" "$size" "$SRC" --out "$OUT_DIR/icon_${size}x${size}.png" >/dev/null
  sips -z "$((size*2))" "$((size*2))" "$SRC" --out "$OUT_DIR/icon_${size}x${size}@2x.png" >/dev/null
done

sips -z 1024 1024 "$SRC" --out "$OUT_DIR/icon_512x512@2x.png" >/dev/null

echo "Generated: $OUT_DIR"
echo "To create .icns: iconutil -c icns '$OUT_DIR' -o '$ROOT_DIR/assets/macos/tapog.icns'"
