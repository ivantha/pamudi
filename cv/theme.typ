// ─────────────────────────────────────────────────────────────────────────
//  theme.typ — "Band & Rule"
//
//  Every colour, typeface, size and rule weight in the CV lives here.
//  Nothing below this file's exports should be hard-coded downstream:
//  cv.typ assembles, content.typ carries words, this file carries the look.
// ─────────────────────────────────────────────────────────────────────────

// ── Colour ───────────────────────────────────────────────────────────────
// One accent hue — teal — in two tints, one per ground. Ratios are enforced
// by tools/contrast.py, not trusted to the eye.

// The light ground, which is most of the document.
#let paper       = rgb("#F1F3F2")   //  page ground
#let ink         = rgb("#141817")   // 16.07 : 1  AAA
#let mute        = rgb("#616768")   //  5.17 : 1  AA
#let accent      = rgb("#1F6357")   //  6.32 : 1  AA
#let rule        = rgb("#DFE3E1")   //  hairlines only, never type
#let rule-strong = rgb("#B2B6B5")   //  hairlines only, never type

// The dark masthead band on page 1.
#let band        = rgb("#14181A")   //  band ground
#let band-ink    = rgb("#ECEFEF")   // 15.45 : 1  AAA
#let band-mute   = rgb("#8E9698")   //  5.93 : 1  AA
#let band-accent = rgb("#7FC6B2")   //  9.04 : 1  AAA
#let band-meta   = rgb("#B9BFC0")   //  9.59 : 1  AAA
#let band-rule   = rgb("#2E3335")   //  hairlines only, never type

// ── Type ─────────────────────────────────────────────────────────────────
// Both families are vendored as static instances under fonts/ — see
// CLAUDE.md. Build with --font-path fonts or the weights will not resolve.
#let DISPLAY = "Cormorant Garamond"  // name, figures, titles, section names
#let TEXTF   = "Work Sans"           // everything read at length

#let SZ = (
  name:    31pt,     // the name, in the band
  figure:  21pt,     // statistic figures
  entry:   13.5pt,   // role titles
  rail:    12.5pt,   // italic section names
  degree:  10.8pt,   // education degrees
  lead:    10.4pt,   // profile paragraph only
  product: 10.2pt,   // product names in the systems table
  body:    8.4pt,    // everything read at length
  meta:    7.2pt,    // employer and institution names
  label:   6.6pt,    // role label and contact row, in the band
  year:    6.4pt,    // the year column of a dated list
  micro:   6.1pt,    // micro-labels, dates, folio
)

// ── Measure ──────────────────────────────────────────────────────────────
#let MARGIN   = 15mm   // page inset; the band bleeds past it
#let RAIL     = 22mm   // in-content column carrying section names
#let GUTTER   = 5mm
#let KV-LABEL = 26mm   // micro-label column of a kv / subsec row
#let KV-GAP   = 5mm
#let YEAR-COL = 14mm   // year column of a dated list
#let YEAR-GAP = 4mm

// ── CSS line boxes ───────────────────────────────────────────────────────
// A browser makes every line box exactly `line-height` tall, splitting the
// difference against the font's own ascent+descent as half-leading above and
// below. Typst instead defaults to cap-height..baseline — about 0.67em — so a
// SINGLE-line row (a table cell, a degree, a dated entry) comes out ~40%
// shorter than the design, while multi-line text looks right because `leading`
// makes up the difference. These map a CSS line-height onto Typst's line box,
// so one rule governs both cases and `leading` can go to zero.
#let FONT-METRICS = (
  "Cormorant Garamond": (asc: 0.924, desc: 0.287),  // hhea, /1000 upm
  "Work Sans":          (asc: 0.930, desc: 0.243),
)

#let lh(font, height) = {
  let m = FONT-METRICS.at(font)
  let half = (height - (m.asc + m.desc)) / 2
  (top-edge: (m.asc + half) * 1em, bottom-edge: -(m.desc + half) * 1em)
}

