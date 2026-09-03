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

Astro 5, TypeScript, static output, zero client JS. Product pages are
frontmatter-only MDX in `src/content/systems/` with `zod` schemas in
`src/content.config.ts`; plain SCSS, no framework; pnpm on Node 22;
`astro:assets` for every content image; GitHub Pages via
`.github/workflows/deploy.yml` on push to `main`.

This mirrors `../ivantha.github.io` deliberately — same runtime, package
manager, deploy shape, and the same YAML-plus-Typst CV arrangement, so one set
of habits maintains both sites. Read that repo before inventing a pattern here.
Where the two diverge: product pages are MDX rather than YAML data, images are
the payload rather than an afterthought, and the CV here has one variant, not
three.

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

`/` (Home), `/work`, `/plates`, `/off-hours`, `/profile`, `/contact` and `/cv`,
plus `/work/[slug]` for every product in the inventory and a `/404`. The header
carries six of those, in two groups either side of the name; `/cv` is reached
from Profile and Contact and marks Profile in the bar.

The home page carries the argument (hero, one painting, the four figures, three
screens, the two teasers); `/work` is the three owned systems argued one at a
time, then the full inventory, then the process; `/plates` is her own paintings
and the identity work; `/off-hours` is the teaching photographs and the rest of
the weekend; `/profile` is the career record in full.

The direction this replaced had `/`, `/systems`, `/about` and `/work/[slug]`.
Every one of those is gone: the product pages moved to `/work/<slug>`, the
inventory to `/work`, and the About page split three ways into `/profile`,
`/plates` and `/off-hours`. `redirects` in `astro.config.mjs` covers all three
old shapes, including the per-product one, so a live link does not 404 — but
static output emits a meta-refresh page rather than a 301, which is the best
GitHub Pages can serve. Write new links against the new paths.

**`/work/[slug]` builds a page for every entry in `data/systems.yaml`, written
or not.** The slug is derived from `product` by `systemSlug` in
`src/lib/slug.ts` rather than stored — the inventory is shared with the Typst
CV, and a `slug:` key only the website read is the same drift risk as a
`group:` key. Renaming a product therefore changes its URL.

A product's page is an optional MDX file in `src/content/systems/` whose
`system:` field must match `product` exactly; the build throws on a file that
names a product the inventory does not have. With no file, the page renders the
sourced facts and the two nearest written pages in the same band, and says on
the page that nothing more is written. **That is the resting state, not a stub
to fill with plausible-sounding prose** — seven of the fourteen are deliberately
in it. See "Whose site this is".

Those files are frontmatter only. The direction this replaced put running prose
in the MDX body; the Plinth design argues a case in a fixed set of parts — a
metadata strip, numbered figures, a two-column argument, a list of what shipped
— so the parts are fields and `src/pages/work/[slug].astro` is the one layout.
The old bodies, and the forty-odd screens they showed that the design does not,
are in git.

**`src/lib/systems.ts` is gone.** It derived the CV's five inventory bands for a
website that grouped its inventory; the Plinth design lists it flat, so the
derivation had no second consumer to stay in step with and became dead code
documenting an invariant nothing checked. `cv/common/loaders.typ` still groups,
and `src/pages/work/index.astro` still draws the one line both consumers need —
the personal group project is not a client engagement — by the same test on the
same field. If the website ever groups again, duplicate the Typst branches
rather than adding a `group:` key to the shared data.

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
| `personal.yaml`   | site identity, contact, the four headline figures, CV masthead and Profile                                           |
| `experience.yaml` | Profile-page roles, CV Experience                                                                                    |
| `systems.yaml`    | the work index's inventory and every `/work/<slug>`, and the CV's grouped table                                      |
| `skills.yaml`     | Toolkit                                                                                                              |
| `projects.yaml`   | the Profile page's "Earlier projects". **Website only** — no Typst file reads it                                     |
| `education.yaml`  | degrees + professional training                                                                                      |
| `community.yaml`  | speaking, mentoring, events, judging, competitions, and the website-only `writing`, `student_events` and `societies` |
| `private.yaml`    | phone number only. **Gitignored**, never in this repo. Read by `loadPrivate()` for the Contact page                  |
| `site.yaml`       | every page's headline and framing copy, and the process. **Website only**, and pending her sign-off                  |

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
local build produces a PDF with the number and CI produces one without.

