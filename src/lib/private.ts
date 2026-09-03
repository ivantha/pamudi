import fs from "node:fs/promises"
import path from "node:path"
import { parse } from "yaml"

/** Contact details that never enter this public repo. */
export interface Private {
    /**
     * Formatted for reading, spaces and all. Empty when unavailable.
     *
     * No example here on purpose: this file is tracked and the repo is public,
     * so a realistic-looking sample is one careless copy away from being the
     * real number. See `data/private.example.yaml`.
     */
    phone: string
}

/**
 * Reads the private contact overlay.
 *
 * `data/private.yaml` is gitignored and holds her phone number, so a local
 * build renders the Contact page's phone row and CI renders the page without
 * it — the same arrangement the Typst CV's masthead uses, seeded by
 * `cv/build.sh` from the tracked `data/private.example.yaml`.
 *
 * A missing file is not an error. It is the normal state of a fresh clone, and
 * the page simply drops the row. **This repo is public: do not close a missing
 * row by committing the number.**
 */
export async function loadPrivate(): Promise<Private> {
    try {
        const raw = await fs.readFile(path.resolve("data/private.yaml"), "utf-8")
        const parsed = (parse(raw) ?? {}) as Partial<Private>
        return { phone: typeof parsed.phone === "string" ? parsed.phone.trim() : "" }
    } catch {
        return { phone: "" }
    }
}
