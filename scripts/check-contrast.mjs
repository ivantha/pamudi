/**
 * Fails the build when a colour pair in the theme drops below its WCAG floor.
 *
 * Colours are read out of src/styles/_tokens.scss rather than duplicated here,
 * so a palette edit is checked automatically instead of being re-verified by
 * eye. Contrast on this site is not a matter of taste: a designer's portfolio
 * shipping unreadable text is the worst bug it can have.
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFile } from "node:fs/promises"

/**
 * Foreground/background token pairs, each with the ratio it must clear.
 *
 * Two grounds are listed: the paper the site is set on, and the panel a picture
 * or a hovered cell sits on. There is no reversed-out palette in this direction
 * — the only dark ground is `--plate-dark`, which is the background of a
 * screenshot and never carries type of ours.
 *
 * `--accent-bright` is checked at 3:1, not 4.5:1, because it is a large-text
 * colour by definition: the italic word inside a display heading, one of the
 * four headline figures, and the underline under the current nav item. Setting
 * a label, a caption or a paragraph in it is the misuse this floor is
 * documenting, not permitting — that brass is `--accent`, four steps darker,
 * and it clears 4.5:1 on both grounds.
 *
 * Hairlines (`--rule`, `--edge`) are absent on purpose. WCAG 1.4.11 covers UI
 * components and meaningful graphics; a divider between two rows of text that
 * each clear 4.5:1 on their own is neither.
 */
const PAIRS = [
    { fg: "ink", bg: "page", min: 7, note: "display, headings and row titles" },
    { fg: "ink", bg: "panel", min: 7, note: "text on a plate" },
    { fg: "body", bg: "page", min: 4.5, note: "running text and the quiet nav" },
    { fg: "body", bg: "panel", min: 4.5, note: "running text on a plate" },
    { fg: "muted", bg: "page", min: 4.5, note: "labels, meta and captions" },
    { fg: "muted", bg: "panel", min: 4.5, note: "captions on a plate" },
    { fg: "accent", bg: "page", min: 4.5, note: "links, rail labels, small brass" },
    { fg: "accent", bg: "panel", min: 4.5, note: "links over a hovered cell" },
    { fg: "accent-bright", bg: "page", min: 3, note: "display accent, large text only" },
    { fg: "page", bg: "ink", min: 4.5, note: "the solid button and the selection" },
    { fg: "page", bg: "accent", min: 4.5, note: "that button, hovered" },
]

const source = await readFile(new URL("../src/styles/_tokens.scss", import.meta.url), "utf-8")

/** Pulls `--name: #rrggbb;` declarations out of the token sheet. */
const tokens = Object.fromEntries(
    [...source.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]),
)

const channel = (c) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Relative luminance per WCAG 2.x. */
const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

let failed = false

for (const { fg, bg, min, note } of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
        console.error(`✗ missing token: --${fg} or --${bg}`)
        failed = true
        continue
    }
    const ratio = contrast(tokens[fg], tokens[bg])
    const ok = ratio >= min
    failed ||= !ok
    const line = `${ok ? "✓" : "✗"} ${fg} on ${bg}  ${ratio.toFixed(2)}:1 (needs ${min}:1) — ${note}`
    if (ok) {
        console.info(line)
    } else {
        console.error(line)
    }
}

if (failed) {
    console.error("\nContrast check failed. Fix the palette in src/styles/_tokens.scss.")
    process.exit(1)
}
