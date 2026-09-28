# AI Interaction Log

**Author:** Luca
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: "Help me write tests for the signup/login and profile/resume upload features."

## Purpose of AI Use
Testing (test design and generation) and learning

## Context / Findings
- Existing test file `backend/test/auth-flow.test.js` (written by Mahmoud) already covered:
  signup validation and duplicates, login with wrong password, protected routes without a
  token, profile get/update, and resume upload type validation, listing and deletion.
- Gap identified: every test used a single user, so nothing checked that users can't
  access each other's data. Also missing: login with unknown email, signup with missing
  fields, resume upload without login.
- Backend routes live in `backend/src/routes/`: auth.js, profile.js, resumes.js.

## AI Output / Actions
- Explained what a test is and the happy path vs. sad path approach.
- Reviewed auth-flow.test.js and summarized what it covers and what's missing.
- Generated `backend/test/edge-cases.test.js` with 5 tests:
  1. Login with an unknown email → 401
  2. Signup with missing fields → 400
  3. Resume upload without login → 401
  4. User B cannot see or delete user A's resume
  5. User B cannot see user A's profile
- Gave steps to add the file on branch `feature/luca-tests` and open a PR.

## Validation
- Confirmed the endpoints used in the tests match the route files (auth.js, profile.js,
  resumes.js).
- Opened a PR; CI ran and all checks passed.
- Checked the CI logs to confirm the 5 new tests actually ran and passed.
- Requested review from Mahmoud (backend owner).

## Decision
Accepted. Test file used as generated.

## Reflection
Useful. I learned how to read an existing test file and look for gaps instead of writing
tests from scratch. The most valuable tests were the cross-user ones, because the original
tests only used one user and would have missed a data-leak bug. The AI noted it couldn't
see the backend source, so some expected status codes were assumptions that CI then confirmed.

Generated file: `backend/test/edge-cases.test.js` (PR #48)
