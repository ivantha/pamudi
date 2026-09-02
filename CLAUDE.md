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

Astro 5, TypeScript, static output, zero client JS. MDX in
`src/content/` — case studies under `work/`, system project pages under
`systems/` — with `zod` schemas in `src/content.config.ts`; plain SCSS, no
framework; pnpm on Node 22; `astro:assets` for every content image; GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`.

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

### The pages

`/` (Work), `/systems`, `/about`, `/cv`, plus `/systems/[slug]` for every
product in the inventory, `/work/[slug]` for a published case study, and a
`/404`. The home page carries the argument (hero, figures, Profile, Practice,
selected work, process, Toolkit, community); `/systems` is the full inventory,
grouped; `/about` is the career record, and carries the three picture sets
(Event design, the Community photographs, Sketches and paintings) through
`Gallery.astro`. The inventory used to sit on About and moved out in the Website
v2 import, so a link to `/about#systems` from anywhere is stale.

**`/systems/[slug]` builds a page for every entry in `data/systems.yaml`,
written or not.** The slug is derived from `product` by `systemSlug` in
`src/lib/slug.ts` rather than stored — the inventory is shared with the Typst
CV, and a `slug:` key only the website read is the same drift risk as a
`group:` key. Renaming a product therefore changes its URL.

A product's long-form page is an optional MDX file in `src/content/systems/`
whose `system:` field must match `product` exactly; the build throws on a file
that names a product the inventory does not have. With no file, the page
renders the sourced facts and the prev/next pair and stops there, and its
status bar says so. **That is the resting state, not a stub to fill with
plausible-sounding prose** — seven of the thirteen are deliberately in it. See
"Whose site this is".

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

**One standing exception, granted by Oshan on 2026-09-03: the system pages.**
He cleared writing the `src/content/systems/*.mdx` prose from the sourced
record. That is a licence to write, not a licence to invent, and the standard
the photo-ID page already set still binds every one of them: scope claims come
from the appraisal record via `kb/projects.md` and are never paraphrased upward,
everything else describes what is visibly in the screens beside it, and there
are no outcomes, metrics or adoption claims anywhere, because no source carries
any. Each file's header states which is which. These pages are still hers to
correct.

What that leaves, as of September 2026:

- **`data/site.yaml` is awaiting her sign-off.** It holds the framing copy that
  arrived with the Website v2 design and carried over into Grid: the hero lede,
  the four Practice cards,
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
- **Six of the thirteen system pages are written; seven are not.** Written, all
  with screens: photo-ID compliance app, freight logistics cockpit, precision
  agriculture app, manufacturing warehouse app, warehouse management platform,
  mining-site tool platform. The other seven render their sourced facts and say
  so in the status bar, which remains the intended resting state rather than a
  stub to fill. Six of the seven have no design file on the Figma document at
  all, so nothing could illustrate them even in principle; the seventh is the
  consumer delivery platform, below.
- **The written pages are not hers yet.** Their prose is of two kinds and no
  third: scope claims lifted from the appraisal record via `kb/projects.md`, and
  description of what is visibly in the screens beside them. No outcomes, no
  metrics, no adoption claims, because no source carries any. Each file's header
  states this; treat them the way `data/site.yaml` is treated, and read the
  header before extending one.
- **Consumer delivery platform will stay unwritten unless she says otherwise,
  and the reason is not a technical one.** Her recorded scope there is UX and
  accessibility research, not UI ownership. Publishing that product's screens
  would claim a contribution the record does not support, which is a worse
  failure than an empty page.
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

The photo-ID screens are the first images to pass that test, and how they passed
is the procedure for the next set. Each frame was rendered and looked at before
it was committed, and each was checked for three things: a client logo or
product wordmark anywhere in the pixels, a real customer's data, and a name that
would defeat the anonymisation. All ten came back clean — the session label is
"1-4-24-John Doe", the phone number is a placeholder in the design file, and the
product name exists only as a Figma layer name, never on screen. **The exported
frame is the artefact, not the Figma page title**: publishing a frame whose
layer name is the client's product is fine, publishing the name is not. Two
frames were dropped rather than published, one a duplicate and one visually
thin; do the same rather than filling a grid.

