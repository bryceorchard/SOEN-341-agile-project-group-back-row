# Contribution Log — Sprint 1 — Luca Mancini (@lucamancini2005-design)

## Task Summary

Integration & QA for Sprint 1. Set up the AI-log folder structure, built the backend CI pipeline with GitHub Actions, added backend edge-case and cross-user tests, and logged my AI use.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| AI-log folder structure | #30 | 0.50 | 2026-09-27 | [Jump to Task](#task-1---ai-log-folder-structure) |
| Backend CI pipeline | #31 | 2.00 | 2026-09-27 | [Jump to Task](#task-2---backend-ci-pipeline) |
| Backend edge-case tests | #32 | 2.00 | 2026-09-27 | [Jump to Task](#task-3---backend-edge-case-tests) |
| Sprint 1 AI logs | #30 | 1.00 | 2026-09-27 | [Jump to Task](#task-4---sprint-1-ai-logs) |

## Task #1 - AI-log folder structure
**Associated Links:** [#30](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/30), commit `ae6f7cc`

Created `AI-log/<name>/` folders for team members so everyone has one place to put their AI interaction logs and PDFs.

## Task #2 - Backend CI pipeline
**Associated Links:** [#31](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/31), [PR #37](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/37), [AI log](../../../AI-log/Luca/2026-09-27-ci-setup.md)

Added `.github/workflows/ci.yml`. On every push and PR to `main` it installs Node 22, runs `npm ci` and runs the backend tests. Checked the job logs to confirm the tests actually ran.

## Task #3 - Backend edge-case tests
**Associated Links:** [#32](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/32), [PR #48](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/48), [AI log](../../../AI-log/Luca/2026-09-27-backend-tests.md)

Added `backend/test/edge-cases.test.js` with 5 tests the existing suite was missing:

- login with an unknown email
- signup with missing fields
- resume upload without logging in
- user B cannot see or delete user A's resume
- user B cannot see user A's profile

## Task #4 - Sprint 1 AI logs
**Associated Links:** [#30](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/30), [`AI-log/Luca/`](../../../AI-log/Luca/)

Logged my AI use for the CI setup and the backend tests (Markdown and PDF).
