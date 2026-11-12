# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Go through all the Sprint 2 tasks assigned to me and complete them, creating branches where needed.

Choices Bryce made when the AI asked:
- Commit on local branches; Bryce pushes and opens the PRs himself.
- Build #81 on #112's branch and #111 on #117's branch.
- Untrack Gabriel's editor files and add them to `.gitignore`.

## Context / Findings
- Bryce's open Sprint 2 tasks: #81, #97, #98, #99, #111. #41 is a story, and #47 is a backlog
  story, not Sprint 2.
- What each task was still missing:
  - #81: a full confirmation and unit tests.
  - #97: README fixes and the editor files (`scripts/.vvrill`, `.helix/`, added by Gabriel on
    2026-09-25).
  - #98: the plan merged.
  - #99: Luca's Sprint 1 logs (deleted in `0edee83`), a Gabriel folder, PDFs of Gene's and
    Mahmoud's logs, and Sprint 2 PDFs.
  - #111: the CI warnings about Node 20 being deprecated (`checkout@v4`, `setup-node@v4`) and the
    `ubuntu-latest` move to Ubuntu 26.
- Angular 22 requires Node `^22.22.3 || ^24.15.0 || >=26.0.0` (from `@angular/cli` in
  `package-lock.json`).
- Current action versions, checked on GitHub: `actions/checkout` v7 and `actions/setup-node` v7.1.0.
  Both run on Node 24. v7's breaking changes (fork checkout under `pull_request_target`, the
  `NODE_AUTH_TOKEN` fallback) don't affect this workflow.
- The work was done in the AI's cloud copy, with commits authored as Bryce. The branches were then
  copied into Bryce's local repo with `git bundle` + `git fetch`. Pushing isn't possible from either
  environment (no GitHub credentials there).

## AI Output / Actions
- **`chore/97-readme-cleanup`** (from `main`, `942c906`):
  - fixed `npm starm` → `npm start`;
  - stated the frontend's Node requirement and the right `.tool-versions` path;
  - updated the `docs/README.md` layout (removed `WeeklyMinutes.md`, added `sprint-2/`);
  - untracked `.vvrill` and `.helix/` and added them to `.gitignore`.
- **`docs/99-ai-log-fixes`** (from `main`, `6066335`):
  - restored Luca's two Sprint 1 logs and added PDF exports of them;
  - exported Gene's Sprint 1 log and Mahmoud's Sprint 1 and Sprint 2 entries to PDF
    (pandoc + xelatex; the `.md` files are unchanged);
  - added `AI-log/Gabriel/README.md`;
  - listed all six AI-log folders in the README tree.
- **`feature/81-apply-confirmation`** (from `recruiter-postings-ui` / #112, `7d6e590`):
  - after applying, the job page shows "Application submitted", the job title, the applied date,
    the status, and a "View My applications" link;
  - an earlier application shows the same card when the page loads;
  - two new unit tests for the 201 and 409 paths. `ng test`: 36/36 pass.
  - Checked end to end against the seeded backend in headless Chromium: applied to a job, followed
    the link to `/applications`, reloaded the page.
- **`chore/111-ci-actions`** (from Luca's #117 branch, `67e4d21`): moved checkout and setup-node
  from v4 to v7, and `ubuntu-latest` to `ubuntu-24.04`, in both jobs.
- **`docs/sprint-2-planning`** (`5d19ed6`, on top of Bryce's commit): updated the plan to
  2026-10-29 (#112 follow-ups, critical path with the new branches, #99 status).
- Checked with `git merge-tree` that #97, #99 and #112 merge cleanly with `main` and with each other.
- Nothing was pushed, no PRs were opened, and no issues were changed. The local `main` and its
  working tree weren't touched.

## Decision
**Bryce:**

## Reflection
**Bryce:**
