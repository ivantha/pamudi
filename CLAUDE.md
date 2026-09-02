# CLAUDE.md

Guidance for Claude Code working in this repository. `README.md` covers what the
project is and how to run it; this file covers what is easy to break.

## What this is

Pamudi Dahanayake's personal website, design portfolio **and CV**. She is a
Senior UI/UX Engineer, so the craft of the site itself is part of what it says.

Two deliverables, one dataset: the Astro site at pamudi.com and a two-page Typst
CV served at `/cv/cv.pdf`. Both read `data/*.yaml`, so a job or a talk is edited
once. The CV lives in `cv/` and has **its own `CLAUDE.md`** covering the visual
system, the font-instancing rules and the two-page guard — read that before
touching anything under `cv/`.

## Stack

Astro 5, TypeScript, static output, zero client JS. MDX case studies in
`src/content/work/` with `zod` schemas in `src/content.config.ts`; plain SCSS,
no framework; pnpm on Node 22; `astro:assets` for every content image;
GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

This mirrors `../ivantha.github.io` deliberately — same runtime, package
manager, deploy shape, and the same YAML-plus-Typst CV arrangement, so one set
of habits maintains both sites. Read that repo before inventing a pattern here.
Where the two diverge: case studies are MDX rather than YAML data (a case study
is prose and images, not a list), images are the payload rather than an
afterthought, and the CV here has one variant, not three.

`pnpm build` **and** `pnpm dev` run `build:cv` first. Typst writes the PDF into
`public/cv/`, which Astro sweeps into `dist/`, and renders each page to
`src/assets/cv/page-N.png`, which `src/pages/cv.astro` displays. Both
directories are gitignored build artefacts, not sources — which is why `dev`
runs the CV build too: without it the `/cv` page has nothing to show and throws.

`/cv` shows the sheets as images rather than embedding the PDF. A browser's PDF
chrome inside an `<object>` is off-brand on a designer's site and renders as a
grey box on iOS; the renders come out of the same Typst compile as the
download, so the page and the file cannot be different documents.

If a contact form, gated NDA work, or anything else needs a server, that is the
signal to move hosting to Vercel — not to bolt a third-party form widget onto
Pages. Static Pages is the default until something real breaks it.

### The four pages

`/` (Work), `/systems`, `/about`, `/cv`, plus `/work/[slug]` for a published
case study and a `/404`. The home page carries the argument (hero, figures,
Profile, Practice, selected work, process, Toolkit, community); `/systems` is
the full inventory, grouped; `/about` is the career record. The inventory used
to sit on About and moved out in the Website v2 import, so a link to
`/about#systems` from anywhere is stale.

**`groupSystems` in `src/lib/systems.ts` deliberately duplicates `system-groups`
in `cv/common/loaders.typ`** — same tests, same order: `lead`, then an
`"Extended"` prefix, then an exact `"Contributed"`, then everything else. A
`group:` key in `data/systems.yaml` that only the website read would let the
PDF's grouping drift silently, which is the failure the shared-data arrangement
exists to prevent. Change one branch, change the other in the same commit.

## Domain

The site is **pamudi.com**, served by GitHub Pages. `public/CNAME` is what sets
that on the Pages side — the build copies it into `dist/`, and deleting it
un-sets the custom domain on the next deploy. Do not remove it while tidying
`public/`.

`base` is the default `/`, but internal links still go through `href()` in
`src/lib/url.ts`. Keep using it: Astro rewrites `src` on assets it processes and
never `href` on hand-written links, so a future move under a path would
otherwise mean hunting every link in the repo.

## Data is the single source of truth

`data/*.yaml` feeds both the website and the CV. Never put a fact in a
component, a page, or a `.typ` file.

| File              | Feeds                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `personal.yaml`   | site identity, hero, contact, CV masthead and Profile                                                                |
| `experience.yaml` | About-page roles, CV Experience                                                                                      |
| `systems.yaml`    | the Systems page inventory, and the CV's grouped table                                                               |
| `skills.yaml`     | Toolkit                                                                                                              |
| `projects.yaml`   | About-page "Earlier projects". **Website only** — no Typst file reads it                                             |
| `education.yaml`  | degrees + professional training                                                                                      |
| `community.yaml`  | speaking, mentoring, events, judging, competitions, and the website-only `writing`, `student_events` and `societies` |
| `private.yaml`    | phone number only. **Gitignored**, never in this repo                                                                |
| `site.yaml`       | the design's framing copy: hero lede, Practice, process, page ledes. **Website only**, and pending her sign-off      |

Two conventions, enforced by `zod` in `src/content.config.ts` and mirrored in
`cv/common/loaders.typ`:

- **`include_in: [cv, web]`** on any entry. Omit the key and it appears in both;
  `include_in: []` hides it everywhere while keeping the record. It also works
  on the lists nested inside a mapping — `education.entries` and the three dated
  lists in `community.yaml` — but those reach the PDF through `keep()` in
  `cv/common/loaders.typ` rather than `load-yaml-list`, so cv.typ has to call it
  explicitly or the two consumers drift.
