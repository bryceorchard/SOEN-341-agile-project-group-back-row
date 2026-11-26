# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Bryce pushed the review follow-up commits to PR #112 and asked for his next steps. Before
answering, Claude did what it had offered: tick the boxes in the review comments, link the issues
#112 now finishes back to it, and update their "Progress in #112" notes.

## Context / Findings
- **Push confirmed.** #112's head is `79c375d`. It includes all seven follow-up commits and `main`
  merged in. The backend check passed.
- **#112 is blocked.** It is mergeable, but branch protection needs an approving review, and it has
  none yet.
- **#118, #119 and #120 were merged without reviews.** That closed #97, #98 and #99. #99's
  Definition of Done isn't finished: the other members' Sprint 2 log PDFs are still missing.
- **#117** (Luca's frontend CI) is still open and behind `main`.
- **Now fully finished by #112** (only "Merged via reviewed PR" left): #74, #75, #81, #83 and #87.
  They were unlinked earlier because they had open items.
- **Still not finished by #112:** #73. Its "tests pass in CI" item needs the frontend job from
  #117.

## AI Output / Actions
- **Updated issue bodies.** Each one was edited in the browser and re-read through the GitHub API.
  - #74: ticked the form-validation unit test and added `1c712df`.
  - #75: ticked the 2000-character check, the load/save unit test and "persists after reload", and
    added `beaffb6`.
  - #81: ticked the confirmation and the 201/409 tests, and added `34baf5e` and `3129d87`.
  - #83: ticked the list, the status filter with counts and the unit test, and added `22c2abb`.
  - #87: ticked the posting-details item and added `591b830`.
  - Each of these now says #112 completes the task and will close it.
  - #73: added `ea78132` (nav highlighting, URL round-trip tests). Still not linked.
  - #79 and #80: replaced the "wording difference" notes. They now say the text matches the
    acceptance tests (`0c18bf1`, `3129d87`).
- **Re-linked #112.** Linked #74, #75, #81, #83 and #87 through the Development picker. That makes
  9 linked issues (#74, #75, #77, #79, #80, #81, #83, #85, #87). Each issue's timeline was checked
  for the new "connected" event.
- **Ticked review checkboxes on #112.**
  - Bryce's review comment: 13 boxes, covering the unit tests and ATs for Zohair, Bryce, Gene and
    Luca.
  - Zohair's comment: 2 boxes.
  - Every "Merged via reviewed PR" box was left unticked.
- **Gave Bryce his next steps:**
  - Get #112 reviewed, then merge it.
  - Then #117, then the #111 CI branch.
  - Tidy local branches.
  - Follow up on #99.
  - Remaining Sprint 2 work: #103, #101, #102 and #104.
- No commits, pushes or merges.

## Decision
**Bryce:**

## Reflection
**Bryce:**
