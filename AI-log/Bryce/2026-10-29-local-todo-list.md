# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Make a local file with all the to-do items. Add it to the local git ignore (`.git/info/exclude`),
not `.gitignore`.

## Context / Findings
- Fresh pull of the 48 open issues through the GitHub API.
- 140 unchecked checklist items, kept in the board's "Prioritized backlog" order (P0–P3).
- Story checklist lines that only point at a task issue (e.g. `- [ ] #73 (Gabriel)`) were left
  out, since those task issues are listed in full.
- PR #112 had a new commit since the 2026-10-28 audit: `3b27bc2` by Luca, "Handle failed requests
  on applicants and profile pages, add tests". It adds `posting-applicants.component.spec.ts`,
  which includes a status-update test. That covers #87's "Unit test for the status update" item,
  which isn't ticked on GitHub yet.

## AI Output / Actions
- Wrote `TODO.local.md` at the repo root:
  - A section of 9 follow-ups that aren't tracked in any issue (merge order for #112/#117,
    the required frontend check, branch-protection bypass, milestone due date, etc.).
  - Every open issue's unchecked items, grouped by priority, with the assignees.
  - #87's unit-test item marked done with a note.
- Added `/TODO.local.md` to `.git/info/exclude`. Confirmed with `git check-ignore -v`.
- No GitHub changes, no commits.

## Decision
**Bryce:**

## Reflection
**Bryce:**
