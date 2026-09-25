# Conversation Log — GitHub Issue: Database Schema

**Theme:** GitHub Issues / Backend
**Date:** 2026-09-25
**Responsible Person:** Bryce (Scrum lead)
**Related Sprint 1 deliverable:** User Stories and Task Breakdown; Code Demonstration (Registration/Login, Resume/Profile)

---

## AI Usage Log Entry

**Task ID/Title:** Draft a GitHub issue for the database/backend work to assign to a team member.

**Purpose of AI Use:** Task breakdown and planning — turning the assignment spec's system features into a concrete, assignable backend/DB issue with scope, tasks, DoR, and DoD.

**Prompt (summary):** Bryce provided his Scrum-lead role and asked for a rough outline of what a GitHub issue would look like for the DB team member — what they'd have to implement backend-wise to fill the assignment spec. Claude read the Sprint 1 spec (`SOEN341_CareerConnect_Project_Sprint1.docx`) from the connected Assignment 1 folder first.

**AI-Suggested Content:**

- **Issue title:** `[Task] Design and implement database schema (Sprint 1 core entities)`
- **Labels:** `task`, `backend`, `database`, `sprint-1`, `priority: high`
- **Sprint 1 tables (implement now):**
  - `users` — id (PK), email (unique), password_hash, role (`job_seeker` | `recruiter`), created_at, updated_at
  - `profiles` — id (PK), user_id (FK), full_name, headline, location, phone, bio, updated_at
  - `resumes` — id (PK), user_id (FK), file_path/blob reference, original_filename, file_type, uploaded_at
- **Design-now / implement-later tables:** `jobs`, `applications` (status enum: Applied/Interview/Offered/Rejected), `saved_jobs`, `notifications`
- **Tasks:** choose DBMS + document it; produce full-app ERD in `/docs`; write Sprint 1 migration scripts; define constraints (PK/FK/unique email/NOT NULL/role enum/defaults); add indexes (email, FKs); seed data; document setup in README; verify auth + profile/resume endpoints work against schema.
- **Definition of Ready:** features/user stories confirmed; DBMS agreed; resume storage approach decided (blob vs. filesystem/cloud path).
- **Definition of Done:** ERD committed & reviewed; Sprint 1 tables created via migrations that run from a clean checkout; constraints + indexes in place; seed data loads; setup documented; merged via reviewed PR.

**Two flagged decisions for the team:** (1) which DBMS; (2) how resumes are stored (DB blob vs. file path) — the second changes the `resumes` table.

**Validation:** Scope cross-checked against the Sprint 1 spec — the two demoed features (Registration/Login and Resume Upload/Profile) drive the Sprint 1 tables; later entities are designed forward to avoid rework but not built yet. Still to be validated by the team during a lab discussion (DBMS + storage decisions).

**Decision:**

**Reflection:**

---

## Open follow-up

Claude offered to draft the companion API/auth issue so the DB and backend work line up.