The website reads it too now, through `loadPrivate()` in `src/lib/private.ts`:
the Contact page's direct-lines strip carries a Phone tile locally and drops it
in CI, and the strip's column count follows. The Plinth artboard prints the
number in plain text; that is the one thing on it that could not be transcribed.

**This repo is public.** Do not commit the number to fix a missing row in the
deployed PDF or a missing tile on the deployed Contact page.

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

- **`data/site.yaml` is awaiting her sign-off.** It now holds every page's
  headline as well as the hero lede, the five process steps, the section notes,
  the Off-hours and Plates copy, the Contact enquiry block and the three footer
  standfirsts. Every string was transcribed verbatim from the Plinth artboards
  and says nothing the sourced data does not support, but the phrasing came from
  the design rather than from her, which is why it sits in its own file with the
  provenance in its header. **Do not extend it with invented copy** — strings
  enter it from a design she has approved, or from her. The one exception on the
  page is noted in the file itself: the work index's aside, reworded because the
  design's sentence was not true of a site that gives every product a URL.
- **The placeholder headline is gone.** `personal.yaml` used to carry a
  layout stand-in for the home page; the design supplies a real headline for
  every page, so the field was removed rather than left sitting there. Nothing
  on the site is a placeholder now.
- **`tagline`, `intro` and `availability` are optional and absent** from
  `data/personal.yaml`. Each has a verified fallback — the meta description is
  assembled from `role`, `location` and the first sentence of `summary`, and the
  hero lede comes from `site.yaml`. A placeholder that ships is worse than a
  field that is not there, so add them back only with her words in them.
- **Seven of the fourteen product pages are written; seven are not.** Written,
  all with screens: precision agriculture app, photo-ID compliance app, freight
  logistics cockpit, warehouse management platform, manufacturing warehouse app,
  mining-site tool platform, and IN2Ocean. The other seven render their sourced
  facts and say so on the page, which remains the intended resting state rather
  than a stub to fill. Six of the seven have no design file on the Figma document
  at all, so nothing could illustrate them even in principle; the seventh is the
  consumer delivery platform, below.
- **The written pages are not hers yet.** Their prose is of two kinds and no
  third: scope claims lifted from the appraisal record via `kb/projects.md`, and
  description of what is visibly in the screens beside them. No outcomes, no
  metrics, no adoption claims, because no source carries any. Each file's header
  states this, and each now also records that the Plinth artboards replaced the
  longer body it used to carry. Treat them the way `data/site.yaml` is treated,
  and read the header before extending one.
- **IN2Ocean is the one written page with no artboard behind it.** The design
  does not plate it with the client work and reaches it from `/plates` instead,
  where its style guide and badge set sit among the other brand work. Its page
  was rebuilt into the new shape from the body it already carried, and its SCOPE
  note still stands: it is a group project, the split of work is recorded
  nowhere, and the page says so rather than guessing.
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

**The fifth pass, 2026-09-03, came with the Plinth design and published the
rest of the Hobbies page.** Seven more of her own drawings joined the eight
already on `/plates`, and nine photographs became `src/assets/hobbies/` for the
off-hours page. Three of the nine needed work first, and the reasons are the
procedure rather than trivia:

- **`drawing-with-cat` had a third party's full name on it.** The laptop behind
  the drawing shows a games profile page with somebody's name set large and
  perfectly legible. It is painted out in the app's own panel colour so the row
  reads as empty, nothing else in the frame is touched, and the redaction is
  recorded in the comment above the imports in `src/pages/off-hours.astro`. Same
  rule as the mining-site screens, applied to a person rather than a client.
- **`keyboard` and `telescope` are stills from social video** and carried the
  player's chrome — an avatar with her name plate, a search icon, a mute button.
  Cropped off. Overlay is not photograph, and a portfolio that shows the
  scaffolding of the platform it was posted on looks like a screenshot.
- **One travel photograph stayed in staging.** It has another person in frame,
  so it is not hers alone to publish. The design uses the other frame from the
  same trip, which is why that section has a window and not a face.

