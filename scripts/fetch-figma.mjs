/**
 * Exports material from Pamudi's portfolio Figma file into `staging/figma/`.
 *
 * The file has fifteen pages: eleven products, a page of volunteering and
 * mentoring photographs, a hobbies page, an "Extra" page of student-conference
 * design work, and a personal group project. This script is the manifest of
 * what is on each, at what scale it renders, and — the part worth keeping —
 * what the look-at-every-frame check concluded about it.
 *
 * NOTHING THIS SCRIPT DOWNLOADS IS PUBLISHABLE UNTIL IT HAS BEEN LOOKED AT,
 * which is why everything lands in `staging/figma/` and not in `src/assets/`.
 * Staging is gitignored. Moving a file out of it is a deliberate act taken
 * after the check in CLAUDE.md, "Whose site this is": a client logo, a product
 * wordmark, real customer data, and — on the photographic pages — third
 * parties who did not agree to appear on this site.
 *
 * Usage:
 *
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs           # everything pending
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs --page ezios
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs --all     # re-fetch, overwriting
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs --dropped # widen to the turned-down set
 *   node scripts/fetch-figma.mjs --list                         # the manifest, no token needed
 *
 * The token is a personal access token from figma.com → Settings → Security →
 * Personal access tokens, with **File content: Read-only** scope. It is free on
 * every plan. Do not commit it, and do not put it in `data/` — this repo is
 * public.
 *
 * ── Three routes, and the free one is the browser ───────────────────────────
 *
 * `mode: "render"` nodes are vector artboards — the UI screens. Rasterising
 * them through the API means `GET /v1/images`, and on the Starter plan that
 * endpoint has a cost budget this account has **exhausted**: it answers 429
 * with `x-figma-rate-limit-type: low` and a `retry-after` around 392,000
 * seconds (checked again 2026-09-03, so it clears about 2026-09-07). The Figma
 * MCP server's `get_screenshot` and `download_assets` share one account-level
 * cap and are also spent. Both API routes are therefore dead for UI screens.
 *
 * **The Figma web app's own export is not metered, and that is how the product
 * screens in `src/assets/systems/` were actually obtained.** Open the file,
 * select a page's frames (Escape, then Cmd+A), add an export setting, pick the
 * scale, and Export N layers; the ZIP lands in ~/Downloads. Two things to know:
 * adding an export setting is a document edit, so Cmd+Z it afterwards rather
 * than leaving her file changed; and Chrome will name a second ZIP
 * "... (1).zip" rather than overwriting, so check what you actually extracted
 * instead of trusting the filename. 1,047 frames across twelve pages came out
 * this way on 2026-09-03. Prefer this route; the manifest below is still the
 * record of what is on each page and what the review concluded.
 *
 * `mode: "fill"` nodes are bitmaps already uploaded into the file — photographs
 * and flat artwork placed on a rectangle. They come from
 * `GET /v1/files/:key/images`, which returns the stored originals and is a
 * different quota that is **not** exhausted. The About-page picture sets came
 * through that endpoint, and it still works.
 *
 * ── Redaction is now allowed, within one rule ───────────────────────────────
 *
 * Oshan cleared covering a client mark rather than dropping the frame
 * (2026-09-03). The rule that makes it safe: paint the mark out in the app's
 * own surrounding colour so it reads as an empty brand slot, never a black
 * censor bar, and never touch anything else in the pixels. The SFI screens in
 * `src/assets/systems/mining-site-tool-platform/` are the worked example, and
 * the page's frontmatter records exactly what was covered. A redacted frame
 * must still pass every other part of the check.
 */
import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

const FILE_KEY = "J9n3q2TRVcsh7HdKxV8Bd8"
const STAGING = path.resolve("staging/figma")

/**
 * `verdict` records the outcome of the look-at-every-frame check, so a later
 * run does not silently re-acquire material that was already considered and
 * turned down. It is the memory of a review, not a preference:
 *
 *   published  reviewed, cleared, and now in `src/assets/`. `asset` says where.
 *   pending    wanted, not yet obtainable or not yet reviewed. Fetched by
 *              default, into staging, where it waits for the check.
 *   dropped    looked at, nothing wrong with it, not worth a figure. Fetch with
 *              --dropped to reconsider one.
 *   blocked    must not be published. Never fetched. The reason is recorded
 *              beside it and is not a matter of taste.
 */
