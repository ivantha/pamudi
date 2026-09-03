import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"
import { loadYamlList, loadYamlSingle } from "@/lib/loaders"

/**
 * Which consumers an entry renders for. Omitting the key means both; `[]` hides
 * the entry everywhere while keeping the record. See `src/lib/variants.ts`.
 */
const includeIn = z.array(z.enum(["cv", "web"]))

/** A string carrying the Typst markup subset. See `src/lib/markup.ts`. */
const markup = z.string()

/**
 * A display heading split around the phrase that takes the italic brass.
 *
 * Every page title, section title and lead-in on the site is one of these. It
 * is three fields rather than one string with a marker in it because the accent
 * is a design decision about where the eye lands, not emphasis inside a
 * sentence — and because `renderMarkup` would then have to know about a third
 * token that only the website understands.
 *
 * The space before the accent is inserted by the component. `after` carries its
 * own leading space when the phrase continues (`" app"`); a full stop or a
 * comma attaches directly (`"."`, `", one iPad"`).
 */
const heading = z.object({
    before: z.string(),
    accent: z.string(),
    after: z.string().default(""),
})

/**
 * Long-form pages for entries in the design-systems inventory.
 *
 * Optional by construction: `src/pages/work/[slug].astro` builds a page for
 * every product in `data/systems.yaml` whether or not a file exists here, and
 * an entry with no file renders the sourced facts alone. That is deliberate —
 * the inventory is the record, and a product without a written page should
 * still have a URL rather than a 404.
 *
 * `system` must match a `product` in `data/systems.yaml` exactly. It is matched
 * on the name rather than on a slug so that the two files cannot drift apart
 * silently: the page throws at build time when a file names a product the
 * inventory does not have.
 *
 * The frontmatter is the whole page. In the direction this replaced these were
 * MDX bodies of running prose; the Plinth design argues a case in a fixed set
 * of parts instead — a metadata strip, numbered figures, two columns, a list of
 * what shipped — so the parts are fields and the layout is one component. The
 * previous bodies are in git if a longer treatment is ever wanted back.
 */
