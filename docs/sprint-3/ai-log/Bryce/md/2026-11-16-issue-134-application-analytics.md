# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCQnsSAkpsHSLJvBWwg>

## Task / Prompt
"can you start working on #134 please?"

#134 is "[Task] Backend: Application analytics + status history (US-21)", assigned to Bryce, Sprint 3,
target Tue 2026-11-10. It covers a status history table, `GET /applications/stats`,
`GET /applications/:id/history`, a shared status-change helper with #136, and docs and tests.

## Context / Findings
- Story #128 (US-21) acceptance criteria and acceptance tests #144 (AT-1 to AT-5) define what the
  dashboard needs; the frontend half is #135 (Gene), which depends on this task.
- #136 (notifications) was already merged and closed. Its status-change notification was inline in
  `PATCH /applications/:id`, so "agree one helper with #136" meant moving that code into the new helper
  rather than coordinating with an open branch.
- Only two places write an application's status: `POST /applications` and `PATCH /applications/:id`.
  `db/seed.js` and some tests insert applications directly with SQL, so they get no history unless the
  backfill covers them.
- Baseline on `main` (`ed655ba`): 137/137 backend tests passing.

## AI Output / Actions
- Branch `feature/134-application-analytics`, commit `d798b53`.
- `db/schema.sql`: new `application_status_history` table (application_id, status, changed_at,
  changed_by), with an index on application_id. `changed_by` is null for backfilled rows.
- `db/migrate.js`: `backfillStatusHistory()` gives each application with no history one row: its current
  status, dated `applied_at` if still Applied, else `updated_at`. Runs on every migrate and is idempotent.
- `src/routes/applications.js`: `recordStatus()` writes a history row; `changeStatus()` updates the
  status, records it and sends the #136 notification. Apply and PATCH both run in a transaction.
  Re-saving the same status adds no row and sends nothing, as before.
- `src/application-stats.js`: `computeStats(rows, now)`, a pure function: count and percent per status,
  total, last 7 and 30 days (rolling), response rate (applications that ever had a status other than
  Applied), 8 Monday-start UTC weeks, and open vs closed postings (archived counts as closed).
- `GET /applications/stats` (caller's own) and `GET /applications/:id/history` (applicant or owning
  recruiter, 404 otherwise, oldest first, `changedBy` as `applicant` / `recruiter` / `null`).
- `db/seed.js`: demo applications now have applied dates spread over ~6 weeks and a status history.
- `backend/README.md` and `docs/ERD.md` updated.
- New `test/application-analytics.test.js`, 13 tests: stats arithmetic on fixed data and a fixed "now",
  week boundaries, the empty case, history on apply and update, no row on a failed update, access rules,
  the stats endpoint on relative dates, and the backfill (including running it twice).
- Result: 150/150 backend tests passing (137 existing + 13 new).

## Decision


## Reflection

