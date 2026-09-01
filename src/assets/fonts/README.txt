Self-hosted webfonts. Do not move these to the Google Fonts CDN — on the sibling
site (ivantha.com) that CDN request was the only render-blocking resource on the
page, and same-origin fonts removed it.

These woff2 files are Google's own `latin` slices, taken byte-for-byte from the
Fontsource packages listed below. They are NOT subset or otherwise modified.
Both families are OFL-1.1 with a Reserved Font Name, so modifying the binaries
(subsetting included) would oblige us to rename the family. Copy new versions in
verbatim rather than running a subsetter over them.

  Fraunces  — @fontsource-variable/fraunces  (latin-full: ital/opsz/wght/SOFT/WONK)
  Karla     — @fontsource-variable/karla     (latin-wght, roman + italic)

Licences: OFL-Fraunces.txt, OFL-Karla.txt