const PAGES = [
    // ══ Products ════════════════════════════════════════════════════════════
    // Every page here is a client system, and the site anonymises its client to
    // a domain descriptor (`data/systems.yaml`). These are branded
    // applications: a login screen with the client's logo on it undoes that
    // anonymisation in one image. So the check on this material is not only
    // "does it leak customer data", it is "does it name the client" — and the
    // answer will often be yes, in the header of every screen. Expect to
    // publish deep screens and to block the branded ones, as happened with the
    // photo-ID modal board below.
    {
        key: "ezios",
        figmaPage: "0:1",
        title: "EZIOS (owned)",
        product: "Photo-ID compliance app",
        mode: "render",
        nodes: [
            // Reviewed 2026-09-02, before the render quota ran out. Sixteen
            // screens and boards are on the page; these are the ones this
            // script fetched. Scale is chosen per node so the committed PNG
            // lands near 2× its largest rendered width and no higher.
            {
                id: "4:24916",
                slug: "ds-board",
                scale: 0.5,
                verdict: "published",
                asset: "systems/photo-id/ds-board.png",
                note: "The whole design-system board, as a contact sheet",
            },
            {
                id: "4:24951",
                slug: "ds-colour",
                scale: 2,
                verdict: "published",
                asset: "systems/photo-id/ds-colour.png",
                note: "Colour palette",
            },
            {
                id: "4:24917",
                slug: "ds-typography",
                scale: 4,
                verdict: "published",
                asset: "systems/photo-id/ds-typography.png",
                note: "Typography scale",
            },
            {
                id: "4:25085",
                slug: "ds-button",
                scale: 2,
                verdict: "published",
                asset: "systems/photo-id/ds-button.png",
                note: "Button: size × style × state × label",
            },
            {
                id: "4:24583",
                slug: "ds-icons",
                scale: 3,
                verdict: "published",
                asset: "systems/photo-id/ds-icons.png",
                note: "The icon set, 44px grid",
            },
            {
                id: "4:23660",
                slug: "edit-photo",
                scale: 2,
                verdict: "published",
                asset: "systems/photo-id/edit-photo.png",
                note: "Edit Photo screen",
            },

            // The modal board carries the client's product name in plain text,
            // twice: an application-version row reading "ezPassport Studio
            // 1.3.0" and an address row naming the company and its office. A
            // printer serial and two unmasked phone strings sit beside them.
            // The whole site anonymises this client to a domain descriptor, so
            // publishing this undoes that in one image. It stays blocked until
            // Pamudi says the product name is publishable, and even then it
            // wants a purpose-built crop rather than the raw board — at web
            // width nothing on it is readable.
            {
                id: "4:24137",
                slug: "ds-modals",
                scale: 0.6,
                verdict: "blocked",
                note: "Modal section — CARRIES THE CLIENT'S PRODUCT NAME",
            },

            // All clean: no branding, no personal data. They simply do not earn
            // a figure. The button matrix already makes the "every state is
            // drawn" point better than any of them, and a portfolio page is not
            // an asset dump.
            { id: "4:25022", slug: "ds-tabbar", scale: 3, verdict: "dropped", note: "Tab bar" },
            {
                id: "4:24988",
                slug: "ds-progressbar",
                scale: 3,
                verdict: "dropped",
                note: "Progress bar",
            },
            {
                id: "4:25604",
                slug: "ds-textfield",
                scale: 3,
                verdict: "dropped",
                note: "Text field",
            },
            { id: "4:25631", slug: "ds-select", scale: 3, verdict: "dropped", note: "Select" },
            {
                id: "4:25655",
                slug: "ds-searchfield",
                scale: 3,
                verdict: "dropped",
                note: "Search field",
            },
            { id: "4:25646", slug: "ds-stepper", scale: 4, verdict: "dropped", note: "Stepper" },
            { id: "4:25497", slug: "ds-alert", scale: 2, verdict: "dropped", note: "Alert" },
            { id: "4:25460", slug: "ds-keyboard", scale: 3, verdict: "dropped", note: "Keyboard" },
            { id: "4:25765", slug: "ds-list", scale: 3, verdict: "dropped", note: "List" },
            {
                id: "4:25810",
                slug: "ds-tablecell",
                scale: 3,
                verdict: "dropped",
                note: "Table cell",
            },
            {
                id: "4:25872",
                slug: "ds-table",
                scale: 2,
                verdict: "dropped",
                note: "Table — unreadable at web width",
            },
            { id: "4:25441", slug: "ds-sheet", scale: 1.5, verdict: "dropped", note: "Sheet" },
            {
                id: "4:25254",
                slug: "ds-menu",
                scale: 1.5,
                verdict: "dropped",
                note: "Menu — unreadable at web width",
            },
            {
                id: "4:24528",
                slug: "ds-flags",
                scale: 3,
                verdict: "dropped",
                note: "Country flags",
            },
            {
                id: "4:24464",
                slug: "ds-imagery",
                scale: 0.5,
                verdict: "dropped",
                note: "Imagery section — near-empty frame",
            },
        ],
    },

    // The ten product pages below have never been exported: the render quota
    // was already spent when they were catalogued. Each carries a shortlist
    // picked from the frame names — a landing or login screen, and the screens
    // that carry the system's actual work — chosen so one run gives a coherent
    // flow rather than a pile. They are candidates, not selections: none has
    // been looked at, and the branding question above is unanswered for all of
    // them.
    {
        key: "aroya",
        figmaPage: "5:36595",
        title: "Aroya (owned)",
        product: "Precision agriculture app",
        review: `Reviewed 2026-09-03, whole page. CLEAN: no client logo and no product wordmark anywhere. The demo facility is "Vandelay Industries", a placeholder, and the rooms are Blackfin / Prop 2 / Flower 1. Six frames published. The Journal view was dropped on its own: it lists named task assignees, which is third-party data whether or not the personas are invented.`,
        mode: "render",
        nodes: [
            {
                id: "7:151387",
                slug: "facility-dashboard",
                scale: 1,
                verdict: "pending",
                note: "Facility Dashboard section, 2045×2040",
            },
            {
                id: "7:147644",
                slug: "room-dashboard",
                scale: 0.25,
                verdict: "pending",
                note: "Room Dashboard section — 8104×6156, contact-sheet scale only",
            },
        ],
    },
    {
        key: "efl",
        figmaPage: "5:36596",
        title: "EFL Cockpit (owned)",
        product: "Freight logistics cockpit",
        review: `Reviewed 2026-09-03, whole page. CLEAN, and the reason is worth keeping: the app brands itself "COCKPIT APP", never the client, so these needed no redaction at all. Rack IDs repeat one placeholder (A07-01-01). Five frames published. The button component set was dropped: it exports with Figma's own dashed component-set boundary in the pixels, which reads as an unfinished export on a portfolio.`,
        mode: "render",
        nodes: [
            { id: "7:154981", slug: "home", scale: 2, verdict: "pending", note: "Home" },
            { id: "7:155002", slug: "warehouse", scale: 2, verdict: "pending", note: "Warehouse" },
            {
                id: "7:155121",
                slug: "home-drawer",
                scale: 2,
                verdict: "pending",
                note: "Home, drawer expanded",
            },
            {
                id: "7:155166",
                slug: "racks-drawer",
                scale: 2,
                verdict: "pending",
                note: "Warehouse racks, drawer expanded",
            },
            {
                id: "7:155269",
                slug: "bay-drawer",
                scale: 2,
                verdict: "pending",
                note: "Warehouse bay, drawer expanded",
            },
            {
                id: "7:155098",
                slug: "camera-disconnected",
                scale: 2,
                verdict: "pending",
                note: "Home, camera disconnected — the failure state",
            },
            {
                id: "7:155521",
                slug: "ds-button",
                scale: 3,
                verdict: "pending",
                note: "Button component set",
            },
        ],
    },
    {
        key: "sfi-web",
        figmaPage: "5:36600",
        title: "SFI Web (Collaborated)",
        // kb/open-questions.md records that SFI may or may not be the same
        // system as SFIKS. The frame names here — asset catalogue, object
        // types, work-pack reservation, dispatch — match the mining-site
        // description closely, but "closely" is not a mapping. Confirm with
        // Pamudi before filing anything from this page under a product.
        product: "Mining-site tool platform (UNCONFIRMED — see note)",
        review: `Reviewed 2026-09-03, whole page. The client's three-letter mark sits in the sidebar of EVERY screen, and one page title repeated it in parentheses. Four frames published WITH BOTH PAINTED OUT in the app's own orange and title-bar grey — see the redaction rule in the header, and the frontmatter of the system page. Everything else in those pixels is untouched and was already generic (WD40, sand bags, resin discs; prices zeroed; a placeholder signed-in persona). These frames also carry a "Kiosk Location" selector, which is evidence toward kb/open-questions.md #4 (is SFI the same system as SFIKS). Evidence, not a ruling.`,
        mode: "render",
        nodes: [
            {
                id: "13:287161",
                slug: "asset-catalogue",
                scale: 1.5,
                verdict: "pending",
                note: "Asset Catalogue",
            },
            {
                id: "13:287231",
                slug: "assets",
                scale: 1.5,
                verdict: "pending",
                note: "Assets page",
            },
            {
                id: "13:287283",
                slug: "add-object-type",
                scale: 1.5,
                verdict: "pending",
                note: "Add Object Type",
            },
            {
                id: "13:287820",
                slug: "plan-orders",
                scale: 1,
                verdict: "pending",
                note: "Ordering, Plan Orders",
            },
            {
                id: "13:287667",
                slug: "no-internet",
                scale: 1.5,
                verdict: "pending",
                note: "No-internet status — the failure state",
            },
        ],
    },
    {
        key: "sfi-mobile",
        figmaPage: "5:36601",
        title: "SFI Mobile (Collaborated)",
        product: "Mining-site tool platform (UNCONFIRMED — see sfi-web)",
        review: `Reviewed 2026-09-03. The password screens carry the client's logo at full size and the Test Compliance detail prints the client as an Ownership value. Nothing published: the web module already covers this product, and these exported at 1x (360×800), too small to use without a re-export anyway.`,
        mode: "render",
        nodes: [
            {
                id: "13:294181",
                slug: "rfid-remapper",
                scale: 3,
                verdict: "pending",
                note: "RFID Remapper",
            },
            {
                id: "13:294190",
                slug: "work-pack-bin",
                scale: 3,
                verdict: "pending",
                note: "Work Pack Reservation, change bin",
            },
            {
                id: "13:294322",
                slug: "dispatch-objects",
                scale: 3,
                verdict: "pending",
                note: "Dispatch Assets, object dispatch",
            },
            {
                id: "13:294304",
                slug: "test-compliance",
                scale: 3,
                verdict: "pending",
                note: "Test Compliance, create",
            },
        ],
    },
    {
        key: "haycarb-web",
        figmaPage: "5:36599",
        title: "Haycarb Web (Collaborated)",
        product: "Manufacturing warehouse app",
        review: `Reviewed 2026-09-03, whole page. Two findings. Every login screen carries the client's logo full size — none published. And the Approvals screen's sidebar names the client's raw material, which narrows "listed multinational manufacturer" to its industry; that one is clean in every other respect and was still dropped. Two frames published. Demo data is synthetic throughout (Machine A–F, barcodes MM111111 upward).`,
        mode: "render",
        nodes: [
            // 519 top-level nodes on this page. Six.
            {
                id: "13:196775",
                slug: "admin-landing",
                scale: 1,
                verdict: "pending",
                note: "Admin landing",
            },
            {
                id: "13:198618",
                slug: "machine-status",
                scale: 1,
                verdict: "pending",
                note: "Machine Status",
            },
            {
                id: "13:198800",
                slug: "shift-assignment",
                scale: 1,
                verdict: "pending",
                note: "Shift assignment, daily",
            },
            {
                id: "13:197721",
                slug: "asset-management",
                scale: 1,
                verdict: "pending",
                note: "Asset Management",
            },
            { id: "13:199635", slug: "lab", scale: 1, verdict: "pending", note: "Lab" },
            { id: "13:198160", slug: "approvals", scale: 1, verdict: "pending", note: "Approvals" },
        ],
    },
    {
        key: "haycarb-mobile",
        figmaPage: "5:36598",
        title: "Haycarb Mobile (Collaborated)",
        product: "Manufacturing warehouse app",
        review: `Reviewed 2026-09-03, whole page. Inner screens carry no wordmark and three are published. The login screen carries the client's logo and is not published. The small green glyph bottom-right of the module screens was checked: it is a functional icon, not the wordmark.`,
        mode: "render",
        nodes: [
            {
                id: "13:167136",
                slug: "production-order-home",
                scale: 3,
                verdict: "pending",
                note: "Production Order, home",
            },
            {
                id: "13:167151",
                slug: "machine-status-home",
                scale: 3,
                verdict: "pending",
                note: "Machine Status, home",
            },
            // The login frame is named "Login - Haycarb" in the file, so it
            // almost certainly carries the client's mark. Fetch it only to look
            // at it; assume it is blocked until it is not.
            {
                id: "13:167126",
                slug: "login-client-branded",
                scale: 3,
                verdict: "pending",
                note: "Login — EXPECT THE CLIENT'S LOGO, check before anything else",
            },
        ],
    },
    {
        key: "acetrak-web",
        figmaPage: "5:36594",
        title: "Acetrack web (Collaborated)",
        product: "Warehouse management platform",
        review: `Reviewed 2026-09-03. BLOCKED as a page: the product wordmark sits in the sidebar of every screen, and the product name is exactly what data/systems.yaml anonymises. Redactable in principle, but the mobile module already covers this product without any redaction, so nothing here was published.`,
        mode: "render",
        nodes: [
            { id: "5:93469", slug: "dashboard", scale: 1, verdict: "pending", note: "Dashboard" },
            {
                id: "5:86973",
                slug: "inventory-management",
                scale: 1,
                verdict: "pending",
                note: "Inventory Management",
            },
            {
                id: "5:87342",
                slug: "order-management",
                scale: 1,
                verdict: "pending",
                note: "Order Management",
            },
            {
                id: "5:89352",
                slug: "inbound-new-packages",
                scale: 1,
                verdict: "pending",
                note: "Inbound Processing, new packages",
            },
            {
                id: "5:88668",
                slug: "cycle-counting",
                scale: 1,
                verdict: "pending",
                note: "Cycle Counting Management",
            },
            {
                id: "5:91983",
                slug: "ds-navigation",
                scale: 2,
                verdict: "pending",
                note: "Navigation component set",
            },
        ],
    },
    {
        key: "acetrak-mobile",
        figmaPage: "5:36593",
        title: "Acetrak Mobile (Collaborated)",
        product: "Warehouse management platform",
        review: `Reviewed 2026-09-03, whole page. CLEAN: the wordmark appears only on the login screen, and no inner screen carries it. Six frames published. Demo data is synthetic (SKU_48484837, bin 4-4-D) and the two personas in the sort list are plainly fictional.`,
        mode: "render",
        nodes: [
            {
                id: "5:49832",
                slug: "order-pick-scan-bin",
                scale: 3,
                verdict: "pending",
                note: "Order Pick, scan bin",
            },
            {
                id: "5:45323",
                slug: "put-away-scan-bin",
                scale: 3,
                verdict: "pending",
                note: "Put Away, scan bin",
            },
            {
                id: "5:47595",
                slug: "quantity-mismatch",
                scale: 3,
                verdict: "pending",
                note: "Bin Review, quantity mismatched — the failure state",
            },
            {
                id: "5:50130",
                slug: "order-pick-summary",
                scale: 3,
                verdict: "pending",
                note: "Order Pick, summary",
            },
            {
                id: "5:50998",
                slug: "locate-tag",
                scale: 3,
                verdict: "pending",
                note: "Locate Tag — the RFID side",
            },
        ],
    },
    {
        key: "marx",
        figmaPage: "5:36597",
        title: "Marx.lk (Collaborated)",
        product: "Consumer delivery platform",
        review: `Reviewed 2026-09-03, whole page. NOTHING PUBLISHED, for two reasons that stack. The platform's brand and its sub-brands are woven through the product copy itself ('Marx eWallet', 'Search MaxDine', 'Earn 50 Marx points'), so redaction would mean rewriting the UI rather than covering a logo. And her recorded scope on this one is UX and accessibility research, not UI ownership, so publishing its screens would claim the wrong contribution. Revisit only if she says otherwise.`,
        mode: "render",
        nodes: [
            // A consumer app: the brand is the product, so assume every screen
            // carries the wordmark and check accordingly.
            { id: "12:156777", slug: "home", scale: 3, verdict: "pending", note: "Home" },
            {
                id: "12:157929",
                slug: "food-ordering",
                scale: 3,
                verdict: "pending",
                note: "Food ordering",
            },
            {
                id: "12:157847",
                slug: "taxi-booking",
                scale: 3,
                verdict: "pending",
                note: "Taxi booking",
            },
            { id: "12:157610", slug: "ewallet", scale: 3, verdict: "pending", note: "eWallet" },
            {
                id: "12:156710",
                slug: "biometric-prompt",
                scale: 3,
                verdict: "pending",
                note: "Enable biometric login",
            },
        ],
    },
    {
        key: "in2ocean",
        figmaPage: "5:36617",
        title: "IN2Ocean (Personal Group Project)",
        // Not in `data/systems.yaml` and not in `data/projects.yaml` either.
        // A personal group project, so no client and no NDA — the one product
        // page here with nothing to anonymise. If it is to appear on the site
        // it needs a data entry first, and that entry needs her words.
        product: "not carried in data/ — needs an entry, and her words, first",
        mode: "render",
        nodes: [
            {
                id: "5:36731",
                slug: "style-guide-light",
                scale: 0.5,
                verdict: "pending",
                note: "Style guide, light theme",
            },
            {
                id: "5:37325",
                slug: "style-guide-dark",
                scale: 0.5,
                verdict: "pending",
                note: "Style guide, dark theme",
            },
            {
                id: "5:36729",
                slug: "logo-guide",
                scale: 0.5,
                verdict: "pending",
                note: "Logo guide",
            },
            {
                id: "5:38864",
                slug: "main-screen",
                scale: 2,
                verdict: "pending",
                note: "Main screen",
            },
            {
                id: "5:39180",
                slug: "collect-trash",
                scale: 1.5,
                verdict: "pending",
                note: "Collect Trash",
            },
            { id: "5:39023", slug: "badges", scale: 1.5, verdict: "pending", note: "Badges" },
        ],
    },

    // ══ Photographs and flat artwork ════════════════════════════════════════
    // These pages are rectangles filled with uploaded bitmaps rather than
    // vector artboards, so they come from the image-fills endpoint and are
    // unaffected by the render quota. The whole of each page was reviewed on
    // 2026-09-02.
    {
        key: "community",
        figmaPage: "5:36602",
        title: "Volunteering Speeches & Mentoring",
        product: "/off-hours, Teaching and mentoring",
        mode: "fill",
        nodes: [
            {
                id: "23:295215",
                slug: "revoux-workshop-card",
                verdict: "published",
                asset: "community/revoux-workshop-card.jpg",
                note: "RevolUX 2.0 workshop card — her name and title, sponsor logos, no one else",
            },
            {
                id: "23:295222",
                slug: "creative-eye-speakers",
                verdict: "published",
                asset: "community/creative-eye-speakers.jpg",
                note: "Creative Eye speaker card — also names a colleague, on the event's own published card",
            },
            {
                id: "23:295214",
                slug: "design-thinking-talk",
                verdict: "published",
                asset: "community/design-thinking-talk.jpg",
                note: "Presenting the design thinking process — her camera tile only",
            },
            {
                id: "23:295211",
                slug: "young-protege-2025",
                verdict: "published",
                asset: "community/young-protege-2025.jpg",
                note: "Young Protégé 2025 plaque — her and one organiser",
            },

            // Two frames display other people's names, legibly, at any size the
            // site would use. The site names no one but Pamudi and the
            // organisations she worked with; publishing an attendee list is a
            // different thing entirely, and it is not hers to publish.
            {
                id: "23:295219",
                slug: "revoux-participant-grid",
                verdict: "blocked",
                note: "Virtual-event participant grid — DOZENS OF ATTENDEES' FULL NAMES",
            },
            {
                id: "23:295209",
                slug: "creative-eye-happening-now",
                verdict: "blocked",
                note: "Creative Eye promo — the embedded call strip carries FIVE ATTENDEES' FULL NAMES",
            },

            // Clean, and genuinely the record of the work — but each is a room
            // full of identifiable people who did not agree to appear on this
            // site, and none of them shows anything the four published frames
            // do not. Reconsider only with Pamudi.
            {
                id: "23:295208",
                slug: "zone-award",
                verdict: "dropped",
                note: "Award handover at a Zone24x7 backdrop",
            },
            {
                id: "23:295210",
                slug: "young-protege-audience",
                verdict: "dropped",
                note: "Holding a microphone in the audience — six identifiable attendees, and not a speaking shot",
            },
            {
                id: "23:295212",
                slug: "zone-group",
                verdict: "dropped",
                note: "Large group photo",
            },
            {
                id: "23:295213",
                slug: "mentoring-laptops-1",
                verdict: "dropped",
                note: "Mentoring session — identifiable students",
            },
            {
                id: "23:295216",
                slug: "young-protege-backdrop",
                verdict: "dropped",
                note: "Three people at the event backdrop",
            },
            {
                id: "23:295217",
                slug: "workshop-room-1",
                verdict: "dropped",
                note: "Workshop room",
            },
            {
                id: "23:295218",
                slug: "group-wide",
                verdict: "dropped",
                note: "Very wide group photo",
            },
            {
                id: "23:295220",
                slug: "mentoring-laptops-2",
                verdict: "dropped",
                note: "Mentoring session — identifiable students",
            },
            {
                id: "23:295221",
                slug: "office-group",
                verdict: "dropped",
                note: "Large group photo in an office",
            },
        ],
    },
    {
        key: "extra",
        figmaPage: "5:36603",
        title: "Extra",
        product: "/plates, Identity and event design",
        mode: "fill",
        nodes: [
            // Student-conference identity work, all of it published event
            // branding: no client, no NDA, and no one's name but hers. The
            // credits behind it are already in `data/community.yaml` under
            // `events` and `student_events`.
            {
                id: "30:295252",
                slug: "slsywc-2017-badge",
                verdict: "published",
                asset: "event-design/slsywc-2017-badge.jpg",
                note: "Organising-committee badge, IEEE SLSYW Congress 2017 — her name only",
            },
            {
                id: "30:295256",
                slug: "congress-2017-emblem",
                verdict: "published",
                asset: "event-design/congress-2017-emblem.png",
                note: "Congress 2017 emblem",
            },
            {
                id: "30:295255",
                slug: "congress-2017-linework",
                verdict: "published",
                asset: "event-design/congress-2017-linework.png",
                note: "The same mark as linework",
            },
            {
                id: "30:295254",
                slug: "ss12-tracks",
                verdict: "published",
                asset: "event-design/ss12-tracks.jpg",
                note: "SS12 track announcements",
            },
            {
                id: "30:295257",
                slug: "ss12-logo",
                verdict: "published",
                asset: "event-design/ss12-logo.png",
                note: "SS12 identity",
            },

            // Clean, and probably hers — but `data/community.yaml` credits her
            // on SLSYW Congress 2017 and SS12 2018 and says nothing about R10
            // HTC. Publishing it would assert a credit the record does not
            // carry. One line from her turns this into a sixth figure.
            {
                id: "30:295258",
                slug: "r10-htc-2018",
                verdict: "dropped",
                note: "IEEE Region 10 HTC 2018 key visual — NO MATCHING CREDIT in data/community.yaml",
            },
        ],
    },
    {
        key: "hobbies",
        figmaPage: "5:36604",
        title: "Hobbies",
        product: "/plates (drawings) and /off-hours (photographs)",
        mode: "fill",
        nodes: [
            // Her own drawings and paintings. Several are signed, and two
            // frames on this page show a piece being drawn, which is where the
            // attribution comes from. No third parties, no client material.
            // The section takes its name from her own label on the Figma page.
            {
                id: "24:295226",
                slug: "portrait-graphite",
                verdict: "published",
                asset: "art/portrait-graphite.jpg",
                note: "Graphite portrait",
            },
            {
                id: "24:295228",
                slug: "koi-watercolour",
                verdict: "published",
                asset: "art/koi-watercolour.jpg",
                note: "Koi, watercolour",
            },
            {
                id: "24:295231",
                slug: "tree-frog-watercolour",
                verdict: "published",
                asset: "art/tree-frog-watercolour.jpg",
                note: "Tree frog, watercolour",
            },
            {
                id: "24:295230",
                slug: "colour-study",
                verdict: "published",
                asset: "art/colour-study.jpg",
                note: "Colour study on paper",
            },
            {
                id: "24:295233",
                slug: "owl-digital",
                verdict: "published",
                asset: "art/owl-digital.jpg",
                note: "Owl, digital",
            },
            {
                id: "24:295234",
                slug: "fox-digital",
                verdict: "published",
                asset: "art/fox-digital.jpg",
                note: "Fox, digital",
            },
            {
                id: "24:295239",
                slug: "macaw-digital",
                verdict: "published",
                asset: "art/macaw-digital.jpg",
                note: "Macaw, digital",
            },
            {
                id: "24:295240",
                slug: "tiger-cub-digital",
                verdict: "published",
                asset: "art/tiger-cub-digital.jpg",
                note: "Tiger cub, digital",
            },

            // Studies after characters someone else owns. Dropped until the
            // Plinth design (2026-09-03), which publishes them under titles
            // that name what they show rather than the character, and carries
            // the attribution line under the gallery: the character belongs to
            // its owner, the drawing is hers. That line is the condition on
            // publishing them, not decoration.
            {
                id: "24:295227",
                slug: "pennywise-graphite",
                verdict: "published",
                asset: "art/study-pennywise-graphite.jpg",
                note: "Study after a film character — titled by what it shows, and the plates page carries the attribution line",
            },
            {
                id: "24:295229",
                slug: "venom-graphite",
                verdict: "published",
                asset: "art/study-venom-graphite.jpg",
                note: "Study after a comics character — see the attribution line",
            },
            {
                id: "24:295236",
                slug: "navi-digital",
                verdict: "published",
                asset: "art/study-navi-digital.jpg",
                note: "Study after a film character — see the attribution line",
            },
            {
                id: "31:295260",
                slug: "dune-digital",
                verdict: "published",
                asset: "art/study-dune-digital.jpg",
                note: "Study after a film character — see the attribution line",
            },
            {
                id: "24:295237",
                slug: "kimono-digital",
                verdict: "published",
                asset: "art/kimono-digital.jpg",
                note: "Character study, digital",
            },
            {
                id: "24:295235",
                slug: "night-landscape",
                verdict: "published",
                asset: "art/night-cubs-digital.jpg",
                note: "Cubs in moonlit undergrowth, digital",
            },

            // Personal life, not work: pets, gaming, puzzles, travel, the desk.
            // Her own page groups them under Music, Gaming, Pets, Traveling,
            // Stargazing and Reading, so the sections are her idea rather than
            // an invention. All of these were dropped until the Plinth design
            // (2026-09-03) gave them a page; nine are now on /off-hours. Two
            // needed a crop and one a redaction — the notes say which and why.
            //
            // 31:295261 is still out, and for the original reason: another
            // person is in frame, so it is not hers alone to publish.
            {
                id: "24:295224",
                slug: "music-desk",
                verdict: "published",
                asset: "hobbies/keyboard.jpg",
                note: "At the keyboard — CROPPED: the social player's avatar, name plate and search icon are overlay, not photograph",
            },
            {
                id: "24:295232",
                slug: "lego-build",
                verdict: "published",
                asset: "hobbies/falcon-build.jpg",
                note: "Lego build, step 1,379",
            },
            {
                id: "24:295238",
                slug: "drawing-with-cat",
                verdict: "published",
                asset: "hobbies/drawing-with-cat.jpg",
                note: "Drawing on an iPad, cat asleep behind — the attribution evidence for the owl. ⚠ REDACTED: a third party's full name is legible on the laptop screen behind it and is painted out in the app's own panel colour. Re-export means re-redacting; see CLAUDE.md, the fifth pass.",
            },
            {
                id: "24:295241",
                slug: "game-screenshot",
                verdict: "published",
                asset: "hobbies/sea-of-thieves.jpg",
                note: "Game capture — the only gamertag in frame is her own",
            },
            {
                id: "24:295242",
                slug: "kittens",
                verdict: "published",
                asset: "hobbies/kittens.jpg",
                note: "Two kittens at the door",
            },
            {
                id: "24:295243",
                slug: "window-desk",
                verdict: "published",
                asset: "hobbies/window-coffee.jpg",
                note: "Coffee and headphones at a hill-country window",
            },
            {
                id: "24:295244",
                slug: "puzzles",
                verdict: "published",
                asset: "hobbies/puzzles.jpg",
                note: "Two 1,000-piece jigsaws",
            },
            {
                id: "28:295246",
                slug: "portrait-in-progress",
                verdict: "published",
                asset: "art/portrait-in-progress.jpg",
                note: "A portrait mid-draw on an iPad",
            },
            {
                id: "28:295249",
                slug: "stargazing",
                verdict: "published",
                asset: "hobbies/telescope.jpg",
                note: "Telescope setup — CROPPED: the social player's mute button is overlay, not photograph. A second figure is in frame and is not identifiable (the tube covers the face); the one identifiable person is Pamudi.",
            },
            {
                id: "30:295259",
                slug: "gaming-setup",
                verdict: "published",
                asset: "hobbies/two-rigs.jpg",
                note: "Two rigs, two cats",
            },
            {
                id: "31:295261",
                slug: "travel-selfie",
                verdict: "dropped",
                note: "Travel photograph — ANOTHER PERSON IN FRAME, not hers to publish alone",
            },
        ],
    },
    {
        key: "soda",
        figmaPage: "5:36616",
        title: "SodaFresh (Freelance)",
        product:
            "experience.yaml role `soda-fresh-freelance`, org given as 'Indonesian consumer brand'",
        mode: "fill",
        nodes: [
            // Nine pieces of consumer marketing collateral — a price sheet,
            // store posters, roll-up banners, apparel, Instagram creatives.
            // They are clean of third-party data and they were made to be seen
            // in public.
            //
            // They are blocked anyway, and for one reason only: the brand's
            // wordmark is on every single one, and `data/experience.yaml`
            // anonymises this client to "Indonesian consumer brand". Publishing
            // the artwork names the client. That may well be fine — a freelance
            // brand engagement whose whole output is public advertising is not
            // an obvious NDA case — but the repo's rule is that de-anonymising
            // an entry is Pamudi's call and not ours. One word from her turns
            // all nine into a portfolio section, and the anonymisation in
            // `experience.yaml` should be lifted in the same commit.
            {
                id: "22:295202",
                slug: "price-sheet",
                verdict: "blocked",
                note: "Distributor price sheet — CARRIES THE BRAND WORDMARK",
            },
            {
                id: "22:295201",
                slug: "good-stuff-poster",
                verdict: "blocked",
                note: "Store poster — CARRIES THE BRAND WORDMARK",
            },
            {
                id: "22:295200",
                slug: "apparel-back",
                verdict: "blocked",
                note: "T-shirt artwork — CARRIES THE BRAND WORDMARK",
            },
            {
                id: "22:295199",
                slug: "hoodies",
                verdict: "blocked",
                note: "Hoodie mockups — CARRIES THE BRAND MONOGRAM",
            },
            {
                id: "22:295203",
                slug: "banner-door-sticker",
                verdict: "blocked",
                note: "Roll-up banner — WORDMARK, plus the company's own phone number",
            },
            {
                id: "22:295207",
                slug: "banner-nourishme",
                verdict: "blocked",
                note: "Roll-up banner, co-branded — TWO WORDMARKS",
            },
            {
                id: "22:295204",
                slug: "instagram-1",
                verdict: "blocked",
                note: "Campaign creative — WORDMARK and social handle",
            },
            {
                id: "22:295205",
                slug: "instagram-2",
                verdict: "blocked",
                note: "Campaign creative, duplicate of the above",
            },
            {
                id: "22:295206",
                slug: "campaign-strip",
                verdict: "blocked",
                note: "Campaign strip — WORDMARK and social handle",
            },
        ],
    },
]

