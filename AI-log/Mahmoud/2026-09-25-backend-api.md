# AI Interaction Log

**Author:** Mahmoud
**Date:** 2026-09-25
**AI Tool:** Claude Code (Claude Sonnet 5)

## Task / Prompt
Implement GitHub issue #2 (backend API): auth (signup/login/logout/me), profile
(get/update), and resume (upload/list/delete) endpoints with validation, auth
middleware, tests, and docs. Prompt: "ok lets do it".

## Context / Findings
- Read issue #2 for the endpoint list and DoD; frontend (Angular, by Gabriel) had no
  HTTP calls yet, so the API was developed and tested independently.
- Open decisions resolved with the team: Node/Express, JWT auth, SQLite, disk storage.

## AI Output / Actions
- Express app in `backend/src/` (routes for auth, profile, resumes; JWT middleware;
  consistent 400/401/404/409 error handler).
- bcrypt password hashing; multer uploads limited to PDF/DOC/DOCX, 5 MB; files stored
  under `uploads/` with random names.
- 6 tests (`node --test` + supertest): signup validation/duplicates, login, protected
  routes without token, profile update, resume upload/list/delete. First run failed
  (`node --test test/` on Node 22 treats the dir as a module); fixed by using a glob.
- Documented endpoints in `backend/README.md`; committed and opened PRs #3 (database)
  and #4 (backend-api).
- Listed the frontend changes Gabriel needs (HttpClient, token header, multipart upload).

## Decision
**Mahmoud:** _(fill in: accepted / modified / rejected; what you verified, e.g. ran
`npm test`, manual curl checks, reviewed code, team review on the PR.)_

## Reflection
**Mahmoud:** _(fill in: what you learned, what was useful, what you'd change.)_
