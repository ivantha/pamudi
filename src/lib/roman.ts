const NUMERALS = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
] as const

/**
 * Writes a positive integer as a Roman numeral.
 *
 * The design numbers things three ways and all three come through here: the
 * plates (I to VII), the five steps of the process, and the year span in the
 * page eyebrows. That last one is why this exists rather than the numerals
 * being typed into `data/` — a hand-written `MMXVIII – MMXXVI` is a string
 * somebody has to remember to change on the 1st of January, and the whole
 * point of the shared data files is that a fact is edited once.
 *
 * @param n A positive integer. Values below 1 return an empty string.
 */
export function roman(n: number): string {
    if (!Number.isFinite(n) || n < 1) return ""

    let rest = Math.floor(n)
    let out = ""

    for (const [value, numeral] of NUMERALS) {
        while (rest >= value) {
            out += numeral
            rest -= value
        }
    }

    return out
}