The second batch, 2026-09-02, is why the check is not a formality. Of 22
exported nodes, **one carries the client's product name in plain text**: the
modal board has an application-version row reading "ezPassport Studio 1.3.0"
and an address row naming the company, with a printer serial and two unmasked
phone strings beside them. Publishing it would undo the whole site's
anonymisation in one image. It is recorded as `verdict: "blocked"` in
`scripts/fetch-figma.mjs`, which never fetches it, and the reason is written
beside it — a finding like that belongs in the tool that would otherwise
re-acquire it, not only in a commit message. Fifteen more were clean but not
worth a figure and are marked `dropped`; six are on the page.

The third pass, 2026-09-03, went through the other fourteen pages of the file
and found the same thing twice more, in a different register. On the
volunteering page, **two frames display other people's names**: a virtual-event
participant grid, and a promotional card whose embedded call strip carries five
attendees in full. Both are `blocked`. Nine more are clean group and workshop
photographs, dropped because each is a room of identifiable people who did not
agree to appear here and none shows anything the four published frames do not.
On the freelance page, **all nine pieces carry the client's wordmark** —
`data/experience.yaml` anonymises that client to "Indonesian consumer brand", so
publishing the artwork names it. They are blocked for that reason alone, which
is a decision for Pamudi rather than a defect: one word from her turns them into
a portfolio section, and the anonymisation should be lifted in the same commit.

What that pass did publish: five pieces of IEEE student-conference identity work
(`src/assets/event-design/`), four photographs of speaking and mentoring
(`src/assets/community/`), and eight of her own drawings and paintings
(`src/assets/art/`). The section that holds the last of those takes its name,
"Sketches and paintings", from her own label on the Figma page — the categories
there are hers, so the section is her idea rather than an invention. A sixth
IEEE piece was dropped for a reason worth repeating: it is clean, and probably
hers, but `data/community.yaml` carries no credit for that event, and
publishing it would assert one.

**The fourth pass, 2026-09-03, exported the product pages and is where the UI
screens came from.** Both API raster routes were still spent, so the export went
through the Figma web app's own Export command instead, which is not metered:
1,047 frames across twelve pages, into `staging/figma/`. Twenty-two are now
published, across five products. The findings are recorded per page as a
`review` note in `scripts/fetch-figma.mjs`, and they are the useful part:

- **Freight logistics cockpit and precision agriculture app were clean as
  exported.** The cockpit brands itself "COCKPIT APP" rather than with the
  client's name, and the agriculture app's demo facility is "Vandelay
  Industries", a placeholder. Neither needed a redaction.
- **Manufacturing warehouse app and warehouse management platform are clean
  below the login screen.** Every login carries the client logo or the product
  wordmark and none is published; the inner screens carry neither.
- **The mining-site tool platform screens are redacted**, the first on this
  site. The client's mark sits in the sidebar of every screen in that module and
  one title repeated it. See the Images section for the rule.
- **One frame was dropped for narrowing rather than naming.** The manufacturing
  Approvals screen has no wordmark, but its sidebar names the client's raw
  material, which takes "listed multinational manufacturer" down to an industry.
  Clean in every other respect, and still dropped.
- **The consumer delivery platform is published from not at all**, for a reason
  that is about the record rather than the pixels. See "Whose site this is".

Those screens also bear on `kb/open-questions.md` #4, which asks whether "SFI"
and "SFIKS" are the same system: the SFI frames carry a "Kiosk Location"
selector and a device labelled "K70 - Star Kiosk", and kiosks are exactly what
the SFIKS record describes. Evidence, not a ruling. The question stays hers.

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

**Currently: "Grid"**, imported from the Claude Design project on 2026-09-02 and
replacing "Website v2" ("Band & Rule", Cormorant Garamond + Work Sans), which is
gone from the repo, as Direction A ("Annual", Fraunces + Karla) was before it.

