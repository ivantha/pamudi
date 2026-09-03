const ONES = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
] as const

const TENS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
] as const

/**
 * Spells a small whole number as an English word.
 *
 * The design writes counts as words in its eyebrows and section notes —
 * "Thirteen of twenty-four products" — and those counts are derived from
 * `data/systems.yaml` and `data/personal.yaml` rather than typed into the copy,
 * so that adding a product cannot leave the page describing an inventory that
 * no longer exists. This is what turns the derived number back into the word
 * the design set.
 *
 * Only 0–99 are covered, which is every count this site can produce; anything
 * larger comes back as digits rather than as a wrong word.
 *
 * @param n The number to spell.
 * @param capital Capitalise the first letter, for the start of a sentence.
 */
export function spell(n: number, capital = false): string {
    if (!Number.isInteger(n) || n < 0 || n > 99) return String(n)

    const word =
        n < 20
            ? ONES[n]
            : n % 10 === 0
              ? TENS[Math.floor(n / 10)]
              : `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}`

    return capital ? word[0].toUpperCase() + word.slice(1) : word
}
