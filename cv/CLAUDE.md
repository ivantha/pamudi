# CLAUDE.md

Guidance for Claude Code working in this repository.

## Working rules

Follow global instructions. Run focused checks of changed behavior and affected dependencies; ordinary web checks need one suitable local browser, with no blanket OS or architecture matrix. Project testing runs locally on the Mac; use UTM only for actual OS-specific needs. Preserve the separate ML worker workflow.

Before work, read the relevant sections of [the project reference](agent_reference.md) for commands, subsystem constraints and procedures. Its detailed rules still apply. Keep this file to essential instructions; update the reference when procedures change.

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

## Reference sections

[What this is](agent_reference.md#what-this-is) · [Build](agent_reference.md#build) · [File roles — keep these boundaries](agent_reference.md#file-roles--keep-these-boundaries) · [Content lives in /data/\*.yaml, shared with the website](agent_reference.md#content-lives-in-datayaml-shared-with-the-website) · [The private overlay](agent_reference.md#the-private-overlay) · [The visual system — "Band & Rule"](agent_reference.md#the-visual-system--band--rule) · [Colour](agent_reference.md#colour) · [Type](agent_reference.md#type) · [Line boxes — the thing that will bite you](agent_reference.md#line-boxes--the-thing-that-will-bite-you) · [Structure](agent_reference.md#structure) · [Components in `theme.typ`](agent_reference.md#components-in-themetyp) · [Where the vertical space is](agent_reference.md#where-the-vertical-space-is) · [Editorial decisions worth knowing](agent_reference.md#editorial-decisions-worth-knowing) · [The September 2026 seniority edit](agent_reference.md#the-september-2026-seniority-edit) · [Still owed by Pamudi](agent_reference.md#still-owed-by-pamudi) · [Earlier decisions, still standing](agent_reference.md#earlier-decisions-still-standing) · [Unverified facts — do not treat as settled](agent_reference.md#unverified-facts--do-not-treat-as-settled) · [Conventions](agent_reference.md#conventions)
