# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-25
**AI Tool:** Claude (Cowork)

## Task / Prompt
As Scrum lead, draft a GitHub issue for the database/backend work to assign to a
teammate. Goal: a rough outline of what that person would have to implement
backend-wise to satisfy the Sprint 1 spec, with scope, tasks, Definition of Ready,
and Definition of Done.

## Context / Findings
- Claude read the Sprint 1 spec (`SOEN341_CareerConnect_Project_Sprint1.docx`) from
  the connected Assignment 1 folder before drafting.
- The two demoed Sprint 1 features (Registration/Login and Resume Upload/Profile)
  are what drive the Sprint 1 tables; later entities are designed forward to avoid
  rework but not built yet.
- Two decisions were flagged as team calls: (1) which DBMS; (2) how resumes are
  stored (DB blob vs. file path) — the second changes the `resumes` table.

## AI Output / Actions
- **Issue title:** `[Task] Design and implement database schema (Sprint 1 core entities)`
- **Labels:** `task`, `backend`, `database`, `sprint-1`, `priority: high`
- **Sprint 1 tables (implement now):**
  - `users` — id (PK), email (unique), password_hash, role (`job_seeker` | `recruiter`), created_at, updated_at
  - `profiles` — id (PK), user_id (FK), full_name, headline, location, phone, bio, updated_at
  - `resumes` — id (PK), user_id (FK), file_path/blob reference, original_filename, file_type, uploaded_at
- **Design-now / implement-later tables:** `jobs`, `applications` (status enum: Applied/Interview/Offered/Rejected), `saved_jobs`, `notifications`
- **Tasks:** choose DBMS + document it; produce full-app ERD in `/docs`; write Sprint 1
  migration scripts; define constraints (PK/FK/unique email/NOT NULL/role enum/defaults);
  add indexes (email, FKs); seed data; document setup in README; verify auth +
  profile/resume endpoints work against the schema.
- **Definition of Ready:** features/user stories confirmed; DBMS agreed; resume storage
  approach decided (blob vs. filesystem/cloud path).
- **Definition of Done:** ERD committed & reviewed; Sprint 1 tables created via migrations
  that run from a clean checkout; constraints + indexes in place; seed data loads; setup
  documented; merged via reviewed PR.
- Scope cross-checked against the Sprint 1 spec; DBMS and storage choices left for the
  team to confirm during a lab discussion.

## Decision
**Bryce:** The issue template was implemented with some minor changes to readability and comprehension. Some lines were omitted while others were clarified.
Some of the list items were included as they are good ideas, however some of them might be beyond the scope of this project and frankly unecessary. Further discussion with the team will be had regarding which items to leave or remove.

## Reflection
**Bryce:** Since I'm not very knowledgeable on databases and what's required to set them up properly (best practices and whatnot), I found this template to be quite useful. It was also a good start to learning about the elements of a DB. I prompted claude for an explanation on migration scripts, and also googled several other topics to learn more.
