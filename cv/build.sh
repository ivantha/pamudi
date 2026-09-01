#!/usr/bin/env bash
# Build the CV.
#
# Content comes from the repo-root data/*.yaml — the same files the website
# reads — so there is no selection step and no reconciliation ritual to run.
# What this still guards:
#
#   1. The PDF must be exactly two pages. Page 2 runs with little headroom, so
#      an innocuous edit to data/ can silently push a third page.
#   2. The private contact overlay must exist. data/private.yaml is gitignored;
#      a fresh clone (and every CI run) gets the empty template instead, so the
#      published PDF carries no phone number while a local build does.
#
# It also renders each page to src/assets/cv/page-N.png, which is what the
# website's /cv page displays. Those are build artefacts, gitignored like the
# PDF, and they come out of the same compile — so the pages on the site cannot
# show a different CV from the one the download link hands over. The PPI is set
# for a ~640 px rendered width at 2x; Astro re-encodes to AVIF/WebP from there.
#
# Typst is given `--root ..` so that `yaml("/data/…")` inside cv.typ resolves
# against the repo root. Fonts are vendored as static instances under fonts/
# and passed with --font-path, so the build depends on nothing installed on the
# machine.
#
# Usage:
#   ./build.sh                       compile to public/cv/cv.pdf and check
#   ./build.sh --preview             also write cv/preview-N.png design proofs
#   ./build.sh --out PATH            write the PDF somewhere else
#   ./build.sh --no-images           skip the src/assets/cv/ page renders
set -euo pipefail
cd "$(dirname "$0")"

WANT_PAGES=2
OUT=../public/cv/cv.pdf
PAGES_DIR=../src/assets/cv
PAGES_PPI=160
preview=false
images=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview)   preview=true; shift ;;
    --no-images) images=false; shift ;;
    --out)       OUT="$2"; shift 2 ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
done

# Seed the private overlay from the tracked template when it is absent, so a
# fresh clone and CI both build without a manual step.
if [[ ! -f ../data/private.yaml ]]; then
  cp ../data/private.example.yaml ../data/private.yaml
  echo "· seeded data/private.yaml from the template (no phone number)"
fi

mkdir -p "$(dirname "$OUT")"
typst compile --root .. --font-path fonts cv.typ "$OUT"
got=$(pdfinfo "$OUT" | awk '/^Pages:/ {print $2}')

if [[ "$got" != "$WANT_PAGES" ]]; then
  echo "✗ $OUT is $got pages, expected $WANT_PAGES." >&2
  echo "  Page 2 has overflowed. Trim data/*.yaml, or adjust the metrics in" >&2
  echo "  theme.typ (table inset, sec 'after', dated spacing) — see CLAUDE.md." >&2
  exit 1
fi

echo "✓ $OUT — $got pages"

# Page renders for the website's /cv page. Cleared first so a CV that ever loses
# a page cannot leave a stale third image behind for Astro to pick up.
if $images; then
  mkdir -p "$PAGES_DIR"
  rm -f "$PAGES_DIR"/page-*.png
  typst compile --root .. --font-path fonts cv.typ "$PAGES_DIR/page-{p}.png" --ppi "$PAGES_PPI"
  echo "✓ $PAGES_DIR/page-1.png … page-$got.png"
fi

if $preview; then
  rm -f preview-*.png
  typst compile --root .. --font-path fonts cv.typ "preview-{p}.png" --ppi 130
  echo "✓ preview-1.png, preview-2.png"
fi
