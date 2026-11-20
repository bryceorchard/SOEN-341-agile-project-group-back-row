# Contribution Log — Sprint 3 — Luca Mancini (@lucamancini2005-design)

## Task Summary

Integration & QA for Sprint 3:

- Automated the Sprint 2 acceptance tests carried over from #103 (#88–#95) and the Sprint 3 acceptance tests (#155: #142, #143, #145, #146).
- Built the US-09 date filter and candidate review panel (#132 backend, #133 frontend).

Every acceptance test file is new (no team test was changed or removed), and each test is named after its AT so it can be cited in the issue.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| US-01 acceptance tests | #88, #103 | 2.00 | 2026-11-12 | [Jump to Task](#task-1---us-01-acceptance-tests) |
| US-02 tests + filename fix | #89, #103 | 1.50 | 2026-11-16 | [Jump to Task](#task-2---us-02-tests--filename-fix) |
| US-03 acceptance tests | #90, #103 | 0.75 | 2026-11-16 | [Jump to Task](#task-3---us-03-acceptance-tests) |
| US-20 acceptance tests | #91, #103 | 0.75 | 2026-11-16 | [Jump to Task](#task-4---us-20-acceptance-tests) |
| US-05 acceptance tests | #92, #103 | 0.75 | 2026-11-16 | [Jump to Task](#task-5---us-05-acceptance-tests) |
| US-06 acceptance tests | #93, #103 | 0.50 | 2026-11-16 | [Jump to Task](#task-6---us-06-acceptance-tests) |
| US-08 acceptance tests | #94, #103 | 0.75 | 2026-11-16 | [Jump to Task](#task-7---us-08-acceptance-tests) |
| US-09 acceptance tests | #95, #103 | 0.75 | 2026-11-16 | [Jump to Task](#task-8---us-09-acceptance-tests) |
| US-08 Sprint 3 tests | #142, #155 | 1.00 | 2026-11-16 | [Jump to Task](#task-9---us-08-sprint-3-tests) |
| Date filter and review panel | #132, #133, #143 | 4.00 | 2026-11-16 | [Jump to Task](#task-10---date-filter-and-review-panel) |
| US-07 acceptance tests | #145, #155 | 1.00 | 2026-11-16 | [Jump to Task](#task-11---us-07-acceptance-tests) |
| US-22 acceptance tests | #146, #155 | 1.00 | 2026-11-16 | [Jump to Task](#task-12---us-22-acceptance-tests) |

## Task #1 - US-01 acceptance tests
**Associated Links:** [#88](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/88), [AI log](../../../AI-log/Luca/2026-11-12-us01-acceptance-tests.md)

`us01-acceptance.spec.ts` (6 tests) and `logout.spec.ts` (2 tests) cover:

- AT-3: registering as each role
- AT-4: an invalid email or a short password is rejected
- AT-5: the profile is saved and kept after a reload
- AT-6: logout

After review, I restored the two team spec files my first version had replaced and moved my tests into their own file, so the test count only goes up.

## Task #2 - US-02 tests + filename fix
**Associated Links:** [#89](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/89), [AI log](../../../AI-log/Luca/2026-11-16-us02-acceptance-tests.md)

Fixed AT-4: a PDF now opens in a tab titled with its original filename and has a Download link, and Word files download under their original name (`open-blob.ts`). Added `us02-acceptance.spec.ts` (7) and `us02-acceptance.test.js` (5) for AT-3 to AT-6.

## Task #3 - US-03 acceptance tests
**Associated Links:** [#90](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/90), [AI log](../../../AI-log/Luca/2026-11-16-us03-acceptance-tests.md)

`us03-acceptance.spec.ts` (3) and `us03-acceptance.test.js` (3):

- AT-1: postings listed newest first
- AT-2: the combined filters survive a reload
- AT-3: the "No jobs match your search." message

## Task #4 - US-20 acceptance tests
**Associated Links:** [#91](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/91), [AI log](../../../AI-log/Luca/2026-11-16-us20-acceptance-tests.md)

`us20-acceptance.spec.ts` (5) and `us20-acceptance.test.js` (3):

- AT-1: job details, and the back link keeps the search
- AT-2: 404 for a missing job
- AT-3: who sees the apply form

Flagged in the PR: the link text doesn't match the AT wording, and POST /applications has no job-seeker role check.

## Task #5 - US-05 acceptance tests
**Associated Links:** [#92](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/92), [AI log](../../../AI-log/Luca/2026-11-16-us05-acceptance-tests.md)

`us05-acceptance.spec.ts` (3) and `us05-acceptance.test.js` (3):

- AT-1: confirmation after applying
- AT-2: no duplicate applications
- AT-3: a logged-out user is sent to login
- AT-4: a removed job is blocked

## Task #6 - US-06 acceptance tests
**Associated Links:** [#93](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/93), [AI log](../../../AI-log/Luca/2026-11-16-us06-acceptance-tests.md)

`us06-acceptance.spec.ts` (1) and `us06-acceptance.test.js` (1) cover AT-2: when a recruiter changes the status to Interview, the job seeker sees it on their dashboard.

## Task #7 - US-08 acceptance tests
**Associated Links:** [#94](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/94), [AI log](../../../AI-log/Luca/2026-11-16-us08-acceptance-tests.md)

`us08-acceptance.spec.ts` (3) and `us08-acceptance.test.js` (4):

- AT-1: creating a posting
- AT-2: the recruiter-only role check
- AT-3: editing and closing a posting
- AT-4: other recruiters can't change someone else's posting

## Task #8 - US-09 acceptance tests
**Associated Links:** [#95](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/95), [AI log](../../../AI-log/Luca/2026-11-16-us09-acceptance-tests.md)

`us09-acceptance.spec.ts` (2) and `us09-acceptance.test.js` (5):

- AT-1: applicant details
- AT-2: status updates
- AT-3: the status filter
- AT-4 and AT-5: access control

## Task #9 - US-08 Sprint 3 tests
**Associated Links:** [#142](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/142), [#155](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/155), [AI log](../../../AI-log/Luca/2026-11-16-us08-s3-acceptance-tests.md)

`us08-s3-acceptance.spec.ts` (5) and `us08-s3-acceptance.test.js` (5):

- AT-5: archive with confirmation
- AT-6: restore
- AT-7: status counts on each posting card
- AT-8: permissions

## Task #10 - Date filter and review panel
**Associated Links:** [#132](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/132), [#133](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/133), [#143](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/143), [AI log](../../../AI-log/Luca/2026-11-16-date-filter-review-panel.md)

My Sprint 3 feature tasks for US-09:

- **Backend (#132):** `from`/`to` date filter on a posting's applications, with a 400 for bad or reversed dates. New candidate review endpoint `GET /jobs/:id/applications/:applicationId` (profile, applied resume, other applications), owner only. Documented in `backend/README.md`.
- **Frontend (#133):** date inputs synced to the URL, a warning for invalid ranges, and a review panel where the recruiter can change the status.
- **Tests (#143):** `us09-s3-acceptance.spec.ts` (12) and `us09-s3-acceptance.test.js` (12) cover AT-6 to AT-9.

The tests caught an impossible date (2026-13-01) returning 500; it now returns 400.

## Task #11 - US-07 acceptance tests
**Associated Links:** [#145](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/145), [#155](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/155), [AI log](../../../AI-log/Luca/2026-11-16-us07-acceptance-tests.md)

`us07-acceptance.spec.ts` (3) and `us07-acceptance.test.js` (5):

- AT-1: the unread badge and click-to-open
- AT-2: interview invites
- AT-3: one deadline reminder
- AT-4: mark all as read
- AT-5: other users can't see or mark your notifications

## Task #12 - US-22 acceptance tests
**Associated Links:** [#146](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/146), [#155](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/155), [AI log](../../../AI-log/Luca/2026-11-16-us22-acceptance-tests.md)

`us22-acceptance.spec.ts` (3) and `us22-acceptance.test.js` (3):

- AT-1: the recruiter's new-application notification and its link to the applicant list
- AT-2: exactly one "closing soon" reminder
- AT-3: the empty state
