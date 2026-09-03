Self-hosted webfonts. Do not move these to the Google Fonts CDN — on the sibling
site (ivantha.com) that CDN request was the only render-blocking resource on the
page, and same-origin fonts removed it.

These woff2 files are Google's own `latin` slices, taken byte-for-byte from the
Fontsource packages listed below. They are NOT subset or otherwise modified.
Both families are OFL-1.1 with a Reserved Font Name, so modifying the binaries
(subsetting included) would oblige us to rename the family. Copy new versions in
verbatim rather than running a subsetter over them.

  Bodoni Moda — @fontsource-variable/bodoni-moda  (latin-standard, roman + italic)
  Archivo     — @fontsource-variable/archivo      (latin-wght,     roman + italic)

Bodoni Moda is taken in its `standard` cut, which carries `opsz` as well as
`wght`. That is deliberate and it is what the extra 20 kB per face buys: the
design sets this face from a 10.5px roman numeral to a 7rem headline, and a
Didone drawn for text has hairlines that disappear at display size while one
drawn for display has hairlines that disappear at text size. `font-optical-
sizing: auto` in _base.scss spends the axis; without the two-axis file it is
inert. Do not swap in the smaller `wght`-only files without removing that rule.

Archivo's `wdth` axis is deliberately not loaded. Nothing in the design
condenses or extends, and the two-axis file is markedly larger for an axis no
rule moves.

The CV keeps its own fonts in cv/fonts/ as static TTF instances, vendored so the
Typst build depends on nothing installed on the machine. That directory is
independent of this one; do not consolidate them.

Licence: OFL-Archivo.txt
