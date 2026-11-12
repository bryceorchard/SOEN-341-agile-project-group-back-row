# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Update the main README so its File Structure section matches the repository as it is now.

## Context / Findings
- Checked against `main` at `aaf6a0a` (after #112, #117, #121 and #122), using `git ls-files`.
- **Mistakes and gaps in the old tree:**
  - It listed `docs/Contributing.md`, but the file is `docs/CONTRIBUTING.md`.
  - It used the minutes name pattern `YYYY-MM-DD`, but the files are named
    `YYYY_MM_DD_Meeting_Minutes.md`.
  - It was missing `docs/ContributionLog/` (#101), `docs/sprint-2/` (#98), the backend's `db/`
    scripts and `src/` files, the frontend's components, `.nvmrc` / `.tool-versions`, and
    `.gitignore`.
  - It called `backend/` "SQLite Database". The folder is the Express API, with the database
    under it.
  - The root was named `my-project/`, the code fence had a made-up language (`CareerConnect`),
    and it mixed `|` and `│` in the tree lines.
- `docs/README.md` has its own docs-folder tree. It's missing `ContributionLog/`, but it wasn't in
  scope for this request.

## AI Output / Actions
- Replaced the README's File Structure section with a tree generated from the tracked files. Each
  salient file has a one-line comment, checked against the code (for example `middleware.js`,
  `config.js`, `ci.yml`, `app.config.ts` and `open-blob.ts`).
- Marked `backend/data/` and `backend/uploads/` as git-ignored, since they only exist locally.
- Nothing else in the README changed.
- No commits or pushes.

## Decision
**Bryce:**

## Reflection
**Bryce:**
