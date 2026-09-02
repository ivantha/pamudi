# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

A two-page CV for **Pamudi Dahanayake**, Senior UI/UX Engineer, typeset in Typst.
The subject is a designer, so the document is itself a design artefact — treat
layout regressions as seriously as content errors.

It lives in her website repo and reads the same `/data/*.yaml` the site does, so
one edit updates the page and the PDF together.

> ### ⚠ Open: client-name anonymisation
>
> This repo went **public** on 2026-09-02 when the CV was merged into the
> website. The client and product names — AROYA, EZIOS, EFL Cockpit, SFIKS,
> UKG-BC, Haycarb, Acetrak, NTBFS, Marx.lk, KOHL'S — are now world-readable in
> `/data/systems.yaml` and `/data/experience.yaml`, and on pamudi.com.
>
> Anonymisation was raised in September 2026 and **deferred, not rejected**.
> Pamudi has not confirmed that these are publishable, and some may be under
> NDA. **Ask her.** To withhold one, set `include_in: []` on the entry: it
> vanishes from the site and the PDF while the record survives. Detail in
> "Editorial decisions worth knowing" below.

## Build

```bash
./build.sh                 # PDF + page renders for the site, assert 2 pages
./build.sh --preview       # also regenerate preview-1.png / preview-2.png proofs
./build.sh --out PATH      # write the PDF somewhere else
./build.sh --no-images     # skip the src/assets/cv/ page renders
python3 tools/contrast.py  # WCAG audit of the palette, reads theme.typ directly
```

Every run also renders `../src/assets/cv/page-N.png` at 160 ppi unless
`--no-images` says otherwise. That is what the website's `/cv` page displays,
and it comes from the same compile as the PDF, so the sheets on the page and
the file behind the download button are the same document by construction. The
directory is cleared first, so a CV that ever loses a page cannot leave a stale
sheet behind for Astro to pick up.

From the repo root, `pnpm build:cv` runs the same script. Both `pnpm build` and
`pnpm dev` run it first — `build` so the PDF is in `public/cv/` when Astro
sweeps `public/` into `dist/`, and `dev` so the `/cv` page has its sheets. That
makes Typst and poppler a requirement for running the dev server, which they
already were for building.

`build.sh` **fails the build if the PDF is not exactly two pages.** There is
~20 mm of headroom on page 1 and ~25 mm on page 2 as of the September 2026
seniority edit, but that is reserved for the outcome clauses still owed, not
spare capacity — and before that edit the margin was 2–3 mm, where a single
added line created a third page. Never "fix" a failure by raising `WANT_PAGES`.
See "Where the vertical space is" below.

Typst must be given **both** `--root ..` and `--font-path fonts`, which
`build.sh` does. `--root ..` is what makes `yaml("/data/…")` in `cv.typ` resolve
to the repo-root data files; without it the compile fails outright. Without
`--font-path` it silently falls back to whatever the machine happens to have and
the weights come out wrong.

Requires `typst` and `pdfinfo` (poppler). Both are on the Mac via Homebrew, and
CI installs them in the `build` job. Nothing else — the fonts are vendored.

## File roles — keep these boundaries

| File                 | Owns                                                | Never contains                    |
| -------------------- | --------------------------------------------------- | --------------------------------- |
| `theme.typ`          | every colour, typeface, size, measure and component | words                             |
| `cv.typ`             | assembly and page order only                        | hard-coded colours, sizes or copy |
| `common/loaders.typ` | YAML reading, variant filtering, shape adapters     | look, or words                    |
| `/data/*.yaml`       | every word that appears on the page                 | layout decisions                  |
| `fonts/`             | vendored static font instances + their OFL licences | anything hand-edited              |

**No file in `cv/` holds a fact.** Words live one directory up, in the repo-root
`data/*.yaml`, which the website reads too.

## Content lives in /data/\*.yaml, shared with the website