#let LH-BODY = 1.4     // everything inherits this in the design
#let LH-LEAD = 1.44    // the profile paragraph
#let LH-NAME = 1.02    // the name is set tight
#let LH-FIG  = 1.0     // and the statistic figures tighter still

// ── Type helpers ─────────────────────────────────────────────────────────

// CSS letter-spacing is relative; Typst tracking is absolute. Derive it from
// the size so a size change cannot silently break the tracking with it.
#let tracked(s, size: SZ.micro, em: 0.2, fill: mute, weight: 300) = text(
  font: TEXTF, size: size, fill: fill, weight: weight, tracking: size * em,
  upper(s),
)

// A thin-space-flanked middot, the document's only separator glyph. The design
// sets a U+2009 thin space (0.2em) that then also takes the 0.2em tracking, so
// 0.4em a side is the faithful gap — and it cannot be collapsed as whitespace.
#let dot = [#h(0.4em)·#h(0.4em)]

#let railhead(s) = text(
  font: DISPLAY, size: SZ.rail, style: "italic", weight: 400, fill: ink,
  ..lh(DISPLAY, LH-BODY), s,
)
#let microlabel(s) = tracked(s)
#let kvlabel(s)    = tracked(s, fill: accent)
#let datestamp(s)  = tracked(s, fill: accent)

// ── Components ───────────────────────────────────────────────────────────

// A hairline separating bands of the page.
#let hairline() = line(length: 100%, stroke: 0.4pt + rule)
#let band-hairline() = line(length: 100%, stroke: 0.4pt + band-rule)

// A section: italic name in the label column, content in the measure.
#let sec(title, body, after: 2.9mm) = {
  grid(columns: (RAIL, 1fr), column-gutter: GUTTER, railhead(title), body)
  v(after)
}

// The figures band, which lives inside the masthead. Numbers and labels are
// laid out as two separate grid rows so they share a baseline: bottom-aligning
// a figure inside a fixed-height box makes `3` and `24` sit differently.
// This has been reintroduced twice — leave it as two rows.
#let stat-band(stats) = {
  let n = stats.len()
  grid(columns: (1fr,) * n, column-gutter: 8mm,
    ..stats.map(s => text(
      font: DISPLAY, size: SZ.figure, weight: 300, fill: band-accent,
      ..lh(DISPLAY, LH-FIG), s.at(0))))
  v(2mm)
  grid(columns: (1fr,) * n, column-gutter: 8mm,
    ..stats.map(s => tracked(s.at(1), fill: band-mute)))
}

// The eyebrow above the name: a label at each end of the band.
#let eyebrow(lead, trail) = grid(
  columns: (1fr, auto), align: (left + bottom, right + bottom),
  tracked(lead, em: 0.28, fill: band-mute),
  tracked(trail, em: 0.28, fill: band-mute),
)

// The full-bleed dark masthead. Every word arrives as an argument.
#let masthead(
  eyebrow-lead: "", city: "", name: "", role: "", spec: (), stats: (),
  contact: (),
) = block(
  width: 100%, fill: band, above: 0pt, below: 0pt,
  inset: (x: MARGIN, top: 11mm, bottom: 9mm),
)[
  #set text(font: TEXTF, size: SZ.body, weight: 300, fill: band-ink, ..lh(TEXTF, LH-BODY))
  #show link: set text(fill: band-meta)
  #eyebrow(eyebrow-lead, city)
  #v(4mm)
  #block(above: 0pt, below: 0pt, text(
    font: DISPLAY, size: SZ.name, weight: 300, fill: band-ink,
    ..lh(DISPLAY, LH-NAME), name))
  #v(4mm)
  #grid(columns: (auto, 1fr), column-gutter: 7mm, align: (left + bottom, left + bottom),
    tracked(role, size: SZ.label, em: 0.28, fill: band-accent),
    tracked(spec.join(dot), fill: band-mute),
  )
  #v(5.5mm)
  #stat-band(stats)
  #v(4mm)
  #band-hairline()
  #v(3mm)
  #grid(columns: (1fr,) * contact.len(), column-gutter: 8mm,
    ..contact.map(c => text(size: SZ.label, fill: band-meta, c)))
]

