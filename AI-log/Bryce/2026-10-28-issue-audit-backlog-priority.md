# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-28
**AI Tool:** Claude (Cowork)

## Task / Prompt
Check every issue against the current progress of the project and tick the right checkboxes.
Then read the Sprint 2 guidelines (`SOEN 341 Sprint 2.docx`) and use them to prioritize the backlog.

Choices Bryce made when the AI asked:
- Work that exists only in an open PR is ticked with a note saying which PR (e.g. "(in #112)").
  "Merged via reviewed PR" stays unticked until the work is on `main`.
- #75 had every box ticked, but the profile page isn't on `main`. Untick the Definition of Done
  items that need `main`.
- Prioritization covers the board (missing issues, statuses, new Priority and Sprint fields),
  priority labels, and a draft `docs/sprint-2/sprint-2-plan.md` (not committed).

## Context / Findings
- All 73 issues were compared against `main` (`016582a`), open PRs #112 (head `5b3ef93`, now
  including Zohair's four follow-up commits) and #117, the `docs-Contributions` and
  `lucamancini2005-design-frontend-failed-test-fix` branches, CI runs, and the `main`
  branch-protection settings.
- **Backend:** every Sprint 2 endpoint is on `main`. `npm test` passes all 28 backend tests.
- **Frontend:** every Sprint 2 page is only in #112. Partial items found while checking #112's code:
  - No 401 handling.
  - No filters in the URL, and no loading or error states on job search.
  - No posted date on job details, and no "already applied" state when the page loads.
  - The apply confirmation is generic.
  - No per-status counts or "last updated" on the dashboard.
  - No resume type/date, size check, or delete confirmation.
  - Unit tests exist only for the recruiter postings form.
- **CI:** #117 adds a frontend job, which currently fails. The unpushed-as-PR branch
  `lucamancini2005-design-frontend-failed-test-fix` "fixes" the stale test by adding
  `<h1>Hello, CareerConnect</h1>` to `app.html`. That conflicts with #112, which fixes
  `app.spec.ts` properly.
- **Wrongly ticked boxes found:**
  - #75: whole Definition of Done (not on `main`) and the ≤ 2000-char validation (not implemented).
  - #97: the "Sprint 1 planning" milestone still exists.
  - #100: `docs/README.md` still lists `WeeklyMinutes.md` and none of the minutes files.
- **Process gaps:**
  - PR #70 was merged without a review.
  - Branch protection on `main` requires a PR, 1 approval, and the `backend` check, but admins can bypass it.
  - The Sprint 2 milestone has no due date.
  - #111 is the Actions warnings about Node 20 being deprecated (`checkout@v4`, `setup-node@v4`)
    and the `ubuntu-latest` migration.
- **Board:**
  - Its "Sprint 1" project was missing 15 issues: US-11–US-19, #64, #66–#69, #111.
  - #73–#95 were on the board as sub-issues but had no status.
  - Closed #25, #26, #30, #33 were still in Todo or In Progress.
- **Sprint 2 doc:** the evaluation is done from the repository. Grading weights: core features + ATs 25,
  planning 15, task breakdown 15, CI 10, PM/GitHub 10, contributions 10, minutes 5,
  contribution log 5, AI log 5.

## AI Output / Actions
- Edited 34 issue bodies through the GitHub web UI as Bryce: #1, #2, #31–#33, #39, #42, #43,
  #45, #46, #64, #66, #67, #73–#87, #96–#101. Each body was checked against the expected text
  through the GitHub API afterwards (all matched).
- Board (project "Sprint 1"):
  - Added the 15 missing issues.
  - Set Status on every item.
  - Created a **Priority** field (P0–P3) and a **Sprint** field (Sprint 1/2/3, Backlog) and set
    them on all 76 items.
  - Added a **Prioritized backlog** table view: open items, grouped by priority, in ranked order.
- Labels: added `priority: high` to #88–#93 and `priority: medium` to #94–#95. Raised #102,
  #103, #104 from medium to high.
- Milestones: put #66, #67, #111 on the Sprint 2 milestone.
- Wrote `docs/sprint-2/sprint-2-plan.md` locally:
  - Sprint goal and current status.
  - Rubric-to-issue mapping and the critical path.
  - The ranked work-plan table (48 open issues) and the completed table.
  - Capacity, estimates, and risks.
  - Not committed.
- Nothing was committed, pushed, merged, or deleted.

## Decision
**Bryce:**

## Reflection
**Bryce:**