const systemPages = defineCollection({
    loader: glob({ base: "./src/content/systems", pattern: "**/*.{md,mdx}" }),
    schema: ({ image }) => {
        const figure = z
            .object({
                /**
                 * `full` is a plate across the page under a three-part caption;
                 * `split` and `split-end` set a plate beside its own detail
                 * list, on the left and on the right; `pair` is two plates side
                 * by side, each with a paragraph.
                 */
                layout: z.enum(["full", "split", "split-end", "pair"]),
                /**
                 * The ground the picture sits on. `dark` is for a product drawn
                 * dark-first — putting those screens on paper would misreport
                 * them — and `white` for a colour board whose swatches include
                 * white.
                 */
                ground: z.enum(["panel", "dark", "white"]).default("panel"),
                number: z.string(),
                title: z.string(),
                /** The right-hand cell of the caption. */
                note: z.string().optional(),
                src: image().optional(),
                alt: z.string().optional(),
                /** Cap for a phone or handheld screen inside a split, e.g. "19rem". */
                shot: z.string().optional(),
                /** Constrain a full-width plate's height so its caption stays on the fold. */
                tall: z.boolean().default(false),
                /** The detail list beside a split. */
                notes: z.array(z.object({ term: z.string(), text: z.string() })).default([]),
                /** The two halves of a pair. */
                items: z
                    .array(
                        z.object({
                            src: image(),
                            alt: z.string(),
                            number: z.string(),
                            title: z.string(),
                            note: z.string().optional(),
                            text: z.string(),
                        }),
                    )
                    .default([]),
            })
            .refine((f) => (f.layout === "pair" ? f.items.length === 2 : Boolean(f.src && f.alt)), {
                message: "A pair needs two items; every other layout needs `src` and `alt`.",
            })

        return z.object({
            /** The `product` field of the inventory entry this page belongs to. */
            system: z.string(),
            /**
             * Which plate this is, as an arabic number; the page prints the
             * Roman numeral. Absent for a product outside the plated sequence.
             */
            plate: z.number().int().positive().optional(),
            /**
             * `owned` argues a system built from scratch and runs the full
             * length; `extended` is a shorter note on a system that was
             * inherited. The difference is in the sourced scope, not in how
             * much there was to say.
             */
            kind: z.enum(["owned", "extended"]).default("extended"),
            /** The line above the title: client context, then domain. */
            eyebrow: z.string(),
            title: heading,
            standfirst: z.string(),
            /** The metadata strip under the title. Three or four cells. */
            meta: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
            /** Where this appears in the work index. */
            index: z
                .object({
                    summary: z.string(),
                    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
                    /** Plate shape in the index; a phone screen wants the tall one. */
                    shape: z.enum(["tall", "wide"]).default("wide"),
                    /** Ground, as on the case figures: a dark-first product keeps its own. */
                    ground: z.enum(["panel", "dark"]).default("panel"),
                    src: image(),
                    alt: z.string(),
                })
                .optional(),
            figures: z.array(figure).default([]),
            /** The two-column argument: problem and approach, or constraint and change. */
            argument: z
                .array(
                    z.object({
                        label: z.string(),
                        lead: z.string(),
                        paragraphs: z.array(z.string()).min(1),
                    }),
                )
                .length(2)
                .optional(),
            /** What shipped. Only the owned systems carry one. */
            shipped: z.array(z.object({ term: z.string(), text: z.string() })).default([]),
            /** Two other products, by `product` name, to send the reader to next. */
            related: z.array(z.string()).default([]),
            /** A drafted page keeps its URL but renders the sourced facts alone. */
            draft: z.boolean().default(false),
        })
    },
})

/**
 * Identity and contact, shared with the Typst CV.
 *
 * `eyebrow` is the only field here the website never reads; it is validated
 * anyway, because `astro check` in `pnpm lint` is the only schema gate this
 * repo has — Typst will happily compile a PDF against a malformed field and
 * show you the damage in print.
 *
 * `tagline`, `intro` and `availability` are optional: they are Pamudi's copy to
 * write, and until she does, the pages fall back to verified material rather
 * than rendering a placeholder. See the comment block in data/personal.yaml.
 *
 * `phone` is absent on purpose. It lives in the gitignored `data/private.yaml`
 * and never reaches this repo. The Contact page reads it through
 * `loadPrivate()` and drops the row when it is empty.
 */
const personal = defineCollection({
    loader: () => loadYamlSingle("personal.yaml"),
    schema: z.object({
        name: z.string(),
        role: z.string(),
        location: z.string(),
        eyebrow: z.string(),
        tagline: z.string().optional(),
        intro: z.array(z.string()).optional(),
        availability: z.string().optional(),
        specialisms: z.array(z.string()).min(1),
        stats: z.array(
            z.object({
                value: z.string(),
                label: z.string(),
                // Invisible to the PDF by construction: cv/common/loaders.typ
                // reads `value` and `label` directly. See data/personal.yaml.
                value_web: z.string().optional(),
                label_web: z.string().optional(),
            }),
        ),
        summary: markup,
        summary_cv: markup.optional(),
        blog: z.object({
            title: z.string(),
            title_cv: z.string().optional(),
            where: z.string(),
            url: z.string().url(),
        }),
        contact: z.object({
            email: z.string().email(),
            links: z.array(
                z.object({
                    label: z.string(),
                    url: z.string().url(),
                    // What to print instead of the bare URL on the CV.
                    display: z.string().optional(),
                    include_in: includeIn.optional(),
                }),
            ),
        }),
    }),
})

