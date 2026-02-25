#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
VERSION="$(node -e "console.log(require('$ROOT_DIR/manifest.json').version)")"
ZIP_PATH="$DIST_DIR/tapog.ai-$VERSION.zip"

mkdir -p "$DIST_DIR"
rm -f "$ZIP_PATH"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

rsync -a \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'docs' \
  --exclude 'scripts' \
  "$ROOT_DIR/" "$TMP_DIR/extension/"

(
  cd "$TMP_DIR/extension"
  zip -qr "$ZIP_PATH" .
)

echo "$ZIP_PATH"
