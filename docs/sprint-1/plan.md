# Sprint 1 Plan — CareerConnect

**Sprint window:** 2026-09-15 → 2026-09-28 · **Prepared by:** Bryce (Scrum lead) · **As of:** 2026-09-27

CareerConnect is a web-based platform for job seekers to create profiles, upload and
manage resumes, search jobs, apply, and track applications — with recruiter-side flows
and at least one Generative-AI feature planned for later sprints.

The full per-issue work plan (Issue #, Title, Type, Responsible, Target date, Priority,
Status) is in [Appendix A](./appendix-a.md).

## Sprint goal

Stand up the project (repo, board, process, requirements) and deliver **two working
features end-to-end** for the demo:

1. **User registration & login** (with profile management).
2. **Resume upload & management.**

The backend for both already exists (#1 schema, #2 API); Sprint 1 completes the UI,
wires it up, and proves it with CI and tests.

## Team capacity

Six members, ~1 in-lab meeting/week plus async work. Rough capacity per member for the
sprint is ~10–12 focused hours (course is one of several), so ~60–70 person-hours total.
Work is allocated by role so members build depth in their area.

| Member  | Role                 | Sprint 1 focus                                                        |
| ------- | -------------------- | --------------------------------------------------------------------- |
| Bryce   | Scrum lead / process | GitHub setup, board, labels, team process, sprint plan (#22–#24, #30) |
| Gene    | Documentation        | README, submission doc, meeting minutes (#25–#27)                     |
| Zohair  | Requirements         | AI-generated + team-generated user stories (#28, #29)                 |
| Mahmoud | Backend              | Schema + API (#1, #2, done); support US wiring (#38, #42)             |
| Gabriel | Frontend / UI        | Registration/login, profile, resume UI (#38, #42)                     |
| Luca    | Integration & QA     | CI, tests, demo prep, AI-log structure (#30–#33)                      |

## Backlog

### Committed to Sprint 1

Everything under the **Sprint 1** milestone / `sprint-1` label — see Appendix A. In short:

- **Foundation & process:** GitHub setup, board, labels, folders (#22); team process /
  DoR / DoD (#23); sprint plan + Appendix A (#24); AI-log structure + contribution log (#30).
- **Requirements:** AI-generated 10 user stories (#28); team-generated stories (#29).
- **Documentation:** README (#25); submission doc + cover page (#26); meeting minutes (#27).
- **Features (demo):** register & manage profile (#38); upload & manage resumes (#42),
  built on the completed backend (#1, #2).
- **Quality & delivery:** CI (#31); automated tests (#32); demo prep (#33).

### Product backlog (identified now, built later)

Recorded as GitHub issues without the `sprint-1` label so scope is visible but not
committed this sprint: job search & filtering, job application submission, application
status tracking, application-history dashboard, saved jobs, notifications/reminders,
recruiter job posting & applicant review, and the AI features (resume feedback,
job-matching). At least one Generative-AI feature plus one additional original feature
are required over the project and are slated for a later sprint.

## Priorities

1. **High** — anything blocking the demo or the graded Sprint 1 deliverables: process
   foundation (#22–#24, #30), user stories (#28, #29), README (#25), the two feature
   stories (#38, #42), and CI (#31).
2. **Medium** — supporting deliverables: submission doc (#26), minutes (#27), tests (#32),
   demo prep (#33).
3. **Low / backlog** — later-sprint stories (search, apply, dashboards, recruiter flows, AI).

Rubric weights confirm the focus: User Stories (3.0) and Sprint Planning (3.0) are the
heaviest, followed by AI Usage Log (2.0) and Task Breakdown (1.5).

## Effort estimation

T-shirt sizing (S ≈ ≤2h, M ≈ half a day, L ≈ full day+):

| Item                                             |   Size   |
| ------------------------------------------------ | :------: |
| Backend schema + API (#1, #2)                    | L (done) |
| Registration/login + profile UI and wiring (#38) |    L     |
| Resume upload/list/delete UI and wiring (#42)    |   M–L    |
| CI setup (#31)                                   | M (done) |
| Automated tests (#32)                            |    M     |
| Process docs + board + Appendix A (#22–#24)      |    M     |
| User stories AI + team (#28, #29)                |    M     |
| README + submission doc + minutes (#25–#27)      |    M     |
| Demo prep (#33)                                  |   S–M    |

The two feature stories are the largest remaining risk sinks and get the most capacity.

## Risks and mitigations

| Risk                                                    | Impact              | Mitigation                                                                                   |
| ------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| Frontend UI is the critical path (backend done, UI not) | Demo slips          | Give Gabriel the most capacity; Mahmoud supports wiring; wire against the existing API early |
| Short sprint / competing coursework                     | Deliverables rushed | Prioritize High items; keep PRs small; lab meeting as a weekly checkpoint                    |
| Direct commits to `main` / messy history                | Broken integration  | Feature-branch workflow + required PR review + green CI (see CONTRIBUTING)                   |
| AI-generated vs team-generated stories mixed            | Grading penalty     | Keep them in clearly separate sections/labels ([AI-Generated] label; #29 separate)           |
| Every member must have a PDF AI log                     | Lost marks          | Luca owns AI-log structure (#30); members export their logs before submission                |
| Merge conflicts near deadline                           | Lost time           | Merge `main` in frequently; short-lived branches; review within ~24h                         |

## Definition of Ready / Done

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full DoR and DoD the team commits to.
