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
