import { roman } from "@/lib/roman"

/**
 * The year span the page eyebrows print, in Roman numerals.
 *
 * The design sets "MMXVIII – MMXXVI" beside her role at the top of the home,
 * profile and contact pages. Both ends are derived rather than written down:
 * the start is the earliest year appearing in `data/experience.yaml`, and the
 * end is today. A hand-typed span is a string somebody has to remember to
 * change on the 1st of January, and the point of the shared data files is that
 * a fact is edited once.
 *
 * @param dates Every `dates` string in the experience record, in any format —
 *   only the four-digit years in them are read.
 * @returns The span, e.g. `"MMXVIII – MMXXVI"`.
 */
export function careerSpan(dates: string[]): string {
    const years = dates.flatMap((d) =>
        [...d.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0])),
    )
    const now = new Date().getFullYear()
    const start = years.length > 0 ? Math.min(...years) : now

    return `${roman(start)} – ${roman(now)}`
}
