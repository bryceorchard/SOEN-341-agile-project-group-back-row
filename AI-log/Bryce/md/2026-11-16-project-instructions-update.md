# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCQuEAYRBt6CMmSHq5N>

## Task / Prompt
1. "Can you examine the repo, and (to your best abilities) update the claude desktop project
instructions please?" The project instructions are the standing instructions Claude gets in
every chat of the "SOEN 341 Project" on claude.ai. Before this, they held only the repo URL,
"use gh when possible", and the AI-log format.
2. "sure please do": open a PR for this AI log.

## Context / Findings
- Read `README.md`, `docs/CONTRIBUTING.md`, `docs/README.md`, the PR template, `.github/workflows/ci.yml`,
  `backend/package.json`, the Sprint 2 plan, the Sprint 3 plan (branch `docs/sprint-3-planning`,
  not on `main`), and recent AI logs in `AI-log/Bryce/md/`.
- Repo settings from the REST API:
  - `main` protection: 1 approving review; required checks `backend` and `frontend` with strict
    (up-to-date) mode; no force pushes.
  - Squash, merge and rebase merges are all allowed; branches are deleted on merge.
  - Milestones Sprint 1 to Sprint 3 are all still open; Sprint 2 has 11 open issues, Sprint 3 has 27.
  - 4 open PRs: #165 (Mahmoud, US-10 backend), #166 (Gene, refactor proposal), #168 and #170
    (Luca, acceptance tests).
- Tooling limits found while working:
  - In the cloud session, gh only works after the repo is attached with push access.
  - GitHub GraphQL is blocked there, so `gh issue list` and `gh pr list` fail; `gh api` (REST) works.
    The Projects v2 board (Status, Priority, Start/Target fields) is GraphQL-only, so board changes
    need the GitHub UI.
- The local clone sits in iCloud Drive, where files (including `.git` internals) have been evicted
  before (see the 2026-11-11 #141 log). Recent AI logs were committed on branches named
  `ai-log/bryce-<date>-<topic>` or on the PR branch they belonged to.
- The project instructions can't be edited through Claude's Projects tool (it only edits
  project docs), so they have to be changed in the claude.ai project settings.

## AI Output / Actions
- Drafted new project instructions. Kept: the repo URL, the gh/UI rule, the AI-log rules and the
  log format example. Added:
  - project summary, team table with GitHub handles, stack, key docs;
  - backend and frontend setup and test commands;
  - process rules from CONTRIBUTING.md and branch protection (branch names, PR template,
    squash merge, no force-push), plus "ask before pushing to a teammate's branch, merging,
    closing issues, or posting under my account";
  - issue title and label conventions;
  - tooling notes (attach with push access, use REST instead of GraphQL, board through the UI,
    don't run git on the iCloud copy);
  - AI-log details: one file per chat named `YYYY-MM-DD-<topic>.md`, updated as the chat goes on,
    committed on an `ai-log/bryce-…` branch with a PR because `main` is protected.
- Tried to save them in the claude.ai project settings through the desktop app's browser pane.
  The pane was not signed in to claude.ai, and signing in is something Bryce has to do himself,
  so the draft was handed over to paste in.
- Committed this log on branch `ai-log/bryce-2026-11-16-project-instructions`.
- Bryce pasted the draft into the project settings himself; the next session context showed the new
  instructions in place.

### Prompt 2: open a PR
- Updated this log, pushed it, and opened a PR from `ai-log/bryce-2026-11-16-project-instructions`
  into `main` using the PR template (type: Docs; no linked issue).

## Decision


## Reflection