Five of the seven new drawings are studies after characters someone else owns.
They are titled by what they show rather than by the character, and the line
under the gallery — `plates.attribution` in `data/site.yaml` — says whose the
character is. That line is the condition on publishing them, not decoration; if
the gallery is ever rebuilt, it goes with it.

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

**Currently: "Plinth"**, imported from the Claude Design project on 2026-09-03
and replacing "Grid" (a twelve-column ruling in Archivo and rust on white),
which is gone from the repo, as "Website v2" ("Band & Rule", Cormorant Garamond

- Work Sans) and Direction A ("Annual", Fraunces + Karla) were before it.

A centred editorial sheet on warm paper, ruled in hairlines, with a Didone doing
every piece of display work and a grotesque doing everything else. Bodoni Moda
carries the name, the headlines, the figures and the Roman numerals; Archivo
carries running text and the uppercase micro-labels the page is ruled with. The
only colour beyond ink and paper is brass, and it appears twice per screen at
most. There is no dark band anywhere: the one dark ground on the site is
`--plate-dark`, which is the background a screenshot was drawn on.

Five things do the structural work, and breaking any of them is what makes the
page stop looking like itself:

- **The sheet.** `.shell` in `_base.scss` is a centred 1360px measure holding
  the header, the page and the footer. Unlike the direction it replaced there is
  no drawn frame: the page is held by its own rules and by the white space
  either side of it.
- **The four collapsing layouts.** `.split` (7fr/5fr, image-led), `.split-narrow`
  (5fr/7fr, text-led), `.split-even` and `.cols`. Every one collapses to a single
  column, and **the collapse for the three splits lives in its own media query
  after all three track definitions, not nested inside the shared block above
  them.** Nested, SCSS emits it where the shared rule sits and the per-class
  `grid-template-columns` that follow simply win at every width — which is a
  two-column split on a phone, and is exactly the bug this arrangement was
  written to fix.
- **The Roman numerals.** Plates, process steps and the year span in the page
  eyebrows all go through `roman()` in `src/lib/roman.ts`, and the counts the
  copy states go through `spell()` in `src/lib/words.ts`. Nothing is typed out:
  "Thirteen of twenty-four products" is derived from `data/systems.yaml` and
  `data/personal.yaml`, and the year span from `data/experience.yaml`.
- **One heading component.** `Heading.astro` renders the `{before, accent,
after}` shape every title in `data/` and `src/content/systems/` uses, so the
  italic brass phrase is one decision rather than a `<span>` typed out forty
  times. It inserts the space before the accent; `after` carries its own leading
  space when the phrase continues, and punctuation attaches directly. Its markup
  is deliberately unbroken — a newline between the span and `{after}` renders as
  a space and floats the full stop away from the word.
- **Two rule weights.** `--rule` is a hairline between rows inside a group;
  `--rule-strong` is ink and closes a section. `.rule-top`, `.rule-top-ink`,
  `.rule-bottom` and `.rule-bottom-ink` are the four utilities. Swapping them is
  what stops the page reading as a ruled sheet.

