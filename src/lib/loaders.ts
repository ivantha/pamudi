import fs from "node:fs/promises"
import path from "node:path"
import { parse } from "yaml"

const DATA_DIR = path.resolve("data")

/**
 * Reads one YAML file from `data/` and returns it as a single content entry.
 *
 * Used for site-wide singletons (personal details, contact links) that would be
 * awkward as MDX but should still be schema-validated by a content collection.
 *
 * @param file File name inside `data/`, e.g. `"personal.yaml"`.
 * @returns A one-element array shaped for an Astro content-collection loader.
 */
export async function loadYamlSingle(file: string) {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8")
    return [{ id: path.basename(file, ".yaml"), ...parse(raw) }]
}

/**
 * Reads one YAML file from `data/` whose top level is a list, and returns it
 * shaped for an Astro content-collection loader.
 *
 * Entries carry their own `id` where a stable one matters (experience roles);
 * otherwise the array index stands in, which is fine for lists that are only
 * ever read in order.
 *
 * @param file File name inside `data/`, e.g. `"experience.yaml"`.
 */
export async function loadYamlList(file: string) {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8")
    const parsed = parse(raw) as Array<Record<string, unknown>>
    return parsed.map((entry, i) => ({ id: String(entry.id ?? i), ...entry }))
}