The CV and the site read the same files. Edit a job, a skill or a talk once and
both follow. There is no selection step, no second copy, and no reconciliation
ritual to remember.

| File              | Feeds                                                   |
| ----------------- | ------------------------------------------------------- |
| `personal.yaml`   | masthead, Profile paragraph, contact row, site identity |
| `experience.yaml` | Experience section, About page roles                    |
| `systems.yaml`    | the page-2 design-systems table                         |
| `skills.yaml`     | Toolkit                                                 |
| `education.yaml`  | Education + professional training                       |
| `community.yaml`  | Speaking, mentoring, events, judging, competitions      |
| `private.yaml`    | phone number only. **Gitignored** — see below           |

`data/projects.yaml` also exists and is **not** in that table: it holds her UCSC
degree projects and no Typst file reads it. Nor does `cv.typ` read
`community.yaml`'s `writing`, `student_events` or `societies` keys. Both are
deliberate — see the last bullet of "Editorial decisions worth knowing".

Two conventions, shared with the website and mirrored in
`src/content.config.ts`:

- **`include_in: [cv, web]`** on any entry. Omit the key and the entry appears
  in both; `include_in: []` hides it everywhere while keeping the record. This
  is how a fact stays on file without going on the page — and how a client name
  gets withheld without being deleted.
  It works on **nested** lists as well as top-level ones: `education.entries`
  and the three dated lists in `community.yaml` honour it. Top-level lists come
  through `load-yaml-list`; nested ones go through `keep()` in
  `common/loaders.typ`, which cv.typ must call explicitly. Miss that call and
  the PDF silently ignores an `include_in` the website is already obeying, and
  the two consumers drift. `judging` and `competitions` are prose strings, not
  lists, and have no such switch — trim the string and keep what you removed in
  a comment beside it.
- **Variant-suffixed overrides.** `role` is the default, `role_cv` overrides it
  for the PDF and `role_web` for the site.

Strings carry a small Typst markup subset: `*strong*` and `_emphasis_`. Typst
evaluates them through `render-md` in `common/loaders.typ`; the site converts the
same two tokens to HTML in `src/lib/markup.ts`. Anything fancier will render on
one side and not the other.

### The private overlay

`data/private.yaml` holds the phone number and nothing else. It is **gitignored**
so it never enters this public repo. `build.sh` seeds it from the tracked
`data/private.example.yaml` (an empty string) when it is missing, which is what
every CI run and every fresh clone gets. So:

- **locally**, with the real file present, the PDF carries the number;
- **on pamudi.com**, the published PDF has no phone row at all.

If she needs a PDF with the number, build it on a machine that has the overlay.
Do not "fix" the missing row in CI by committing the number.

## The visual system — "Band & Rule"

Ported from the `cv.dc.html` design exploration in the Claude Design project
"CV D design exploration". Editorial, not corporate. A cool ground, one accent
hue, hairline rules, and a single filled shape: the masthead band.

### Colour

One accent **hue** — teal — in two tints, one per ground. A second hue breaks
the system; if something needs to stand out, use scale or weight instead.

The light ground, which is most of the document:

| Token         | Hex       | Role                                           | Contrast      |
| ------------- | --------- | ---------------------------------------------- | ------------- |
| `paper`       | `#F1F3F2` | page ground                                    | —             |
| `ink`         | `#141817` | body text                                      | 16.07 : 1 AAA |
| `mute`        | `#616768` | metadata, employer names, `dated` years        | 5.16 : 1 AA   |
| `accent`      | `#1F6357` | dates, `kv` labels, stat figures, group labels | 6.32 : 1 AA   |
| `rule`        | `#DFE3E1` | row hairlines **only**, never type             | n/a           |
| `rule-strong` | `#B2B6B5` | stat-strip bottom stroke **only**              | n/a           |

The dark masthead band on page 1:

| Token         | Hex       | Role                              | Contrast      |
| ------------- | --------- | --------------------------------- | ------------- |
| `band`        | `#14181A` | band ground                       | —             |
| `band-ink`    | `#ECEFEF` | the name                          | 15.45 : 1 AAA |
| `band-mute`   | `#8E9698` | eyebrow, spec line                | 5.93 : 1 AA   |
| `band-accent` | `#7FC6B2` | role label, website link          | 9.04 : 1 AAA  |
| `band-meta`   | `#B9BFC0` | contact row                       | 9.59 : 1 AAA  |
| `band-rule`   | `#2E3335` | hairline inside the band **only** | n/a           |

The three rule tokens are too light for text at any size and are excluded from
the audit deliberately. Run `tools/contrast.py` after touching the palette; it
checks all seven text pairs rather than trusting the eye. Note its token regex
is `[\w-]+`, not `\w+` — Typst identifiers here contain hyphens, and `\w`
would silently drop every `band-*` token.

### Type

Both faces are **vendored** as static instances under `fonts/`, with each
family's OFL licence beside them.

| Role                       | Face                            | Size    |
| -------------------------- | ------------------------------- | ------- |
| Name                       | Cormorant Garamond 300          | 34 pt   |
| Statistic figures          | Cormorant Garamond 300          | 27 pt   |
| Role titles                | Cormorant Garamond 500          | 13.5 pt |
| Section names              | Cormorant Garamond 400 _italic_ | 12.5 pt |
| Education degrees          | Cormorant Garamond 500          | 10.8 pt |
| Profile                    | Cormorant Garamond 400          | 10.4 pt |
| Table product names        | Cormorant Garamond 500          | 10.2 pt |
| Body                       | Work Sans 300                   | 8.4 pt  |
| Employer, institution      | Work Sans 300                   | 7.2 pt  |
| Role label, contact        | Work Sans 300                   | 6.6 pt  |
| `dated` year               | Work Sans 300                   | 6.4 pt  |
| Micro-labels, dates, folio | Work Sans 300                   | 6.1 pt  |

⚠ **The fonts must be regenerated, not downloaded.** Google ships Cormorant
Garamond and Work Sans as variable `[wght].ttf` only — there are no static
instances upstream, and Homebrew's casks install the variable files. `fonts/`
holds instances cut with `fonttools varLib.instancer` and then renamed, because
two things bite:

- Cormorant's `nameID 1` is **"Cormorant Garamond Light"** (its variable default
  is wght=300, and RIBBI names the family after the default). Instancing with
  `--update-name-table` produces three faces in three different families, and
  `weight: 500` then silently never resolves.
- Typst keys fonts on family name + `OS/2.usWeightClass` + the italic bit, not
  on the style string. Each instance therefore sets `usWeightClass` explicitly
  and states the same family in nameID 1 **and** 16.

Verify with `typst fonts --font-path fonts --variants`: one family each, with
distinct weights. `pdffonts public/cv/cv.pdf` should list seven subset faces — if a weight
is missing, it collapsed rather than errored.

Unlike the previous Canela-based system, **this repo now builds anywhere**:

```bash
typst compile --root .. --font-path fonts --ignore-system-fonts cv.typ /tmp/x.pdf
```

Run that after any font change. A missing face **falls back silently** — the PDF
still builds, in the wrong typeface — and CI's Ubuntu runner has no system fonts
at all, so a fallback that looks fine on the Mac ships broken.

### Line boxes — the thing that will bite you

The design is HTML with `line-height: 1.4`. A browser makes **every** line box
exactly that tall, single-line rows included, splitting the difference against
the font's ascent+descent as half-leading. Typst instead defaults to
cap-height→baseline, about 0.67 em, and makes up the difference between lines
with `leading`. Multi-line text then looks right while every single-line row —
a table cell, a degree, a dated entry — comes out ~40 % short.