`--accent-bright` (#9c7a3c) is the one colour with a usage rule attached: at
3.80:1 on paper it clears the large-text floor and nothing else. The italic word
inside a display heading, one of the four headline figures, and the underline
under the current nav item. Never a label, a caption or a paragraph — that is
`--accent` (#7a5a1e), the same brass four steps darker, which clears 4.5:1 on
both grounds. The design paints a few small uppercase meta labels in the
brighter brass; those are set in `--accent` here, and the contrast gate is why.

Every colour, typeface, size and spacing value lives in `src/styles/_tokens.scss`,
one value per role. The display sizes are named for what each one sets rather
than as an abstract step scale, because the design uses eleven of them and means
all eleven. Change values there; do not introduce a second value for the same
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
  `:where()` so it weighs nothing. `ol[class]` is specificity (0,1,1) and would
  otherwise beat a single-class layout rule; a reset that outranks a layout
  utility fails silently and off the edge of the page.

Whether the site gets a dark mode at all is a real decision to make with her,
not a default to assume.

**The CV is a separate visual system and was not restyled with the site.** The
Plinth design carries no CV artboard at all — it offers the document by email
instead — so `cv/` is still the Cormorant-and-green "Band & Rule" document while
the site around it is Bodoni and brass. The `/cv` page is kept anyway, because
the PDF is a real deliverable the build produces on every push and both Profile
and Contact link to it; the divergence is visible there, where the sheets are
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
- `src/assets/systems/<product>/` holds a product's published screens.
  `src/assets/art/` and `src/assets/event-design/` are the two sets on
  `/plates`; `src/assets/community/` and `src/assets/hobbies/` are the two on
  `/off-hours`. Everything in all five came out of Pamudi's own Figma file and
  was checked frame by frame before committing — read the header of
  `src/content/systems/photo-id-compliance-app.mdx` and the comments above the
  picture arrays in `src/pages/plates.astro` and `src/pages/off-hours.astro`
  before adding. The alt text lives beside the import in the page, not in
  `data/`: it describes this crop of this image, which is a property of the page
  rather than of the career record.
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
    `src/assets/systems/mining-site-tool-platform/` is the worked example for a
    client mark, and `src/assets/hobbies/drawing-with-cat.jpg` for a third
    party's name — same rule, applied to a person. Note the sharp trap in doing
    it: sharp composites **after** it resizes, so a patch has to be burnt into
    the original in its own pass or the coordinates land in the wrong space and
    the name survives.
- **`design-archive/` holds all 950 exported frames, used or not**, foldered by
  the `data/systems.yaml` product rather than by Figma page so it lines up with
  `/work/<slug>`. Lossless WebP, long edge capped at 1600px. It is **an
  archive, not a publication queue**: nothing in it has been through the
  frame-by-frame check, and moving a file from there into `src/assets/` still
  means looking at it first. 76 frames were withheld from it by an OCR pass over
  every frame, because they carry a client or product name and this repo is
  public; `design-archive/README.md` names each one and says how to re-export it.
  Astro never imports from this directory, so it costs nothing at build time.
- The `work` content collection, its three placeholder case studies,
  `src/assets/work/` and `scripts/make-placeholders.mjs` are **gone**. The
  Plinth design has no separate case-study index — the products are the work —
  and those three files were scaffolding that could never ship. They are in git.

## Fonts

Self-hosted in `src/assets/fonts/`, imported by relative path from
`src/styles/_fonts.scss` so Vite rewrites the URL with the base — an absolute
`/fonts/...` path breaks under a non-root `base`. Do not move them to the
Google Fonts CDN: on the sibling site that was the only render-blocking request
on the page. The Plinth artboards load Bodoni Moda from Google; that is the one
thing about them not to copy.

The woff2 files are Google's own `latin` slices, copied byte-for-byte out of
`@fontsource-variable/bodoni-moda` and `@fontsource-variable/archivo` in
`node_modules` and not subset. Both families are OFL-1.1 with a Reserved Font
Name, so modifying the binaries would force a family rename. Copy new versions
in verbatim, from the same packages.

Four faces, two families:

- **Bodoni Moda**, roman and italic, in the `standard` cut — which carries an
  `opsz` axis as well as `wght`. That is deliberate, and it is what the extra
  20 kB per face buys: the design sets this face from a 10.5px Roman numeral to
  a 7rem headline, and a Didone drawn for text has hairlines that disappear at
  display size while one drawn for display has hairlines that disappear at text
  size. `font-optical-sizing: auto` on `.display` spends the axis; swapping in
  the smaller `wght`-only files makes that rule inert.
- **Archivo**, roman and italic, on `wght` alone. Archivo also ships a `wdth`
  axis and it is deliberately not loaded: nothing in this design condenses or
  extends, and the two-axis file is markedly larger for an axis no rule moves.

Both italics are real faces rather than synthesised slants. Bodoni's carries the
accented word inside every display heading; Archivo's carries `_emphasis_` from
the shared YAML, which on this site is the conference and society names down the
Profile page. On a designer's site a faux oblique is the kind of detail the site
is arguing against.

Only the two romans are preloaded in `Layout.astro`, and both are: the sticky
header sets the name in Bodoni and the nav in Archivo on every page. The italics
are not — the display italic appears once, inside the page title, and the text
italic well down the Profile page.

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
