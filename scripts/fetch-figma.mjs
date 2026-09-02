/**
 * Exports named nodes from the product Figma file into `src/assets/systems/`.
 *
 * This exists because the Figma MCP server's tool-call allowance on the Starter
 * plan runs out well before a design system's worth of boards is exported, and
 * because "which nodes, at what scale" is worth writing down once rather than
 * rediscovering. The REST image endpoint used here is a different quota from
 * the MCP one, so this keeps working when the MCP has stopped.
 *
 * Usage:
 *
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs            # everything pending
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs --all      # re-fetch, overwriting
 *   node scripts/fetch-figma.mjs --list                          # print the manifest, no token needed
 *
 * The token is a personal access token from figma.com → Settings → Security →
 * Personal access tokens, with **File content: Read-only** scope. It is free on
 * every plan. Do not commit it, and do not put it in `data/` — this repo is
 * public.
 *
 * NOTHING THIS SCRIPT DOWNLOADS IS PUBLISHABLE UNTIL IT HAS BEEN LOOKED AT.
 * See CLAUDE.md, "Whose site this is": every frame is checked for a client
 * logo, a product wordmark, and real customer data before it is committed, and
 * two frames from the first batch were dropped rather than published. A file
 * landing in `src/assets/` is the start of that check, not the end of it.
 */
import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

const FILE_KEY = "J9n3q2TRVcsh7HdKxV8Bd8"
const OUT_DIR = path.resolve("src/assets/systems/photo-id")

/**
 * The nodes worth having, with the scale each is rendered at.
 *
 * Scale is chosen per node so the committed PNG lands near 2× its largest
 * rendered width and no higher — the repo keeps every byte of a source forever
 * and the build downscales anyway. A 400px-wide control needs 3×; a 2272px
 * board needs less than 1×.
 *
 * `note` is what the node is, for whoever reads this next. It is not alt text:
 * alt text describes a specific rendering and belongs beside the figure.
 */
const NODES = [
    // ── The design system board, component by component ──────────────────────
    // Exporting the board whole gives one 2272×9735 strip nobody can read. The
    // components are the figures; the board is only useful as a contact sheet.
    { id: "4:24917", slug: "ds-typography", scale: 4, note: "Typography scale" },
    { id: "4:24951", slug: "ds-colour", scale: 2, note: "Colour palette" },
    { id: "4:25085", slug: "ds-button", scale: 2, note: "Button: size × style × state × label" },
    { id: "4:25022", slug: "ds-tabbar", scale: 3, note: "Tab bar, 2 to 5 tabs" },
    { id: "4:24988", slug: "ds-progressbar", scale: 3, note: "Progress bar, 0 to 100%" },
    { id: "4:25604", slug: "ds-textfield", scale: 3, note: "Text field" },
    { id: "4:25631", slug: "ds-select", scale: 3, note: "Select" },
    { id: "4:25655", slug: "ds-searchfield", scale: 3, note: "Search field" },
    { id: "4:25646", slug: "ds-stepper", scale: 4, note: "Stepper" },
    { id: "4:25497", slug: "ds-alert", scale: 2, note: "Alert" },
    { id: "4:25460", slug: "ds-keyboard", scale: 3, note: "Keyboard" },
    { id: "4:25765", slug: "ds-list", scale: 3, note: "List" },
    { id: "4:25810", slug: "ds-tablecell", scale: 3, note: "Table cell" },
    { id: "4:25872", slug: "ds-table", scale: 2, note: "Table" },
    { id: "4:25441", slug: "ds-sheet", scale: 1.5, note: "Sheet" },
    { id: "4:25254", slug: "ds-menu", scale: 1.5, note: "Menu" },
    { id: "4:24916", slug: "ds-board", scale: 0.5, note: "The whole board, as a contact sheet" },

    // ── The library sections beside it ───────────────────────────────────────
    { id: "4:24583", slug: "ds-icons", scale: 3, note: "The icon set, 44px grid" },
    { id: "4:24528", slug: "ds-flags", scale: 3, note: "Country flags" },
    { id: "4:24137", slug: "ds-modals", scale: 0.6, note: "Modal section" },
    // Photography, so the PII check matters more here than anywhere else: look
    // at every face before this one goes near a commit.
    { id: "4:24464", slug: "ds-imagery", scale: 0.5, note: "Imagery section" },

    // ── The screen the first export run never reached ────────────────────────
    { id: "4:23660", slug: "edit-photo", scale: 2, note: "Edit Photo screen" },
]

