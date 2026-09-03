# Design archive

Every frame exported from Pamudi's Figma file on 2026-09-03, whether the site
uses it or not, kept so the extraction does not have to be repeated and so the
material behind each system page is inspectable.

**This is an archive, not a publication queue.** Nothing here has been through
the frame-by-frame check in `CLAUDE.md`, "Whose site this is". Before anything
moves from here into `src/assets/`, look at it: a client logo, a product
wordmark, real customer data, a third party who did not agree to appear. The
automated filter described below removes the cases a machine can find. It is a
floor, not a clearance.

## What is here

Folders are named for the `product` in `data/systems.yaml` they belong to, not
for the Figma page they came from, so the archive lines up with the site and
with `/work/<slug>`. Web and mobile modules of one product are split.

| Folder                           |  Frames |
| -------------------------------- | ------: |
| `consumer-delivery-platform/`    |      26 |
| `event-design/`                  |       5 |
| `freight-logistics-cockpit/`     |      17 |
| `in2ocean/`                      |      44 |
| `manufacturing-warehouse-app/`   |     581 |
| `mining-site-tool-platform/`     |      23 |
| `precision-agriculture-app/`     |      31 |
| `warehouse-management-platform/` |     223 |
| **Total**                        | **950** |

Lossless WebP throughout, long edge capped at 1600px. Lossless because an
archive should not degrade; WebP because it halves the size at no quality cost.
A handful of frames whose source was smaller than any WebP encoding kept their
original format.

`in2ocean/` is not anonymised and does not need to be: it is her own project.
`event-design/` holds the IEEE student-conference pieces already published on
the About page.

## What was withheld, and why

76 frames were exported but are **not** in this archive. Every one of
them was withheld by an automated pass, not by taste: each frame was rendered to
text with `tesseract`, and any frame whose text contained a client or product
name was dropped. The names searched were Haycarb, Acetrak, MaxDine, Marx,
EZPassport, EZIOS, SFI, SFIKS, Beautesoft, Addium and Zone24x7.

That matters because `data/systems.yaml` anonymises every client on this site to
a domain descriptor, and this repository is public. A branded frame committed
here would undo that anonymisation just as surely as putting it on a page.

The withheld frames are still obtainable: re-export the page through the Figma
web app as described in `scripts/fetch-figma.mjs`. Nothing is lost, only
un-published.

### `consumer-delivery-platform` — 13 withheld

- `marx/Challenge-1.png`
- `marx/Challenge.png`
- `marx/Enable biometric login_-1.png`
- `marx/Food Ordering-4.png`
- `marx/Food Ordering.png`
- `marx/Home.png`
- `marx/Manage cards & accounts-3.png`
- `marx/Manage cards & accounts.png`
- `marx/Money market account.png`
- `marx/Profile.png`
- `marx/Services menu.png`
- `marx/Taxi Booking-3.png`
- `marx/Taxi Booking-5.png`

### `manufacturing-warehouse-app` — 12 withheld

- `haycarb-mobile/Login - Haycarb.png`
- `haycarb-web/Delete locations.png`
- `haycarb-web/Locations.png`
- `haycarb-web/Login page suggestion 1.png`
- `haycarb-web/Login page suggestion 2.png`
- `haycarb-web/Login page suggestion 3.png`
- `haycarb-web/Login page-1.png`
- `haycarb-web/Login page-2.png`
- `haycarb-web/Login page.png`
- `haycarb-web/Pin Page.png`
- `haycarb-web/Sprint1-HomePage.png`
- `haycarb-web/Verification page.png`

### `mining-site-tool-platform` — 11 withheld

- `sfi-mobile/Reset Password.png`
- `sfi-mobile/Test Compliance - Create.png`
- `sfi-web/Add Item-1.png`
- `sfi-web/Add Item-2.png`
- `sfi-web/Asset Catalogue-1.png`
- `sfi-web/Asset Catalogue.png`
- `sfi-web/Assets page.png`
- `sfi-web/Configure Currency --  Ordering - Plan Orders.png`
- `sfi-web/Configure Currency -- Ordering - Plan Orders - Source Assets.png`
- `sfi-web/Settings Page.png`
- `sfi-web/View CCTV Footage.png`

### `warehouse-management-platform` — 40 withheld

- `acetrak-mobile/Acetrak - Ashvinth Premanantha 1.png`
- `acetrak-mobile/Login-directed.png`
- `acetrak-mobile/Login.png`
- `acetrak-mobile/app-logo.png`
- `acetrak-web/BOM Management.png`
- `acetrak-web/Customer Management.png`
- `acetrak-web/Cycle Counting Management-1.png`
- `acetrak-web/Cycle Counting Management.png`
- `acetrak-web/Dashboard - DO Pending.png`
- `acetrak-web/Dashboard - PO In Progress.png`
- `acetrak-web/Dashboard.png`
- `acetrak-web/Inbound Processing - Dimensions.png`
- `acetrak-web/Inbound Processing - Existing Packages.png`
- `acetrak-web/Inbound Processing - Images.png`
- `acetrak-web/Inbound Processing - New Packages-1.png`
- `acetrak-web/Inbound Processing - New Packages-2.png`
- `acetrak-web/Inbound Processing - New Packages.png`
- `acetrak-web/Inbound Processing - Summary.png`
- `acetrak-web/Inbound Processing.png`
- `acetrak-web/Inventory Management-1.png`
- `acetrak-web/Inventory Management-2.png`
- `acetrak-web/Inventory Management.png`
- `acetrak-web/Inventory Scan-1.png`
- `acetrak-web/Inventory Scan.png`
- `acetrak-web/Navigation-2.png`
- `acetrak-web/Navigation.png`
- `acetrak-web/Order Management - Batch Pick.png`
- `acetrak-web/Order Management - Create Batch Creating cont..png`
- `acetrak-web/Order Management - Create Batch Creating.png`
- `acetrak-web/Order Management.png`
- `acetrak-web/Order Packing-1.png`
- `acetrak-web/Order Packing.png`
- `acetrak-web/PO Management - Purchase Order - Detail View.png`
- `acetrak-web/PO Management 1.png`
- `acetrak-web/PO Management 2.png`
- `acetrak-web/Return Management.png`
- `acetrak-web/SKU Management-1.png`
- `acetrak-web/SKU Management.png`
- `acetrak-web/Settings.png`
- `acetrak-web/Supplier Management.png`

## Two limits worth knowing

**OCR cannot read a logo that is pure shape.** It read every wordmark in this
file, which is why the filter caught the sidebar and login frames it was aimed
at, and a separate geometric sweep for the mining-site product's solid orange
brand rail found nothing left over. But a purely pictorial mark on some future
page would pass straight through. Look before you publish.

**Redaction is a per-frame decision, never a coordinate.** An earlier pass on
the mining-site screens painted the rail's brand colour at a fixed position
across four frames, two of which had no rail at all, which added a
brand-coloured block to screens that never had one. The archive build was
written to check each frame's own pixels instead, and where that check was still
the wrong tool the frame was withheld rather than altered.
