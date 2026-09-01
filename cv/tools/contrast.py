#!/usr/bin/env python3
"""WCAG contrast audit for the CV palette.

Reads the hexes straight out of theme.typ so the audit can never drift from
what is actually rendered. Run after any palette change:

    python3 tools/contrast.py

Exits non-zero if any text colour fails AA against the ground it sits on.
"""
import re
import sys
from pathlib import Path

THEME = Path(__file__).resolve().parent.parent / "theme.typ"

# (foreground token, background token, smallest size it is used at, required ratio)
# `rule`, `rule-strong` and `band-rule` are deliberately absent: they draw
# hairlines, never type. Every other colour in theme.typ appears here.
PAIRS = [
    # the light ground
    ("ink",         "paper", "8.4pt body",         4.5),
    ("mute",        "paper", "6.1pt micro-label",  4.5),
    ("accent",      "paper", "6.1pt date stamp",   4.5),
    # the dark masthead band
    ("band-ink",    "band",  "31pt name",          4.5),
    ("band-mute",   "band",  "6.1pt micro-label",  4.5),
    ("band-accent", "band",  "6.1pt role label",   4.5),
    ("band-meta",   "band",  "6.6pt contact row",  4.5),
]


def channel(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour: str) -> float:
    h = hex_colour.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def ratio(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def main() -> int:
    source = THEME.read_text()
    tokens = dict(re.findall(r'#let ([\w-]+)\s*=\s*rgb\("(#[0-9A-Fa-f]{6})"\)', source))

    failed = False
    for fg, bg, usage, required in PAIRS:
        r = ratio(tokens[fg], tokens[bg])
        grade = "AAA" if r >= 7 else "AA" if r >= 4.5 else "AA-large" if r >= 3 else "FAIL"
        ok = r >= required
        failed |= not ok
        mark = " " if ok else "✗"
        print(f"{mark} {fg:11s} {tokens[fg]} on {bg:5s} {tokens[bg]}  "
              f"{r:5.2f}:1  {grade:8s}  ({usage})")

    if failed:
        print("\nA text colour fails AA at the size it is used. Darken it in theme.typ.",
              file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
