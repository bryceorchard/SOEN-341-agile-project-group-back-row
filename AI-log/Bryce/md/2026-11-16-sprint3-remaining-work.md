# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCUVzHhh6jfPgpa9xFn>

## Task / Prompt
"Can you look over the entire repo and figure out what needs to be done to finish sprint 3, in order?"

## Context / Findings
State of `main` at `c0a6605` (after #181), evaluation day:

- CI on `main`: `backend` and `frontend` both green. Local run: backend 159/159, frontend 133/133 (26 files).
- `Sprint 3` milestone: 14 open, 20 closed.
- Backend for every Sprint 3 feature is merged: archive + summary (#157), notifications (#158), reminders (#164),
  AI feedback service (#165), date filter + review (#177), analytics + history (#179), eval run (#181).
- Frontend gaps: no analytics/history page for US-21 (#135) and no AI feedback UI for US-10 (#140). The endpoints
  they need exist: `GET /applications/stats`, `GET /applications/:id/history`, `POST`/`GET /resumes/:id/feedback`.
- No acceptance tests for US-21 (#144) or US-10 (#147); all other Sprint 3 AT issues are closed.
- #139 is still open though PR #165 merged with every DoD item ticked. #47 and #128 have unticked task boxes for
  merged work. Sprint 2 #42 has all tasks ticked but is still open.
- #154: CI runs plain `npm test` / `ng test`, no coverage output; no per-feature unit-test comment.
- Branches with work but no PR: `docs/sprint-3-planning` (Sprint 3 plan, 26 behind `main`),
  `Sprint-3/Contribution` (Zohair's contribution log, in `Sprint 3/` not `Sprint3/`), `gene-AI-Logs` (Gene's PDFs).
- #149 Sprint 3 PDFs on `main`: Mahmoud, Zohair. Missing: Bryce, Gene (on branch), Gabriel, Luca.
- #151 contribution logs on `main`: 0 of 6.
- #150 minutes: only `2026_11_05_Meeting_Minutes copy.md` for Sprint 3 (file name has " copy").
- #152 summary report: not started.
- README "Features" still lists Sprints 1–2 and calls notifications and AI feedback "planned".
- PR #166 (refactor proposal) open with changes requested.
- Demo seed already has a posting closing in two days (`backend/db/seed.js`).

## AI Output / Actions
- Cloned the repo, read the Sprint 3 plan (on `docs/sprint-3-planning`), every open Sprint 3 issue and its comments,
  open PRs, unmerged branches, CI checks, routes, tests, `AI-log/`, `docs/minutes/` and `docs/ContributionLog/`.
- Ran both test suites.
- Produced an ordered list of the remaining work (in the chat). No issues, PRs or board fields were changed.

## Decision
**Bryce:**

## Reflection
**Bryce:**