`theme.typ` therefore maps CSS line-height onto Typst's line box directly:
`lh(font, height)` returns `top-edge`/`bottom-edge` from `FONT-METRICS`, and
`par(leading)` is **zero**. Do not reintroduce `leading` to "fix" spacing — it
will pull the single-line rows back out of rhythm. Change `LH-BODY` instead.

`LH-NAME` (1.02) and `LH-FIG` (1.0) are the design's own tight settings for the
name and the statistic figures; everything else is `LH-BODY` (1.4).

Cormorant's default figures are **oldstyle** — `24` and `3` descend below the
baseline, `10` sits at x-height. That is the design's look, not a bug. Never
bottom-align a figure inside a fixed-height box: `stat-strip` lays numbers and
labels as two separate table rows so they share a baseline. This bug has been
fixed twice; don't reintroduce it.

### Structure

- Page margins are **`x: 0`**, with the 15 mm inset carried by `pad()` on the
  content instead. That is what lets the masthead band bleed to the paper edge;
  a margined page would need the band's height known in advance. Anything that
  is not the band must be wrapped in `pad(x: MARGIN, …)`.
- A **22 mm label column** (+5 mm gutter) carries italic section names inside
  the measure, leaving a 153 mm body. It is not a margin rail.
- **Hairlines separate sections.** Full-width hairlines appear between Profile
  and Experience on page 1, and before each section on page 2. The masthead is
  the only filled shape in the document.
- The **stat-strip** sits on paper ground immediately below the masthead band,
  carrying the four headline figures in accent with column dividers and a
  `rule-strong` bottom stroke. Stats left the band to give them room at 27 pt.
- **Contact is split**: left items (email, phone, LinkedIn, Behance) joined
  with middots, the website link pulled right in `band-accent`.
- A **running folio** appears on **both** pages, zero-padded and tabular.
- Sub-headings go through `subsec()`, which is `kv()`'s geometry wrapped in
  `breakable: false`. A grey micro-label stranded at the foot of a page reads as
  a mistake; this makes it impossible.

### Components in `theme.typ`

`masthead` · `eyebrow` · `sec` · `subsec` · `role-entry` · `stat-strip` · `kv` ·
`sysgroups` · `dated` · `dated-list` · `degree-entry` · `folio` · `hairline` ·
`band-hairline` · `railhead` · `microlabel` · `kvlabel` · `datestamp` · `lh`

Reach for one of these before writing a bare `grid`.

Two naming traps, both already hit: `left`/`right` are alignment constants and
`place`/`pad`/`label` are builtins. A parameter named after one shadows the real
thing inside the function body — `eyebrow(left, right)` failed exactly this way.

## Where the vertical space is

After the September 2026 theme update (stats moved to a paper-ground strip,
inter-section hairlines added, page-2 top padding raised to 13 mm, section
gaps set to 4.5 mm): **~15 mm slack on page 1, ~15 mm on page 2.** The
measurements are the design's own — they follow `cv.dc.html`.

**That slack is reserved, not spare.** It is what the outcome clauses will cost
when Pamudi supplies them (see "Still owed by Pamudi" below) — a bullet that
carries a consequence runs longer than one that names a deliverable. Do not
spend it on new sections.

If a page does overflow, take space back from the stat-strip inset (4.5 mm →
3 mm) or the inter-section hairline gaps (3 mm → 2 mm) before touching
`LH-BODY`, `sysgroups`'s row inset or `dated`'s rhythm — all three are
load-bearing for the design's proportions.

Re-measure rather than trusting these numbers after any content change:

```bash
./build.sh --preview && python3 - <<'EOF'
from PIL import Image; import glob
for f in sorted(glob.glob('preview-*.png')):
    im=Image.open(f).convert('L'); w,h=im.size; px=list(im.getdata()); last=0
    for y in range(h-90,-1,-1):
        if min(px[y*w:(y+1)*w])<140: last=y; break
    print(f'{f}: ~{297*(h-90-last)/h:.1f} mm free')
EOF
```