// ── CLI ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const args = new Set(argv)
const pageFilter = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : null

const VERDICT_ORDER = ["published", "pending", "dropped", "blocked"]
const allNodes = PAGES.flatMap((p) => p.nodes.map((n) => ({ ...n, page: p })))

if (args.has("--list")) {
    for (const page of PAGES) {
        const counts = VERDICT_ORDER.map(
            (v) => `${page.nodes.filter((n) => n.verdict === v).length} ${v}`,
        ).join(", ")
        console.info(`\n── ${page.key}  ${page.title}  [${page.figmaPage}]  ${page.mode}`)
        console.info(`   → ${page.product}`)
        console.info(`   ${counts}`)
        for (const n of page.nodes) {
            const scale = page.mode === "render" ? `@${n.scale}x` : "fill"
            console.info(
                `   ${n.verdict.padEnd(10)} ${n.slug.padEnd(24)} ${n.id.padEnd(11)} ${scale.padEnd(7)} ${n.note}`,
            )
        }
    }
    const tally = VERDICT_ORDER.map(
        (v) => `${allNodes.filter((n) => n.verdict === v).length} ${v}`,
    ).join(", ")
    console.info(`\n${allNodes.length} nodes across ${PAGES.length} pages: ${tally}.`)
    console.info(`File key: ${FILE_KEY}`)
    console.info(
        "\nEvery `render` node is currently unobtainable: the Starter-plan image\n" +
            "budget is spent on both the REST endpoint and the Figma MCP. See the\n" +
            "header of this file. `fill` nodes are a separate quota and still work.",
    )
    process.exit(0)
}

