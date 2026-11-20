# Contribution Log — Sprint 2 — Zohair Ameeri (@ZA-Error)

## Task Summary

Led sprint requirements by defining acceptance criteria and Given/When/Then scenarios for all user stories. Expanded authentication and profile features to include zoneless signal error handling, client-side validation, and role-based UI guards.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| Define acceptance tests | #105 | 3.00 | 2026-10-26 | [Jump to Task](#task-1---define-acceptance-tests) |
| Auth error signals | #74, #75 | 1.50 | 2026-10-26 | [Jump to Task](#task-2---auth-error-signals) |
| Password validation UI | #74, #75 | 1.25 | 2026-10-26 | [Jump to Task](#task-3---password-validation-ui) |
| Profile save errors | #74, #75 | 0.75 | 2026-10-26 | [Jump to Task](#task-4---profile-save-errors) |
| Hide recruiter resumes | #74, #75 | 0.50 | 2026-10-26 | [Jump to Task](#task-5---hide-recruiter-resumes) |

## Task #1 - Define acceptance tests
**Associated Links:** [https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/105#issue-5953040466 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/68#issue-5762623511 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/69#issue-5762624474 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/88#issue-5953003890 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/88#issue-5953003890 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/89#issue-5953005035 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/90#issue-5953006180 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/91#issue-5953007322 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/92#issue-5953011766 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/93#issue-5953012940 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/94#issue-5953014111 , https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/95#issue-5953015318 ]

Reviewed and refined Given/When/Then wording for Sprint 1 and Sprint 2 user stories to ensure a minimum of two test cases per story. Linked, labeled (`acceptance-test`), and verified all AT issues (#68, #69, #89-95) to ensure acceptance criteria matched Sprint 2 guidelines.

## Task #2 - Auth error signals
**Associated Links:** PR #112 [https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/37b0090a0884423cc1443476bcfb9aa14ca3c962]

Converted `display_error` in `login.component.ts` to an Angular signal to ensure reliable UI rendering without Zone.js. Captured and surfaced specific 400 backend error messages (e.g., invalid details) directly to the user.

## Task #3 - Password validation UI
**Associated Links:** [https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/5c4c255dc882810651fe12acf5419337cb893c00]

Added an 8-character client-side length check before firing signup requests. Configured real-time inline hint warnings for invalid emails and short passwords, tying the disabled state of the Register button directly to these checks. 

## Task #4 - Profile save errors
**Associated Links:** [https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/79d47e5f04f307fd12ee24106d9fc6571971048e]

Created a `profile_error` signal in `profile.component.ts` to capture and display a red alert box if updating user details fails on the backend, complementing the existing success notification.

## Task #5 - Hide recruiter resumes
**Associated Links:** [https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/5b3ef93934ead8bf1bf92e84a692c3b9e0acdcdf]

Added conditional rendering to the Resumes card to hide it entirely for users logged in with the recruiter role. Placed a role check in `ngOnInit()` to skip unnecessary `/resumes` API calls.