## Editorial decisions worth knowing

### The September 2026 seniority edit

The CV read as an **inventory of output** rather than a record of judgment:
every headline number counted artefacts (24 products, 3 systems, 10 style
guides, 8 teams), and the whole document carried exactly one outcome. That is
the register of a productive mid-level designer, not a senior one. This pass
fixed what could be fixed without new facts:

- **Scope verbs in `systems.yaml`.** "Maintained" appeared six times — a
  custodial verb on a document arguing she is an owner. The six the record calls
  "maintained and expanded" are now `Extended`; the three she built are
  `Owned, from scratch` rather than "Led"; `Contributed` stands, because that is
  what Acetrak RFID was. Keep this vocabulary: **Owned > Extended > Contributed**,
  and never reach for a verb the source record does not support.
- **The AI bullet leads with the consequence.** It opened on a tool roll-call;
  it now opens on removing the frontend dependency and closes with "Currently
  via Cursor, Claude, Visily.ai, Builder.ai and Figma AI". Tool names date
  within eighteen months, the operating change does not. Keep the tools last and
  keep them hedged.
- **Mentoring leads the Community section**, ahead of Speaking. Influence beyond
  her own hands is the seniority signal in that block.
- **The junior tail came off the PDF and stayed on the site**, all via
  `include_in: [web]`: the freelance brand-collateral role, the IT diploma, the
  G.C.E. Advanced Level, and the 2017–18 student office-holding row. The
  undergraduate hackathon placings were trimmed out of the `competitions` string
  with the removed text preserved in a comment beside it.
- **All six compressed spacing metrics were reverted to the design's values**,
  paid for by the cuts. See "Where the vertical space is".

### Still owed by Pamudi

**Three of the improvements identified could not be made, because they need
facts no source in this repo holds. Do not fabricate them to close the gap.**

1. **Outcome clauses in the Experience bullets.** Every bullet still ends on a
   deliverable. The senior shape is _decision → consequence_. The raw material
   exists — she held sole ownership of the Figma source of truth for eight
   teams, so there are arbitration and migration stories — but only she has
   them. The reserved page slack is sized for this.
2. **The `stat-strip` figures.** Four artefact counts. "24 products designed"
   invites the reader to wonder how deep any one of them was; volume without
   depth reads as production work. Two counts plus two consequences would carry
   more. Note the existing constraint: no figure in the band may rest on an
   unverified value, which is why an earlier "seven years" was retired.
3. **A scale column on the design-systems table.** Product / Scope / Stack
   answers _how many_ and _with what tool_; neither is a seniority signal, since
   Figma is table stakes. Components, consuming teams, or adoption would make
   the table evidence rather than an inventory. The column would also need page-2
   width — the table is already three columns wide in a 153 mm measure.

One thing that was already working and should survive future edits: the
bold verb-first bullet labels (`*Design system ownership.*`). Change what
follows the full stop, not the structure.

### Earlier decisions, still standing

- **The 2018 summary was discarded.** It described an undergraduate seeking a
  first role. The Profile paragraph is a rewrite and still needs Pamudi's
  sign-off — it is her voice, not ours.
- **"Seven years" and "7 yrs" are gone.** Both derived from `START_YEAR`, which
  is an inference (see below). The Profile now opens "Building and owning…",
  and the fourth statistic is `8 / Product teams guided`, which the page
  corroborates itself in the senior role's second bullet. No figure in
  `stat-strip` now rests on an unverified value.
- **No AI figure in `stat-strip`.** The career record claims a "measurable increase in
  design output efficiency" but records no number, and inventing one would put a
  fabrication next to four verifiable figures.
- **The 24-products figure reconciles.** Thirteen rows in the design-systems
  table plus eleven named under the earlier role. Acetrak WMS and Acetrak RFID
  are separate rows — one extended, one contributed — which is both the honest
  split and what makes the count add up. It did not previously: the table held
  twelve rows. If either list changes, recount.
