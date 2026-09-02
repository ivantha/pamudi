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
 * Case studies. Frontmatter carries everything the index and the case header
 * need so neither has to parse the body, and `zod` fails the build rather than
 * letting a half-filled study ship.
 *
 * Deliberately MDX rather than YAML: a case study is prose and images, not a
 * list of fields. The `data/*.yaml` collections below are the opposite case.
 */
const work = defineCollection({
    loader: glob({ base: "./src/content/work", pattern: "**/*.{md,mdx}" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            summary: z.string(),
            year: z.number().int(),
            // What she actually did, not the team's job title.
            role: z.string(),
            context: z.string(),
            disciplines: z.array(z.string()).min(1),
            tools: z.array(z.string()).default([]),
            cover: image(),
            coverAlt: z.string(),
            // Lower sorts first on the index; ties fall back to year descending.
            order: z.number().int().default(100),
            draft: z.boolean().default(false),
        }),
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
 * and never reaches this repo or the site.
 */
const personal = defineCollection({
    loader: () => loadYamlSingle("personal.yaml"),
    schema: z.object({
        name: z.string(),
        role: z.string(),
        location: z.string(),
        eyebrow: z.string(),
        tagline: z.string().optional(),
        headline: z.object({ before: z.string(), accent: z.string(), after: z.string() }),
        intro: z.array(z.string()).optional(),
        availability: z.string().optional(),
        specialisms: z.array(z.string()).min(1),
        stats: z.array(z.object({ value: z.string(), label: z.string() })),
        summary: markup,
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
 * and owned end to end; the CV colours those rows in accent.
 */
const systems = defineCollection({
    loader: () => loadYamlList("systems.yaml"),
    schema: z.object({
        include_in: includeIn.optional(),
        product: z.string(),
        client: z.string().optional(),
        description: markup.optional(),
        scope: z.string(),
        stack: z.string(),
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
 * subsections on the About page, not filtered-out members of an existing one —
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
 * the About page can render both through the same markup.
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
 * The framing copy the Website v2 design added around the career record: the
 * hero lede, the Practice cards, the process band, the page ledes and the CV
 * contents list.
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
            lede: z.string(),
            figures: z.array(z.object({ value: z.string(), label: z.string() })),
        }),
        practice: z.array(z.object({ label: z.string(), title: z.string(), text: markup })).min(1),
        process: z.object({
            lede: z.string(),
            steps: z.array(z.object({ title: z.string(), text: markup })).min(1),
        }),
        pages: z.object({ systems: z.string(), about: z.string() }),
        cv: z.object({ eyebrow: z.string(), contents: z.array(z.string()).min(1) }),
        footer: z.object({ standfirst: z.string() }),
    }),
})

export const collections = {
    work,
    personal,
    site,
    experience,
    education,
    skills,
    systems,
    community,
    projects,
}