const token = process.env.FIGMA_TOKEN
if (!token) {
    console.error(
        "FIGMA_TOKEN is not set.\n\n" +
            "Create one at figma.com → Settings → Security → Personal access tokens,\n" +
            "with File content: Read-only. Then:\n\n" +
            "  FIGMA_TOKEN=figd_... node scripts/fetch-figma.mjs\n\n" +
            "`node scripts/fetch-figma.mjs --list` prints the manifest without a token.",
    )
    process.exit(1)
}

const exists = (p) =>
    access(p).then(
        () => true,
        () => false,
    )
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// `blocked` is not a default anyone can opt out of by forgetting a flag: the
// reason is a disclosure problem, not a preference, so it is filtered first and
// separately from everything else.
let wanted = allNodes.filter((n) => n.verdict !== "blocked")
if (pageFilter) wanted = wanted.filter((n) => n.page.key === pageFilter)
if (!args.has("--dropped")) wanted = wanted.filter((n) => n.verdict !== "dropped")

if (wanted.length === 0) {
    console.error(
        pageFilter
            ? `Nothing selectable on page "${pageFilter}". Try --list.`
            : "Nothing selected. Try --list.",
    )
    process.exit(1)
}

const outFor = (n) => path.join(STAGING, n.page.key, `${n.slug}.png`)

