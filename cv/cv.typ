// ─────────────────────────────────────────────────────────────────────────
//  cv.typ — Pamudi Dahanayake, two-page CV.
//
//  Assembly only. Look lives in theme.typ, words live in /data/*.yaml — the
//  same files the website reads. Nothing here should ever hold a fact.
//  Build:  ./build.sh   (sets --root .. and --font-path fonts)
// ─────────────────────────────────────────────────────────────────────────

#import "theme.typ": *
#import "common/loaders.typ": *

#let variant = "cv"

// ── Data ─────────────────────────────────────────────────────────────────
#let personal   = yaml("/data/personal.yaml")
#let private    = yaml("/data/private.yaml")
#let experience = load-yaml-list("/data/experience.yaml", variant)
#let systems    = load-yaml-list("/data/systems.yaml", variant)
#let skills     = load-yaml-list("/data/skills.yaml", variant)
#let education  = yaml("/data/education.yaml")
#let community  = yaml("/data/community.yaml")

#let NAME  = personal.name
#let ROLE  = personal.role
#let PHONE = private.at("phone", default: "")

// The contact row. Phone is dropped entirely when the private overlay is empty,
// which is what CI builds with — the published PDF carries no phone number.
#let CONTACT = (
  link("mailto:" + personal.contact.email)[#personal.contact.email],
)
#let CONTACT = CONTACT + if PHONE != "" { ([#PHONE],) } else { () }
#let CONTACT = CONTACT + (
  personal.contact.links
    .map(l => link(l.url)[#l.at("display", default: l.label)])
    .join(h(3mm)),
  [#link(personal.blog.url)[#personal.blog.at("title_cv", default: personal.blog.title)], #personal.blog.where],
)

// ── Page ─────────────────────────────────────────────────────────────────
// The horizontal margin is zero and the 15 mm inset lives on the content
// instead, so the masthead band can bleed to the paper edge. Everything that
// is not the band is wrapped in `pad(x: MARGIN)`.
#set page(
  paper: "a4",
  margin: (x: 0mm, top: 0mm, bottom: 14mm),
  fill: paper,
  footer: context pad(x: MARGIN, folio(
    NAME, ROLE,
    counter(page).get().first(),
    counter(page).final().first(),
  )),
  footer-descent: 4.5mm,
)

#set text(font: TEXTF, size: SZ.body, weight: 300, fill: ink, lang: "en", region: "gb",
  ..lh(TEXTF, LH-BODY))
// The line box already carries the full line-height, so leading is zero: lines
// stack exactly LH-BODY apart, and a lone line is that tall too.
#set par(justify: false, leading: 0em, spacing: 0em)
#show link: set text(fill: accent)

// ═════════════════════════ PAGE 1 ════════════════════════════════════════

#masthead(
  eyebrow-lead: personal.eyebrow,
  city: personal.location,
  name: NAME,
  role: ROLE,
  spec: personal.specialisms,
  stats: stats-tuples(personal.stats),
  contact: CONTACT,
)

#pad(x: MARGIN, top: 7mm)[

  #sec("Profile", {
    set text(font: DISPLAY, size: SZ.lead, weight: 400, fill: ink, ..lh(DISPLAY, LH-LEAD))
    render-md(personal.summary)
  }, after: 4mm)

  #sec("Experience", grid(columns: 1fr, row-gutter: 5mm,
    ..experience.map(e => role-entry(
      field(e, "role", variant),
      field(e, "org", variant),
      field(e, "place", variant),
      field(e, "dates", variant),
      bullets-for(e, variant).map(b => render-md(field(b, "text", variant))),
    ))
  ), after: 0mm)

]

// ═════════════════════════ PAGE 2 ════════════════════════════════════════
#pagebreak()

#pad(x: MARGIN, top: 11mm)[

  #sec("Design systems", systable(
    ("Product", "Scope", "Design → implementation"),
    system-tuples(systems),
  ), after: 5mm)

  #sec("Toolkit", { for s in skills { kv(s.category, render-md(s.stack)) } }, after: 5mm)

  #sec("Education", {
    grid(columns: 1fr, row-gutter: 2.5mm,
      ..keep(education.entries, variant).map(e => degree-entry(..degree-args(e))))
    v(2.5mm)
    subsec("Professional training",
      text(size: SZ.body, fill: ink, render-md(education.training)))
  }, after: 5mm)

  #sec("Community", {
    subsec("Mentoring",       dated-list(dated-tuples(keep(community.mentoring, variant))))
    subsec("Speaking",        dated-list(dated-tuples(keep(community.speaking, variant))))
    subsec("Event and brand", dated-list(dated-tuples(keep(community.events, variant))))
    subsec("Judging panels",  text(size: SZ.body, fill: ink, render-md(community.judging)))
    subsec("Competitions",    text(size: SZ.body, fill: ink, render-md(community.competitions)))
  }, after: 0mm)

]
