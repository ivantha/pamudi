# pamudi

Pamudi Dahanayake's portfolio site **and CV**. Astro 5 and Typst, static,
deployed to GitHub Pages at [pamudi.com](https://pamudi.com).

Both deliverables read one dataset. `data/*.yaml` is the single source of truth:
the website renders it, and the two-page Typst CV in `cv/` typesets it into
`/cv/cv.pdf`. Edit a job once and the page and the PDF both follow. The CV is on
the site as well as behind a download link: `/cv` shows both sheets, rendered
from the same compile as the file.

## Running it

```bash
pnpm install
pnpm dev      # http://localhost:14321
```

`pnpm dev` compiles the CV first, so it needs `typst` and `pdfinfo` (poppler)
too — without them there are no sheets for the `/cv` page to show:

```bash
brew install typst poppler
```

| Command                  | Does                                                    |
| ------------------------ | ------------------------------------------------------- |
| `pnpm dev`               | Compile the CV, then a dev server with hot reload       |
| `pnpm build`             | Compile the CV, then static build into `dist/`          |
| `pnpm build:cv`          | Just the CV — `public/cv/cv.pdf` and `src/assets/cv/`   |
| `pnpm preview`           | Serve the built output                                  |
| `pnpm lint`              | `astro check`, ESLint, Prettier, and the contrast check |
| `pnpm check:cv:contrast` | WCAG audit of the CV palette                            |
| `pnpm format`            | Rewrite files with Prettier                             |

## Editing content

Everything on the site and the CV comes from `data/`:

| File              | Holds                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `personal.yaml`   | name, role, contact, the four headline figures, CV masthead, Profile                                           |
| `experience.yaml` | roles and their bullets                                                                                        |
| `systems.yaml`    | the design-systems inventory                                                                                   |
| `skills.yaml`     | toolkit, grouped by category                                                                                   |
| `projects.yaml`   | the UCSC degree projects — website only                                                                        |
| `education.yaml`  | degrees and professional training                                                                              |
| `community.yaml`  | speaking, mentoring, events, judging, competitions, and — website only — writing, student events and societies |
| `site.yaml`       | every page's headline and framing copy — website only, and pending Pamudi's sign-off                           |

Three things to know when editing:

- **`include_in: [cv, web]`** picks where an entry shows. Leave the key off and
  it shows in both; `include_in: []` hides it in both without deleting it. It
  works on the top-level lists and on the nested ones — `education.entries` and
  the dated `community` lists — but the CV applies it per call, so a new nested
  list needs its own `keep()` in `cv.typ`. `judging` and `competitions` are
  prose strings, not lists, and have no such switch.
- **Variant suffixes.** `role` is the default, `role_web` and `role_cv` override
  it — that is how the site carries a longer date line than the PDF has room for.
- Text carries `*strong*` and `_emphasis_`. Both the website and Typst
  understand exactly those two, and nothing else.

Her phone number is **not** in this repo. It lives in `data/private.yaml`, which
is gitignored; `cv/build.sh` seeds an empty copy from `data/private.example.yaml`
when it is missing. So a local build puts the number on the PDF and the deployed
one has no phone row. That is deliberate: this repo is public.

## The CV

Source in `cv/`, with its own `README.md` and `CLAUDE.md`. It is a design
artefact in its own right, with a hard two-page budget the build enforces.

```bash
pnpm build:cv                # or: cd cv && ./build.sh
cd cv && ./build.sh --preview  # PNG proofs of both pages
```

## Adding a product page

Every product in `data/systems.yaml` already has a page at `/work/<slug>`,
whether or not anyone has written it. With no file it shows the sourced facts —
client, scope, what it was specified for — and says so.

To write one, create `src/content/systems/<slug>.mdx`. It is frontmatter only:
the Plinth design argues a case in a fixed set of parts, so the parts are fields
and `src/pages/work/[slug].astro` lays them out. `system` must match the
`product` field in `data/systems.yaml` exactly, or the build fails.

```mdx
---
system: Freight logistics cockpit
plate: 4 # the Roman numeral in the bar above the title
kind: owned # or `extended`, which sets a shorter title and a shorter page
eyebrow: Freight forwarding and 3PL · Global distribution network
title: # `after` carries its own leading space; a full stop attaches directly
  before: Freight logistics
  accent: cockpit
standfirst: One paragraph under the title.
meta: # the ink-ruled strip: three or four cells
  - label: Role
    value: Sole designer, system owner
index: # how it appears on /work; omit and it stays a row in the inventory
  summary: A longer blurb for the index.
  facts: [{ label: Stack, value: "Figma, specified for React" }]
  shape: wide # or `tall`, for a phone screen
  ground: panel # or `dark`, for a product drawn dark-first
  src: ../../assets/systems/freight-logistics-cockpit/racks.png
  alt: Describe the image.
figures:
  - layout: full # `full`, `split`, `split-end` or `pair`
    number: Figure 1
    title: Rack detection
    note: Location state across aisles and bays
    tall: true # cap the height so the caption stays on the fold
    src: ../../assets/systems/freight-logistics-cockpit/racks.png
    alt: Describe the image.
argument: # exactly two columns: problem and approach, or constraint and change
  - label: The problem
    lead: One line, set in the display face.
    paragraphs: ["…"]
  - label: The approach
    lead: One line.
    paragraphs: ["…"]
shipped: [{ term: Token set, text: "…" }] # owned systems only
related: [Precision agriculture app, Photo-ID compliance app]
---
```

A `split` figure sets its plate beside a three-row detail list; `shot: 19rem`
caps the screenshot so a phone screen stays phone-sized and sizes the column
around it. `split-end` is the same with the plate on the right. `pair` takes two
`items`, each with its own caption and paragraph. `draft: true` keeps a written
page out and leaves the sourced scaffold in its place.

`src/content/systems/photo-id-compliance-app.mdx` is the worked example, and its
header explains what may and may not go in one of these.

Pictures come out of the portfolio Figma file via `scripts/fetch-figma.mjs`,
which holds every page, every node, the scale each renders at, and what the last
review concluded about it:

```bash
node scripts/fetch-figma.mjs --list          # the manifest, no token needed
FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs
FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs --page extra
```

The token is a free read-only personal access token from figma.com → Settings →
Security. Files land in `staging/figma/`, which is gitignored: **look at every
one before moving it into `src/assets/`** — client logo, product wordmark, real
customer data, anyone in frame who did not agree to be on a public site — and
drop what is redundant rather than filling a grid with it. Then record the
verdict back in the script.

Exporting a UI screen needs Figma to rasterise a vector artboard, and that is
metered separately from reading the file. **That budget is currently spent**, on
the REST endpoint and the Figma MCP both, so the product pages cannot be
exported that way right now; the script says so when you try. The Figma web
app's own Export command is not metered and is how every screen on the site was
obtained. Pages made of uploaded bitmaps come through a different quota and
still work.

## Domain

The site is served from **pamudi.com** on GitHub Pages. `public/CNAME` holds the
domain and the build copies it into `dist/`; deleting that file un-sets the
custom domain on the next deploy.

DNS lives at Namecheap. The apex has four `A` records pointing at GitHub's Pages
addresses and `www` is a `CNAME` to `ivantha.github.io`. Namecheap's default
parking records must be removed or they win over these.

## Conventions

`CLAUDE.md` has the rules that are easy to break by accident — the data
contract, the theme, the fonts, the image discipline, and what not to write on
Pamudi's behalf. `cv/CLAUDE.md` covers the CV's visual system, its vendored
fonts and its two-page guard. Read both before making changes.

`data/site.yaml` and the seven written product pages carry writing that came
with the design rather than from Pamudi, and both are waiting on her sign-off.
Seven products have no page at all; that is the resting state, not a gap to fill
with a plausible guess. `tagline`, `intro` and `availability` are hers too; they
are optional and currently absent, and every page falls back to verified
material rather than rendering a placeholder.
