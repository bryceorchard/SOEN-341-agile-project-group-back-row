# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-20
**AI Tool:** Claude (Cowork)

## Task / Prompt
Two-part request:
1. Audit Sprint 1 against `SOEN341 Sprint 1.docx`: find what is missing (frontend and backend
   suspected incomplete, plus anything else), given that most work was tracked through GitHub issues.
2. Create the Sprint 2 issues from `SOEN 341 Sprint 2.docx`, matching the style of past feature
   issues, and delegate them to team members.

Clarifying questions asked by the AI and answered by Bryce:
- Reuse existing backlog user stories for Sprint 2 (instead of creating duplicates).
- Break stories into separate task issues, linked as GitHub sub-issues.
- Acceptance tests for the stories in scope for Sprint 1 and Sprint 2 (not every backlog story).
- Spread frontend work across the whole team instead of strictly by role.

## Context / Findings
Sources reviewed: both sprint docx files, the repo (`main` @ `e63c3dc`), all issues and PRs
(#1–#71) via the GitHub API, the "Sprint 1" project board, and GitHub Actions run history.
Backend tests (`npm test`) and the frontend build/test (`ng build`, `ng test`) were run in the AI sandbox.

**Sprint 1 status**
- Backend: solid. Auth, profile, and resume endpoints plus early Sprint 2 work (jobs,
  applications, resume replace — #66/#67, PR #70); 18/18 tests pass; CI green on every run.
- Frontend (#38, #42 still open):
  - No profile view/edit UI (`GET/PUT /profile` never called) — US-01 criterion unmet.
  - Registration always sends `job_seeker`; recruiters cannot sign up from the UI.
  - No logout, nav bar, or route guard; `/profile/<email>` just echoes the URL.
  - No client-side validation (400s show "Something went wrong").
  - `app.spec.ts` is stale: `ng test` fails 1 of 2. CI only runs the backend, so it went unnoticed.
    Angular 22 needs Node ≥ 22.22.3 / 24.15, which is not pinned.
- Process / rubric gaps:
  - `main` is not protected; none of PRs #48, #52, #65, #70, #71 has an approving review
    (CONTRIBUTING.md says otherwise).
  - Luca's two Sprint 1 AI logs were deleted from `main` in `0edee83`; Gabriel has no AI-log
    folder; Zohair's log lives in `docs/user-stories/`; Gene's and Mahmoud's logs are `.md`, not PDF.
  - Contribution log only exists on unmerged `feature/luca-contributions` (`docs/contriubtions.md`).
  - Board stale (closed #25/#26/#33 in Todo); PR #53 still open though its commit landed via #65;
    #31/#33 closed with unchecked boxes; empty "Sprint 1 planning" milestone; README `npm starm`
    typo; `docs/README.md` references a missing `WeeklyMinutes.md`; no minutes after 2026-10-06.
- Sprint 2 starting point: features 1–3 mostly exist on the backend; none of features 2–4 exist
  on the frontend (about 10 frontend tasks against about 5 small backend tasks).

**Incident:** a `git fetch --prune` run by the AI against the local repo left 9 `.lock` files
under `.git` (the mounted folder blocks deletes by default). Bryce granted delete permission and
the AI removed the 9 files it created. 4 older lock files (2026-09-25/27) were left untouched.

## AI Output / Actions
All GitHub writes were done through the GitHub web UI in the browser (signed in as Bryce).
No commits, pushes, or PR changes were made.

- Created milestone **Sprint 2** (no due date set).
- Created **34 issues (#72–#105)**, all with label `sprint-2`, milestone Sprint 2, and added to
  the project board (No Status column):
  - New user story **#72 US-20: View job details** (covers "view detailed job descriptions";
    marked in the body as drafted with AI assistance).
  - 15 feature task issues (#73–#87): backend, frontend, and recruiter tasks for features 1–4.
  - 8 acceptance-test issues (#88–#95), Given/When/Then format matching #68/#69 (≥ 2 ATs per story).
  - 10 process/QA/docs task issues (#96–#105): frontend CI, branch protection + Sprint 1
    cleanup, Sprint 2 plan/board, AI-log fixes, minutes, contribution log, summary report,
    acceptance-test automation, demo prep, acceptance-test finalization.
- Updated 7 existing stories (#38, #39, #41, #42, #43, #45, #46): refreshed acceptance criteria
  to the Sprint 2 doc, task/AT references, `sprint-2` label, Sprint 2 milestone, added task owners
  as assignees; #39/#41/#43 raised from medium to high priority.
- Linked 23 sub-issues (each task and AT issue under its story).
- Delegation (spread frontend):

| Member  | Issues |
| ------- | ------ |
| Gabriel | #73 app shell, #77 resume UI, #79 job listings, #80 job details |
| Mahmoud | #76, #78, #82, #84, #86 (backend), #85 recruiter postings UI |
| Zohair  | #74 registration role, #75 profile UI, #105 finalize ATs, ATs #88–#95 |
| Luca    | #87 recruiter applicants UI, #96 CI, #103 AT automation, #104 demo, ATs #88–#95 |
| Gene    | #83 applications dashboard, #100 minutes, #101 contribution log, #102 summary report |
| Bryce   | #81 apply flow, #97 branch protection + cleanup, #98 Sprint 2 plan, #99 AI logs |

- Validation by the AI: every created issue was compared field by field (title, body, labels,
  assignees, milestone) against the generated plan through the GitHub API — 0 mismatches. Story
  edits and all 23 sub-issue links were re-checked the same way.

## Decision
**Bryce:**

## Reflection
**Bryce:**