- **Variant-suffixed overrides**: `role` is the default, `role_web` and `role_cv`
  override it.

Strings carry a two-token Typst markup subset, `*strong*` and `_emphasis_`,
rendered by `src/lib/markup.ts` on the web and `render-md` in Typst. Keep both
readers in mind: anything fancier renders on one side only.

### Which reads are filtered, and which are not

`include_in` is only honoured where the consumer actually applies it. On the
website, `isWebVisible` is applied everywhere. On the CV, `cv.typ` filters
`experience.yaml`, `systems.yaml` and `skills.yaml` through `load-yaml-list`,
its bullets through `bullets-for`, and `education.entries` plus the three dated
`community` lists through `keep()`. `judging` and `competitions` are prose
strings rather than lists and have no such switch — trim the string and keep
what you removed in a comment beside it.

The filters are per-call, not automatic. A **new** nested list reaching the PDF
needs its own `keep()` in `cv.typ`, or it renders unfiltered and can cost you
the two-page guard. So website-only material can go in `include_in: [web]` on a
filtered list — or, where it is a distinct section rather than a filtered-out
row, in a **new key** (`writing`, `student_events`, `societies`, all of which
`cv.typ` ignores because it names the keys it wants), a **new file**
(`projects.yaml`), or a **variant-suffixed override** (`dates_web`, which
`degree-args` never looks at). That is how the site carries the full record
while the CV stays at two pages.

`astro check` in `pnpm lint` validates every YAML file against its schema. It is
the only gate this repo has on the data — Typst will happily typeset a malformed
field and show you the damage in print.

### The private overlay

`data/private.yaml` holds her phone number and is **gitignored**. `cv/build.sh`
seeds it from the tracked `data/private.example.yaml` (empty) when missing, so a
local build produces a PDF with the number and CI produces one without. **This
repo is public.** Do not commit the number to fix a missing row in the deployed
PDF.

## Whose site this is

**Do not write Pamudi's copy.** Bio, project descriptions, role framing, client
names, and anything about what she did on a project come from her. Never replace
one with plausible-looking career history. Ask.

What that leaves, as of September 2026:

- **`data/site.yaml` is awaiting her sign-off.** It holds the framing copy that
  arrived with the Website v2 design: the hero lede, the four Practice cards,
  the five process steps, the Systems and About page ledes, the CV contents
  list and the footer standfirst. It says nothing the sourced data does not
  support, but the phrasing came from the design rather than from her, which is
  why it sits in its own file with the provenance in its header rather than
  being mixed into `personal.yaml`. **Do not extend it with invented copy** —
  strings enter it from a design she has approved, or from her.
- **`tagline`, `intro` and `availability` are optional and absent** from
  `data/personal.yaml`. Each has a verified fallback — the meta description is
  assembled from `role`, `location` and the first sentence of `summary`; the
  About opening falls back to `summary`, the Profile paragraph the CV also
  prints, and the hero lede goes to `site.yaml`'s line before `summary`. A
  placeholder that ships is worse than a field that is not there, so add them
  back only with her words in them.
- **`headline` is the one placeholder still on the page.** It is a layout
  stand-in and makes no claim about her career, which is why it survives.
- **The three case studies in `src/content/work/` are `draft: true`.** They are
  templates, not studies: publishing them would put `TODO` text and placeholder
  artwork on a public portfolio under her name. The home page's work section
  falls back to the three design systems she led from scratch and switches back
  to the case-study index by itself the moment one is published.
- **Everything else on the site is sourced.** The career record in `kb/` is the
  provenance for every fact in `data/`, reconciled from her 2018 CV, the
  2019–2025 Zone24x7 appraisals, a September 2026 update from her and a
  September 2026 project-description handover. Start at `kb/INDEX.md` and check
  a claim against it before adding one. It also carries the mapping from the
  anonymised descriptors in `data/` back to the real client and product names.
  **`kb/` is gitignored**, because this repo is public and the record holds those
  names, an employer's internal appraisal detail and her phone number; only
  `kb/README.md` is tracked. A fresh clone will not have it. Recover it from the
  frozen upstream snapshot at `~/Documents/archives/pamudi-cv-data-2026-09-02/`.

**Client work may be under NDA, and this repo is public.** Client and product
names are therefore anonymised to domain descriptors in `data/systems.yaml` and
`data/experience.yaml`, with the mapping back held in the gitignored
`kb/projects.md`. That is a precaution pending Pamudi's answer, not a settled
decision. See the callout at the top of `cv/CLAUDE.md`. Do not add an image,
name, or metric unless it is confirmed publishable, and do not de-anonymise an
entry without her.

One value on the page is still unconfirmed: the BSc, where LinkedIn and her 2018
CV disagree on both the degree name and the institution and no source gives an
end year. It carries a `⚠ CONFLICT` comment at `data/education.yaml`; leave it
until she settles it. The LinkedIn and Behance handles, her pre-2022 title and
the Zone24x7 start year were all verified on 2026-09-02 and now carry
`# Verified` comments instead. `kb/open-questions.md` has the rest.