const args = new Set(process.argv.slice(2))

if (args.has("--list")) {
    for (const n of NODES) {
        console.info(`${n.slug.padEnd(18)} ${n.id.padEnd(10)} @${n.scale}x  ${n.note}`)
    }
    console.info(`\n${NODES.length} nodes. File key: ${FILE_KEY}`)
    process.exit(0)
}

const token = process.env.FIGMA_TOKEN
if (!token) {
    console.error(
        "FIGMA_TOKEN is not set.\n\n" +
            "Create one at figma.com → Settings → Security → Personal access tokens,\n" +
            "with File content: Read-only. Then:\n\n" +
            "  FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs\n\n" +
            "`node scripts/fetch-figma.mjs --list` prints the manifest without a token.",
    )
    process.exit(1)
}

const exists = async (p) =>
    access(p).then(
        () => true,
        () => false,
    )

await mkdir(OUT_DIR, { recursive: true })

// Skip what is already on disk unless asked to redo it, so a re-run after a
// partial failure costs only the nodes that failed.
const pending = args.has("--all")
    ? NODES
    : (
          await Promise.all(
              NODES.map(async (n) =>
                  (await exists(path.join(OUT_DIR, `${n.slug}.png`))) ? null : n,
              ),
          )
      ).filter(Boolean)

if (pending.length === 0) {
    console.info("Nothing pending. Pass --all to re-fetch everything.")
    process.exit(0)
}

// The endpoint takes one scale per request, so the batches are the distinct
// scales rather than a fixed page size.
const byScale = new Map()
for (const n of pending) byScale.set(n.scale, [...(byScale.get(n.scale) ?? []), n])

let written = 0
let failed = 0

for (const [scale, nodes] of byScale) {
    const ids = nodes.map((n) => n.id).join(",")
    const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`

    const res = await fetch(url, { headers: { "X-Figma-Token": token } })
    if (!res.ok) {
        console.error(`✗ @${scale}x request failed: ${res.status} ${res.statusText}`)
        failed += nodes.length
        continue
    }

    const body = await res.json()
    if (body.err) {
        console.error(`✗ @${scale}x: ${body.err}`)
        failed += nodes.length
        continue
    }

    for (const node of nodes) {
        const href = body.images?.[node.id]
        if (!href) {
            console.error(`✗ ${node.slug}: Figma returned no image for ${node.id}`)
            failed += 1
            continue
        }
        const img = await fetch(href)
        if (!img.ok) {
            console.error(`✗ ${node.slug}: download failed (${img.status})`)
            failed += 1
            continue
        }
        const buf = Buffer.from(await img.arrayBuffer())
        const out = path.join(OUT_DIR, `${node.slug}.png`)
        await writeFile(out, buf)
        console.info(
            `✓ ${node.slug.padEnd(18)} ${(buf.length / 1024).toFixed(0).padStart(5)} kB  ${node.note}`,
        )
        written += 1
    }
}

console.info(
    `\n${written} written, ${failed} failed, into ${path.relative(process.cwd(), OUT_DIR)}/`,
)
console.info(
    "Now LOOK at each one before committing: client logo, product wordmark, real\n" +
        "customer data. Drop anything redundant or visually thin rather than filling\n" +
        'a grid with it. See CLAUDE.md, "Whose site this is".',
)

if (failed > 0) process.exit(1)
