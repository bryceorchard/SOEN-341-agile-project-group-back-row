# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-25
**AI Tool:** Claude (Cowork)

## Task / Prompt
Write the follow-up assignments from the PR #112 review, routing each fix to the original owner
of the task that #112 implemented, so contributions stay spread across the team. When asked
whether to post them as five GitHub issues, Bryce chose to **add them as a comment on the PR**
instead.

## Context / Findings
- Re-checked #112 first: still open at `6656511`, no new commits, reviews, or comments since the
  2026-10-22 review, so all findings still applied. `main` was unchanged (`1568a06`).
- The fixes touch code that only exists in #112, so each follow-up is written to start after #112
  merges.

## AI Output / Actions
- Drafted five follow-up sections, each with the problem as found, a to-do checklist, and a
  Definition of Done naming the unit tests and the acceptance tests (#88–#95) it should satisfy:
  - **@ZA-Error** (#74, #75): login/register errors never render (zoneless + a plain field), show
    the backend's 400 messages, ≥ 8-character check, profile save error, hide Resumes for
    recruiters.
  - **@gabibdods** (#73, #79): log out on a 401, `RouterLinkActive` import, search filters in the
    URL, loading state.
  - **@bryceorchard** (#80, #81): "Posting closed" banner and hidden Apply form, already-applied
    state on load, 404 vs. other errors.
  - **@GeneFeng1** (#83): `jobStatus` "Posting closed" badge, per-status counts, error state.
  - **@lucamancini2005-design** (#87, #96): revert a failed status change, popup-safe resume
    viewing with URL cleanup, replace/delete errors, applicants-page unit tests, frontend tests in
    CI.
- The comment opens with a verdict ("good to merge, with follow-ups"), a summary of what passed
  (20/26 end-to-end checks; `ng test` 4/4), and a note asking @gabibdods to confirm #112's
  overlap with #73. It ends with an AI-assistance note.
- Posted as Bryce through the GitHub web UI:
  https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112#issuecomment-6403892880
  - The text was hash-verified against the draft before submitting and confirmed through the API
    afterwards (exact match).
  - Only the "Comment" button was used; #112 remains open.
- No issues were created and no code was changed.

## Decision
**Bryce:**

## Reflection
**Bryce:**
