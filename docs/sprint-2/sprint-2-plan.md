# Sprint 2 Plan — CareerConnect

**Sprint window:** 2026-09-29 → 2026-10-26 (team deadline from the 2026-10-24 minutes) · **Evaluation:** in the lab, directly from the GitHub repository · **Prepared by:** Bryce (Scrum lead) · **As of:** 2026-10-28

The per-issue work plan (Issue #, Title, Type, Responsible, Target, Priority, Status) is the
[ranked backlog](#ranked-backlog-work-plan) below. The same order and fields are on the
[Sprint 2 project board](https://github.com/users/bryceorchard/projects/4) (**Prioritized backlog**
view, with Status, Priority and Sprint fields). The [Sprint 1 board](https://github.com/users/bryceorchard/projects/2)
now holds only Sprint 1 work.

## Sprint goal

Deliver the three required Sprint 2 features end to end and start the fourth:

1. **User profile and resume management**: create/edit profile; upload, replace, view, delete resumes.
2. **Job search and listings**: list jobs, filter by keyword/location/category, view job details.
3. **Application submission and tracking**: apply with a resume, confirmation, status dashboard
   (Applied, Under Review, Interview, Offered, Rejected).
4. **Recruiter dashboard and posting management** (started now, finished in Sprint 3): create/manage
   postings, see applications received.

Alongside: at least two acceptance tests per Sprint 1 and Sprint 2 story, a CI pipeline that is set
up and demonstrated, an up-to-date board, meeting minutes, a contribution log per member, and the AI log.

## Where we are (2026-10-28)

- **Backend: done and on `main`.** All endpoints for Features 1–4 are merged (#66, #67, #76, #78, #82,
  #84, #86); 28 backend tests pass in CI.
- **Frontend: done in an open PR.** PR #112 implements the UI for Features 1–4 (#73–#87), plus
  Zohair's follow-up fixes. It is not on `main` yet, so it does not count for a repository evaluation.
- **CI:** the backend job is green and required on `main`. PR #117 adds the frontend job; that job
  fails until #112 merges (the old `app.spec.ts` test is fixed in #112).
- **Acceptance tests:** written for every story (#68, #69, #88–#95, closed out in #105); the Sprint 2
  UI tests have not been verified in the running app yet (#103).
- **Process docs:** meeting minutes are up (#100); the contribution logs are on the unmerged
  `docs-Contributions` branch (#101); the AI-log gaps in #99 and the summary report (#102) are still open.

## How the backlog is prioritized

The Sprint 2 guidelines say the evaluation is done **from the repository** and grade it as follows.
Priority follows the points at stake and what blocks them.

| Criterion (weight)                         | What earns it                                       | Issues                       |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------- |
| Core features incl. acceptance tests (25)  | Features 1–3 on `main`, ATs verified                | #112 tasks, #88–#93, #103     |
| Sprint planning (15)                       | This plan, the work plan, the board                 | #98                          |
| Task breakdown (15)                        | Stories split into owned tasks, ATs linked          | #38–#46, #72–#95 (done)      |
| CI pipeline (10)                           | Backend + frontend jobs, demonstrated on a PR       | #96 / PR #117                |
| Project management and GitHub usage (10)   | Board current, PRs reviewed, branch protection      | #97, #98                     |
| Contribution by team members (10)          | Visible commits, PRs, reviews per member            | #112 follow-ups by owner     |
| Meeting minutes (5)                        | Minutes in the repo                                 | #100 (done)                  |
| Detailed contribution log (5)              | One log per member with time and links              | #101                         |
| AI usage log and validation (5)            | Every member's log, Sprint 1 + 2                    | #99                          |

**Priority levels** (board field):

- **P0:** needed for the Sprint 2 evaluation. Without it, graded work is missing from `main`.
- **P1:** Sprint 2 completeness and follow-ups; Feature 4 (only has to *start* this sprint).
- **P2:** Sprint 3: finish Feature 4, the Generative-AI feature (US-10), CI housekeeping.
- **P3:** backlog stories for later sprints.

## Critical path

1. **Merge #112 into `main`** (after updating it with `main`; it is currently behind). This one merge
   moves ten frontend tasks to done and unblocks the UI acceptance tests and the demo.
2. **Merge #117** once its frontend job is green on top of #112. Don't merge the
   `lucamancini2005-design-frontend-failed-test-fix` branch: it adds a `Hello, CareerConnect` heading
   to `app.html` to satisfy the stale test, and it conflicts with #112's `app.html`.
3. **Make `frontend` a required check** on `main` next to `backend` (#96, #97).
4. **Verify the acceptance tests on `main`** (#103), tick them in #88–#93 (and #94–#95 where done),
   and close the AT issues and their tasks.
5. **Documentation before the lab:** merge the contribution logs (#101), fill the AI-log gaps (#99),
   write the one-page summary (#102), run the demo once (#104).

## Ranked backlog (work plan)

Open issues in priority order. Target is relative because the evaluation date isn't in the repo.

| Rank | Issue | Title | Type | Responsible | Target | Priority | Status |
| :--: | :---: | ----- | ---- | ----------- | ------ | :------: | ------ |
| 1 | #98 | [Task] Sprint 2 planning + work plan + board | Task | Bryce | Before evaluation | P0 | In Progress |
| 2 | #73 | [Task] Frontend: App shell — navigation, route guards, logout (US-01) | Task | Gabriel | Before evaluation | P0 | In Review |
| 3 | #74 | [Task] Frontend: Registration role selection + form validation (US-01) | Task | Zohair | Before evaluation | P0 | In Review |
| 4 | #75 | [Task] Frontend: Profile view and edit page (US-01) | Task | Zohair | Before evaluation | P0 | In Review |
| 5 | #77 | [Task] Frontend: Resume replace, view, and details (US-02) | Task | Gabriel | Before evaluation | P0 | In Review |
| 6 | #79 | [Task] Frontend: Job listings page with search and filters (US-03) | Task | Gabriel | Before evaluation | P0 | In Review |
| 7 | #80 | [Task] Frontend: Job details page (US-20) | Task | Gabriel | Before evaluation | P0 | In Review |
| 8 | #81 | [Task] Frontend: Apply to a job + submission confirmation (US-05) | Task | Bryce | Before evaluation | P0 | In Review |
| 9 | #83 | [Task] Frontend: My applications dashboard (US-06) | Task | Gene | Before evaluation | P0 | In Review |
| 10 | #96 | [Task] CI: Add frontend build + tests to the pipeline | Task | Luca | Before evaluation | P0 | In Review |
| 11 | #103 | [Task] QA: Automate and verify acceptance tests | Task | Luca | Before evaluation | P0 | Todo |
| 12 | #88 | Acceptance tests: US-01 Register and manage profile (Sprint 2 UI) | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 13 | #89 | Acceptance tests: US-02 Upload and manage resumes (Sprint 2 UI) | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 14 | #90 | Acceptance tests: US-03 Search and filter job postings | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 15 | #91 | Acceptance tests: US-20 View job details | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 16 | #92 | Acceptance tests: US-05 Submit applications through the platform | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 17 | #93 | Acceptance tests: US-06 Application dashboard with status | Acceptance Test | Zohair + Luca | Before evaluation | P0 | Todo |
| 18 | #101 | [Task] Detailed contribution log (Sprint 2) | Task | Gene | Before evaluation | P0 | In Progress |
| 19 | #99 | [Task] AI Usage Log — Sprint 2 + Sprint 1 fixes | Task | Bryce | Before evaluation | P0 | Todo |
| 20 | #102 | [Task] Sprint 2 summary report (one page) | Task | Gene | Before evaluation | P0 | Todo |
| 21 | #104 | [Task] Sprint 2 demo preparation | Task | Luca | Before evaluation | P0 | Todo |
| 22 | #38 | US-01 [AI-Generated]: Register and manage profile | User Story | Gabriel + Mahmoud + Zohair | Before evaluation | P0 | In Progress |
| 23 | #42 | US-02 [AI-Generated]: Upload and manage resumes | User Story | Gabriel + Mahmoud | Before evaluation | P0 | In Progress |
| 24 | #39 | US-03 [AI-Generated]: Search and filter job postings | User Story | Gabriel + Mahmoud | Before evaluation | P0 | In Progress |
| 25 | #72 | US-20: View job details | User Story | Gabriel | Before evaluation | P0 | In Progress |
| 26 | #41 | US-05 [AI-Generated]: Submit applications through the platform | User Story | Gabriel + Bryce + Mahmoud | Before evaluation | P0 | In Progress |
| 27 | #43 | US-06 [AI-Generated]: Application dashboard with status | User Story | Gabriel + Gene + Mahmoud | Before evaluation | P0 | In Progress |
| 28 | #85 | [Task] Frontend: Recruiter postings — create and manage (US-08) | Task | Mahmoud | Before evaluation | P1 | In Review |
| 29 | #87 | [Task] Frontend: Recruiter view of applicants + status updates (US-09) | Task | Luca | Before evaluation | P1 | In Review |
| 30 | #45 | US-08 [AI-Generated]: Recruiter creates and manages job postings | User Story | Gabriel + Mahmoud | Before evaluation | P1 | In Progress |
| 31 | #46 | US-09 [AI-Generated]: Recruiter views and filters applications | User Story | Gabriel + Mahmoud + Luca | Before evaluation | P1 | In Progress |
| 32 | #94 | Acceptance tests: US-08 Recruiter creates and manages job postings | Acceptance Test | Zohair + Luca | Before evaluation | P1 | Todo |
| 33 | #95 | Acceptance tests: US-09 Recruiter views and filters applications | Acceptance Test | Zohair + Luca | Before evaluation | P1 | Todo |
| 34 | #97 | [Task] Process: Branch protection + Sprint 1 cleanup | Task | Bryce | Before evaluation | P1 | In Progress |
| 35 | #32 | [Task] Automated tests for the two Sprint 1 features | Task | Luca | Before evaluation | P1 | In Progress |
| 36 | #47 | US-10 [AI-Generated]: AI-assisted resume feedback | User Story | Gabriel + Bryce + Mahmoud + Zohair | Sprint 3 | P2 | Backlog |
| 37 | #111 | [Task] Resolve node and ubuntu issues | Task | Bryce | Sprint 3 | P2 | Todo |
| 38 | #40 | US-04 [AI-Generated]: Save and favourite job postings | User Story | Gabriel + Mahmoud | Later sprint | P3 | Backlog |
| 39 | #44 | US-07 [AI-Generated]: Notifications and deadline reminders | User Story | Gabriel + Mahmoud | Later sprint | P3 | Backlog |
| 40 | #54 | US-11: AI job-matchmaking suggestions | User Story | — | Later sprint | P3 | Backlog |
| 41 | #55 | US-12: AI Mock Interview Question Generator | User Story | — | Later sprint | P3 | Backlog |
| 42 | #56 | US-13: Salary Visualizer | User Story | — | Later sprint | P3 | Backlog |
| 43 | #57 | US-14: Job Skill Glossary and Trend Tracker | User Story | — | Later sprint | P3 | Backlog |
| 44 | #58 | US-15: Saved Message Templates | User Story | — | Later sprint | P3 | Backlog |
| 45 | #59 | US-16: AI Job Description Polisher | User Story | — | Later sprint | P3 | Backlog |
| 46 | #60 | US-17: Basic Company Profile Card Builder | User Story | — | Later sprint | P3 | Backlog |
| 47 | #61 | US-18: Application Goal & Streak Tracker | User Story | — | Later sprint | P3 | Backlog |
| 48 | #62 | US-19: Interview Hours Setup | User Story | — | Later sprint | P3 | Backlog |

### Completed this sprint

| Issue | Title | Type | Responsible | Closed |
| :---: | ----- | ---- | ----------- | :----: |
| #64 | [Task] Integerate JWT Authentication (Backend & Frontend) | Task | Mahmoud | 2026-10-08 |
| #66 | [Backend] Jobs & Applications schema + endpoints | Task | Mahmoud | 2026-10-08 |
| #67 | [Backend] Resume replace endpoint | Task | Mahmoud | 2026-10-08 |
| #76 | [Task] Backend: Resume file view/download endpoint (US-02) | Task | Mahmoud | 2026-10-21 |
| #78 | [Task] Backend: Job search support — categories endpoint + demo seed data (US-03) | Task | Mahmoud | 2026-10-21 |
| #82 | [Task] Backend: Application tracking — job details + status filter (US-06) | Task | Mahmoud | 2026-10-21 |
| #84 | [Task] Backend: Recruiter posting management — my postings, edit, close (US-08) | Task | Mahmoud | 2026-10-21 |
| #86 | [Task] Backend: Applications received for a posting (US-09) | Task | Mahmoud | 2026-10-21 |
| #100 | [Task] Meeting minutes for Sprint 2 | Task | Gene | 2026-10-28 |
| #105 | [Task] Requirements: Finalize acceptance tests for Sprint 1 + 2 stories | Task | Zohair | 2026-10-26 |

## Team capacity

Six members, one lab meeting a week plus Discord. The study break and midterms (Midterm #1 on
2026-10-25) cut capacity in the second half of the sprint, which is why the frontend landed late.

| Member  | Role                 | Sprint 2 focus                                                                   |
| ------- | -------------------- | -------------------------------------------------------------------------------- |
| Bryce   | Scrum lead / process | Plan + board (#98), branch protection (#97), AI logs (#99), apply flow (#81)    |
| Gene    | Documentation        | Minutes (#100), contribution log (#101), summary report (#102), dashboard (#83) |
| Zohair  | Requirements         | Acceptance tests (#105), registration + profile UI (#74, #75)                   |
| Mahmoud | Backend              | All Sprint 2 endpoints (#66–#86), recruiter postings UI (#85), PR #112         |
| Gabriel | Frontend / UI        | App shell, resumes, job list and details (#73, #77, #79, #80)                   |
| Luca    | Integration & QA     | CI (#96), AT verification (#103), demo (#104), applicants view (#87)            |

## Effort estimation (remaining work)

T-shirt sizing (S ≈ ≤ 2 h, M ≈ half a day, L ≈ a full day or more):

| Item                                                              | Size |
| ----------------------------------------------------------------- | :--: |
| Update and merge #112 (resolve conflicts, re-run tests)           |  M   |
| #112 follow-ups (401 handling, filters in URL, counts, unit tests) |  L   |
| Frontend CI green + required check (#96, #117)                    |  S   |
| Verify and tick ATs #88–#95 (#103)                                |  M   |
| Contribution logs for all six members (#101)                      |  M   |
| AI-log gaps + Sprint 2 PDFs (#99)                                 |  M   |
| Summary report (#102) and demo dry run (#104)                     |  M   |
| README / repo cleanup (#97)                                       |  S   |

## Risks and mitigations

| Risk                                                               | Impact                                   | Mitigation                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Frontend still unmerged (#112) when the TA evaluates from the repo | Core-feature and AT points lost          | Merge #112 first; follow-ups go in small PRs after it                                   |
| #112 implements tasks assigned to five other members               | Contribution grade skews to one person   | Owners do the follow-ups and unit tests on their own tasks (#112 review comment)        |
| Frontend CI red until #112 lands                                   | CI demo fails                            | Merge order #112 → #117; don't merge the h1 workaround branch                           |
| Admins can bypass branch protection                                | PRs merged without review (e.g. #70)     | Every PR gets one approval before merge, including the Scrum lead's                     |
| Contribution logs and AI logs incomplete                           | Up to 10 points and individual marks     | Merge `docs-Contributions`; every member adds a log and an AI-log PDF before the lab    |
| Internal deadline (2026-10-26) passed during midterms               | Last-minute merges, conflicts            | Freeze `main` except for the critical path above until the evaluation                   |

## Definition of Ready / Done

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the DoR and DoD the team works to.
