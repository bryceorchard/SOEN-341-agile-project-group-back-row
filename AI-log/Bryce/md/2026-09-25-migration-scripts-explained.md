# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-25
**AI Tool:** Claude (Cowork)

## Task / Prompt
Explain what the "migration scripts" mentioned in the database issue are and what
the term means.

## Context / Findings
- General, well-established software-engineering concept; no external sources required.
- Tied directly to the DB issue's task list and to the assignment's "runs from a clean
  checkout" requirement.
- The specific tool depends on the DBMS/framework the team eventually chooses.

## AI Output / Actions
- A migration script is a version-controlled file that defines how the database
  structure changes, one step at a time, committed alongside the code.
- Schema changes are written as code (raw SQL or a framework's migration format) instead
  of being applied manually in a GUI, so every teammate gets an identical database.
- Each migration is one incremental change (e.g. "create users/profiles/resumes tables",
  later "add a column"); the DB tracks which migrations have been applied so none run
  twice; many support an "undo"/down step for rollback.
- Example given: a raw SQL `001_create_users.sql` creating the `users` table (id PK,
  unique email, password_hash, role default, timestamps).
- Common framework tools noted: Django makemigrations/migrate, Rails Active Record
  migrations, Node Knex/Prisma, Spring Flyway/Liquibase.
- Tied back to the assignment's "runs from a clean checkout" requirement: a teammate or
  the TA can clone the repo, run the migrations, and get a working DB in one step — no
  manual schema drift.
- Conclusion: "write migration scripts for the Sprint 1 tables" = create the
  files/commands that build `users`, `profiles`, `resumes`, commit them, and document
  the run command.

## Decision
N/A

## Reflection
**Bryce:** This helped me understand what migration scripts are, why it needed to be an
item on the DB issue todo list, and why we need it in the first place.
