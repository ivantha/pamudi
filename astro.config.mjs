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
