# CLAUDE.md

### Line boxes — the thing that will bite you

`theme.typ` therefore maps CSS line-height onto Typst's line box directly:
`lh(font, height)` returns `top-edge`/`bottom-edge` from `FONT-METRICS`, and
`par(leading)` is **zero**. Do not reintroduce `leading` to "fix" spacing — it
will pull the single-line rows back out of rhythm. Change `LH-BODY` instead.

Cormorant's default figures are **oldstyle** — `24` and `3` descend below the
baseline, `10` sits at x-height. That is the design's look, not a bug. Never
bottom-align a figure inside a fixed-height box: `stat-strip` lays numbers and
labels as two separate table rows so they share a baseline. This bug has been
fixed twice; don't reintroduce it.

### Where the vertical space is

**That slack is reserved, not spare.** It is what the outcome clauses will cost
when Pamudi supplies them (see "Still owed by Pamudi" below) — a bullet that
carries a consequence runs longer than one that names a deliverable. Do not
spend it on new sections.

## Reference

[Technical reference](agent_reference.md).
