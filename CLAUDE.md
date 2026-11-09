# CLAUDE.md

Guidance for Claude Code working in this repository. `README.md` covers what the
project is and how to run it; this file covers what is easy to break.

### Stack

Astro 5, TypeScript, static output, zero client JS. Product pages are
frontmatter-only MDX in `src/content/systems/` with `zod` schemas in
`src/content.config.ts`; plain SCSS, no framework; pnpm on Node 22;
`astro:assets` for every content image; GitHub Pages via
`.github/workflows/deploy.yml` on push to `main`.

### The pages

**`/work/sodafresh` is a static route, not a `[slug]` page**, and must stay one.
Sodafresh is brand and print rather than a product, so it is not in
`data/systems.yaml` — and it must not be added there, because that file is
shared with the Typst CV's grouped inventory table and feeds the derived
"thirteen of twenty-four products" count on the work index. The page is
hand-built in `src/pages/work/sodafresh.astro`, borrowing the case-page classes
(`case-bar`, `case-head`, `case-meta`, `fig`, `figcap`) without joining the
collection. Astro prefers the static route, so it wins over `[slug].astro`
without any special handling.

**`/work/[slug]` builds a page for every entry in `data/systems.yaml`, written
or not.** The slug is derived from `product` by `systemSlug` in
`src/lib/slug.ts` rather than stored — the inventory is shared with the Typst
CV, and a `slug:` key only the website read is the same drift risk as a
`group:` key. Renaming a product therefore changes its URL.

Those files are frontmatter only. The direction this replaced put running prose
in the MDX body; the Plinth design argues a case in a fixed set of parts — a
metadata strip, numbered figures, a two-column argument, a list of what shipped
— so the parts are fields and `src/pages/work/[slug].astro` is the one layout.
The old bodies, and the forty-odd screens they showed that the design does not,
are in git.

### Domain

The site is **pamudi.com**, served by GitHub Pages. `public/CNAME` is what sets
that on the Pages side — the build copies it into `dist/`, and deleting it
un-sets the custom domain on the next deploy. Do not remove it while tidying
`public/`.

`base` is the default `/`, but internal links still go through `href()` in
`src/lib/url.ts`. Keep using it: Astro rewrites `src` on assets it processes and
never `href` on hand-written links, so a future move under a path would
otherwise mean hunting every link in the repo.

### Data is the single source of truth

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

## Reference

[Technical reference](agent_reference.md).