A twelve-column editorial ruling drawn in hairlines on white, with the ink
reversed out only where the page needs a full stop. One typeface, Archivo,
worked hard: tight and heavy at display sizes, uppercase and letterspaced at
label sizes, tabular for every numeral. There is no ornament and no second
family.

Four things do the structural work, and breaking any of them is what makes the
page stop looking like itself:

- **The frame.** `.frame` in `_base.scss` is a 1680px column with a hairline
  down each side, holding the header, the page and the footer, so the dark
  bands can bleed edge to edge inside it. The side rules run the full height,
  which is why the frame is a flex column with the footer inside it.
- **The twelve columns.** `.grid` is `repeat(12, minmax(0, 1fr))`, halving to
  six on a tablet and collapsing to one on a phone. A component that sets a
  span must restate it at those two widths: a `span 10` on a six-track grid
  overflows silently.
- **The label rail.** `Section.astro` is an uppercase rust label in columns 1–2
  with its content from column 3, and nearly every section on every page is
  one. That is what lines the pages up with each other and with the CV's
  `sec()`. Do not hand-roll a section.
- **Two rule weights, and two palettes.** `--rule` is a hairline between rows
  inside a group; `--rule-strong` is ink and closes a section. Swapping them is
  what stops the page reading as a ruled sheet. Separately, the bands and the
  footer are reversed out on `--dark`, where the paper `--muted` measures
  2.13:1 — `--on-dark-muted` is its counterpart, and the contrast gate below
  covers both surfaces so the swap cannot be got wrong quietly.

`--accent-bright` is the one colour with a usage rule attached: at 4.44:1 on
paper and 4.37:1 on ink it clears the large-text floor on both and nothing else.
Display type, 2px rules and hover on display-sized links only. `--accent` is the
text-sized rust on paper, `--accent-on-dark` on ink.

Every colour, typeface, size and spacing value lives in `src/styles/_tokens.scss`,
one value per role. The display sizes are named for what each one sets rather
than as an abstract step scale, because the design uses twelve of them and means
all twelve. Change values there; do not introduce a second value for the same
role anywhere else.

Three rules that would hold in any direction:

- **Contrast is not a matter of taste.** `scripts/check-contrast.mjs` reads the
  palette out of `_tokens.scss` and fails `pnpm lint` if a pair drops below its
  floor. Add a pair to `PAIRS` when you add a colour role; do not silence it.
- **Pin the theme.** `src/styles/_base.scss` declares an explicit
  `background-color` _and_ a matching `color-scheme` on `html`. Without the
  pair, dark-mode browsers paint their own canvas and the ink lands on it at
  roughly 1.5:1. Keep those in sync with the `theme-color` meta tag in
  `src/layouts/Layout.astro` and with `public/manifest.json`.
- **The reset never wins a cascade.** Every rule in `_reset.scss` is wrapped in
  `:where()` so it weighs nothing. `ol[class]` is specificity (0,1,1) and beat
  `.pad` on the process band until it was; a reset that outranks a layout
  utility fails silently and off the edge of the frame.

Whether the site gets a dark mode at all is a real decision to make with her,
not a default to assume.

**The CV is a separate visual system and was not restyled with the site.** The
Grid design project carries a `/cv` page but no redesigned PDF, so `cv/` is
still the Cormorant-and-green "Band & Rule" document while the site around it is
Archivo and rust. That divergence is visible on `/cv`, where the sheets are
shown. Whether to bring the PDF across is a decision for Pamudi, not a tidy-up;
`cv/CLAUDE.md` remains authoritative for anything under `cv/`.

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
- `src/assets/systems/<product>/` holds a product's published screens;
  `src/assets/community/`, `src/assets/event-design/` and `src/assets/art/` hold
  the three picture sets on the About page. Everything in all four came out of
  Pamudi's own Figma file and was checked frame by frame before committing — see
  the header of `src/content/systems/photo-id-compliance-app.mdx`, and the
  comment above the picture arrays in `src/pages/about.astro`, before adding.