const pending = args.has("--all")
    ? wanted
    : (await Promise.all(wanted.map(async (n) => ((await exists(outFor(n))) ? null : n)))).filter(
          Boolean,
      )

if (pending.length === 0) {
    console.info("Nothing pending in staging. Pass --all to re-fetch, --dropped to widen.")
    process.exit(0)
}

for (const key of new Set(pending.map((n) => n.page.key))) {
    await mkdir(path.join(STAGING, key), { recursive: true })
}

let written = 0
let failed = 0

const save = async (node, href) => {
    const img = await fetch(href)
    if (!img.ok) {
        console.error(`✗ ${node.slug}: download failed (${img.status})`)
        failed += 1
        return
    }
    const buf = Buffer.from(await img.arrayBuffer())
    await writeFile(outFor(node), buf)
    console.info(
        `✓ ${node.page.key.padEnd(15)} ${node.slug.padEnd(24)} ${(buf.length / 1024).toFixed(0).padStart(6)} kB  ${node.note}`,
    )
    written += 1
}

// ── Bitmaps already in the file ──────────────────────────────────────────────
// One request returns every image fill in the document, keyed by `imageRef`, so
// the node's ref has to be read out of the file JSON before they can be paired.

const fillNodes = pending.filter((n) => n.page.mode === "fill")
if (fillNodes.length > 0) {
    const pagesNeeded = new Set(fillNodes.map((n) => n.page.figmaPage))
    const [doc, fills] = await Promise.all([
        fetch(`https://api.figma.com/v1/files/${FILE_KEY}?depth=2`, {
            headers: { "X-Figma-Token": token },
        }).then((r) => r.json()),
        fetch(`https://api.figma.com/v1/files/${FILE_KEY}/images`, {
            headers: { "X-Figma-Token": token },
        }).then((r) => r.json()),
    ])

    const refFor = new Map()
    for (const page of doc.document?.children ?? []) {
        if (!pagesNeeded.has(page.id)) continue
        for (const child of page.children ?? []) {
            const ref = (child.fills ?? []).find((f) => f.type === "IMAGE" && f.imageRef)?.imageRef
            if (ref) refFor.set(child.id, ref)
        }
    }

    for (const node of fillNodes) {
        const href = fills.meta?.images?.[refFor.get(node.id)]
        if (!href) {
            console.error(`✗ ${node.slug}: no image fill found for ${node.id}`)
            failed += 1
            continue
        }
        await save(node, href)
    }
}

