const BASE = import.meta.env.BASE_URL

/**
 * Joins a site-root-relative path onto the configured `base`.
 *
 * Astro rewrites `src` on assets it processes but not `href` on hand-written
 * links, so every internal link and every file served straight out of
 * `public/` has to go through here or it breaks under a non-root `base`.
 *
 * @param path Site-root-relative path, with or without a leading slash.
 * @returns The path prefixed with the deployment base, without a double slash.
 */
export function href(path = "/"): string {
    const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE
    const rest = path.startsWith("/") ? path : `/${path}`
    return `${base}${rest}` || "/"
}
