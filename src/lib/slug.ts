/**
 * Turns a product name from `data/systems.yaml` into its URL segment.
 *
 * The inventory has no `slug:` key on purpose. `data/` is shared with the Typst
 * CV, and a key only the website read would be a key the PDF could not check —
 * the same failure `groupSystems` in `src/lib/systems.ts` exists to avoid. The
 * product name is already the entry's identity in both consumers, so the URL is
 * derived from it rather than written down beside it.
 *
 * A consequence worth knowing before renaming a product: the URL changes with
 * it. That is the right trade for a site with thirteen of these and no
 * inbound links to protect, but it is a trade.
 *
 * @param product The `product` field, e.g. `"Photo-ID back-office"`.
 * @returns A lowercase, hyphenated segment, e.g. `"photo-id-back-office"`.
 */
export function systemSlug(product: string): string {
    return (
        product
            .toLowerCase()
            .normalize("NFKD")
            // Strip combining marks left behind by the decomposition above.
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
    )
}
