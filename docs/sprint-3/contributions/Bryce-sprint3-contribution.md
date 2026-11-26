# Contribution Log — Sprint 3 — Bryce Orchard (@bryceorchard)

## Task Summary

Scrum lead for Sprint 3. Planned the sprint and created its issues, milestone and board. Built the US-21 backend (application analytics and status history, #134) and the US-10 prompt, response schema and evaluation set, then ran the evaluation on a real model (#141). Reviewed and merged the team's PRs, and pushed the fixes needed to merge #158, #164 and #165. On evaluation day, audited what was left, closed out finished issues and milestones, added test coverage to CI (#154), and got the plan, README and missing AI logs onto `main`.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| Sprint 3 plan, issues, board | #148 | 4.00 | 2026-11-05 | [Jump to Task](#task-1---sprint-3-plan-issues-board) |
| Review and fix PRs #157, #158 | #130, #136 | 2.00 | 2026-11-09 | [Jump to Task](#task-2---review-and-fix-prs-157-158) |
| US-10 prompt, schema, eval set | #141 | 4.00 | 2026-11-11 | [Jump to Task](#task-3---us-10-prompt-schema-eval-set) |
| Review and fix PR #164 | #137, #138 | 2.50 | 2026-11-16 | [Jump to Task](#task-4---review-and-fix-pr-164) |
| Review and fix PR #165 | #139 | 2.00 | 2026-11-16 | [Jump to Task](#task-5---review-and-fix-pr-165) |
| US-10 evaluation run | #141 | 3.50 | 2026-11-16 | [Jump to Task](#task-6---us-10-evaluation-run) |
| Application analytics backend | #134 | 3.00 | 2026-11-16 | [Jump to Task](#task-7---application-analytics-backend) |
| Review and merge team PRs | #88–#95, #142, #145, #146, #149, #150 | 2.00 | 2026-11-12 | [Jump to Task](#task-8---review-and-merge-team-prs) |
| Sprint 3 close-out | #148–#152 | 1.50 | 2026-11-16 | [Jump to Task](#task-9---sprint-3-close-out) |
| CI test coverage | #154 | 1.00 | 2026-11-16 | [Jump to Task](#task-10---ci-test-coverage) |
| AI logs | #149 | 0.75 | 2026-11-12 | [Jump to Task](#task-11---ai-logs) |

## Task #1 - Sprint 3 plan, issues, board
**Associated Links:** [#148](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/148), [Sprint 3 board](https://github.com/users/bryceorchard/projects/8), [Sprint 3 milestone](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/milestone/4), [PR #185](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/185), [`plan.md`](../plan.md), [AI log](../ai-log/Bryce/md/2026-11-05-sprint3-plan-issues-board.md), [AI log](../ai-log/Bryce/md/2026-11-05-sprint2-issues-on-sprint3-board.md)

Created the `Sprint 3` milestone and `sprint-3` label, and 29 issues (#128–#156):

- 2 new stories: US-21 analytics and history dashboard (#128), US-22 recruiter notifications (#129)
- 12 feature tasks (#130–#141), each with a target date, dependencies and a Definition of Done that requires unit tests in CI
- 6 acceptance-test issues (#142–#147), one per Sprint 3 story, drafted for Zohair to finalize in #153
- 9 process tasks (#148–#156): plan and board, AI logs, minutes, contribution logs, summary report, AT finalization, unit tests and CI, AT verification, demo

Widened US-07 (#44) and added Sprint 3 criteria to US-08 (#45) and US-09 (#46). Split the work so every member owns feature tasks. Created the Sprint 3 project with Start and Target fields and a Timeline view, and moved the 18 open Sprint 2 issues and the backlog stories onto it. Wrote the Sprint 3 plan (goal, grading-weighted priorities, timeline, critical path, ranked work plan, capacity, risks), merged in #185.

## Task #2 - Review and fix PRs #157, #158
**Associated Links:** [PR #157](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/157), [PR #158](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/158), [`ec2465f`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/ec2465f), [`04c92c9`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/04c92c9), [`ec7494b`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/ec7494b), [`4373e18`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/4373e18), [AI log](../ai-log/Bryce/md/2026-11-09-pr157-pr158-review.md), [AI log](../ai-log/Bryce/md/2026-11-09-merge-pr157-pr158.md)

Reviewed Mahmoud's two Sprint 3 backend PRs: posting archive and recruiter dashboard summary (#157, for #130) and notifications (#158, for #136). Found that the two PRs conflict in `routes/applications.js`, and that #158 sent a notification when a status was re-saved unchanged and returned same-second notifications oldest first. On #158's branch:

- `ec2465f` merged `main` in and resolved the conflict
- `04c92c9` only notifies when the status actually changes
- `ec7494b` orders by `created_at DESC, id DESC`
- `4373e18` tests newest-first order and same-status updates (fails on the old code)

Approved and merged both. `main` after the merge: 36/36 backend tests, CI green.

## Task #3 - US-10 prompt, schema, eval set
**Associated Links:** [#141](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/141), [US-10 #47](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/47), [PR #162](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/162), [`ec95388`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/ec95388), [`us10-resume-feedback.md`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/blob/main/docs/ai/us10-resume-feedback.md), [AI log](../ai-log/Bryce/md/2026-11-11-issue-141-us10-prompt-schema-eval.md)

Wrote the contract that the AI backend (#139) and UI (#140) build against. PR #162 (+1,794/−1, 19 files):

- Response schema, validator and `parseFeedback()` (`src/ai/feedback-schema.js`)
- Prompt `resume-feedback-v1`: quotes the resume instead of inventing, ignores name, gender and age, strips email, phone and postal code before sending, and flags instructions hidden in a resume instead of following them
- Automatic output checks (`src/ai/checks.js`)
- Six synthetic resumes (strong, weak, sparse, badly formatted, prompt injection, name-swap bias pair) and a sample reply for the mock provider
- `npm run ai:eval`, which runs the set through a provider and writes a review sheet; never runs in CI
- Design doc: API contract and error codes, provider recommendation, evaluation method, limitations, privacy notice text

55 backend tests (17 new), no network calls.

## Task #4 - Review and fix PR #164
**Associated Links:** [PR #164](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/164), [#137](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/137), [#138](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/138), [`5611242`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/5611242), [`2d206a7`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/2d206a7), [`cc32732`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/cc32732), [`8e0f7fc`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/8e0f7fc), [`a3a99a3`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/a3a99a3), [`901515c`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/901515c), [AI log](../ai-log/Bryce/md/2026-11-16-pr164-review.md)

Reviewed Zohair's deadline reminders and notification centre. The frontend CI job was red (the bell's polling made real HTTP calls in `logout.spec.ts`), the tests and seed data the DoD required were missing, and three date bugs were reproduced under `TZ=America/Toronto`: notification times 5 h off, no reminder on the deadline day itself, and unparseable deadlines treated as inside the window. Pushed to the PR branch:

- `5611242` deadlines read as local calendar dates, bad deadlines skipped, window configurable as `DEADLINE_REMINDER_DAYS`
- `2d206a7` backend reminder tests with a fixed "now", passing in four time zones
- `cc32732` seed posting that always closes two days after seeding
- `8e0f7fc` timestamps read as UTC, error handlers on every poll, HTTP mocked in `logout.spec.ts`
- `a3a99a3` notification service and page tests
- `901515c` README docs for the reminder rule

Result: backend 65/65, frontend 86/86, CI green. Approved and merged.

## Task #5 - Review and fix PR #165
**Associated Links:** [PR #165](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/165), [#139](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/139), [`878c718`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/878c718), [AI log](../ai-log/Bryce/md/2026-11-16-pr165-review.md)

Reviewed Mahmoud's AI resume feedback service and endpoint. Reproduced a bug: after `PUT /resumes/:id` replaced the file, `GET /resumes/:id/feedback` still returned feedback for the old file. With no API key, the provider also silently fell back to the mock and stored canned feedback for every user. `878c718` on the PR branch:

- Clears a resume's feedback when the file is replaced
- Uses the mock only with `AI_PROVIDER=mock`; otherwise no key returns 503
- Moves the mock reply into `src/ai/` so `src/` no longer reads from `test/`
- Non-JSON provider replies return 502, a missing stored file returns 404
- New `test/ai-provider.test.js` stubs `fetch` to cover the real call path

Merged `main` in to resolve the README conflict. Backend 96/96 tests. Approved and merged; closed #139.

## Task #6 - US-10 evaluation run
**Associated Links:** [#141](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/141), [PR #181](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/181), [`c0a6605`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/c0a6605), [AI log](../ai-log/Bryce/md/2026-11-16-issue-141-eval-run.md), review sheets [v1](../ai-log/Bryce/md/2026-11-16-us10-eval-gpt-oss-120b-v1.md), [v2](../ai-log/Bryce/md/2026-11-16-us10-eval-gpt-oss-120b-v2.md), [v3 low](../ai-log/Bryce/md/2026-11-16-us10-eval-gpt-oss-120b-v3-low.md), [v3 medium](../ai-log/Bryce/md/2026-11-16-us10-eval-gpt-oss-120b-v3-medium.md)

Ran the evaluation set on Groq `openai/gpt-oss-120b`: four runs (prompt v1, v2, v3 at low and medium reasoning), 6 fixtures × 2 each, 48 outputs reviewed by hand. Revised the prompt twice from the findings:

- v2 fixed the bias-pair failure (v1 told the name-swap resume to remove "(she/her)") and cut invented figures
- v3 restored flagging of injected text and changed the redaction markers

Recorded the configuration: prompt v3, `reasoning_effort: "low"`, `max_completion_tokens: 5000` (48/48 schema-valid; medium was no better and 2–3× slower). Added those two fields to `provider.js` (without them, 2 of 3 requests failed with HTTP 400). The eval runner now retries on 429. Closed #141 with PR #181 (+4,640/−64, 13 files); 143 backend tests, no network.

## Task #7 - Application analytics backend
**Associated Links:** [#134](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/134), [US-21 #128](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/128), [PR #179](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/179), [`a8c1701`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/a8c1701), [AI log](../ai-log/Bryce/md/2026-11-16-issue-134-application-analytics.md)

Backend for US-21. PR #179 (+499/−48, 9 files):

- `application_status_history` table, written on apply and on every real status change
- `recordStatus()` / `changeStatus()`: the one status-change path, now also sending the #136 notification, so history and notifications can't drift apart; apply and PATCH run in a transaction
- Migration backfills one history row per existing application (idempotent)
- `GET /applications/stats`: counts and percent per status, last 7/30 days, response rate, 8 weeks of applications per week, open vs closed postings
- `GET /applications/:id/history`: applicant or owning recruiter only, 404 otherwise
- Seed data spread over ~6 weeks so the dashboard (#135) has something to show
- `backend/README.md` and `docs/ERD.md` updated

150/150 backend tests (137 existing + 13 new in `application-analytics.test.js`). Closed #134.

## Task #8 - Review and merge team PRs
**Associated Links:** [PR #159](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/159), [PR #160](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/160), [PR #161](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/161), [PR #166](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/166), [PR #168](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/168), [PR #169](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/169), [PR #170](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/170), [PR #171](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/171), [PR #173](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/173), [PR #174](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/174), [PR #175](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/175), [PR #176](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/176), [PR #177](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/177), [PR #178](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/178), [PR #180](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/180), [PR #182](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/182), [PR #188](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/188)

- **#161 (Luca, US-01 ATs):** requested changes because the PR rewrote two spec files and deleted 11 existing tests; approved and merged once they were restored.
- **#166 (Gene, refactor proposal):** requested changes: drop the `src/` wrapper, keep `backend/src` and `AI-log/` where they are, pick Node 24 for both jobs, keep `package-lock.json` tracked, cover CI and the PR template, do the move as one `git mv` PR after #165.
- **Approved and merged:** Luca's acceptance-test PRs for US-02, 03, 05, 06, 08, 09, 20, 07, 22 and US-08 Sprint 3 (#168–#171, #173–#176, #178, #180), Luca's US-09 date filter and candidate review (#177), Mahmoud's AI log (#182), and Gene's minutes (#159, #188). Merged Gabriel's recruiter dashboard (#160).
- Updated branches with `main` where branch protection required it (#160, #161, #166, #170, #171, #182). Noted on #95 and #103 that #175 closed them.

## Task #9 - Sprint 3 close-out
**Associated Links:** [PR #184](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/184), [PR #185](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/185), [PR #186](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/186), [AI log](../ai-log/Bryce/md/2026-11-16-sprint3-remaining-work.md)

On evaluation day, went through the whole repo (issues, PRs, branches, CI, tests, docs) and produced an ordered list of what was left. Then:

- Ticked the verified boxes in #47, #128, #139, #149 and #154; closed #139 and Sprint 2's #42; closed the Sprint 1, Sprint 1 planning and Sprint 2 milestones (0 open issues each)
- PR #184: README features and file tree for Sprint 3; renamed `2026_11_05_Meeting_Minutes copy.md` (#150)
- PR #185: the Sprint 3 plan, which had been written on 2026-11-05 but never had a PR
- PR #186: opened a PR for Gene's AI-log PDFs so they reach `main` (#149)

## Task #10 - CI test coverage
**Associated Links:** [#154](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/154), [PR #187](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/187), [`209616e`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/209616e)

Both CI jobs now print a coverage report. Backend: new `npm run test:coverage` using Node's built-in coverage. Frontend: `@vitest/coverage-v8` and `ng test --coverage`. No thresholds, and the job names are unchanged, so the required checks on `main` still match. At merge: backend 159 tests, 98.40% lines; frontend 133 tests, 95.55% lines.

## Task #11 - AI logs
**Associated Links:** [#149](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/149), [PR #163](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/163), [PR #172](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/172), [PR #183](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/183), [AI log](../ai-log/Bryce/md/2026-11-16-project-instructions-update.md)

Logged each AI interaction of the sprint in `AI-log/Bryce/md/`. PR #163 moved the 19 Sprint 2 logs into `md/` (renames only, contribution-log links updated) and added the missing Sprint 3 logs. PRs #172 and #183 added the logs for updating the team's Claude project instructions and for the remaining-work review.
