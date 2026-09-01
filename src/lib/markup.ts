/**
 * Renders the small slice of Typst markup that `data/*.yaml` strings carry.
 *
 * The same strings feed the Typst CV, where `render-md` in
 * `cv/common/loaders.typ` evaluates them as real markup. The site cannot eval
 * Typst, so it converts the two tokens actually in use:
 *
 * - `*text*` → `<strong>` (Typst strong)
 * - `_text_` → `<em>` (Typst emphasis)
 *
 * Anything else passes through as text. Input is HTML-escaped first, so a
 * stray `<` in a job description cannot become markup.
 */

const ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"]/g, (c) => ESCAPES[c])
}

/**
 * Converts one Typst-markup string to an HTML fragment.
 *
 * Delimiters must wrap at least one non-space character and are matched
 * non-greedily, so `*a* and *b*` yields two elements rather than one spanning
 * the middle. `_` is matched only at a word boundary, so `Sass/SCSS_v2` and
 * other mid-word underscores survive intact.
 *
 * @param s Raw string from `data/*.yaml`.
 * @returns HTML safe to inject with `set:html`.
 */
export function renderMarkup(s: string): string {
    return escapeHtml(s)
        .replace(/\*(\S(?:.*?\S)?)\*/g, "<strong>$1</strong>")
        .replace(/(^|\s)_(\S(?:.*?\S)?)_(?=[\s,.;:!?)]|$)/g, "$1<em>$2</em>")
}

/**
 * Strips the markup tokens without producing HTML.
 *
 * For the places that need plain text rather than a fragment — a meta
 * description, an `alt`, a `title` attribute — where `renderMarkup` would leak
 * tags and the raw string would leak asterisks.
 *
 * @param s Raw string from `data/*.yaml`.
 * @returns The same string with `*` and `_` delimiters removed.
 */
export function plainMarkup(s: string): string {
    return s
        .replace(/\*(\S(?:.*?\S)?)\*/g, "$1")
        .replace(/(^|\s)_(\S(?:.*?\S)?)_(?=[\s,.;:!?)]|$)/g, "$1$2")
}