## Writing style

Do not use em dashes in content. Use commas, semicolons, colons, parentheses, or
separate sentences instead.

## Visual system

**Currently: "Website v2"**, imported from the Claude Design project on
2026-09-02 and replacing the earlier Direction A ("Annual", Fraunces + Karla),
which is gone from the repo along with the two directions pitched beside it.

A printed sheet laid on a darker ground, banded with full-bleed ink sections.
Cormorant Garamond carries every heading, every numeral and every section label
(the labels in italic); Work Sans carries the text sizes. There is no ornament.

Three things do the structural work, and breaking any of them is what makes the
page stop looking like itself:

- **The sheet.** `.sheet` in `_base.scss` is a 1240px card holding the header,
  the page and the footer, so the dark bands can run edge to edge inside it. The
  shadow only appears once the viewport is wider than the sheet; below that
  there is no ground to cast onto.
- **The label rail.** `Row.astro` is a 180px italic label beside its content,
  and nearly every section on every page is one. That is what lines the pages up
  with each other and with the CV's `sec()`. Do not hand-roll a section.
- **Two palettes, not one.** Header, hero, "How it runs" and the footer are
  reversed out on `--dark`, and the paper palette's `--muted` measures 3.10:1
  there. `--on-dark-muted` is its counterpart. The contrast gate below covers
  both surfaces so this cannot be got wrong quietly.

Every colour, typeface, size and spacing value lives in `src/styles/_tokens.scss`,
one value per role. The display sizes are named for what each one sets rather
than as an abstract step scale, because the design uses eleven of them and means
all eleven. Change values there; do not introduce a second value for the same
role anywhere else.

Two rules that would hold in any direction:

- **Contrast is not a matter of taste.** `scripts/check-contrast.mjs` reads the
  palette out of `_tokens.scss` and fails `pnpm lint` if a pair drops below its
  floor. Add a pair to `PAIRS` when you add a colour role; do not silence it.
- **Pin the theme.** `src/styles/_base.scss` declares an explicit
  `background-color` _and_ a matching `color-scheme` on `html`. Without the
  pair, dark-mode browsers paint their own canvas and the ink lands on it at
  roughly 1.5:1. Keep those in sync with the `theme-color` meta tag in
  `src/layouts/Layout.astro` and with `public/manifest.json`.

Whether the site gets a dark mode at all is a real decision to make with her,
not a default to assume.

## Images

- Content images go in `src/assets/`, imported and rendered through
  `astro:assets`. `public/` is only for files that must keep an exact URL
  (favicon, `manifest.json`, `robots.txt`, downloadable PDFs).
- `src/assets/cv/` is the one exception to "sources live here": it holds
  generated page renders and is gitignored. `cv.astro` reaches them with
  `import.meta.glob` rather than named imports, so a missing render is an empty
  match — `astro check` in the lint job, which has no Typst, stays green — and
  the page throws a build-time error instead of shipping blank.
- **Commit reasonably-sized sources, not camera or Figma originals.** The build
  downscales; the repo keeps every byte forever. Cap committed sources at
  roughly 2× the largest rendered width.
- Every image needs real `alt` text, or `alt=""` when decorative. On a
  portfolio, "screenshot" is not alt text.
- `src/assets/work/placeholder-*.png` and `scripts/make-placeholders.mjs` are
  scaffolding. Delete both once real covers land.

## Fonts

Self-hosted in `src/assets/fonts/`, imported by relative path from
`src/styles/_fonts.scss` so Vite rewrites the URL with the base — an absolute
`/fonts/...` path breaks under a non-root `base`. Do not move them to the
Google Fonts CDN: on the sibling site that was the only render-blocking request
on the page.

The woff2 files are Google's own `latin` slices taken byte-for-byte and are not
subset. Both families are OFL-1.1 with a Reserved Font Name, so modifying the
binaries would force a family rename. Copy new versions in verbatim.

Three faces, both variable on `wght` alone: Cormorant Garamond roman and italic,
Work Sans roman. The Cormorant italic is a real face doing real work — every
section label is set in it — not a synthesised slant. Work Sans italic is
deliberately absent; nothing on the site asks for one. Both roman faces are
preloaded in `Layout.astro` because the sticky header sets one of each above the
fold on every page.

## Git workflow

Solo personal repo: **commit directly to `main`**, no PR ceremony.

**Do not create worktrees**, and do not switch or create branches, even when a
harness default or skill suggests isolating the work first. The only exceptions
are an explicit "use a worktree" or a named feature branch in the request.

Background sessions enforce worktree isolation until it is switched off in
`.claude/settings.json`:

```json
{ "worktree": { "bgIsolation": "none" } }
```

`.claude` is ignored by the global `~/.gitignore`, so that file is never
committed — recreate it after a fresh clone.

## pnpm

pnpm 11 gates postinstall scripts, and settings moved out of `package.json`.
The allowlist lives in `pnpm-workspace.yaml` under `allowBuilds`; `sharp` will
not build without it and the site will not build without `sharp`.
