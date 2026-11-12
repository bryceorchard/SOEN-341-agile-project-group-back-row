# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Make a new Sprint 2 project board and import all the relevant issues. Remove from the Sprint 1
board what isn't needed there.

## Context / Findings
- The "Sprint 1" project (#2) had 76 items after the 2026-10-28 cleanup. It mixed Sprint 1 work,
  all of Sprint 2, and the product backlog.
- A copy of a project keeps its views, custom fields (Status, Priority, Sprint) and workflows.
  It does not copy issues, and copies are private by default.
- None of Sprint 1's workflows are enabled, so the copy matches.

## AI Output / Actions
- Created the **Sprint 2** project (#4, https://github.com/users/bryceorchard/projects/4) by copying Sprint 1.
- Linked Sprint 2 to the repository. Made it public, to match Sprint 1, after Bryce approved.
- Added 62 items to Sprint 2:
  - All Sprint 2 issues: #38, #39, #41–#43, #45, #46, #64, #66, #67, #72–#105, #111.
  - #68 and #69 (the Sprint 1 stories' acceptance tests, written in Sprint 2).
  - #32 (carried over from Sprint 1).
  - The backlog stories: #40, #44, #47, #54–#62.
  - Open PRs #112 and #117.
- Set Status, Priority and Sprint on every Sprint 2 item, reusing the values from the 2026-10-28
  audit. #32, #68 and #69 moved to Sprint 2, and both PRs are "In Review", P0.
- Applied the same ranked order. The "Prioritized backlog" view shows open items, grouped by
  priority, with sub-issue nesting off.
- Checked by re-reading all 62 items: every field value and the order matched.
- Sprint 1 project:
  - Removed the 57 items that now live on Sprint 2 (the issues themselves are untouched).
  - Kept the 19 Sprint 1 items, including #32, #38 and #42, since they were Sprint 1 commitments
    carried into Sprint 2.
  - Deleted the "Prioritized backlog" view added there on 2026-10-28.
- Updated #98's board note and the board paragraph in the local `docs/sprint-2/sprint-2-plan.md`
  to point to the Sprint 2 project.
- No commits.

## Decision
**Bryce:**

## Reflection
**Bryce:**
