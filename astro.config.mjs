import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"

// The domain is set on the Pages side by `public/CNAME`, which the build
// copies into `dist/` — deleting that file un-sets the custom domain on the
// next deploy. `base` stays at its default "/", but internal links still go
// through `href()` in src/lib/url.ts so a future move under a path is a
// one-line change rather than a sweep.
export default defineConfig({
    site: "https://pamudi.com",
    trailingSlash: "ignore",
    build: { format: "directory" },
    // The Plinth import (2026-09-03) moved the inventory to /work, split the
    // About page three ways, and put the product pages under /work/. These are
    // the URLs the previous direction shipped. Static output turns each into a
    // meta-refresh page, which is not a 301 — but it is the only redirect
    // GitHub Pages can serve, and it beats a 404 on a live domain. Drop them
    // once the analytics show nothing arriving here.
    redirects: {
        "/about": "/profile",
        "/systems": "/work",
        "/systems/[slug]": "/work/[slug]",
    },
    // A portfolio is a small set of heavy pages: the visitor who opens one case
    // study almost always opens a second. Prefetching on hover spends a few kB
    // of HTML to make that second click land instantly, and Astro only ever
    // prefetches same-origin links so outbound project links are untouched.
    prefetch: { prefetchAll: true, defaultStrategy: "hover" },
    image: {
        // Case-study imagery is the payload here; AVIF first, WebP behind it.
        responsiveStyles: true,
        layout: "constrained",
    },
    integrations: [mdx(), sitemap()],
})
