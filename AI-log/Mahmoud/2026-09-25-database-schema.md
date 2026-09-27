# AI Interaction Log

**Author:** Mahmoud
**Date:** 2026-09-25
**AI Tool:** Claude Code (Claude Sonnet 5)

## Task / Prompt
Implement GitHub issue #1 (database schema): choose a DBMS, write migration and
seed scripts for `users`, `profiles`, `resumes`, and produce an ERD covering the
later-sprint entities. Prompt: "ok go" after Claude proposed starting with the schema.

## Context / Findings
- Read issue #1 body (scope, tasks, DoR/DoD, open decisions: DBMS and resume storage).
- Inspected the repo: `main` only had README/LICENSE/.gitignore; branch `database` was empty.
- Node v22.11.0 available locally.

## AI Output / Actions
- Chose **SQLite** (`better-sqlite3`) for zero-setup dev/demo; resumes stored on disk,
  DB keeps path + metadata only.
- Created `backend/db/schema.sql` (PKs, FKs with cascade, unique case-insensitive email,
  role CHECK, index on `resumes.user_id`), `migrate.js`, `seed.js` (2 demo users).
- Created `docs/ERD.md` (Mermaid) including jobs, applications, saved_jobs, notifications.
- Ran `npm run db:reset` and queried the DB to confirm tables and seed rows.
- Flagged DBMS and resume storage as team decisions.

## Decision
**Mahmoud:** _(fill in: accepted / modified / rejected, and what you verified, e.g. ran
db:reset on a clean checkout, reviewed schema against issue #1 checklist, team approved SQLite.)_

## Reflection
**Mahmoud:** _(fill in: what you learned, what was useful, what you'd change.)_