// ── Vector artboards, rasterised by Figma ────────────────────────────────────
// The endpoint takes one scale per request, so the batches are the distinct
// scales rather than a fixed page size.

const renderNodes = pending.filter((n) => n.page.mode === "render")
if (renderNodes.length > 0) {
    const byScale = new Map()
    for (const n of renderNodes) byScale.set(n.scale, [...(byScale.get(n.scale) ?? []), n])

    for (const [scale, nodes] of byScale) {
        const ids = nodes.map((n) => n.id).join(",")
        const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`
        const res = await fetch(url, { headers: { "X-Figma-Token": token } })

        if (res.status === 429) {
            const secs = Number(res.headers.get("retry-after") ?? 0)
            console.error(
                `\n✗ Figma is rate-limiting the image endpoint` +
                    (secs ? ` for another ${(secs / 3600).toFixed(1)} hours` : "") +
                    ` (plan: ${res.headers.get("x-figma-plan-tier") ?? "?"}, ` +
                    `limit: ${res.headers.get("x-figma-rate-limit-type") ?? "?"}).\n` +
                    `  Rendering a frame is metered separately from reading the file, and\n` +
                    `  the Figma MCP's get_screenshot draws on a spent budget too. Nothing\n` +
                    `  will export a UI screen until this clears; the fill-mode pages are a\n` +
                    `  different quota and still work. See the header of this file.`,
            )
            failed += nodes.length
            break
        }

        const body = await res.json().catch(() => ({}))
        if (!res.ok || body.err) {
            console.error(`✗ @${scale}x request failed: ${res.status} ${body.err ?? ""}`)
            failed += nodes.length
            continue
        }

        for (const node of nodes) {
            const href = body.images?.[node.id]
            if (!href) {
                console.error(`✗ ${node.slug}: Figma returned no image for ${node.id}`)
                failed += 1
                continue
            }
            await save(node, href)
        }
        await sleep(2000)
    }
}

console.info(
    `\n${written} written, ${failed} failed, into ${path.relative(process.cwd(), STAGING)}/`,
)
if (written > 0) {
    console.info(
        "Staging is gitignored, and that is the point. LOOK at each file before\n" +
            "moving one into src/assets/: client logo, product wordmark, real customer\n" +
            "data, and anyone in frame who did not agree to be on this site. Drop what\n" +
            "is redundant or thin rather than filling a grid with it. Then record the\n" +
            'verdict in this file. See CLAUDE.md, "Whose site this is".',
    )
}

if (failed > 0) process.exit(1)
