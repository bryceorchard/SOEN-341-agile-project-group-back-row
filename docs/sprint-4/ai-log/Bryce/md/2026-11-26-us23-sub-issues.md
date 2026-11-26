# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-26
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCUTophY8FTj2fgeLxn>

## Task / Prompt
1. "can we get started on issue #199? (sub issues first)". #199 is US-23: Application Version
   Snapshots, the team-proposed non-AI feature for Sprint 4. Its sub-issues #202 (backend),
   #203 (frontend) and #213 (acceptance tests) were still US-11 placeholders. Goal: rewrite them
   for US-23 before any implementation starts.
2. "just add the repo": retry attaching the repo with push access and apply the edits.

## Context / Findings
- #199: 4 acceptance criteria (snapshot saved on submit, later edits only affect future
  applications, recruiter sees the frozen snapshot and submission time, graceful fallback for
  applications without a snapshot). TA approval still pending; #200's Definition of Done says
  no implementation PR until approval is recorded in #199.
- #202, #203, #213 bodies were generic placeholders ("Team-proposed unique feature"), and their
  first task was to rename them after the feature.
- Storing `applications.resume_id` would not freeze the resume: `PUT /resumes/:id` overwrites the
  file on disk and deletes the old one, and `DELETE /resumes/:id` sets `resume_id` to NULL. The
  snapshot has to copy the file at submission.
- The recruiter review is the existing panel in `posting-applicants.component`
  (`GET /jobs/:id/applications/:applicationId`), so #203 extends it; no new page or nav link.
- Seeded applications have no resumes and would all be pre-snapshot, so the seed needs at least
  one application with a snapshot for the demo.
- The placeholder DoDs mention lint, but neither `backend` nor `frontend` has a lint script, and
  CI runs only tests and the build. The rewritten DoDs name the actual CI steps.
- On prompt 1, attaching the repo with push access was denied, so issue bodies were read through
  the public API and the repo was cloned read-only. On prompt 2 the attach succeeded.

## AI Output / Actions
- Drafted new titles and bodies for the three sub-issues:
  - #202 `[Task] Backend: Snapshot profile and resume on submit (US-23)`: snapshot columns on
    `applications` plus an idempotent migration, snapshot written in the `POST /applications`
    transaction, resume file copied to `uploads/snapshots/`, `snapshot` field on the review
    endpoint, `GET /applications/:id/snapshot/resume`, seed data, API contract for #203, and a
    Supertest test list.
  - #203 `[Task] Frontend: Show the submitted snapshot in candidate review (US-23)`: review panel
    shows the snapshot and submission time, "View resume" uses the snapshot route, fallback
    notice when `snapshot` is null, component tests.
  - #213 `Acceptance tests: US-23 application version snapshots`: AT-1 to AT-4 in
    Given/When/Then, one per acceptance criterion plus access control, as a draft for Zohair
    and Luca.
- Prompt 1: wrote the drafts and an `apply.sh` to `Claude outputs/us23-sub-issues/`, since the
  edits couldn't be applied from the session.
- Prompt 2: attached the repo and applied the new titles and bodies to #202, #203 and #213 through
  the REST API. Ticking the two done tasks in #200 (scoping, story and acceptance criteria) was
  blocked by the session's permission check and left for Bryce. Committed this log on
  `ai-log/bryce-2026-11-26-us23-sub-issues` and opened a PR.

## Decision


## Reflection