const experience = defineCollection({
    loader: () => loadYamlList("experience.yaml"),
    schema: z.object({
        include_in: includeIn.optional(),
        role: z.string(),
        role_web: z.string().optional(),
        role_cv: z.string().optional(),
        org: z.string(),
        place: z.string(),
        dates: z.string(),
        bullets: z.array(
            z.object({
                include_in: includeIn.optional(),
                text: markup,
                text_web: markup.optional(),
                text_cv: markup.optional(),
            }),
        ),
    }),
})

/**
 * Degrees plus the professional-training prose. A singleton rather than a list
 * because `training` is document-level and sits alongside the entries.
 */
const education = defineCollection({
    loader: () => loadYamlSingle("education.yaml"),
    schema: z.object({
        training: markup,
        entries: z.array(
            z.object({
                include_in: includeIn.optional(),
                degree: z.string(),
                institute: z.string(),
                dates: z.string(),
                // cv.typ reads `dates` directly rather than through `field()`,
                // so a `_web` override is invisible to the PDF by construction.
                dates_web: z.string().optional(),
                dates_cv: z.string().optional(),
            }),
        ),
    }),
})

const skills = defineCollection({
    loader: () => loadYamlList("skills.yaml"),
    schema: z.object({
        include_in: includeIn.optional(),
        category: z.string(),
        stack: markup,
    }),
})

/**
 * The design-systems inventory. `lead` marks a system she built from scratch
 * and owned end to end; the CV colours those rows in accent and the website
 * gives each one a full case.
 */
const systems = defineCollection({
    loader: () => loadYamlList("systems.yaml"),
    schema: z.object({
        include_in: includeIn.optional(),
        product: z.string(),
        client: z.string().optional(),
        description: markup.optional(),
        scope: z.string(),
        detail: z.string().optional(),
        stack: z.string(),
        stack_cv: z.string().optional(),
        lead: z.boolean().default(false),
    }),
})

/**
 * Speaking, mentoring, event work, judging, competitions.
 *
 * The dated lists carry `include_in` like every other entry in `data/`, so a
 * student-era row can leave the PDF without leaving the record. `judging` and
 * `competitions` are prose rather than lists and have no such switch — trim the
 * string and keep what you removed in a comment beside it.
 *
 * `writing`, `student_events` and `societies` are website-only, and optional so
 * the page renders without them. They stay separate keys rather than becoming
 * `include_in: [web]` rows in the lists above because they are distinct
 * subsections on the Profile page, not filtered-out members of an existing one —
 * and because no Typst file reads them by name, so they cannot reach the PDF.
 */
const datedRow = z.object({ include_in: includeIn.optional(), year: z.string(), text: markup })

const community = defineCollection({
    loader: () => loadYamlSingle("community.yaml"),
    schema: z.object({
        speaking: z.array(datedRow),
        mentoring: z.array(datedRow),
        events: z.array(datedRow),
        judging: markup,
        judging_cv: markup.optional(),
        competitions: markup,
        writing: z.array(z.object({ text: markup, url: z.string().url().optional() })).default([]),
        student_events: z.array(datedRow).default([]),
        societies: markup.optional(),
    }),
})

/**
 * Earlier project work — the UCSC degree projects.
 *
 * Website-only by construction: no Typst file reads `data/projects.yaml`, so
 * nothing here can push the CV onto a third page. Shaped like `experience` so
 * the Profile page can render both through the same markup.
 */
const projects = defineCollection({
    loader: () => loadYamlList("projects.yaml"),
    schema: z.object({
        include_in: includeIn.optional(),
        title: z.string(),
        /** Client, institution or product the project was for. */
        context: z.string(),
        dates: z.string(),
        /** What it was built with, `·`-separated like `skills.yaml`. */
        stack: z.string(),
        bullets: z.array(
            z.object({
                include_in: includeIn.optional(),
                text: markup,
            }),
        ),
    }),
})

