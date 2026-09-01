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
| `personal.yaml`   | name, role, hero copy, contact, CV masthead, Profile                                                           |
| `experience.yaml` | roles and their bullets                                                                                        |
| `systems.yaml`    | the design-systems inventory                                                                                   |
| `skills.yaml`     | toolkit, grouped by category                                                                                   |
| `projects.yaml`   | the UCSC degree projects — website only                                                                        |
| `education.yaml`  | degrees and professional training                                                                              |
| `community.yaml`  | speaking, mentoring, events, judging, competitions, and — website only — writing, student events and societies |

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

## Adding a case study

Create `src/content/work/<slug>.mdx`. The frontmatter schema lives in
`src/content.config.ts` and the build fails on a missing field, so start by
copying an existing file.

```mdx
---
title: Queue-length forecasting
summary: One sentence on the problem and the outcome.
year: 2025
role: What you actually did
context: Team, company, or client
disciplines: ["Product design"]
tools: ["Figma"]
cover: "../../assets/work/queue-forecasting/cover.png"
coverAlt: Describe the image.
order: 10
---
```

Images go in `src/assets/work/` and are imported, never referenced by URL:

```mdx
import { Image } from "astro:assets"
import shot from "@/assets/work/queue-forecasting/flow.png"

<figure>
  <Image src={shot} alt="What the image shows." widths={[640, 960, 1400]} />
  <figcaption>Caption.</figcaption>
</figure>
```

`order` sets the sequence on the index page; `draft: true` keeps a study out of
the build entirely.

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

The hero headline in `data/personal.yaml`, and the three `draft: true` files in
`src/content/work/`, are placeholders waiting on Pamudi. Do not fill one in with
a plausible guess. `tagline`, `intro` and `availability` are hers too; they are
optional and currently absent, and every page falls back to verified material
rather than rendering a placeholder.
