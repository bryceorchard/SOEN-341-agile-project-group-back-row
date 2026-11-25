# Sprint 4 Plan — CareerConnect

**Sprint window:** 2026-11-25 → 2026-11-30 · **Evaluation:** Mon 2026-11-30, in the lab, directly from the GitHub repository · **Prepared by:** Bryce (Scrum lead) · **As of:** 2026-11-25

The per-issue work plan (Issue #, Title, Type, Responsible, Start, Target, Priority, Status) is the
[ranked backlog](#ranked-backlog-work-plan) below. The same items, fields and dates are on the
[Sprint 4 project](https://github.com/users/bryceorchard/projects/9): **Timeline** shows every Sprint 4 item
between its Start and Target date with the milestone as a marker, **Prioritized backlog** groups open items by
priority, and **Board** is the status board. Every Sprint 4 issue is on the
[`Sprint 4` milestone](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/milestone/5) and has
the `sprint-4` label.

## Sprint goal

Finish and validate everything for the final evaluation, as the Sprint 4 handout asks:

1. **All core features finalized, integrated and tested** (handout Features 1–5). The only gap is the US-21
   analytics and history page (#135).
2. **Two Generative-AI features** (Feature 6): finish and validate US-10 AI resume feedback (#47), and build
   US-11 AI job matching (#54), which is one of the handout's listed options.
3. **One team-proposed unique feature, not AI** (US-23, #199). The team picks it on the call today; the TA must
   approve it before anyone builds it (#200).
4. **Quality and maintenance:** reorganized repository (#206), coding standards and lint in CI (#207), static
   analysis in CI with a findings report and fixes linked to it (#208–#210), and a review on every PR (#211).

Alongside: acceptance and unit tests for all Sprint 4 work, a green CI pipeline, minutes, contribution logs,
the AI usage log, a Sprint 4 PDF per member, the summary report and the final demo.

## Where we are (2026-11-25)

- **`main` is at `3e079fa`.** Backend 162/162 and frontend 151/151 (26 files) pass locally; both CI jobs passed
  on the last push to `main`.
- **Features 1–4 are done** (Sprints 1–3). **Feature 5:** notifications and reminders are merged (#158, #164);
  the analytics backend is merged (#179) but there is no analytics or history page yet (#135, not started).
- **US-10 works end to end:** backend (#165), UI (#193, #197), prompt and evaluation (#162, #181). Left:
  acceptance tests #147 (AT-3 and AT-4 automated in #194), the open items from the evaluation, and the
  validation write-up the handout now asks for (section 5.4).
- **US-11 does not exist yet.** The 2026-11-12 meeting picked job recommendation as the second AI feature; it is
  the handout's "AI job matching suggestions" option, so it needs no TA approval.
- **Quality:** no linter and no static analysis on `main`. Coverage already shows in both CI jobs (#187). The
  repository reorganization proposal is PR #166 (docs part pushed, waiting for a review).
- **Sprint 3 leftovers:** five process issues are still open (see
  [Carried over from Sprint 3](#carried-over-from-sprint-3)).

## How the backlog is prioritized

The Sprint 4 handout grades the sprint as follows. Priority follows the points at stake and what blocks them.

| Criterion (weight)                    | What earns it                                                           | Issues                                    |
| ------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| Features implementation (20)          | Features 1–6 on `main`; two AI features; US-23 approved and built       | #47, #54, #128, #135, #199–#205           |
| Contribution by team members (10)     | Every member owns feature or quality work with visible commits and PRs | See [Team capacity](#team-capacity)       |
| Acceptance/unit tests (10)            | ATs for every Sprint 4 story, verified on `main`; unit tests for all code | #144, #147, #212–#215                   |
| Continuous integration pipeline (10)  | Tests, lint and static analysis in CI, green on `main`; no real AI calls | #207, #208, #214                         |
| Repository organization (5)           | Code, tests, docs, minutes, AI logs, config and workflows separated     | #206                                      |
| Code review (10)                      | Every Sprint 4 PR reviewed by someone else, with written comments       | #211                                      |
| Coding standards (5)                  | Written standard plus a linter that enforces it                         | #207                                      |
| Meeting minutes (5)                   | All Sprint 4 minutes in the repo                                        | #218                                      |
| Static analysis and maintenance (10)  | Tool in CI, findings documented, fixes linked to the report             | #208, #209, #210                          |
| Detailed contribution/AI logs (5)     | One contribution log and one Sprint 4 AI-log PDF per member             | #217, #219                                |
| Project management (10)               | Board, backlog, plan and assignments kept current                       | #216                                      |

Not graded directly but required for the evaluation: the summary report (#220) and the demo (#221).

**Priority levels** (board field):

- **P0:** needed for the Sprint 4 evaluation on Mon 2026-11-30.
- **P1:** Sprint 3 carry-overs to close out.
- **P2:** Sprint 4 improvements, cut first if time runs out (#204).
- **P3:** backlog, not planned.

## Timeline

Five days from planning to the lab. Backend and frontend overlap: frontend tasks build against the API contract
in their backend issue and stub it until it merges.

| Date       | Milestone                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Wed Nov 25 | Plan, issues and board (#216); AI-log reminder (#217); team call picks the unique feature (#200)            |
| Thu Nov 26 | TA approval for US-23 (#200); US-11 schema agreed (#201); repository move merged (#206); lint in CI (#207); first static-analysis report (#208); US-11 ATs final (#212) |
| Fri Nov 27 | US-11 backend merged (#202); US-23 backend; US-23 ATs (#212); US-10 hardening if time allows (#204); contribution-log reminder (#219) |
| Sat Nov 28 | **Feature freeze:** US-11 page (#203), analytics page (#135), US-23 frontend; static-analysis fixes merged (#209, #210) |
| Sun Nov 29 | ATs verified on `main` plus a regression pass (#215); CI green (#214); final static-analysis report (#208); AI validation (#201, #205); logs, PDFs, summary report (#217, #219, #220); demo dry run (#221) |
| Mon Nov 30 | Lab evaluation                                                                                              |

The `Sprint 4` milestone shows as "due by November 29" in GitHub's UI (it stores midnight UTC on the 30th),
which matches the plan: everything is merged by the end of Sunday.

## Critical path

1. **US-23 needs TA approval before any code.** Pick it on today's call, send it to the TA in writing tonight,
   and confirm on Thursday at the latest (#200). Keep it to one backend and one frontend task.
2. **Repository move first** (#206, Thu). It moves `frontend/CareerConnect/` to `frontend/`, so every frontend
   branch rebases once. It has to land before the feature PRs open, not after.
3. **Lint before static-analysis fixes.** #207 sets the rules and fixes or disables existing violations; #208
   runs the analysis; #209 and #210 fix what's left, so nothing is fixed twice.
4. **US-11: schema → backend → page.** #201's schema (Thu) unblocks #202 and #203. CI must never call the real
   AI service (#214).
5. **Review every PR** (#211). No merge without an approving review from someone else.
6. **Verify on `main`, not on branches** (#215), then the demo (#221).

## Ranked backlog (work plan)

Open Sprint 4 issues in priority order, then by target date.

| Rank | Issue | Title | Type | Responsible | Start | Target | Priority | Status |
| :--: | :---: | ----- | ---- | ----------- | ----- | ------ | :------: | ------ |
| 1 | #200 | [Task] Requirements: Pick the unique non-AI feature, write it up and get TA approval (US-23) | Task | Zohair + Bryce | Wed Nov 25 | Thu Nov 26 | P0 | Todo |
| 2 | #206 | [Task] Repo: Reorganize the repository structure (#166) | Task | Gene + Bryce | Wed Nov 25 | Thu Nov 26 | P0 | Todo |
| 3 | #207 | [Task] Process: Coding standards + ESLint in CI | Task | Bryce | Wed Nov 25 | Thu Nov 26 | P0 | Todo |
| 4 | #212 | [Task] Requirements: Finalize Sprint 4 user stories, tasks and acceptance tests | Task | Zohair | Wed Nov 25 | Fri Nov 27 | P0 | Todo |
| 5 | #202 | [Task] Backend: AI job-matching service + endpoint (US-11) | Task | Mahmoud | Thu Nov 26 | Fri Nov 27 | P0 | Todo |
| 6 | #199 | US-23: Team-proposed unique feature (non-AI, to be picked 2026-11-25) | User Story | Zohair + Bryce | Wed Nov 25 | Sat Nov 28 | P0 | Todo |
| 7 | #54 | US-11: AI job-matchmaking suggestions | User Story | Bryce + Mahmoud + Gabriel | Wed Nov 25 | Sat Nov 28 | P0 | Todo |
| 8 | #128 | US-21: Application analytics and history dashboard | User Story | Bryce + Gene | Wed Nov 25 | Sat Nov 28 | P0 | Todo |
| 9 | #135 | [Task] Frontend: Application analytics + history dashboard (US-21) | Task | Gene | Wed Nov 25 | Sat Nov 28 | P0 | Todo |
| 10 | #203 | [Task] Frontend: "Recommended for you" job-matching page (US-11) | Task | Gabriel | Thu Nov 26 | Sat Nov 28 | P0 | Todo |
| 11 | #209 | [Task] Quality: Fix static-analysis findings — backend | Task | Mahmoud | Fri Nov 27 | Sat Nov 28 | P0 | Todo |
| 12 | #210 | [Task] Quality: Fix static-analysis findings — frontend | Task | Gabriel | Fri Nov 27 | Sat Nov 28 | P0 | Todo |
| 13 | #201 | [Task] AI: Prompt, response schema and evaluation set for job matching (US-11) | Task | Bryce | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 14 | #205 | [Task] AI: Final validation of AI resume feedback (US-10) | Task | Bryce | Thu Nov 26 | Sun Nov 29 | P0 | Todo |
| 15 | #47 | US-10 [AI-Generated]: AI-assisted resume feedback | User Story | Gabriel + Bryce + Mahmoud + Zohair | Wed Nov 25 | Sun Nov 29 | P0 | In Progress |
| 16 | #208 | [Task] DevOps: Static analysis in CI + analysis report | Task | Luca | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 17 | #213 | Acceptance tests: US-11 AI job-matching suggestions | Acceptance Test | Zohair + Luca | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 18 | #144 | Acceptance tests: US-21 Application analytics and history dashboard | Acceptance Test | Zohair + Luca | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 19 | #147 | Acceptance tests: US-10 AI resume feedback (Sprint 3 slice) | Acceptance Test | Zohair + Luca | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 20 | #214 | [Task] QA: Unit tests for all Sprint 4 code + CI upkeep | Task | Luca | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 21 | #215 | [Task] QA: Automate and verify Sprint 4 acceptance tests + regression of Features 1–5 | Task | Luca | Fri Nov 27 | Sun Nov 29 | P0 | Todo |
| 22 | #217 | [Task] AI Usage Log + Sprint 4 PDF reports (all members) | Task | Bryce | Wed Nov 25 | Sun Nov 29 | P0 | Todo |
| 23 | #219 | [Task] Detailed contribution log (Sprint 4) | Task | Gene | Fri Nov 27 | Sun Nov 29 | P0 | Todo |
| 24 | #220 | [Task] Sprint 4 summary report | Task | Gene | Sat Nov 28 | Sun Nov 29 | P0 | Todo |
| 25 | #221 | [Task] Sprint 4 final demo preparation | Task | Luca | Sat Nov 28 | Sun Nov 29 | P0 | Todo |
| 26 | #211 | [Task] Process: Code review on every Sprint 4 PR | Task | Bryce | Wed Nov 25 | Mon Nov 30 | P0 | Todo |
| 27 | #216 | [Task] Sprint 4 planning + work plan + board | Task | Bryce | Wed Nov 25 | Mon Nov 30 | P0 | In Progress |
| 28 | #218 | [Task] Meeting minutes for Sprint 4 | Task | Gene | Wed Nov 25 | Mon Nov 30 | P0 | Todo |
| 29 | #204 | [Task] Backend: Harden AI resume feedback — injected text and PDF columns (US-10) | Task | Mahmoud | Thu Nov 26 | Fri Nov 27 | P2 | Todo |

The US-23 backend, frontend and acceptance-test issues are added after the TA approves the feature (#200).

Every task and AT issue is linked as a sub-issue of its story:

| Story | Sub-issues |
| ----- | ---------- |
| #54 US-11 | #201, #202, #203, #213 |
| #47 US-10 | #139, #140, #141 (closed in Sprint 3), #147, #204, #205 |
| #128 US-21 | #134 (closed in Sprint 3), #135, #144 |
| #199 US-23 | #200, then the tasks created after approval |

### Carried over from Sprint 3

- **Moved to Sprint 4** (milestone and `sprint-4` label; the `sprint-3` label stays): #47 and #147 (US-10 was
  always planned to finish in Sprint 4), #128, #135 and #144 (the analytics page is part of Feature 5).
- **Still on the Sprint 3 milestone:** #149 (AI-log PDFs), #151 (contribution logs), #154 (unit tests + CI),
  #155 (AT verification) and #156 (demo). They were Sprint 3 deliverables. They are on the board with
  Sprint = "Sprint 3" and Priority P1, to be closed out as part of #216.
- **Backlog:** #40 and #55–#62 are on the board with Sprint = "Backlog" and Priority P3. US-11 (#54) moved out of
  the backlog into Sprint 4.

## Unique feature shortlist

For the team call on Wed 2026-11-25. The handout requires TA approval before a team-proposed feature is built,
and the sprint leaves Friday and Saturday to build it. What makes a candidate fit:

- **Not AI**, and different from Features 1–6 in the handout.
- **Small:** one backend task and one frontend task, no new external service.
- **Reuses what's on `main`:** applications, status history, notifications, postings.
- **Easy to demo** in a minute and to cover with two or three acceptance tests.

| Candidate | What it is | Builds on | Size | Notes |
| --------- | ---------- | --------- | :--: | ----- |
| US-18 Application goal and streak tracker (#61) | Job seeker sets a weekly application goal; progress bar and streak | Applications, analytics stats (#134) | S–M | Fits next to the analytics page (#135) |
| US-14 Skill trend tracker (#57) | Most-requested skills, counted from open postings with a fixed keyword list | Postings | M | Non-AI by design (keyword counts); no seed data needed beyond postings |
| US-17 Company profile card (#60) | Recruiter adds company name, logo URL, website and "About us"; shown on postings | Profiles, postings | M | Schema change on profiles |
| US-13 Offer comparison (#56) | Compare base pay, bonus and equity for two or more offers | Nothing (stand-alone) | S | Mostly frontend; weak link to the rest of the app |
| US-04 Save and favourite postings (#40) | Bookmark postings and list them | Postings | S | Common in job sites, so less "unique" |
| New: follow-up notes and reminders | Private notes on an application plus a follow-up date that creates a reminder | Applications, notifications, reminders (#137) | S–M | Reuses the reminder job from Sprint 3 |

US-15 (message templates, #58) and US-19 (interview hours, #62) depend on messaging or interview scheduling,
which the app doesn't have, so they need more than two days.

## Team capacity

Six members, one meeting a week plus Discord, over a five-day window. Sprint 4 is graded individually, so every
member owns at least one feature or quality task with its tests, on top of their role.

| Member  | Role                 | Feature work                                              | Quality work                                     | Role work                                                    |
| ------- | -------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Bryce   | Scrum lead / process | US-11 prompt, schema, evaluation (#201); US-10 validation (#205) | Coding standards + lint (#207); repo move with Gene (#206) | Plan + board (#216), AI logs + PDFs (#217), code review (#211), US-23 approval with Zohair (#200) |
| Mahmoud | Backend              | US-11 backend (#202); US-10 hardening (#204, P2)          | Backend static-analysis fixes (#209)             | Backend reviews                                              |
| Gabriel | Frontend / UI        | US-11 page (#203)                                         | Frontend static-analysis fixes (#210)            | Frontend reviews, UI consistency                             |
| Luca    | Integration & QA     | —                                                         | Static analysis in CI (#208), unit tests + CI (#214) | AT verification + regression (#215), demo (#221)         |
| Gene    | Documentation        | Analytics and history page (#135)                         | Repository move (#206)                           | Minutes (#218), contribution logs (#219), summary report (#220) |
| Zohair  | Requirements         | US-23 (after approval)                                    | —                                                | Pick + TA approval (#200), finalize ATs (#212), ATs with Luca (#213, #144, #147) |

US-23 owners are set on the call. Zohair has the most room for feature work; the frontend half can go to
whoever finishes first (Gene after #135, or Gabriel after #203).

## Effort estimation

T-shirt sizing (S ≈ ≤ 2 h, M ≈ half a day, L ≈ a full day or more):

| Item                                                                  | Size |
| --------------------------------------------------------------------- | :--: |
| #200 Pick US-23, write it up, TA approval                             |  S   |
| US-23 backend + frontend (after approval)                             | M–L  |
| #201 US-11 prompt, schema, evaluation, validation doc                 |  M   |
| #202 US-11 backend service + endpoint                                 |  L   |
| #203 US-11 page                                                       |  M   |
| #204 US-10 injected text + PDF columns                                |  M   |
| #205 US-10 final validation                                           |  M   |
| #135 Analytics and history page                                       |  L   |
| #206 Repository move                                                  |  L   |
| #207 Coding standards + ESLint in CI                                  |  M   |
| #208 Static analysis in CI + report                                   |  M   |
| #209, #210 Static-analysis fixes                                      |  M   |
| #212, #213 Finalize stories and ATs                                   |  S   |
| #214, #215 Unit tests, AT verification, regression                    |  M   |
| #211, #216–#221 Reviews, plan, logs, minutes, report, demo            |  M   |

## Risks and mitigations

| Risk                                                                  | Impact                                     | Mitigation                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Five-day sprint                                                       | Features unfinished at the lab             | Feature freeze Sat Nov 28; P2 (#204) is cut first; frontend builds against the contract              |
| TA approval for US-23 arrives late                                    | Feature can't be built in time             | Send it in writing tonight; pick a small feature; confirm by Thu Nov 26                             |
| Repository move conflicts with open branches                          | Lost work, broken CI                       | Merge it first (Thu); one `git mv` PR; announce it; everyone rebases once                           |
| Static analysis reports many findings                                 | Fixes break features, or run out of time   | Bugs and vulnerabilities first; "won't fix" with a reason is allowed; tests run on every fix         |
| AI provider rate limit (free Groq plan, about 2 requests a minute for the team) | Demo or evaluation runs fail      | Mock provider as fallback; saved results shown without new calls; plan the demo order (#205, #221)  |
| US-11 recommends postings that don't exist                            | Wrong output at the demo                   | `jobId` checked in code against the postings sent (#201, #202)                                      |
| Resume text sent to an external AI service                            | Privacy question at the evaluation         | Notice before every request; contact details removed; same approach as US-10                        |
| Reviews become rubber stamps                                          | Code Review points lost                    | Reviewer checklist in the PR template; written comments required (#211)                             |
| Logs, PDFs and the report left to Sunday                              | Up to 10 points                            | Reminders on Wed Nov 25 and Fri Nov 27; per-member checklists in #217 and #219                      |
| Admins can bypass branch protection                                   | PRs merged without review                  | Every PR gets one approval before merge, including the Scrum lead's                                 |

## Definition of Ready / Done

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the DoR and DoD the team works to. #207 adds "lint passes" and #211
adds the reviewer checklist. Each Sprint 4 task issue lists its own Definition of Done (unit tests, CI green,
reviewed PR).
