Self-hosted webfonts. Do not move these to the Google Fonts CDN — on the sibling
site (ivantha.com) that CDN request was the only render-blocking resource on the
page, and same-origin fonts removed it.

These woff2 files are Google's own `latin` slices, taken byte-for-byte from the
Fontsource package listed below. They are NOT subset or otherwise modified.
Archivo is OFL-1.1 with a Reserved Font Name, so modifying the binaries
(subsetting included) would oblige us to rename the family. Copy new versions in
verbatim rather than running a subsetter over them.

  Archivo — @fontsource-variable/archivo  (latin-wght, roman + italic)

The `wdth` axis is deliberately not loaded. Nothing in the design condenses or
extends, and the two-axis file is markedly larger for an axis no rule moves.

The CV keeps its own fonts in cv/fonts/ as static TTF instances, vendored so the
Typst build depends on nothing installed on the machine. That directory is
independent of this one; do not consolidate them.

Licence: OFL-Archivo.txt
