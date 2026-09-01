# cv

A two-page CV for **Pamudi Dahanayake**, Senior UI/UX Engineer, typeset in
[Typst](https://typst.app).

```bash
./build.sh                 # → ../public/cv/cv.pdf, verified at two pages
./build.sh --preview       # also writes preview-1.png / preview-2.png
./build.sh --out PATH      # write the PDF somewhere else
python3 tools/contrast.py  # WCAG audit of the palette
```

From the repo root, `pnpm build:cv` does the same thing, and `pnpm build` runs
it before `astro build`.

Needs `typst` and `pdfinfo` (poppler). Both typefaces are vendored under
`fonts/`, so the build depends on nothing installed on the machine.

## Content comes from ../data

Every word on the page is in the repo-root `data/*.yaml` — the same files the
website reads, so the page and the PDF cannot drift. Nothing in this directory
holds a fact.

|                      |                                                         |
| -------------------- | ------------------------------------------------------- |
| `/data/*.yaml`       | every word on the page, shared with the site            |
| `cv.typ`             | page assembly only                                      |
| `theme.typ`          | every colour, typeface, size and component              |
| `common/loaders.typ` | YAML reading, `include_in` filtering, markup eval       |
| `tools/contrast.py`  | reproducible WCAG check, reads `theme.typ` directly     |
| `fonts/`             | Cormorant Garamond and Work Sans, static instances, OFL |

`build.sh` passes `--root ..`, which is what lets `yaml("/data/…")` in `cv.typ`
resolve to the repo root. Compiling by hand without it fails.

To keep something on file but off the page, set `include_in: []` on the entry
rather than deleting it. `[cv]` puts it on the PDF only, `[web]` on the site
only, and omitting the key means both.

## The design

**Band & Rule** — editorial rather than corporate. A cool ground, one accent hue
in two tints, hairline rules, and a single filled shape: the dark masthead band
that opens page 1. Cormorant Garamond at 31 pt over Work Sans at 8.4 pt, with
italic section names in a 22 mm label column beside the measure.

Every text colour passes WCAG AA against the ground it sits on — seven pairs
across the two grounds — which `tools/contrast.py` enforces rather than assumes,
fitting for a CV whose subject ships accessibility work.

Both pages run with 2–3 mm of headroom, so `build.sh` fails rather than quietly
producing a third page.

Full rationale, component reference and the rules for changing any of it are in
[CLAUDE.md](CLAUDE.md).

## Before this goes out

**The phone number is not in this repo.** It lives in the gitignored
`/data/private.yaml`; `build.sh` seeds an empty copy from
`/data/private.example.yaml` when it is absent. A local build therefore carries
the number and the published PDF does not, which is deliberate — the repo is
public.

Five values no source can confirm are flagged `⚠ unverified` or `⚠ inferred`
where they sit in the YAML: the LinkedIn and Behance handles
(`/data/personal.yaml`), the pre-2022 job title and Zone24x7 start year
(`/data/experience.yaml`), and the BSc graduation year (`/data/education.yaml`).

Ten client and product names appear on the page and are now public. Whether they
may is [an open question](CLAUDE.md) that was deferred, not settled.
