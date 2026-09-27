# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
Fix all the issues found while reviewing PR #4 (backend API), and produce a stub to add
to the PR commit description describing the fixes. (PR #3 was already merged into `main`.)

## Context / Findings
- The repo's `.git` (on iCloud Drive) had a stale `.git/index.lock` that the sandbox
  could not remove ("Operation not permitted"), so in-place checkout/edit of the
  `backend-api` branch wasn't safe. Worked instead in a clean `git clone` of
  `origin/backend-api` (HEAD 378f51c) outside iCloud, then produced a patch.
- Issues addressed:
  1. Real bug — `UPLOAD_DIR` in `src/config.js` used `new URL(...).pathname`, which
     leaves percent-encoding in the path. A project path with a space (the team's own
     "Assignment 1" iCloud path) resolved to `.../Assignment%201/.../uploads`.
  2. `middleware.js` set `req.user.id = payload.sub` (a string), relying on SQLite type
     affinity to match INTEGER PKs.
  3. `JWT_SECRET` silently fell back to a dev placeholder even in production.

## AI Output / Actions
- `src/config.js`: `UPLOAD_DIR` now uses `fileURLToPath(new URL('../uploads', import.meta.url))`
  (decodes the path; also Windows-safe). Added a guard that throws at startup if
  `NODE_ENV === 'production'` and `JWT_SECRET` is still the default.
- `src/middleware.js`: `req.user.id` now `Number(payload.sub)` so it is a real integer.
- Added `test/config.test.js`: a regression guard asserting the resolved `UPLOAD_DIR`
  contains no `%`. Verified it FAILS on the old `.pathname` code under a spaced path
  (`cc%20fix%20spaced`) and PASSES with the fix.
- Full suite: 7/7 tests pass (6 original + new regression test).
- Deliberately left `POST /auth/logout` as a stateless client-side token discard — that
  matches issue #2's spec; a real server-side token blocklist is out of Sprint 1 scope.
- Delivered the changes as `cc-fix-pr4.patch` in the repo root (apply with `git apply`).

## Decision


## Reflection