/**
 * The framing copy the Plinth design added around the career record: every page
 * headline, the hero lede, the process band, the section notes and the footer
 * standfirsts.
 *
 * Website-only by construction, like `projects` — no Typst file reads
 * `data/site.yaml`. It is kept apart from `personal.yaml` for a second reason
 * too: everything in it is pending Pamudi's sign-off, and a separate file makes
 * that boundary visible rather than a comment somebody has to notice. See the
 * header of `data/site.yaml`.
 */
const site = defineCollection({
    loader: () => loadYamlSingle("site.yaml"),
    schema: z.object({
        home: z.object({
            headline: heading,
            lede: z.string(),
            actions: z
                .array(
                    z.object({
                        label: z.string(),
                        to: z.string(),
                        style: z.enum(["solid", "ghost"]).default("ghost"),
                    }),
                )
                .min(1),
            plate: z.object({ title: z.string(), note: z.string() }),
            picks: z.object({
                title: heading,
                items: z
                    .array(
                        z.object({
                            /** The `product` in data/systems.yaml this card shows. */
                            system: z.string(),
                            title: z.string(),
                            text: z.string(),
                            more: z.string(),
                            /** Overrides the link to that product's own page. */
                            to: z.string().optional(),
                        }),
                    )
                    .length(3),
                note_before: z.string(),
                note_link: z.string(),
            }),
            plates: z.object({ title: heading, text: z.string(), more: z.string() }),
            profile: z.object({ label: z.string(), text: z.string(), more: z.string() }),
        }),
        work: z.object({
            eyebrow: z.string(),
            headline: heading,
            lede: z.string(),
            inventory: z.object({ title: z.string(), note: z.string(), aside: z.string() }),
        }),
        process: z.object({
            title: heading,
            lede: z.string(),
            steps: z.array(z.object({ title: z.string(), text: markup })).min(1),
        }),
        plates: z.object({
            eyebrow: z.string(),
            headline: heading,
            lede_before: z.string(),
            lede_link: z.string(),
            attribution: z.string(),
            identity: z.object({ title: z.string(), note: z.string() }),
        }),
        off_hours: z.object({
            eyebrow: z.string(),
            headline: heading,
            lede_before: z.string(),
            lede_link: z.string(),
            lede_after: z.string(),
            teaching: z.object({
                title: heading,
                text_before: z.string(),
                text_link: z.string(),
            }),
            music: z.object({ label: z.string(), title: z.string(), text: z.string() }),
            cats: z.object({
                title: heading,
                text_before: z.string(),
                text_link: z.string(),
                text_after: z.string(),
            }),
            games: z.object({ label: z.string(), title: heading, text: z.string() }),
            bricks: z.object({ title: heading, text: z.string() }),
            traveling: z.object({ label: z.string(), title: heading, text: z.string() }),
            stargazing: z.object({
                label: z.string(),
                title: heading,
                text: z.string(),
                coda: z.string(),
            }),
        }),
        profile: z.object({
            eyebrow: z.string(),
            headline: heading,
            teaching: z.object({
                title: heading,
                text_before: z.string(),
                text_link: z.string(),
            }),
            languages: z.string(),
            how: z.object({
                label: z.string(),
                title: z.string(),
                text_before: z.string(),
                text_link: z.string(),
            }),
        }),
        contact: z.object({
            eyebrow_suffix: z.string(),
            headline: heading,
            enquiry: z.object({ label: z.string(), title: z.string(), text: z.string() }),
        }),
        cv: z.object({
            eyebrow: z.string(),
            title: z.string(),
            contents: z.array(z.string()).min(1),
        }),
        footer: z.object({
            standfirst: z.string(),
            standfirst_off_hours: z.string(),
            standfirst_plates: z.string(),
        }),
        not_found: z.object({ headline: heading, lede: z.string() }),
    }),
})

export type Heading = z.infer<typeof heading>

export const collections = {
    systemPages,
    personal,
    site,
    experience,
    education,
    skills,
    systems,
    community,
    projects,
}
