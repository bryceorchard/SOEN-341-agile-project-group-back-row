# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-22
**AI Tool:** Claude (Cowork)

## Task / Prompt
Look at PR #112 ("Add recruiter postings UI: list, create, edit, close/reopen", author
Mahmoud): 30 frontend files, +1,781/−163, 5 commits, based on current `main` with no
conflicts. Per its description, it grew from #85 into the app shell, guards, role-based login,
jobs search/detail/apply, the applications dashboard, the applicants page, the profile, and a
visual redesign.

## Context / Findings
**Build and tests**
- `ng test --watch=false`: 4/4 pass (2 spec files). The development build compiles cleanly.
- The production build failed in the AI's sandbox only because the sandbox network blocks Google
  Fonts. Angular's production build inlines the `@import` from `fonts.googleapis.com` in
  `styles.css`, so every production build now needs internet access (fine on GitHub Actions; worth
  noting).

**End-to-end smoke test**
The AI ran the seeded backend plus the built app in headless Chromium, using Playwright,
across 26 checks. **20 passed**: role-based login redirects, the jobs list (14 seeded) and
category filter, profile edit persisting, resume upload with a non-ASCII name, applying with a
resume, the applications dashboard and status filter, the role guard, registering as a
recruiter, recruiter create/edit/close/reopen (the API trims the category), the applicants
page, status updates reaching the seeker, opening an applicant's resume, and the no-access
page for another recruiter's posting.

**6 confirmed problems**
1. **Login/register server errors never appear** (wrong password 401, duplicate email 409,
   short password 400). The app is zoneless (no `zone.js`), and `login.component.ts` stores
   `display_error` in a plain field set inside the HTTP callback, so nothing re-renders. The user
   clicks and nothing happens. The same pattern already exists on `main`; the PR rewrote the
   component but kept it. Fix: make it a signal.
2. **Closed postings still show the Apply form** on `/jobs/:id`. Submitting shows the backend's
   "This job posting is closed". `JobSummary` has no `status`.
3. **An expired or invalid token isn't handled.** The guards only check that a token exists, and
   the interceptor ignores 401s, so the user stays "logged in" while pages show misleading empty
   states. The JWT lifetime is 1 day.
4. **`routerLinkActive` does nothing.** `app.ts` doesn't import `RouterLinkActive`, so the nav's
   active-link style never applies.

**Notes**
- The job page doesn't show an already-applied state on load (only a 409 message after
  submitting).
- The dashboard doesn't show `jobStatus` / "posting closed" or per-status counts.
- `posting-applicants` and `profile` replace/delete/status updates have no error handling.
- `window.open` from an async callback may be blocked by Safari's popup blocker.
- Frontend tests are thin (4) compared with the tasks' Definitions of Done.
- The PR body has no `Closes #…` lines.
- The production build depends on Google Fonts at build time.

**Process (Scrum lead decision)**
- The PR implements tasks assigned to other people: #73, #77, #79, #80 (Gabriel); #74, #75
  (Zohair); #81 (Bryce); #83 (Gene); #87 (Luca); as well as Mahmoud's own #85. Sprint 2 grades
  individual contributions. Gabriel was pinged in the PR body but hasn't responded. Suggested
  approach: merge after fixes, and route the follow-up fixes and tests to the original task owners
  so everyone still has visible feature work.

## AI Output / Actions
- Gave Bryce a review with the findings above and a recommended verdict of **Request changes**
  (items 1–4), and offered to implement the fixes or split them across the original owners.
- No code changes, nothing pushed, and no review posted to GitHub. The sandbox checkout was
  reset to `main`.

## Decision
**Bryce:**

## Reflection
**Bryce:**
