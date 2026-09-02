// ─────────────────────────────────────────────────────────────────────────
//  loaders.typ — read the repo-root YAML and adapt it for theme.typ.
//
//  Paths are absolute within the Typst root, which build.sh sets to the repo
//  root via `--root ..`. So "/data/experience.yaml" resolves to the same file
//  the Astro site reads. That flag is the whole bridge between the two halves
//  of this repo; without it every `yaml()` call below fails to resolve.
// ─────────────────────────────────────────────────────────────────────────

// Every variant-scoped entry in data/*.yaml may carry an `include_in` list,
// e.g. `include_in: [cv, web]`. An entry with no such key defaults to
// `(variant,)`, so it appears everywhere; `include_in: []` hides it everywhere
// while keeping the record.
#let load-yaml-list(path, variant) = {
  yaml(path).filter(e => variant in e.at("include_in", default: (variant,)))
}

// Same filter, for a list nested inside a mapping — education.entries and the
// community lists, which cv.typ reads with a plain `yaml()` rather than through
// `load-yaml-list`. Without this the PDF silently ignores an `include_in` that
// the website already honours, and the two consumers drift.
#let keep(rows, variant) = {
  rows.filter(e => variant in e.at("include_in", default: (variant,)))
}

// Fields that differ between consumers use a per-variant suffix: `role` is the
// default, `role_cv` overrides it for the CV. No cross-variant fallback here,
// deliberately — the website's pickField() does fall back, and the difference
// is documented on both sides.
#let field(item, key, variant) = {
  item.at(key + "_" + variant, default: item.at(key, default: none))
}

// Same filter semantics as `load-yaml-list`, applied to an item's bullets.
#let bullets-for(item, variant) = {
  item.at("bullets", default: ()).filter(
    b => variant in b.at("include_in", default: (variant,)))
}

// YAML strings carry Typst markup (*strong*, _emphasis_). This turns them into
// content. Markup eval, not code eval, and every string originates in our own
// data/ directory.
#let render-md(s) = eval(s, mode: "markup")

// ── Shape adapters ───────────────────────────────────────────────────────
// theme.typ's components take positional tuples. These keep the YAML readable
// (named keys) without touching the components, which are load-bearing.

#let stats-tuples(stats) = stats.map(s => (s.value, s.label))

// Group systems by scope for the CV's design-systems table. Returns an array
// of (label: string, rows: array of (product, detail-or-none, stack)) where
// groups are Owned / Extended / Contributed / Further engagements.
#let system-groups(systems, variant) = {
  let owned = ()
  let extended = ()
  let contributed = ()
  let further = ()
  let personal = ()

  for s in systems {
    let scope = s.at("scope", default: "")
    let row = (
      s.product,
      s.at("detail", default: none),
      field(s, "stack", variant),
    )
    if s.at("lead", default: false) {
      owned.push(row)
    } else if scope == "Personal project" {
      // Mirrors `groupSystems` in src/lib/systems.ts. The one entry with this
      // scope is `include_in: [web]`, so this branch never fires here today;
      // it exists so the two derivations cannot drift.
      personal.push(row)
    } else if scope.starts-with("Extended") {
      extended.push(row)
    } else if scope == "Contributed" {
      contributed.push(row)
    } else {
      further.push(row)
    }
  }

  let groups = ()
  if owned.len() > 0 { groups.push((label: "Owned,\nfrom scratch", rows: owned)) }
  if extended.len() > 0 { groups.push((label: "Extended", rows: extended)) }
  if contributed.len() > 0 { groups.push((label: "Contributed", rows: contributed)) }
  if further.len() > 0 { groups.push((label: "Further\nengagements", rows: further)) }
  if personal.len() > 0 { groups.push((label: "Personal", rows: personal)) }
  groups
}

#let dated-tuples(rows) = rows.map(r => (r.year, render-md(r.text)))

#let degree-args(e) = (e.degree, e.institute, e.dates)
