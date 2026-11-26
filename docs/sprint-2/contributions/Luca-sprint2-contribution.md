# Contribution Log — Sprint 2 — Luca Mancini (@lucamancini2005-design)

## Task Summary

Integration & QA for Sprint 2. Added the frontend job to the CI pipeline and finished my PR #112 follow-up for the recruiter applicants view (#87): error handling and unit tests. The Sprint 2 acceptance-test automation (#88–#95, #103) was finished early in Sprint 3 and is logged in my Sprint 3 contribution log.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| Frontend CI job | #96 | 2.00 | 2026-10-28 | [Jump to Task](#task-1---frontend-ci-job) |
| Applicants view error handling | #87 | 3.00 | 2026-10-28 | [Jump to Task](#task-2---applicants-view-error-handling) |

## Task #1 - Frontend CI job
**Associated Links:** [#96](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/96), [PR #117](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/117), commit `d222149`, [AI log](../ai-log/Luca/2026-10-28-frontend-ci.md)

Added a `frontend` job to `.github/workflows/ci.yml` that installs, builds and runs the Angular tests, next to the existing backend job. The default app test was failing because the app had no heading. Following the TA's advice to fix the app rather than the test, I added the `<h1>` to `app.html`. Both jobs pass on PRs.

## Task #2 - Applicants view error handling
**Associated Links:** [#87](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/87), [PR #112](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112), commit `3b27bc2`, [AI log](../ai-log/Luca/2026-10-28-applicants-error-handling.md)

Follow-up on PR #112 for the recruiter applicants view. The applicants and profile pages now show an error when a request fails, instead of failing silently. Added `open-blob.ts` to open resume files in a new tab, and unit tests in `posting-applicants.component.spec.ts`.
