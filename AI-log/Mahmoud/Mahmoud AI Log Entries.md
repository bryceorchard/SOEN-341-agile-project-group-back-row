Mahmoud AI Log Entries

Task: Design and implement the database schema (Issue #1)
Purpose: Backend/database implementation. Asked Claude to design the Sprint 1 schema (users, profiles, resumes), write migration/seed scripts, and produce an ERD covering the later-sprint entities (jobs, applications, saved_jobs, notifications), so I wasn't starting the later sprints from scratch.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: SQLite schema (backend/db/schema.sql) with PK/FK constraints, a unique case-insensitive email, a role check, and an index on resumes.user_id; migrate.js and seed.js; a Mermaid ERD in docs/ERD.md. It also flagged DBMS choice and resume storage (DB blob vs. file path) as decisions for the team, and I picked SQLite + on-disk files with the DB storing only the path.
Validation: Ran `npm run db:reset` on a clean checkout and queried the resulting tables directly to confirm the schema and seed rows were correct. Opened as PR #3, reviewed by a teammate, merged into main.

Task: Build the backend API (Issue #2)
Purpose: Coding. Asked Claude to implement the auth (signup/login/logout/me), profile (get/update), and resume (upload/list/delete) endpoints against the schema above, with validation, auth middleware, and tests, so the frontend would have something real to call.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: An Express app (backend/src/) with bcrypt password hashing, JWT-based auth middleware, multer file upload limited to PDF/DOC/DOCX at 5MB, and consistent 400/401/404/409 error responses. It wrote 6 automated tests covering the signup → login → protected-route flow, duplicate emails, and resume CRUD, plus endpoint docs in backend/README.md.
Validation: Ran the test suite locally (all passing) and manually exercised the endpoints. Opened as PR #4, reviewed by a teammate (who added 6 more tests during review), and merged into main — `npm test` still passes 12/12 on main after merge.

Task: Resume file view/download endpoint (Issue #76)
Purpose: Backend coding. Asked Claude to add a GET /resumes/:id/file route so a seeker can view their own resume and a recruiter can view a resume attached to an application on one of their postings, with everyone else refused, without changing the resume upload/list/delete routes.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: The route in backend/src/routes/resumes.js checks ownership, then falls back to an owning-recruiter check via a join across applications/jobs, 404s if the file is missing on disk, sanitizes the filename header, and streams the file with the right content type. It also added a test covering owner, applied-to recruiter, an unrelated user, and a missing file, and documented the route in backend/README.md.
Validation: Ran `npm test` locally (19/19 passing). Opened as PR #106; CI passed; not yet merged (pending human review/merge).

Task: Job search categories endpoint + richer demo seed data (Issue #78)
Purpose: Backend coding. Asked Claude to add a GET /jobs/categories endpoint returning the distinct categories in use, and to flesh out the seed data (more jobs across more categories, a second recruiter, sample applications) so the frontend's search/filter UI would have something realistic to demo against.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: The /categories route in backend/src/routes/jobs.js (registered ahead of /:id so it isn't swallowed by the id route), and an expanded backend/db/seed.js with a second recruiter, 14 jobs across 10 categories, and 5 demo applications covering each status. Added a test distinguishing the categories route from an id lookup, and updated backend/README.md.
Validation: Ran `npm test` locally (19/19 passing). Opened as PR #107; CI passed; merged into main by a teammate.

Task: Application tracking — job details + status filter (Issue #82)
Purpose: Backend coding. Asked Claude to enrich a seeker's /applications results with job title/location/category/resume filename (instead of just status) and add an optional ?status= filter, so the frontend dashboard doesn't need extra round-trips to show each application in context.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: An enriched toApi/shared SELECT in backend/src/routes/applications.js joining jobs and resumes, and a status query-param filter that 400s on an invalid value. Extended the existing apply test with the new fields and added a dedicated filter test, updated backend/README.md.
Validation: Ran `npm test` locally (19/19 passing). Opened as PR #108; CI passed; merged into main by a teammate.

Task: Recruiter posting management — my postings, edit, close/reopen (Issue #84)
Purpose: Backend coding. Asked Claude to let a recruiter list only their own postings, edit one, and close/reopen it (closed postings stop accepting new applications and drop out of public search), which meant adding a status column and a backward-compatible migration for existing databases.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: A status column on jobs (open/closed) added to backend/db/schema.sql plus a guarded ALTER TABLE in backend/db/migrate.js that backfills it on existing DBs without data loss; GET /jobs/mine, PUT /jobs/:id, and PATCH /jobs/:id/status in backend/src/routes/jobs.js with ownership checks and a shared body validator; a job-status check in applications.js so applying to a closed posting is rejected. Added a posting-management test covering mine/edit/close/reopen/ownership, and updated backend/README.md.
Validation: Ran `npm test` locally (19/19 passing); manually verified the migration backfills `status: 'open'` on a simulated pre-existing DB missing the column. Opened as PR #109; CI passed; merged into main by a teammate (who resolved a conflict with #86's changes to the same file).

Task: Applications-received view for a posting (Issue #86)
Purpose: Backend coding. Asked Claude to let the owning recruiter see who applied to a specific posting (with applicant name/email/headline/resume and an optional status filter), refusing everyone else, to back the recruiter's "view applicants" screen.
Link: Claude Code session (terminal) — no shareable chat link; full prompts/output available on request.
AI Generated: GET /jobs/:id/applications in backend/src/routes/jobs.js, joining applications → users → profiles → resumes, with an ownership check (404 for non-owners to avoid leaking that the posting exists) and an optional ?status= filter. Added a test covering the owning recruiter, a non-owning recruiter, and the applicant themself, and updated backend/README.md.
Validation: Ran `npm test` locally (19/19 passing). Opened as PR #110; CI passed; merged into main by a teammate (after resolving the #84/#86 conflict in jobs.js).
