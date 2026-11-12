# Sprint 3 Plan — CareerConnect

**Sprint window:** 2026-10-30 → 2026-11-16 · **Evaluation:** Mon 2026-11-16, in the lab, directly from the GitHub repository · **Prepared by:** Bryce (Scrum lead) · **As of:** 2026-11-05

The per-issue work plan (Issue #, Title, Type, Responsible, Start, Target, Priority, Status) is the
[ranked backlog](#ranked-backlog-work-plan) below. The same items, fields and dates are on the
[Sprint 3 project](https://github.com/users/bryceorchard/projects/8): the **Timeline** view shows every
Sprint 3 item between its Start and Target date with the milestone as a marker, **Prioritized backlog** groups
open items by priority, and **View 1** is the status board. Every Sprint 3 issue is on the
[`Sprint 3` milestone](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/milestone/4) and has the
`sprint-3` label.

## Sprint goal

Finish the remaining core features, make the test suite cover all of them, and start the Generative-AI feature:

1. **Recruiter dashboard and posting management**: every posting in one place with application counts per
   status; archive and restore; applications filtered by status and date; candidate review and status updates.
2. **Application analytics and history dashboard**: a job seeker's application history, status breakdown, and
   activity over time.
3. **Notifications and reminders**: in-app notifications for status updates, interview invitations, upcoming
   deadlines, and new applications (recruiters).
4. **AI-Powered Resume Feedback** (US-10, started now, finished in Sprint 4): working end to end with a mock
   provider in Sprint 3; real provider tuned from an evaluation set in Sprint 4.

Alongside: at least one acceptance test per Sprint 3 story (we aim for two or more), unit tests for every Sprint 3
feature running in CI, an up-to-date board, meeting minutes, a contribution log per member, the AI usage log, and a
Sprint 3 PDF report in each member's `AI-log/<Name>/` folder.

## Where we are (2026-11-05)

- **Sprint 2 features are on `main`.** PR #112 (frontend for Features 1–4) merged on 2026-10-29, along with the CI
  update (#117, #122). `main` has 28 backend and 63 frontend unit tests, and both CI jobs run on every PR.
- **Feature 1 is partly done.** Recruiters can already create, edit, close and reopen postings, see who applied
  (with a status filter), and change an application's status (#84–#87). Still missing: archiving, a dashboard
  overview with counts per status, a date filter, and a candidate review.
- **Feature 2 starts from US-06.** `/applications` lists a job seeker's applications with a status filter and
  per-status counts (#83). There is no status history (the schema stores only the current status) and no metrics
  over time.
- **Feature 3 does not exist yet.** There is no notifications table or UI. US-07 (#44) was a backlog story; it is
  widened for Sprint 3, and US-22 (#129) adds the recruiter side.
- **Feature 4 does not exist yet.** US-10 (#47) was already marked as the team's mandatory GenAI story.
- **Sprint 2 leftovers:** 18 issues are still open (see [Carried over from Sprint 2](#carried-over-from-sprint-2)).
  Most are stories and acceptance-test issues whose work is merged but which were never ticked or closed.

## How the backlog is prioritized

The Sprint 3 guidelines grade the sprint as follows. Priority follows the points at stake and what blocks them.

| Criterion (weight)                          | What earns it                                                  | Issues                                         |
| ------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| Core feature development (20)               | Features 1–3 on `main`; Feature 4 started                      | #128–#141, stories #44–#47, #128, #129         |
| Acceptance tests (20)                       | ≥ 1 AT per Sprint 3 story, verified on `main`                  | #142–#147, #153, #155                          |
| Unit testing (20)                           | Unit tests for every Sprint 3 feature, run in CI               | DoD of every task, #154                        |
| Continuous integration pipeline (10)        | Backend + frontend jobs green and required; no real AI calls   | #154                                           |
| Project management and GitHub usage (10)    | Board, backlog, plan and assignments kept current              | #148                                           |
| Individual contribution (10)                | Every member owns feature work with visible commits and PRs   | See [Team capacity](#team-capacity)            |
| Meeting minutes (5)                         | All minutes in the repo                                        | #150                                           |
| Detailed contribution log (5)               | One log per member with time and links                         | #151                                           |

Not graded directly but required for the evaluation: the AI usage log and per-member Sprint 3 PDF (#149), the
one-page summary report (#152), and the demo (#156).

**Priority levels** (board field):

- **P0:** needed for the Sprint 3 evaluation on Mon 2026-11-16.
- **P1:** the Sprint 3 slice of Feature 4 (US-10), and Sprint 2 carry-overs to close out.
- **P2:** Sprint 4, finishing the AI feature.
- **P3:** backlog stories for later sprints.

## Timeline

The sprint is short (planning starts on 2026-11-05 and the lab evaluation is 11 days later), so backend
and frontend work overlap: frontend tasks build against the API contract in their backend task and stub it until
it merges.

| Date        | Milestone                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Thu Nov 5   | Plan, issues and board ready (#148); AI-log reminder (#149)                                        |
| Sun Nov 8   | Acceptance tests finalized with the task owners (#153)                                             |
| Mon Nov 9   | AI response schema agreed by Bryce, Mahmoud and Gabriel (#141)                                     |
| Tue Nov 10  | Backend merged: archive + summary (#130), date filter + candidate review (#132), analytics + history (#134), notifications (#136) |
| Wed Nov 11  | Deadline reminders merged (#137); contribution-log reminder (#151)                                 |
| Thu Nov 12  | AI backend with mock provider merged (#139); first evaluation run (#141)                           |
| Fri Nov 13  | **Feature freeze:** all frontend PRs merged (#131, #133, #135, #138, #140)                         |
| Sat Nov 14  | Unit-test coverage checked on every feature; both CI jobs green on `main` (#154)                   |
| Sun Nov 15  | ATs verified on `main` (#155); summary report (#152), contribution logs (#151), AI-log PDFs (#149); demo dry run (#156) |
| Mon Nov 16  | Lab evaluation                                                                                     |

The `Sprint 3` milestone shows as "due by November 15" in GitHub's UI (it stores midnight UTC on the 16th),
which matches the plan: everything is merged by the end of Sunday.

## Critical path

1. **Finalize the ATs first** (#153, by Sun Nov 8). They define what each task builds and are 20 points on their own.
2. **Backend before frontend.** Each frontend task depends on one backend task: #131 ← #130, #133 ← #132,
   #135 ← #134, #138 ← #136, #140 ← #139. Backend PRs merge by Tue Nov 10 so the frontend has three days on real data.
3. **One shared status-change hook.** #134 (status history) and #136 (notifications) both hook into
   `PATCH /applications/:id`. Bryce and Mahmoud agree on one helper before either PR is opened, to avoid the kind of
   conflict that broke #112 in Sprint 2.
4. **Reminders follow notifications.** #137 builds on the table and helper from #136.
5. **AI: schema → backend → UI.** #141's response schema (Mon Nov 9) unblocks #139 and #140. CI must never need a
   real API key (#154).
6. **Verify on `main`, not on branches** (#155), then demo (#156).

## Ranked backlog (work plan)

Open Sprint 3 issues in priority order, then by target date.

| Rank | Issue | Title | Type | Responsible | Start | Target | Priority | Status |
| :--: | :---: | ----- | ---- | ----------- | ----- | ------ | :------: | ------ |
| 1 | #153 | [Task] Requirements: Finalize acceptance tests for Sprint 3 stories | Task | Zohair | Thu Nov 5 | Sun Nov 8 | P0 | Todo |
| 2 | #130 | [Task] Backend: Archive postings + recruiter dashboard summary (US-08) | Task | Mahmoud | Fri Nov 6 | Tue Nov 10 | P0 | Todo |
| 3 | #132 | [Task] Backend: Applications received — date filter + candidate review (US-09) | Task | Luca | Fri Nov 6 | Tue Nov 10 | P0 | Todo |
| 4 | #134 | [Task] Backend: Application analytics + status history (US-21) | Task | Bryce | Fri Nov 6 | Tue Nov 10 | P0 | Todo |
| 5 | #136 | [Task] Backend: Notifications — table, API and event triggers (US-07, US-22) | Task | Mahmoud | Fri Nov 6 | Tue Nov 10 | P0 | Todo |
| 6 | #137 | [Task] Backend: Deadline reminders (US-07, US-22) | Task | Zohair | Mon Nov 9 | Wed Nov 11 | P0 | Todo |
| 7 | #44 | US-07 [AI-Generated]: Notifications and deadline reminders | User Story | Mahmoud + Zohair | Fri Nov 6 | Fri Nov 13 | P0 | Todo |
| 8 | #45 | US-08 [AI-Generated]: Recruiter creates and manages job postings | User Story | Gabriel + Mahmoud | Fri Nov 6 | Fri Nov 13 | P0 | In Progress |
| 9 | #46 | US-09 [AI-Generated]: Recruiter views and filters applications | User Story | Gabriel + Mahmoud + Luca | Fri Nov 6 | Fri Nov 13 | P0 | In Progress |
| 10 | #128 | US-21: Application analytics and history dashboard | User Story | Bryce + Gene | Fri Nov 6 | Fri Nov 13 | P0 | Todo |
| 11 | #129 | US-22: Recruiter notifications for new applications | User Story | Mahmoud + Zohair | Fri Nov 6 | Fri Nov 13 | P0 | Todo |
| 12 | #131 | [Task] Frontend: Recruiter dashboard — postings overview + archive (US-08) | Task | Gabriel | Sun Nov 8 | Fri Nov 13 | P0 | Todo |
| 13 | #133 | [Task] Frontend: Applicants view — date filter + candidate review panel (US-09) | Task | Luca | Sun Nov 8 | Fri Nov 13 | P0 | Todo |
| 14 | #135 | [Task] Frontend: Application analytics + history dashboard (US-21) | Task | Gene | Sun Nov 8 | Fri Nov 13 | P0 | Todo |
| 15 | #138 | [Task] Frontend: Notification centre — bell, unread count, list (US-07, US-22) | Task | Zohair | Sun Nov 8 | Fri Nov 13 | P0 | Todo |
| 16 | #154 | [Task] QA: Unit tests for Sprint 3 features + CI upkeep | Task | Luca | Fri Nov 6 | Sat Nov 14 | P0 | Todo |
| 17 | #142 | Acceptance tests: US-08 Archive postings + recruiter dashboard (Sprint 3) | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P0 | Todo |
| 18 | #143 | Acceptance tests: US-09 Date filter + candidate review (Sprint 3) | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P0 | Todo |
| 19 | #144 | Acceptance tests: US-21 Application analytics and history dashboard | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P0 | Todo |
| 20 | #145 | Acceptance tests: US-07 Job seeker notifications and deadline reminders | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P0 | Todo |
| 21 | #146 | Acceptance tests: US-22 Recruiter notifications for new applications | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P0 | Todo |
| 22 | #151 | [Task] Detailed contribution log (Sprint 3) | Task | Gene | Wed Nov 11 | Sun Nov 15 | P0 | Todo |
| 23 | #155 | [Task] QA: Automate and verify Sprint 3 acceptance tests | Task | Luca | Thu Nov 12 | Sun Nov 15 | P0 | Todo |
| 24 | #152 | [Task] Sprint 3 summary report (one page) | Task | Gene | Fri Nov 13 | Sun Nov 15 | P0 | Todo |
| 25 | #156 | [Task] Sprint 3 demo preparation | Task | Luca | Fri Nov 13 | Sun Nov 15 | P0 | Todo |
| 26 | #148 | [Task] Sprint 3 planning + work plan + board | Task | Bryce | Thu Nov 5 | Mon Nov 16 | P0 | In Progress |
| 27 | #149 | [Task] AI Usage Log + Sprint 3 PDF reports (all members) | Task | Bryce | Thu Nov 5 | Mon Nov 16 | P0 | Todo |
| 28 | #150 | [Task] Meeting minutes for Sprint 3 | Task | Gene | Thu Nov 5 | Mon Nov 16 | P0 | Todo |
| 29 | #141 | [Task] AI: Prompt, response schema and evaluation set for resume feedback (US-10) | Task | Bryce | Fri Nov 6 | Thu Nov 12 | P1 | Todo |
| 30 | #139 | [Task] Backend: AI resume feedback service + endpoint (US-10) | Task | Mahmoud | Sat Nov 7 | Thu Nov 12 | P1 | Todo |
| 31 | #47 | US-10 [AI-Generated]: AI-assisted resume feedback | User Story | Gabriel + Bryce + Mahmoud + Zohair | Fri Nov 6 | Fri Nov 13 | P1 | Todo |
| 32 | #140 | [Task] Frontend: AI resume feedback UI (US-10) | Task | Gabriel | Mon Nov 9 | Fri Nov 13 | P1 | Todo |
| 33 | #147 | Acceptance tests: US-10 AI resume feedback (Sprint 3 slice) | Acceptance Test | Zohair + Luca | Fri Nov 6 | Sun Nov 15 | P1 | Todo |

Every task and AT issue is linked as a sub-issue of its story:

| Story | Sub-issues |
| ----- | ---------- |
| #45 US-08 | #130, #131, #142 |
| #46 US-09 | #132, #133, #143 |
| #128 US-21 | #134, #135, #144 |
| #44 US-07 | #136, #137, #138, #145 |
| #129 US-22 | #146 (shares #136–#138 with US-07) |
| #47 US-10 | #139, #140, #141, #147 |

### Carried over from Sprint 2

Still open on 2026-11-05. They are on the Sprint 3 board with Sprint = "Sprint 2", Priority P1 and their Sprint 2
status. Most only need their boxes ticked against `main` and closing (#148 tracks this). #73 (app shell) was
closed on 2026-11-05 and shows as Done.

| Issue | Title | Responsible | Status |
| :---: | ----- | ----------- | ------ |
| #32 | [Task] Automated tests for the two Sprint 1 features | Luca | In Progress |
| #38 | US-01 [AI-Generated]: Register and manage profile | Gabriel + Mahmoud + Zohair | In Progress |
| #42 | US-02 [AI-Generated]: Upload and manage resumes | Gabriel + Mahmoud | In Progress |
| #39 | US-03 [AI-Generated]: Search and filter job postings | Gabriel + Mahmoud | In Progress |
| #72 | US-20: View job details | Gabriel | In Progress |
| #41 | US-05 [AI-Generated]: Submit applications through the platform | Gabriel + Bryce + Mahmoud | In Progress |
| #43 | US-06 [AI-Generated]: Application dashboard with status | Gabriel + Gene + Mahmoud | In Progress |
| #88–#95 | Acceptance tests for US-01, US-02, US-03, US-20, US-05, US-06, US-08, US-09 | Zohair + Luca | Todo |
| #102 | [Task] Sprint 2 summary report (one page) | Gene | Todo |
| #103 | [Task] QA: Automate and verify acceptance tests | Luca | Todo |
| #104 | [Task] Sprint 2 demo preparation | Luca | Todo |

The backlog stories (#40, #54–#62) are on the board with Sprint = "Backlog" and Priority P3.

## Team capacity

Six members, one lab meeting a week plus Discord, over an 11-day window. Sprint 3 is graded individually, so every
member owns at least one feature task (backend or frontend) with its unit tests, on top of their role. Frontend work
is spread across the team as in Sprint 2, and backend work is spread too, so the contribution isn't concentrated on
one person as it was with #112.

| Member  | Role                 | Feature work                                                         | Role work                                             |
| ------- | -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| Bryce   | Scrum lead / process | Analytics + status history backend (#134); AI prompt, schema and evaluation (#141) | Plan + board (#148), AI logs + PDFs (#149)            |
| Mahmoud | Backend              | Archive + dashboard summary (#130), notifications (#136), AI service (#139) | Backend reviews                                       |
| Gabriel | Frontend / UI        | Recruiter dashboard (#131), AI feedback UI (#140)                   | Frontend reviews, UI consistency                       |
| Luca    | Integration & QA     | Date filter + candidate review, backend and frontend (#132, #133)    | Unit tests + CI (#154), AT verification (#155), demo (#156) |
| Gene    | Documentation        | Analytics + history dashboard (#135)                                 | Minutes (#150), contribution logs (#151), summary report (#152) |
| Zohair  | Requirements         | Deadline reminders (#137), notification centre (#138)                | Finalize ATs (#153)                                   |

## Effort estimation

T-shirt sizing (S ≈ ≤ 2 h, M ≈ half a day, L ≈ a full day or more):

| Item                                                                 | Size |
| -------------------------------------------------------------------- | :--: |
| #130 Archive + dashboard summary (backend)                           |  M   |
| #131 Recruiter dashboard (frontend)                                  |  L   |
| #132 Date filter + candidate review (backend)                        |  M   |
| #133 Applicants view: date filter + review panel (frontend)          |  M   |
| #134 Analytics + status history (backend, migration + backfill)      |  L   |
| #135 Analytics + history dashboard with charts (frontend)            |  L   |
| #136 Notifications table, API, triggers (backend)                    |  L   |
| #137 Deadline reminders (backend)                                    |  M   |
| #138 Notification centre (frontend)                                  |  M   |
| #139 AI service + endpoint with mock provider (backend)              |  L   |
| #140 AI feedback UI (frontend)                                       |  M   |
| #141 Prompt, schema, evaluation set                                  |  M   |
| #153 Finalize ATs                                                    |  S   |
| #154 Coverage in CI + per-feature unit-test check                    |  M   |
| #155 Verify ATs on `main`                                            |  M   |
| #149–#152, #156 Logs, minutes, report, demo                          |  M   |

## Risks and mitigations

| Risk                                                                    | Impact                                         | Mitigation                                                                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 11-day sprint; backend late means frontend can't finish                 | Core-feature and AT points lost                | Backend merged by Tue Nov 10; frontend builds against the contract in each backend issue        |
| #134 and #136 both change `PATCH /applications/:id`                     | Merge conflicts, lost code (as with #112)      | One shared status-change helper agreed up front; second PR rebases on the first                 |
| AI provider: cost, rate limits, API key leaking, flaky tests            | CI red, key exposed, demo fails                | Mock provider by default and in CI; key only in an env var; `.env.example`; rate limit         |
| Resume text sent to a third-party AI service                            | Privacy concern raised at evaluation           | Explicit request only, notice in the UI, no real personal data in the evaluation set (#141)    |
| Unit tests left to the end                                              | 20 unit-test points at risk                    | Unit tests are in every task's DoD; #154 checks each PR before approval                         |
| Sprint 2 issues left open                                               | Board doesn't match the repo                   | Tick and close them against `main` early in the sprint (#148)                                   |
| Contribution logs and AI-log PDFs left to the last day                  | Up to 5 points and individual marks            | Reminders on Nov 5 and Nov 11; per-member checklists in #149 and #151                           |
| Admins can bypass branch protection                                     | PRs merged without review                      | Every PR gets one approval before merge, including the Scrum lead's                             |

## Definition of Ready / Done

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the DoR and DoD the team works to. Each Sprint 3 task issue also lists
its own Definition of Done (unit tests, CI green, reviewed PR).
