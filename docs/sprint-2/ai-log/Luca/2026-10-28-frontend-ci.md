# AI Interaction Log

**Author:** Luca
**Date:** 2026-10-28
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Asked for help adding the frontend build and tests to the CI pipeline (#96), then asked why the frontend test failed.

## Purpose of AI Use
Implementation (CI configuration) and debugging

## Context / Findings
- Backend CI already existed from Sprint 1 (`.github/workflows/ci.yml`).
- Frontend is Angular with Vitest (`npx ng test --watch=false`).
- The default app test expected a heading that the app no longer had.

## AI Output / Actions
- Added a `frontend` job to `ci.yml` (Node setup, `npm ci`, build, tests in `frontend/CareerConnect`).
- Explained why the test failed. The TA said to fix the app rather than the test, so I added the missing `<h1>` to `app.html`.

## Validation
- Opened PR #117; both the backend and frontend jobs ran and passed.
- Checked the job logs to confirm the frontend tests actually ran.

## Decision
Accepted. The app was fixed instead of the test, following the TA's advice.

## Reflection
I learned that a failing test can point to a real gap in the app, and that changing the test just to pass hides the problem.

Files: `.github/workflows/ci.yml`, `frontend/CareerConnect/src/app/app.html` (PR #117)