// One role: title and employer left, dates in accent right, then the items as
// plain paragraphs — this system has no bullet glyphs.
#let role-entry(role, org, place, dates, items) = {
  grid(columns: (1fr, auto), column-gutter: 4mm, align: (left + bottom, right + bottom),
    [#text(font: DISPLAY, size: SZ.entry, weight: 500, fill: ink, ..lh(DISPLAY, LH-BODY), role) #h(3mm)
     #text(size: SZ.meta, fill: mute)[#org, #place]],
    datestamp(dates),
  )
  v(2.4mm)
  grid(columns: 1fr, row-gutter: 2.2mm, ..items)
}

// Micro-label in accent, value in ink. The label is nudged down optically so
// its cap-height sits on the value's first line rather than above it.
#let kv(label, value) = {
  grid(columns: (KV-LABEL, 1fr), column-gutter: KV-GAP,
    move(dy: 0.9mm, kvlabel(label)),
    text(size: SZ.body, fill: ink, value))
  v(0.9mm)
}

// A sub-heading inside a section: kv's geometry, glued to the block it
// introduces so the label can never be orphaned at a page break.
#let subsec(label, body) = {
  block(breakable: false, grid(columns: (KV-LABEL, 1fr), column-gutter: KV-GAP,
    move(dy: 0.9mm, kvlabel(label)),
    body))
  v(0.9mm)
}

// A dated line: year in a narrow left column, entry to its right.
#let dated(year, body) = grid(
  columns: (YEAR-COL, 1fr), column-gutter: YEAR-GAP,
  move(dy: 0.6mm, text(
    size: SZ.year, fill: mute, tracking: SZ.year * 0.1,
    number-type: "lining", number-width: "tabular", year)),
  text(size: SZ.body, fill: ink, body),
)

// A list of dated lines, at the design's row rhythm.
#let dated-list(rows) = grid(columns: 1fr, row-gutter: 1mm,
  ..rows.map(r => dated(r.at(0), r.at(1))))

// One education row: degree and institution left, years in accent right.
#let degree-entry(deg, inst, years) = grid(
  columns: (1fr, auto), column-gutter: 6mm, align: (left + bottom, right + bottom),
  [#text(font: DISPLAY, size: SZ.degree, weight: 500, fill: ink, ..lh(DISPLAY, LH-BODY), deg) #h(2.5mm)
   #text(size: SZ.meta, fill: mute, inst)],
  datestamp(years),
)

// Three-column rules-between table for the design-system inventory. Rows are
// (product, scope, implementation, led); `led` colours the scope in accent.
#let systable(head, rows) = table(
  columns: (auto, auto, 1fr),
  align: (left + top, left + top, left + top),
  inset: (x, y) => (
    left: 0mm, right: 5mm,
    top: if y == 0 { 0mm } else { 0.45mm },
    bottom: if y == 0 { 1.4mm } else { 0.45mm },
  ),
  stroke: (x, y) => (
    bottom: if y == 0 { 0.4pt + rule-strong } else { 0.4pt + rule },
  ),
  table.header(..head.map(h => microlabel(h))),
  ..rows.map(r => (
    text(font: DISPLAY, size: SZ.product, weight: 500, fill: ink,
         ..lh(DISPLAY, LH-BODY), r.at(0)),
    text(size: SZ.body, fill: if r.at(3) { accent } else { ink }, r.at(1)),
    text(size: SZ.body, fill: mute, r.at(2)),
  )).flatten()
)

// The running folio, on both pages. Numbers are zero-padded and tabular so
// `01 / 02` and `02 / 02` occupy the same width at the same optical weight.
#let zero2(n) = if n < 10 { "0" + str(n) } else { str(n) }

#let folio(name, role, n, total) = grid(
  columns: (1fr, auto),
  tracked([#name#dot#role]),
  tracked(text(number-width: "tabular")[#zero2(n) / #zero2(total)]),
)
