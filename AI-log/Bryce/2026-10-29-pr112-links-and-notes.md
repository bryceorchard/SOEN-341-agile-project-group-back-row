# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Unlink from PR #112 every issue that #112 wouldn't fully finish, since linked issues close
automatically when the PR merges. In each issue #112 touches, add a note on what #112 contributed,
unless one already exists.

## Context / Findings
- **New commit.** Mahmoud pushed `128e7e6` to #112 at 14:22, "Finish remaining Sprint 2 frontend
  checklist items (#73, #77, #79, #80)". It adds:
  - logout on a 401;
  - resume type and date on each row, a client-side type/size check, and a delete confirmation;
  - filters kept in the URL, plus loading and error states;
  - the posted date, the already-applied status, and "Back to search" keeping filters;
  - unit tests for all of these.
- **Checked against #112's head:** `ng test --watch=false` passes all 34 tests in 9 files, and the
  development build compiles.
- **Fully finished by #112** (only "Merged via reviewed PR" left): #77, #79, #80, #85.
- **Not fully finished:**
  - #73: its tests are in #112, but its "pass in CI" item needs the frontend job from #117.
  - #74: no form-validation unit test.
  - #75: no ≤ 2000-character check and no profile load/save test.
  - #81: confirmation details, link, and unit tests missing.
  - #83: "last updated", per-status counts, and unit test missing.
  - #87: posting details not shown on the applicants page.
- **Existing notes:** none of the ten issues had a summary note about #112, only per-item
  "(in #112)" annotations on their checklists.

## AI Output / Actions
- Unlinked #73, #74, #75, #81, #83 and #87 from #112. #77, #79, #80 and #85 stay linked.
  Checked through each issue's timeline (connected/disconnected events).
- Ticked the items `128e7e6` finished:
  - #73: 401 handling.
  - #77: row details, client-side check, delete confirmation, unit test.
  - #79: filters in the URL, empty/loading/error states, unit test.
  - #80: posted date, applied status, back-to-results, unit test.
  - #87: the status-update unit test from Luca's `3b27bc2`.
- Updated the notes on items that are still open in #73 and #81.
- Added a "Progress in #112" section to all ten issues: what #112 did for that issue, who wrote
  each part (commit SHAs), what's still open, and whether the issue will close when #112 merges.
- Noted two wording differences from the acceptance tests:
  - #79's empty state vs. AT-3 in #90;
  - #80's not-found text vs. AT-2 in #91.
- Every body was re-read through the GitHub API and matched the intended text.
- No commits, pushes, or merges. #112's description was not edited.

## Decision
**Bryce:**

## Reflection
**Bryce:**
