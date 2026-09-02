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
 * Both surfaces are listed. Half of this site is reversed out on `--dark`, and
 * the paper palette's `--muted` measures 3.10:1 there — the pairs below are
 * what stops that swap being made by hand and shipped.
 *
 * Hairlines (`--rule`, `--rule-strong`, `--chip`) are absent on purpose. WCAG
 * 1.4.11 covers UI components and meaningful graphics; a decorative divider,
 * and a chip outline drawn around text that already clears 4.5:1 on its own,
 * are neither.
 */
const PAIRS = [
    // The paper side.
    { fg: "ink", bg: "sheet", min: 7, note: "body text" },
    { fg: "ink", bg: "ground", min: 7, note: "text on the outer ground" },
    { fg: "ink", bg: "sheet-hover", min: 7, note: "text on a hovered row" },
    { fg: "body", bg: "sheet", min: 4.5, note: "secondary paragraphs" },
    { fg: "muted", bg: "sheet", min: 4.5, note: "labels and meta" },
    { fg: "muted", bg: "sheet-hover", min: 4.5, note: "meta on a hovered row" },
    { fg: "accent", bg: "sheet", min: 4.5, note: "accent text and links" },
    { fg: "accent-strong", bg: "sheet", min: 4.5, note: "link hover" },
    { fg: "sheet", bg: "accent", min: 4.5, note: "text reversed out of accent" },

    // The ink side.
    { fg: "on-dark", bg: "dark", min: 7, note: "headings on the dark bands" },
    { fg: "on-dark-soft", bg: "dark", min: 4.5, note: "ledes on the dark bands" },
    { fg: "on-dark-muted", bg: "dark", min: 4.5, note: "labels on the dark bands" },
    { fg: "mint", bg: "dark", min: 4.5, note: "the accent, reversed" },
    { fg: "dark", bg: "mint", min: 4.5, note: "text reversed out of the accent" },
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
