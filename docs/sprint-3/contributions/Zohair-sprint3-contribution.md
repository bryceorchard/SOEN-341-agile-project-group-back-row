# Contribution Log — Sprint 3 — Zohair Ameeri (@ZA-Error)

## Task Summary

Implemented the notification and deadline-reminder functionality for job seekers and recruiters. The work covered backend reminder generation, notification-route integration, the frontend notification centre, the navigation bell and unread count, and frontend test updates for notification polling.

| Task Done | Issue # | Hrs Spent | Date Started | Task Jump |
| --------- | --------- | --------- | ------------ | --------- |
| Backend deadline reminders | #137 | 1.5 | 2026-11-12 | [Jump to Task](#task-1---backend-deadline-reminders) |
| Frontend notification centre | #138 | 2 | 2026-11-12 | [Jump to Task](#task-2---frontend-notification-centre) |
| Frontend notification polling tests | #138 | 1.5 | 2026-11-12 | [Jump to Task](#task-3---frontend-notification-polling-tests) |
| Sprint 3 acceptance tests and requirements | #145, #146 | 3 | 2026-11-10 | [Jump to Task](#task-4---sprint-3-acceptance-tests-and-requirements) |

## Task #1 - Backend deadline reminders

**Associated Links:** [#137](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/137), [US-07 #44](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/44), [US-22 #129](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/129), [Implement deadline reminders](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/753ce53), [Trigger reminders on notification reads](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/7a73489)

Implemented deadline reminder generation for open, non-archived postings whose deadlines fall within the configured three-day window.

The backend:

- Creates one `deadline_reminder` notification for the posting's recruiter.
- Creates one reminder for each eligible applicant.
- Excludes applicants with `Rejected` or `Offered` application statuses.
- Prevents duplicate reminders for the same recipient, posting, and notification type.
- Uses the existing shared `notify()` helper.
- Links recruiters to the posting's applicant list.
- Links job seekers to their applications.
- Generates reminders when notifications or unread counts are fetched, without requiring a scheduler.
- Handles the reminder window using calendar days.

## Task #2 - Frontend notification centre

**Associated Links:** [#138](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/138), [NotificationService](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/7fd27de), [Notification centre component](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/f1ec0b0), [Notification list template and UI states](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/6dd327c), [Notification list styling](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/4df55d9), [Notification centre route](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/16389ff), [Notification bell and unread count](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/2152429), [Navigation bar and notification badge styling](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/8eb76e2), [Unread polling and router refresh](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/e154125)

Implemented the frontend notification centre for job seekers and recruiters.

The frontend:

- Adds a protected `/notifications` route.
- Loads notifications and unread counts through a dedicated service.
- Supports marking one notification as read.
- Supports marking all notifications as read.
- Displays notifications newest first.
- Highlights unread notifications.
- Distinguishes interview invitations.
- Displays relative timestamps.
- Keeps read notifications visible in notification history.
- Provides an empty state when no notifications exist.
- Navigates to the related application or recruiter applicant list.
- Adds the notification bell to the authenticated navigation bar.
- Displays the current unread count.
- Refreshes the count after navigation and every 60 seconds.
- Hides the bell for logged-out users.

## Task #3 - Frontend notification polling tests

**Associated Links:** [#138](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/138), [Mock notification polling requests](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/commit/41c8cd7)

Updated the frontend application tests to intercept unread-count requests with Angular HTTP testing utilities. This prevents navigation and logout tests from making real requests to the backend during unit-test execution.

The test updates:

- Provide the Angular HTTP testing client.
- Intercept initial unread-count requests.
- Flush navigation-triggered unread-count requests.
- Keep frontend tests independent of a running backend server.

## Task #4 - Sprint 3 acceptance tests and requirements

**Associated Links:** [Requirements task #153](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/153), [US-08 acceptance tests #142](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/142), [US-09 acceptance tests #143](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/143), [US-21 acceptance tests #144](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/144), [US-07 acceptance tests #145](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/145), [US-22 acceptance tests #146](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/146), [US-10 acceptance tests #147](https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row/issues/147)

Reviewed and reworked the Sprint 3 acceptance tests for every Sprint 3 user story under the requirements task. Finalized the Given/When/Then scenarios with the relevant task owners so each acceptance test was testable, matched the planned implementation, and was linked to its user story.

The finalized acceptance-test issues cover:

- US-08 archive postings and recruiter dashboard behavior.
- US-09 date filtering and candidate review.
- US-21 application analytics and history dashboard.
- US-07 job-seeker notifications and deadline reminders.
- US-22 recruiter notifications for new applications.
- US-10 AI resume feedback for the Sprint 3 slice.

Ensured that every Sprint 3 story had finalized acceptance tests, with at least two scenarios where the story scope justified them.
