# AI Interaction Log

**Author:** Luca
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Asked for help implementing my Sprint 3 tasks #132 (backend) and #133 (frontend) for US-09, plus the US-09 acceptance tests (#143).

## Purpose of AI Use
Implementation and testing

## Context / Findings
- #132: from/to date filter for a posting's applications and a candidate review endpoint.
- #133: date inputs on the applicants page and a candidate review panel.

## AI Output / Actions
- Backend: `from`/`to` (YYYY-MM-DD) on GET /jobs/:id/applications, with 400 errors for bad or reversed dates.
- Backend: new GET /jobs/:id/applications/:applicationId (profile, applied resume, other applications); owner only. Documented in backend/README.md.
- Frontend: date filter synced to the URL, a warning for invalid ranges, different empty states, and a review panel with a status change.
- Acceptance tests for AT-6 to AT-9: `us09-s3-acceptance.spec.ts` (12) and `us09-s3-acceptance.test.js` (12).

## Validation
- Found a bug while testing: an impossible date (2026-13-01) caused a 500 error. Fixed it so it returns 400.
- Ran both suites locally and the frontend build; CI passed on the PR.

## Decision
Accepted after the date-validation fix.

## Reflection
Writing the acceptance tests alongside the feature caught the invalid-date bug before review.

Files: `backend/src/routes/jobs.js`, `backend/README.md`, `posting-applicants.component.*`, the US-09 Sprint 3 test files
