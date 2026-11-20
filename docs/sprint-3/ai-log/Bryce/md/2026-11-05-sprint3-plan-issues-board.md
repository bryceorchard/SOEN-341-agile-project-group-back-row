# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-05
**AI Tool:** Claude (Cowork)

## Task / Prompt
Create the Sprint 3 planning doc from `SOEN 341 Sprint3.pdf`, create the Sprint 3 issues, assign them to team
members, and add them to the project board timeline.

Questions asked by the AI and answered by Bryce:
- Sprint 3 evaluation date (not in the PDF): Mon 2026-11-16.
- AI feature: US-10 AI-Powered Resume Feedback (#47), started in Sprint 3, finished in Sprint 4.
- Board: a new "Sprint 3" project copied from Sprint 2, with date fields and a Timeline view, linked to the repo
  and made public like Sprints 1–2.
- Owners: the proposed split (every member gets feature work, frontend and backend spread across the team).

## Context / Findings
Sources reviewed: the Sprint 3 PDF, the Sprint 1 and 2 docx files, `docs/sprint-2/sprint-2-plan.md`, the
Sprint 2 AI logs, every issue and PR via the GitHub API, the Sprint 1 and 2 projects, and the code on `main`
(`76b6de4`).
- Sprint 3 features: (1) recruiter dashboard and posting management, (2) application analytics and history
  dashboard, (3) notifications and reminders, (4) one GenAI feature, started now and finished in Sprint 4.
  Grading: core features 20, acceptance tests 20, unit tests 20, CI 10, PM/GitHub 10, individual 10, minutes 5,
  contribution log 5.
- Starting point on `main`: recruiters can already create, edit, close and reopen postings, filter applicants by
  status and change statuses (#84–#87). Missing for Feature 1: archiving, a dashboard overview, a date filter and a
  candidate review. Feature 2 only has the US-06 list (#83); the schema stores no status history. Features 3 and 4
  don't exist. 28 backend and 63 frontend unit tests; both CI jobs run on PRs.
- Neither existing project had a date or iteration field, so neither could show a timeline.
- 19 Sprint 2 issues were still open (mostly stories and AT issues whose work is merged).
- This session's GitHub API token was read-only for the repo and the Projects API was blocked, so all GitHub
  writes were done in the browser, signed in as Bryce.

## AI Output / Actions
No commits, pushes or PR changes.

**Milestone and label**
- Milestone `Sprint 3` (#4), due 2026-11-16 (GitHub shows it as "due by November 15"); label `sprint-3`.

**29 new issues (#128–#156)**, all with `sprint-3`, the Sprint 3 milestone and the Sprint 3 project:
- Stories: #128 US-21 Application analytics and history dashboard; #129 US-22 Recruiter notifications for new
  applications. Both are marked in their bodies as drafted with AI assistance.
- 12 feature tasks (#130–#141), each with a target date, dependencies and a Definition of Done that includes unit
  tests in CI.
- 6 acceptance-test issues (#142–#147), Given/When/Then, one per Sprint 3 story (3–5 ATs each), drafted for Zohair
  to finalize in #153.
- 9 process/QA/docs tasks (#148–#156): plan + board, AI log + Sprint 3 PDFs, minutes, contribution log, summary
  report, finalize ATs, unit tests + CI, AT verification, demo.

**Existing stories updated:** #44 (US-07, widened to cover status updates, interview invitations and deadline
reminders; Gabriel unassigned and Zohair assigned, to match the new owners), #45 (US-08) and #46 (US-09)
(Sprint 3 criteria added, moved to the Sprint 3 milestone), #47 (US-10, Sprint 3 → 4). All got `sprint-3`; #44,
#45 and #46 were raised to high priority.

**Owners**

| Member  | Issues |
| ------- | ------ |
| Bryce   | #134 analytics + history backend, #141 AI prompt/schema/evaluation, #148 plan + board, #149 AI log + PDFs |
| Mahmoud | #130 archive + dashboard summary, #136 notifications backend, #139 AI service + endpoint |
| Gabriel | #131 recruiter dashboard UI, #140 AI feedback UI |
| Luca    | #132 + #133 date filter + candidate review (backend + frontend), #154 unit tests + CI, #155 AT verification, #156 demo |
| Gene    | #135 analytics + history UI, #150 minutes, #151 contribution log, #152 summary report |
| Zohair  | #137 deadline reminders, #138 notification centre UI, #153 finalize ATs |
| Zohair + Luca | ATs #142–#147 |

**Sub-issues:** 17 links: #45 ← #130, #131, #142; #46 ← #132, #133, #143; #128 ← #134, #135, #144;
#44 ← #136, #137, #138, #145; #129 ← #146; #47 ← #139, #140, #141, #147.

**Sprint 3 project (#8, https://github.com/users/bryceorchard/projects/8)**
- Copied from Sprint 2 (keeps the Status, Priority and Sprint fields, the views and the workflows). Added the Start
  date and Target date fields. Added "Sprint 4" to the Sprint field and rewrote the Priority and Sprint option
  descriptions for Sprint 3.
- New **Timeline** view: roadmap by Start/Target date, milestone markers, sorted by start date, filtered to
  `sprint:"Sprint 3"`. Added the date columns to "Prioritized backlog" and turned off sub-issue nesting there, as on
  the Sprint 2 board.
- 62 items: the 33 Sprint 3 items, each with Status, Priority, Sprint and both dates; the 19 open Sprint 2 issues
  (Sprint 2, P1, status copied from the Sprint 2 board); and the backlog stories #40 and #54–#62 (Backlog, P3).
- The "Auto-add sub-issues" workflow also pulled in 16 closed Sprint 2 tasks (#68, #69, #74–#87). Those cards were
  archived on the Sprint 3 board; the issues and the Sprint 2 board are untouched.
- Linked to the repo and made public, as Bryce had approved.

**Plan:** `docs/sprint-3/sprint-3-plan.md` (local, not committed). It has the sprint goal, the starting point, a
grading-to-issues table, priority levels, a day-by-day timeline with a feature freeze on Fri Nov 13, the critical
path, a ranked work plan (33 rows), the Sprint 2 carry-overs, team capacity, effort sizes and risks. Lints clean
against the repo's `.markdownlint.json`.

**Problems hit**
- For about ten minutes after the 29 issues were created, every attempt to link a sub-issue or add an existing
  issue to a project failed with GitHub 500 errors. This was most likely a temporary rate limit; the same steps
  worked when retried.
- An automated replace of an existing issue body was blocked by the session's safety check, so the four story
  updates were made through GitHub's normal edit box instead.
- A `git fetch --dry-run` run by the AI on the local repo left `.git/objects/maintenance.lock` (the mounted folder
  blocks deletes). It was renamed to `.git/stale-maintenance-lock-claude-2026-11-05`, an empty file Bryce can
  delete.
- Mahmoud closed #73 during the session; the board's "Item closed" workflow moved it to Done.

**Validation by the AI**
- All 29 new issues were re-read through the API and compared field by field (title, body, labels, assignees,
  milestone, state) with the generated spec: 0 mismatches. The four story updates and all 17 sub-issue links were
  checked the same way.
- All 62 board items were re-read through the project's own data: every Status, Priority, Sprint and date matched
  the plan.
- Ticked the first three boxes on #148: plan written, issues created, board ready.

## Decision
**Bryce:**

## Reflection
**Bryce:**