- **`scripts/fetch-figma.mjs` is how the next batch arrives.** It is the
  manifest for the whole file: fifteen pages, 126 nodes, each with a scale and a
  recorded verdict (`published`, `pending`, `dropped`, `blocked`). `--list`
  prints it without a token. Two things to know before running it:
  - **It writes to `staging/figma/`, which is gitignored, never to
    `src/assets/`.** Moving a file out of staging is the deliberate act that
    follows the review, and an untracked landing area is what keeps that
    structural rather than a good intention. Record the verdict in the script
    afterwards, so the next run cannot silently re-acquire what was turned down.
  - **The API cannot rasterise a frame on this account, and the browser can.**
    `GET /v1/images` answers 429 on this Starter plan with a `retry-after`
    around 4.5 days, and the Figma MCP's `get_screenshot` and `download_assets`
    share one account-level cap that is also spent. **The Figma web app's own
    Export command is not metered**, and it is how every product screen in
    `src/assets/systems/` was obtained: open the file, Escape then Cmd+A on a
    page, add an export setting, choose the scale, Export N layers. Two traps.
    Adding an export setting is a document edit, so Cmd+Z afterwards rather than
    leaving her file changed. And Chrome numbers a second download
    `... (1).zip` instead of overwriting, so verify what you extracted rather
    than trusting the filename. `GET /v1/files/:key/images`, which returns
    bitmaps already uploaded into the file, is a third quota and still works;
    the About-page picture sets come through it. Both API routes need only a
    free read-only token in `FIGMA_TOKEN`. Never commit it; this repo is public.
  - **Covering a client mark is allowed; changing anything else is not.** Oshan
    cleared redaction on 2026-09-03, and the rule that keeps it honest is that
    the mark is painted out in the app's own surrounding colour so it reads as
    an empty brand slot, never as a black censor bar. Nothing else in the pixels
    may be touched, the frame must still pass every other part of the check, and
    the page's frontmatter must record exactly what was covered.
    `src/assets/systems/mining-site-tool-platform/` is the worked example.
- **`design-archive/` holds all 950 exported frames, used or not**, foldered by
  the `data/systems.yaml` product rather than by Figma page so it lines up with
  `/systems/<slug>`. Lossless WebP, long edge capped at 1600px. It is **an
  archive, not a publication queue**: nothing in it has been through the
  frame-by-frame check, and moving a file from there into `src/assets/` still
  means looking at it first. 76 frames were withheld from it by an OCR pass over
  every frame, because they carry a client or product name and this repo is
  public; `design-archive/README.md` names each one and says how to re-export it.
  Astro never imports from this directory, so it costs nothing at build time.
- `src/assets/work/placeholder-*.png` and `scripts/make-placeholders.mjs` are
  scaffolding. Delete both once real covers land.

## Fonts

Self-hosted in `src/assets/fonts/`, imported by relative path from
`src/styles/_fonts.scss` so Vite rewrites the URL with the base — an absolute
`/fonts/...` path breaks under a non-root `base`. Do not move them to the
Google Fonts CDN: on the sibling site that was the only render-blocking request
on the page.

The woff2 files are Google's own `latin` slices, copied byte-for-byte out of
`@fontsource-variable/archivo` in `node_modules` and not subset. Archivo is
OFL-1.1 with a Reserved Font Name, so modifying the binaries would force a
family rename. Copy new versions in verbatim, from the same package.

Two faces, both variable on `wght` alone: Archivo roman and italic. The italic
is a real face rather than a synthesised slant, and it has exactly one job — the
degree names inside the earlier-projects descriptions, which arrive through
`_emphasis_` in the shared YAML. Only the roman is preloaded in `Layout.astro`,
because the sticky header sets it at two weights above the fold on every page
and the italic appears once, well down the About page.

Archivo also ships a `wdth` axis, and `_fonts.scss` deliberately does not load
it: nothing in this design condenses or extends, and the two-axis file is
markedly larger for an axis no rule would move.

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
