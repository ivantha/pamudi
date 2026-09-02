# Career knowledge base

This directory holds the career record behind `data/*.yaml`: the provenance for every
fact that reaches pamudi.com and the CV, plus the much larger body of detail that the
website and the two-page PDF leave out.

## It is not tracked, and it should stay that way

`.gitignore` carries `kb/*` followed by a `!kb/README.md` negation, so this file is
the only thing in here that git sees. That is deliberate. **This repo is public**, and
the record contains:

- Real client and product names. `data/systems.yaml` and `data/experience.yaml` are
  anonymised to domain descriptors precisely because it is unconfirmed whether those
  names are publishable, and some may be under NDA. The mapping back to them lives in
  this directory, which is what those files mean by "maintained offline".
- An employer's internal performance-appraisal detail, including department structure
  and review cycles.
- Names of third parties: colleagues, a mentee, and employees whose award material she
  designed. None of them agreed to appear in a public repository.
- Her phone number, which is otherwise confined to the gitignored `data/private.yaml`.

If any of that changes, it changes by Pamudi's decision, not by a tidy-up.

## What it holds

Nine markdown files plus a `sources/` directory. Between them: a project catalogue
mapping every product she worked on to the anonymised entry it became, a chronological
career record, and the supporting records for profile, skills, education and community
work. `sources/` keeps the original handover documents verbatim and unedited, so the
rewrite can always be checked against them. An `open-questions.md` collects every fact
the sources cannot settle.

Start at `kb/INDEX.md`.

## Relationship to `data/`

`kb/` is the **record**. `data/*.yaml` is **what ships**. Editing a file in here
changes nothing on the site or in the PDF, and it is not meant to: the direction of
travel is that a fact is sourced here first, then a publishable subset of it is written
into `data/`. Do not add a claim to `data/` that this directory cannot source.

## If this directory is missing

It is untracked, so a fresh clone will not have it. The frozen upstream snapshot it was
built from lives at `~/Documents/archives/pamudi-cv-data-2026-09-02/`, with a git bundle
beside it at `~/Documents/archives/pamudi-cv-2026-09-02.bundle`. That snapshot predates
this directory and is missing the project catalogue, but it is the recovery point.
