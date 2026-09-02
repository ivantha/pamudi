import type { CollectionEntry } from "astro:content"

type System = CollectionEntry<"systems">

/** One band of the inventory: a rail label, its subtitle, and the rows under it. */
export interface SystemGroup {
    key: "owned" | "extended" | "contributed" | "further"
    label: string
    /** The two-line note under the label, or `undefined` where the label stands alone. */
    note?: string
    rows: System[]
}

/**
 * Groups the design-systems inventory into the four bands the page renders.
 *
 * The rule is deliberately identical to `system-groups` in
 * `cv/common/loaders.typ`, down to the order of the tests: `lead` wins, then an
 * "Extended" prefix, then an exact "Contributed", and everything left over is a
 * further engagement. Keeping the derivation in both consumers rather than
 * writing a `group:` key into `data/systems.yaml` is the point — a key only the
 * website read would let the PDF's grouping drift silently, which is the one
 * failure this repo's shared-data arrangement exists to prevent.
 *
 * If you change a branch here, change the Typst one in the same commit.
 *
 * @param systems Inventory entries, already filtered for web visibility.
 * @returns The non-empty groups, in reading order.
 */
export function groupSystems(systems: System[]): SystemGroup[] {
    const owned: System[] = []
    const extended: System[] = []
    const contributed: System[] = []
    const further: System[] = []

    for (const s of systems) {
        if (s.data.lead) owned.push(s)
        else if (s.data.scope.startsWith("Extended")) extended.push(s)
        else if (s.data.scope === "Contributed") contributed.push(s)
        else further.push(s)
    }

    return [
        { key: "owned", label: "Owned", note: "From scratch, end to end", rows: owned },
        { key: "extended", label: "Extended", note: "Inherited systems, grown", rows: extended },
        { key: "contributed", label: "Contributed", rows: contributed },
        {
            key: "further",
            label: "Further engagements",
            note: "Research and targeted work",
            rows: further,
        },
    ].filter((g) => g.rows.length > 0) as SystemGroup[]
}
