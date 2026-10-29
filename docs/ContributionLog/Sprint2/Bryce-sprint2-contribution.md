# Contribution Log — Sprint 2 — Bryce Orchard (@bryceorchard)

## Task Summary

Scrum lead for Sprint 2. Audited Sprint 1 and broke the Sprint 2 stories into task and acceptance-test issues. Set up the process: branch protection, the Sprint 2 board, priorities and the sprint plan. Reviewed and merged the team's PRs, and finished the open review items on the frontend PR (#112), including my own task (#81).

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| Sprint 1 gap audit | #97 | 1.00 | 2026-10-20 | [Jump to Task](#task-1---sprint-1-gap-audit) |
| Create Sprint 2 issues | #72–#105 | 3.00 | 2026-10-20 | [Jump to Task](#task-2---create-sprint-2-issues) |
| Branch protection and cleanup | #97 | 1.50 | 2026-10-21 | [Jump to Task](#task-3---branch-protection-and-cleanup) |
| Review backend PRs | #76, #78, #82, #84, #86 | 1.50 | 2026-10-21 | [Jump to Task](#task-4---review-backend-prs) |
| Review frontend PR #112 | #73–#87 | 2.50 | 2026-10-22 | [Jump to Task](#task-5---review-frontend-pr-112) |
| Issue audit and prioritization | #98 | 2.00 | 2026-10-28 | [Jump to Task](#task-6---issue-audit-and-prioritization) |
| Review and merge PRs | #96, #100, #101 | 0.75 | 2026-10-28 | [Jump to Task](#task-7---review-and-merge-prs) |
| Sprint 2 board and plan | #98 | 2.00 | 2026-10-29 | [Jump to Task](#task-8---sprint-2-board-and-plan) |
| AI log fixes | #99 | 1.25 | 2026-10-29 | [Jump to Task](#task-9---ai-log-fixes) |
| Finish PR #112 follow-ups | #73–#87 | 4.00 | 2026-10-29 | [Jump to Task](#task-10---finish-pr-112-follow-ups) |
| Update CI actions | #111 | 0.75 | 2026-10-29 | [Jump to Task](#task-11---update-ci-actions) |

