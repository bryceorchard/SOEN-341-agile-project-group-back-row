# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-25
**AI Tool:** Claude (Cowork)

## Task / Prompt
Produce a paste-ready GitHub issue body for the authentication & core API endpoints
task — the companion backend issue that sits on top of the database schema issue,
in the same paste-ready format.

## Context / Findings
- This issue depends on the database schema issue and is built on the same Sprint 1
  tables (`users`, `profiles`, `resumes`).
- Endpoint scope was cross-checked against the Sprint 1 demo features
  (Registration/Login and Resume/Profile).
- Three decisions were left open for the team: (1) backend framework/language;
  (2) JWT vs. server-side sessions; (3) file upload handling (size limits, allowed types).

## AI Output / Actions
- **Title:** `[Task] Implement authentication & core API endpoints (Sprint 1)`
- **Labels:** `task`, `backend`, `api`, `sprint-1`, `priority: high`
- **Depends on:** the database schema issue.
- **Endpoints — Auth:** `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- **Endpoints — Profile:** `GET /profile`, `PUT /profile` (full_name, headline, location, phone, bio).
- **Endpoints — Resume:** `POST /resumes` (upload + type/size validation), `GET /resumes`, `DELETE /resumes/:id`.
- **Tasks:** choose framework/language + document; project skeleton + env config + DB
  connection; password hashing (bcrypt/argon2); auth endpoints w/ token sessions;
  profile endpoints; resume endpoints w/ validation; auth middleware on protected
  routes; input validation + consistent error responses; basic auth-flow tests;
  endpoint documentation.
- **Definition of Ready:** DB schema merged/available; framework agreed; auth strategy
  decided (JWT vs. session); resume storage approach decided.
- **Definition of Done:** endpoints implemented + testable; passwords hashed + protected
  routes enforce auth; upload validates type/size; auth-flow tests pass; endpoints
  documented; merged via reviewed PR.

## Decision
**Bryce:** todo

## Reflection
**Bryce:** todo