- **The senior role's first bullet said "seven more" and listed six.** It now
  reads "six more … and contributed to the existing system on Acetrak RFID",
  matching the table.
- **The 2025 project record is grouped, not listed.** Fourteen projects times
  four activity types is unreadable at CV length. It collapses into six themes
  under the senior role; the project names survive inside the prose and in the
  design-systems table.
- **G.C.E. Advanced Level is retained** alongside the MSc and BSc. If page 2
  ever needs ~6 mm, this is the first row to reconsider.
- **Deliberately omitted from the page**, and as of September 2026 all of it now
  lives in `data/` tagged for the website only, where it renders on the About
  page: the three 2017–18 university projects (`/data/projects.yaml`); the 2019
  departmental design work (a `include_in: [web]` bullet on the earlier role);
  the career record's "Other platforms" (WordPress, JavaFX, MySQL, Express,
  Node, MongoDB) and the individual generative-icon tools (web-only rows in
  `skills.yaml`); the "Windows Geek" technology writing and the full student
  conference list (`community.writing` and `community.student_events`, new keys
  `cv.typ` does not read). Re-adding any of it **to the page** needs a reason,
  not just the space.
- **AI is woven through, not bolted on.** Everything AI on the page is sourced
  from the career record's AI-tooling sections.
  It surfaces in four places: the masthead specialism line, one clause of the
  Profile, the third bullet of the senior role, and the leading Toolkit row,
  with the Agentic AI programme leading Professional training. The framing stays
  _designer whose practice is AI-augmented_, never _builds AI products_ — she
  uses these tools, and the CV should not imply otherwise.
- **The phone number does not follow the design.** `cv.dc.html` regroups it in
  threes; `data/private.yaml` keeps the standard Sri Lankan mobile grouping.
  Same digits. The number itself is deliberately absent from every tracked file
  in this repo — do not paste it into one, including this file.
- **Project-name anonymisation was raised and deferred** (September 2026), and
  the merge into a public repo on 2026-09-02 raised the stakes without settling
  it — see the callout at the top of this file. The question was whether client
  and product names can appear at all, or whether they need replacing with
  domain descriptors. Deferred, not rejected; the names currently stand. If it
  comes back, note that the career record does **not** give a domain for several
  of them (AROYA, EZIOS, NTBFS, EZPassport), so honest descriptors there have to
  describe shape rather than industry, and the page-2 table would grow — it is
  keyed by product name in its narrowest column.

## Unverified facts — do not treat as settled

Five values that no source can confirm: the LinkedIn and Behance handles, the
pre-2022 job title, the Zone24x7 start year, and the graduation year. Each is
marked with a `⚠ unverified` or `⚠ inferred` comment next to it in the YAML:

| Value             | Where                                            |
| ----------------- | ------------------------------------------------ |
| LinkedIn, Behance | `/data/personal.yaml` → `contact.links`          |
| pre-2022 title    | `/data/experience.yaml` → `zone24x7-early.role`  |
| Zone24x7 start    | `/data/experience.yaml` → `zone24x7-early.dates` |
| BSc graduation    | `/data/education.yaml` → BSc `dates`             |

The start year no longer reaches any figure — the "seven years" and "7 yrs"
claims that derived from it are gone — but it still sets the earlier role's date
range on the page, so the flag stays live.

**Do not remove those comments until Pamudi has confirmed the values**, and note
that these now show on the public website as well as in the PDF.

## Conventions

- British spelling in prose; product and client names keep their source spelling
  (the archived career record documents the normalisations applied).
- Solo personal repo: commit directly to `main`.
- `preview-*.png` and `public/cv/*.pdf` are build artefacts and are gitignored.
  **The PDF is no longer committed** — CI rebuilds it on every push and serves it
  at `pamudi.com/cv/cv.pdf`, so a committed copy could only ever be stale. It
  would also have carried the phone number into a public repo.