## Task #1 - Sprint 1 gap audit
**Associated Links:** [#97](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/97), [AI log](../../../AI-log/Bryce/2026-10-20-sprint1-audit-sprint2-issues.md)

Compared the repository and the Sprint 1 issues against the Sprint 1 requirements to find what was missing or unfinished. The findings became the Sprint 1 cleanup task (#97) and shaped the scope of the Sprint 2 issues.

## Task #2 - Create Sprint 2 issues
**Associated Links:** [#72](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/72), [#73](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/73), [#88](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/88), [#96](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/96), [#105](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/105), [AI log](../../../AI-log/Bryce/2026-10-20-sprint1-audit-sprint2-issues.md)

Broke the Sprint 2 user stories (US-01, 02, 03, 05, 06, 08, 09 and the new US-20, #72) into 15 backend and frontend task issues (#73–#87), linked as sub-issues of their stories. Added 8 acceptance-test issues (#88–#95) and the process tasks for CI, planning, AI logs, meeting minutes, contribution logs, the summary report, QA, requirements and the demo (#96–#105). Assigned them across the team, spreading frontend work to everyone rather than strictly by role.

## Task #3 - Branch protection and cleanup
**Associated Links:** [#97](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/97), [PR #53](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/53), [PR #118](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/118), [`942c906`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/118/commits/942c906d35add1af4b3ee49a6f542bed2413c451)

Protected `main`: a pull request, one approving review and passing CI are required to merge. Closed the stale PR #53 (its commit had already landed through #65), deleted merged remote branches, and updated the Sprint 1 checklists (#31, #33). PR #118 fixed the README setup steps (`npm start`, the frontend Node version, the `docs/` layout) and untracked personal editor files.

## Task #4 - Review backend PRs
**Associated Links:** [PR #106](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/106), [PR #107](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/107), [PR #108](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/108), [PR #109](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/109), [PR #110](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/110)

Reviewed, approved and merged Mahmoud's five Sprint 2 backend PRs: resume view/download (#106), job categories and demo seed data (#107), application tracking with job details (#108), recruiter posting management (#109) and applications received for a posting (#110). Left follow-up notes on #108 (add the job's status to each application) and #109.

## Task #5 - Review frontend PR #112
**Associated Links:** [PR #112](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112), [Review comment](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112#issuecomment-6403892880), [AI log](../../../AI-log/Bryce/2026-10-22-review-pr112-frontend-revamp.md), [AI log](../../../AI-log/Bryce/2026-10-25-pr112-followup-assignments.md)

Reviewed PR #112 (+1,781/−163 across 30 files: app shell, guards, job search and details, apply, the applications dashboard, the applicants page, the profile and a visual redesign). Posted a review comment that routed each follow-up to the owner of the original task, with to-dos, unit tests and the acceptance tests to check, so the work stayed spread across the team.

## Task #6 - Issue audit and prioritization
**Associated Links:** [#98](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/98), [AI log](../../../AI-log/Bryce/2026-10-28-issue-audit-backlog-priority.md), [AI log](../../../AI-log/Bryce/2026-10-29-p0-sync.md), [AI log](../../../AI-log/Bryce/2026-10-29-pr112-links-and-notes.md)

Checked every open issue against the code and ticked or annotated its checklist (work only in an open PR was marked with that PR). Prioritized the backlog P0–P3 from the Sprint 2 guidelines. Later synced every P0 issue and PR: linked each issue to #112 only once #112 fully finished it, and added a "Progress in #112" note crediting each contributor's commits.

## Task #7 - Review and merge PRs
**Associated Links:** [PR #113](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/113), [PR #114](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/114), [PR #115](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/115), [PR #117](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/117), [PR #121](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/121)

Reviewed and merged the team's Sprint 2 PRs: Mahmoud's AI log (#113), the README and meeting minutes (#114, for #100), Zohair's AI log (#115), the frontend CI job (#117, for #96) and the contribution logs (#121, for #101).

## Task #8 - Sprint 2 board and plan
**Associated Links:** [#98](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/98), [Sprint 2 board](https://github.com/users/bryceorchard/projects/4), [PR #120](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/120), [`sprint-2-plan.md`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/blob/main/docs/sprint-2/sprint-2-plan.md), [AI log](../../../AI-log/Bryce/2026-10-29-sprint2-project-board.md)

Created the Sprint 2 project board with Status, Priority and Sprint fields and a "Prioritized backlog" view, moved the Sprint 2 and backlog issues onto it, and trimmed the Sprint 1 board to Sprint 1 work. Set the Sprint 2 milestone due date. Wrote the Sprint 2 plan (sprint goal, backlog, priorities, risks, effort estimates, team capacity and the work-plan table), merged in #120.

## Task #9 - AI log fixes
**Associated Links:** [#99](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/99), [PR #119](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/119), [`6066335`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/119/commits/6066335acff02082b13ee1c81fc4e3adffdce21b)

PR #119 restored Luca's Sprint 1 AI logs (deleted from `main` in `0edee83`), exported the missing PDFs for Gene, Mahmoud and Luca, and created `AI-log/Gabriel/`. Logged my own AI interactions throughout the sprint in `AI-log/Bryce/`.

## Task #10 - Finish PR #112 follow-ups
**Associated Links:** [`ea78132`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/ea78132b4ddef2440b6b7d82fbf93566983e9556), [`1c712df`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/1c712dfd40f0cb59e03e1d191c8deaebfc01c31a), [`beaffb6`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/beaffb673b1fa9e09c02cb135a46cf4cb848f0ee), [`34baf5e`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/34baf5ed68933f59544b5518e59ae9b0661e0d15), [`3129d87`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/3129d87efc85497a9911b61c04a91a1c37a23ec7), [`22c2abb`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/22c2abb523396248096c0300ae48a07d4bb19ef2), [`591b830`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/591b83010affee6d95639f3d042fd0055609250a), [`0c18bf1`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/112/commits/0c18bf1f2052cf55fbcd333e4dd966163cb38a3a), [AI log](../../../AI-log/Bryce/2026-10-29-pr112-gabriel-followups.md), [AI log](../../../AI-log/Bryce/2026-10-29-pr112-all-review-items.md)

Implemented every review item still open on #112 so its tasks could close on merge, including my own task, the apply confirmation (#81):

- Nav highlights the current page; tests for the nav and for filters round-tripping through the URL (#73, #79)
- Login/register tests for the 401, 409 and 400 responses and the form validation (#74)
- Profile fields limited to 2000 characters; tests for loading and saving the profile (#75)
- Apply confirmation with the job title, date, status and a link to My applications; tests for the 201 and 409 paths (#81)
- Closed postings show a banner and hide the Apply form; "not found" is told apart from other load errors (#80, #81)
- My applications: "Posting closed" badge, a count for each status, and an error state (#83)
- Applicants page shows the posting's details and each applicant's resume filename (#87)
- Empty job search uses the acceptance-test wording (#79)

Ran the acceptance tests end to end against the running app (#88, #90–#93, #95). All 63 frontend unit tests pass. Merged #112 into `main`.

## Task #11 - Update CI actions
**Associated Links:** [#111](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/111), [PR #122](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/122), [`67e4d21`](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/pull/122/commits/67e4d214ea17beea8e4ef9cf24c68d4c3376b29b)

PR #122 moved `actions/checkout` and `actions/setup-node` to v7 (Node 24 runtime, which clears the Node 20 deprecation warning) and pinned the runner to `ubuntu-24.04`, so GitHub's move of `ubuntu-latest` can't change the build without notice. Built on Luca's frontend CI job (#117).
