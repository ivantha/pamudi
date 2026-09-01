/**
 * Which consumer an entry in `data/*.yaml` is meant for.
 *
 * The Typst CV filters on `"cv"`, the website on `"web"`. An entry with no
 * `include_in` key belongs to both; `include_in: []` hides it everywhere while
 * keeping the record in the file.
 */
export type Variant = "cv" | "web"

type Item = Record<string, unknown>

/**
 * Whether an entry should render on the website.
 *
 * @param item Any entry loaded from `data/`.
 */
export function isWebVisible(item: Item): boolean {
    const tags = item.include_in
    if (tags == null) return true
    if (!Array.isArray(tags)) return false
    return tags.includes("web")
}

/**
 * Picks a field, preferring the variant-suffixed override.
 *
 * Deliberately different from Typst's `field()` in `cv/common/loaders.typ`:
 * that one has no cross-variant fallback, because a CV that silently borrows
 * the website's phrasing is a worse failure than a missing line. Here the
 * fallback is wanted — the site should render *something* rather than a gap.
 *
 * @param item Entry to read from.
 * @param key Base field name, e.g. `"role"`.
 * @param variant Which consumer's override to prefer.
 */
export function pickField(item: Item, key: string, variant: Variant = "web"): string | undefined {
    const other: Variant = variant === "web" ? "cv" : "web"
    const value = item[`${key}_${variant}`] ?? item[key] ?? item[`${key}_${other}`]
    return typeof value === "string" ? value : undefined
}
